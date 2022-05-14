const cheerio = require("cheerio");
const moment = require("moment");
const Math = require("mathjs");
const { Puppet } = require("./puppeting");

function ampmto24h(h, a) {
    h = parseInt(h)
    if (a.toLowerCase() === "am" && h === 12) h = 0
    if (a.toLowerCase() === "pm") {
        if (h !== 12) h += 12
    }
    let emaitza = h.toString()
    return (emaitza.length === 1) ? "0" + emaitza : emaitza
}

class Manipulator {
    constructor() {
        this.puppet = new Puppet();
    }

    //---------------------------------------------------------------------------------------------------------------------
    // Data getters

    async getBasicData(origin, destination) {
        console.log("Getting basic data...");
        const url = 'https://www.google.com/maps/dir/?api=1&origin='+origin+'&destination='+destination+'&travelmode=transit'

        var directions = [];

        var html_dictionary = await this.puppet.getAllPreferenceDirections(url)
        for (const [key, value] of Object.entries(html_dictionary)) {
            var basic_garraio_multzoa = this.getBasicDirections(value, key);
            for (var garraioa = 0; garraioa < basic_garraio_multzoa.length; garraioa++) {
                directions.push(basic_garraio_multzoa[garraioa]);
            }
        }
        
        // save json file
        const fs = require('fs');
        fs.writeFileSync('data.json', JSON.stringify(directions, null, 2));

        console.log("Removing duplicates.");
        directions = this.removeDuplicates(directions);
        console.log("Finished getting basic data.");
        return directions;
    }

    async getDetailedDirections (json) {
        console.log("Getting detailed directions...");

        // Preferntzia mota guztiak lortu
        const preferences = [];
        // save json file
        const fs = require('fs');

        json.forEach(element => {
            if (!preferences.includes(element['pref'])) {
                preferences.push(element['pref']);
            }
        });

        // Preferentzia bakoitzetik menua ireki eta hauek prozesatu
        for (var pref = 0; pref < preferences.length; pref++) {
            const preferentzia = preferences[pref];
            
            await this.puppet.openPreference(preferentzia);

            for (var garraioa = 0; garraioa < json.length; garraioa++) {
                if (json[garraioa]["pref"] === preferentzia) {
                    json[garraioa].xehetasunak = await this.getGarraioaDetails(json[garraioa]);
                }
            }

            await this.puppet.closePreferences();
        }

        console.log("Filtering json files...");
        json = this.fillDirectiontransshipment(json);
        json = this.removeDuplicates(json);

        
        fs.writeFileSync('data.json', JSON.stringify(json, null, 2));

        console.log("Finished getting detailed directions.");
        return json;
    }

    //---------------------------------------------------------------------------------------------------------------------
    // Scrapping methods

    getBasicDirections(html, pref = '') {
        console.log("Extracting basic directions...");

        var directions = [];
        var $ = cheerio.load(html);

        $("div[id^='section-directions-trip']").each((i, elem) => {
            var basic_garraioa = this.extractBasicData(i, elem, pref)
            directions.push(basic_garraioa);
        });

        return directions;
    }

