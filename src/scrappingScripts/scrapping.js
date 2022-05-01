const cheerio = require("cheerio");
const { Puppet } = require("./Puppet");
const moment = require("moment");
const Promise = require("bluebird");

class Scraper {
    constructor() {
        this.puppet = new Puppet();
    }

    async getBasicData(url) {
        console.log("Getting basic data...");
        let directions = [];

        var html_dictionary = await this.puppet.getPreferenceDirectionsAllHtml(url)
        for (const [key, value] of Object.entries(html_dictionary)) {
            var basic_garraio_multzoa = this.getBasicDirections(value);
            basic_garraio_multzoa.push({pref: key});
            directions.push(basic_garraio_multzoa);
        }
        
        // save json file
        const fs = require('fs');
        fs.writeFileSync('data.json', JSON.stringify(directions, null, 2));

        return directions;
    }

    getBasicDirections(html) {
        console.log("Getting basic directions...");

        let directions = [];
        let $ = cheerio.load(html);

        $("div[id^='section-directions-trip']").each((i, elem) => {
            var basic_garraioa = this.extractBasicData(i, $(elem))
            directions.push(basic_garraioa);
        });

        return directions;
    }

    extractBasicData (i, elem, full_html) {
        const id = i;

        // ^ erabiltzen da css_selector-ean regex erabiltzeko. 
        const denbora = {
            hasiera: elem.find("h1[id^='section-directions-trip-title-'] > span:nth-child(2) > span:nth-child(1)").text(),
            bukaera: elem.find("h1[id^='section-directions-trip-title-'] > span:nth-child(2) > span:nth-child(2)").text(),
            iraupena: elem.find("div[class='Fk3sm fontHeadlineSmall']").text(),
        }

        // Denborari formatua aldatu
        denbora.hasiera = moment(denbora.hasiera, "HH:mm a").format("HH:mm");
        denbora.bukaera = moment(denbora.bukaera, "HH:mm a").format("HH:mm");
        // lortu desberdintazuna minututan
        denbora.iraupena = elem.find("div[class='Fk3sm fontHeadlineSmall']").text();

        const details_selector = '#' + elem.find("img").attr("id");

        // return a json with the data
        const data = {
                id: id,
                denbora: denbora,
                details: details_selector
        }
        return data;
    }

    async getDetailedDirections (json) {
        if (true) {
            console.log("Getting detailed directions...");
            for (let garraio_multz = 0; garraio_multz < json.length; garraio_multz++) {
                const pref = json[garraio_multz].pref;
                console.log("Where 1");
                await this.puppet.openPreference(pref);
                console.log("Where 2");
                for (let garraio = 0; garraio < json[garraio_multz].length; garraio++) {
                    json[garraio_multz][garraio].details = await this.getGarraioaDetails(json[garraio_multz][garraio]);
                }
                console.log("Where 3");
                await this.puppet.closePreference();
            }
        } else {
            for (let i = 0; i < json.length; i++) {
                json[i].details = await this.getGarraioaDetails(json[i]);
            }
        }
        
        json = this.fillDirectiontransshipment(json);

        // save json file 
        const fs = require('fs');
        fs.writeFileSync('data.json', JSON.stringify(json, null, 2));

        return json;
    }

    /**
     * Garraio baten details-ak lortu.
     * @param {json} garraioa - Garraio baten json-a, details gabe, selectorra bakarrik.
     * @returns {json} garraioa - Garraio baten json-a, details-ekin.
    */
    async getGarraioaDetails(garraioa) {
        // String-a bada details-ak kargatu ez direla esan nahi du.
        if (typeof garraioa.details === "string") {
            console.log("Getting details...");
            const details_html = await this.puppet.getDirectionDetailsHtml(garraioa.details);
            const $ = cheerio.load(details_html);

            const informazioa = $("div.tUEI8e > span:nth-child(1)").text();
            // $('.M3pmwc').html() menuaren informazioa lortzeko
            const etapak = await this.extractEtapakData($('.M3pmwc').html());

            return {
                informazioa: informazioa,
                etapak: etapak
            };
        } else {
            return garraioa.details;
        }
        
    }

