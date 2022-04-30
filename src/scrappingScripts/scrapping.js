const cheerio = require("cheerio");
const { Puppet } = require("./Puppet");
const moment = require("moment");
const { html } = require("cheerio/lib/api/manipulation");
const { Z_ASCII } = require("zlib");

class Scraper {
    constructor() {
        this.puppet = new Puppet();
    }

    async getBasicData(url) {
        console.log("Getting basic data...");
        let directions = [];

        const html = await this.puppet.getPreferenceDirectionsAllHtml(url);

        for (let i = 0; i < html.length; i++) {
            directions.push(await this.getBasicDirections(html[i]));
        }
        
        // save json file
        const fs = require('fs');
        fs.writeFileSync('data.json', JSON.stringify(directions, null, 2));

        return directions;
    }

    async getBasicDirections(html) {
        console.log("Getting basic directions...");

        let directions = [];
        let $ = cheerio.load(html);

        $("div[id^='section-directions-trip']").each((i, elem) => {
            var basic_garraioa = this.extractBasicData(i, $(elem))
            basic_garraioa.pref = $(".U8X7Nb > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > label:nth-child(2) > span:nth-child(1)").text();
            directions.push(basic_garraioa);
        });

        return this.getDetailedDirections(directions);
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
        for (let i = 0; i < json.length; i++) {
            json[i].details = await this.getGarraioaDetails(json[i]);
        }

        json = this.fillDirectiontransshipment(json);

        // for (let i = 0; i < json.length; i++) {
        //     console.log(json[i].details.etapak)
        // }

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
            const details_html = await this.puppet.getDirectionDetailsHtml(garraioa.details, garraioa.pref);
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

    async extractEtapakData(etapak) {

        const $ = cheerio.load(etapak);
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
        // Bidaia bakoitzako
        for (let i = 0; i < json.length; i++) {
            // etapak lortu
            for (let j = 0; j < json[i].details.etapak.length; j++) {
                // eta etaparen amaiera hurrengoaren hasiera bihurtu, hau hutsa bada.
                if (json[i].details.etapak[j].amaiera === "") {
                    json[i].details.etapak[j].amaiera = json[i].details.etapak[j+1].hasiera;; 
                }
            }            
        }

        return json;
    }

    // Itxi puppeteer
    finish() {
        this.puppet.close();
    }
}

const scraper = new Scraper();
scraper.getBasicData("https://www.google.com/maps/dir/?api=1&origin=Madrid&destination=Paris&travelmode=transit").then(
    data => console.log('Success:' + data))
.then(
    () => scraper.finish()
);