    extractBasicData (i, elem, pref = '') {
        console.log("-> Extracting trip data...");
        const id = i;
        const $ = cheerio.load(elem);

        // ^ erabiltzen da css_selector-ean regex erabiltzeko. 
        const denbora = {
            hasiera: $("h1[id^='section-directions-trip-title-'] > span:nth-child(2) > span:nth-child(1)").text(),
            amaiera: $("h1[id^='section-directions-trip-title-'] > span:nth-child(2) > span:nth-child(2)").text(),
            iraupena: $("div[class='Fk3sm fontHeadlineSmall']").text(),
        }

        // // Denborari formatua aldatu
        let iraupenaRegEx = /^((?<d>[0-9]{1,2}) day[s]?)?[ ]?((?<h>[0-9]{1,2}) hr)?[ ]?((?<m>[0-9]{1,2}) min)?$/gm;
        let orduaRegEx = /(?<h>[0-9]{1,2}):(?<m>[0-9]{2}) (?<a>(AM|PM))/gm

        let hasieraMatch = orduaRegEx.exec(denbora.hasiera);
        orduaRegEx.lastIndex = 0;
        let amaieraMatch = orduaRegEx.exec(denbora.amaiera);
        let iraupenaMatch = iraupenaRegEx.exec(denbora.iraupena);

        denbora.hasiera = ampmto24h(hasieraMatch['groups']['h'], hasieraMatch['groups']['a']) + ":" + hasieraMatch['groups']['m']
        denbora.amaiera = ampmto24h(amaieraMatch['groups']['h'], amaieraMatch['groups']['a']) + ":" + amaieraMatch['groups']['m']
        denbora.iraupena = ((iraupenaMatch['groups']['d'] !== undefined) ? ((iraupenaMatch['groups']['d'].length === 1?'0':'')+iraupenaMatch['groups']['d'] + ":") : "00:") + 
        ((iraupenaMatch['groups']['h'] !== undefined) ? (iraupenaMatch['groups']['h'].length === 1?'0':'')+iraupenaMatch['groups']['h'] + ":" : "00:") +
        ((iraupenaMatch['groups']['m'] !== undefined) ? (iraupenaMatch['groups']['m'].length === 1?'0':'')+iraupenaMatch['groups']['m'] : "00")

        var iterazioak = [];
        $("div:nth-child(2) > div:nth-child(2) > div:nth-child(3) > span").each((i, elem) => {
            if (i % 2 === 0) {
                iterazioak.push({
                    img: $(elem).find("span:nth-child(1) > img:nth-child(1)").attr("alt"), 
                    text: $(elem).find("span:nth-child(2) > span:nth-child(2) > span:nth-child(2) > span:nth-child(1)").text()
                });
            }                                             
        });

        const details_selector = '#' + $("div").attr("id");

        // return a json with the data
        const data = {
                id: Math.random().toString(16).slice(2),
                pref: pref,
                iterazioak: iterazioak,
                denbora: denbora,
                xehetasunak: details_selector
        }
        return data;
    }

    /**
     * Garraio baten details-ak lortu.
     * @param {json} garraioa - Garraio baten json-a, details gabe, selectorra bakarrik.
     * @returns {json} garraioa - Garraio baten json-a, details-ekin.
    */
    async getGarraioaDetails(garraioa) {
        // String-a bada details-ak kargatu ez direla esan nahi du.
        if (typeof garraioa.xehetasunak === "string") {
            console.log("-> Getting details...");
            const details_html = await this.puppet.getDirectionDetailsHtml(garraioa.xehetasunak);
            const $ = cheerio.load(details_html);

            const informazioa = $("div.tUEI8e > span:nth-child(1)").text();
            // $('.M3pmwc').html() menuaren informazioa lortzeko
            const ibilbideak = await this.extractEtapakData($('.M3pmwc').html());

            return {
                informazioa: informazioa,
                ibilbideak: ibilbideak
            };

        } else {
            return garraioa.xehetasunak;
        }
    }