    async extractEtapakData(etapak_html) {

        const $ = cheerio.load(etapak_html);
        const etapak_data = [];

        $("span[id^='transit_group_']").each((i, elem) => {
            const mota = $(elem).find("div:nth-child(2) > div:nth-child(2) > div:nth-child(7) > div:nth-child(1) > div:nth-child(4) > div:nth-child(2) > div:nth-child(1) > span:nth-child(1) > img:nth-child(1)").attr("alt");
            
            if (mota === "bus", "train", "tram" && mota !== undefined) {

                let den_hasi = $(elem).find("div.Lp2Gff div.gnWycb div.qbarme").text();
                den_hasi = moment(den_hasi, "HH:mm a").format("HH:mm");

                let den_bukaera = $(elem).find("div.Lp2Gff div.gnWycb div.o4X11d").text()
                                        + $(elem).find("div.Ni8Gpb span.T1PeR div.lEcnMb.pxLwif").text();
                den_bukaera = moment(den_bukaera, "HH:mm a").format("HH:mm");

                etapak_data.push({
                    id: i,
                    izena: $(elem).find("div.Ni8Gpb > div > div.transit-logical-step-content.noprint.za2rbe > div.voTEBc > div > div:nth-child(3) > div.Cc5bxc > span > span > span:nth-child(1) > a > span:nth-child(2)").text(),
                    hasiera: $(elem).find("span.FzIExb > h2:nth-child(2)").text(),
                    amaiera: $(elem).find("div.FzIExb > h2:nth-child(2)").text(),
                    denbora: {
                        hasiera: den_hasi, 
                        bukaera: den_bukaera
                    },
                    mota: mota
                });
            }
        });
        return etapak_data;
    }

    // Transbordoak egotean hauen amaiera lekua ez da etaparen parte, baina hurrengoaren hasiera lekua da.
    fillDirectiontransshipment(json){
        if (json.hasOwnProperty("pref")) {
            for (let garraio_multzoa = 0; garraio_multzoa < json.length; garraio_multzoa++) {
                // Length - 1 pref datua ez artzeko
                for (let garraioa = 0; garraioa < json.length - 1; garraioa++) {
                    // etapak lortu
                    for (let etapa = 0; etapa < json[garraio_multzoa][garraioa].details.etapak.length; etapa++) {
                        // eta etaparen amaiera hurrengoaren hasiera bihurtu, hau hutsa bada.
                        if (json[garraio_multzoa][garraioa].details.etapak[etapa].amaiera === "") {
                            json[garraio_multzoa][garraioa].details.etapak[etapa].amaiera = json[garraio_multzoa][garraioa].details.etapak[etapa + 1].hasiera;;
                        }
                    }
                }
            }
        } else {
            for (let garraioa = 0; garraioa < json.length; garraioa++) {
                // etapak lortu
                for (let etapa = 0; etapa < json[garraioa].details.etapak.length; etapa++) {
                    // eta etaparen amaiera hurrengoaren hasiera bihurtu, hau hutsa bada.
                    if (json[garraioa].details.etapak[etapa].amaiera === "") {
                        json[garraioa].details.etapak[etapa].amaiera = json[garraioa].details.etapak[etapa + 1].hasiera;;
                    }
                }
            }
        }
        

        return json;

        // Bidaia bakoitzako
        function bidaiakFill() {
            
        }
    }

    // Itxi puppeteer
    finish() {
        this.puppet.close();
    }
}

const scraper = new Scraper();
var data = [];
data = scraper.getBasicData("https://www.google.com/maps/dir/?api=1&origin=Madrid&destination=Paris&travelmode=transit")
Promise.all(data).then(function(values) {
    //console.log(JSON.stringify(values, null, 2));
    scraper.getDetailedDirections(values);
    scraper.finish();
});

