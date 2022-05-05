const cheerio = require("cheerio");
const moment = require("moment");
const Math = require("mathjs");
const { Puppet } = require("./puppeting");

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

        directions = this.removeDuplicates(directions);
        return directions;
    }

    async getDetailedDirections (json) {
        console.log("Getting detailed directions...");

        // Preferntzia mota guztiak lortu
        const preferences = [];
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

        json = this.fillDirectiontransshipment(json);
        json = this.removeDuplicates(json);
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

        // Denborari formatua aldatu
        denbora.hasiera = moment(denbora.hasiera, "HH:mm a").format("HH:mm");
        denbora.amaiera = moment(denbora.amaiera, "HH:mm a").format("HH:mm");
        // lortu desberdintazuna minututan
        denbora.iraupena = $("div[class='Fk3sm fontHeadlineSmall']").text();

        var iterazioak = [];
        $("div:nth-child(2) > div:nth-child(2) > div:nth-child(3) > span").each((i, elem) => {
            if (i % 2 === 0) {
                iterazioak.push({
                    img: $(elem).find("span:nth-child(1) > img:nth-child(1)").attr("alt"), 
                    text: $(elem).find("span:nth-child(2) > span:nth-child(2) > span:nth-child(2) > span:nth-child(1)").text()
                });
            }                                             
        });

        const details_selector = '#' + $("img").attr("id");

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
                var den_hasi = $(elem).find("div.Lp2Gff div.gnWycb div.qbarme").text();
                den_hasi = moment(den_hasi, "HH:mm a").format("HH:mm");

                var den_bukaera = $(elem).find("div.Lp2Gff div.gnWycb div.o4X11d").text()
                                        + $(elem).find("div.Ni8Gpb span.T1PeR div.lEcnMb.pxLwif").text();
                den_bukaera = moment(den_bukaera, "HH:mm a").format("HH:mm");

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
        // Length - 1 pref datua ez artzeko
        for (var garraioa = 0; garraioa < json.length; garraioa++) {
            // ibilbideak lortu
            for (var etapa = 0; etapa < json[garraioa].xehetasunak.ibilbideak.length - 1; etapa++) {
                // eta etaparen amaiera hurrengoaren hasiera bihurtu, hau hutsa bada.
                if (json[garraioa].xehetasunak.ibilbideak[etapa].amaiera === "") {
                    json[garraioa].xehetasunak.ibilbideak[etapa].amaiera = json[garraioa].xehetasunak.ibilbideak[etapa + 1].hasiera;;
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

// const scraper = new Manipulator();
// // var informazioa = null;
// const fs = require('fs');
// // //data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
// scraper.getBasicData('Bilbo', "Zalla").then(data => {
//     fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
//     //scraper.finish();
//     scraper.getDetailedDirections(data).then(data => {
//         // save data to file
//         fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
//         scraper.finish();
//     })
// })