    async extractEtapakData(ibilbideak_html) {
        const $ = cheerio.load(ibilbideak_html);
        const ibilbideak_data = [];

        $("span[id^='transit_group_']").each((i, elem) => {
            var mota_str = $(elem).find("div:nth-child(2) > div:nth-child(2) > div:nth-child(7) > div:nth-child(1) > div:nth-child(4) > div:nth-child(2) > div:nth-child(1) > span:nth-child(1) > img:nth-child(1)").attr("alt");
            var mota = undefined;
            switch (mota_str) {
                case "Bus":
                    mota = 0;
                    break;
                case "Train":
                    mota = 1;
                    break;
                case "Tram":
                    mota = 2;
                    break;
                case "Subway":
                    mota = 3;
                    break;
                case "Walk":
                    mota = 4;
                    break;
            }


            if (0 <= mota && mota !== undefined) {
                let orduaRegEx = /(?<h>[0-9]{1,2}):(?<m>[0-9]{2}) (?<a>(AM|PM))/gm

                var den_hasi = $(elem).find("div.Lp2Gff div.gnWycb div.qbarme").text();
                var den_bukaera = $(elem).find("div.Lp2Gff div.gnWycb div.o4X11d").text()
                                        + $(elem).find("div.Ni8Gpb span.T1PeR div.lEcnMb.pxLwif").text();
                let hasieraMatch = orduaRegEx.exec(den_hasi);
                orduaRegEx.lastIndex = 0;
                let amaieraMatch = orduaRegEx.exec(den_bukaera);

                den_hasi = ampmto24h(hasieraMatch['groups']['h'], hasieraMatch['groups']['a']) + ":" + hasieraMatch['groups']['m']
                den_bukaera = ampmto24h(amaieraMatch['groups']['h'], amaieraMatch['groups']['a']) + ":" + amaieraMatch['groups']['m']

                ibilbideak_data.push({
                    id: i,
                    izena: $(elem).find("div:nth-child(2) > div:nth-child(2) > div:nth-child(7) > div:nth-child(1) > div:nth-child(4) > div:nth-child(2) > div:nth-child(1) > span:nth-child(2) > span:nth-child(2) > span:nth-child(2) > span:nth-child(1)").text(),
                    helmuga: $(elem).find("div:nth-child(2) > div:nth-child(2) > div:nth-child(7) > div:nth-child(1) > div:nth-child(4) > div:nth-child(2) > div:nth-child(1) > span:nth-child(3) > span:nth-child(2) > span:nth-child(3)").text(),
                    enpresa: $(elem).find("div:nth-child(2) > div:nth-child(2) > div:nth-child(7) > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div:nth-child(2) > span:nth-child(1) > span:nth-child(1) > span:nth-child(1) > a:nth-child(1) > span:nth-child(2)").text(),
                    mota: mota,
                    kokapenak: {
                        hasiera: $(elem).find("span.FzIExb > h2:nth-child(2)").text(),
                        amaiera: $(elem).find("div.FzIExb > h2:nth-child(2)").text()
                    },
                    denbora: {
                        hasiera: den_hasi, 
                        amaiera: den_bukaera
                    }
                });
            }
        });
        return ibilbideak_data;
    }

    //----------------------------------------------------------------------------------------------------------------------
    // Cleaning methods

    /**
     * Transbordoak egotean hauen amaiera lekua ez da etaparen parte, baina hurrengoaren hasiera lekua da.
     **/ 
    fillDirectiontransshipment(json){
        for (var garraioa = 0; garraioa < json.length; garraioa++) {
            // ibilbideak lortu
            for (var etapa = 0; etapa < json[garraioa].xehetasunak.ibilbideak.length - 1; etapa++) {
                // eta etaparen amaiera hurrengoaren hasiera bihurtu, hau hutsa bada.
                if (json[garraioa].xehetasunak.ibilbideak[etapa].kokapenak.amaiera === "") {
                    json[garraioa].xehetasunak.ibilbideak[etapa].kokapenak.amaiera = json[garraioa].xehetasunak.ibilbideak[etapa + 1].kokapenak.hasiera;
                }
            }
        }

        return json;
    }

    removeDuplicates(json) {
        var denb_itin = denb_itin = [];
        var final_json = [];
        for (var garraioa = 0; garraioa < json.length; garraioa++) {
            const ident = JSON.stringify({
                denbora: json[garraioa].denbora,
                iterazioak: json[garraioa].iterazioak
            })
            if (!denb_itin.includes(ident)) {
                final_json.push(json[garraioa]);
                denb_itin.push(ident);
            }
        }
        return final_json;
    }

    // Itxi puppeteer
    finish() {
        this.puppet.close();
    }
}
exports.Manipulator = Manipulator;