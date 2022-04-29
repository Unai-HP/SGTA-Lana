const cheerio = require("cheerio");
const { Puppet } = require("./Puppet");
const moment = require("moment");
const { html } = require("cheerio/lib/api/manipulation");

class Scraper {
    constructor() {
        this.puppet = new Puppet();
    }

    async getBasicDirections(url) {
        console.log("Getting basic directions for: " + url);

        // Array for data storage
        let data = [];

        // Get data from maps
        const html = await this.puppet.getDirectionsHtml(url);

        let $ = cheerio.load(html);

        // TODO simplify this
        // css regex erabiltzen da section-directions-trip duten div-ak lortzeko, nahi ditugunak. Child direnak erabili beharko litzateke.
        $("div[id^='section-directions-trip']").each((i, elem) => {
            data.push(this.extractBasicData(i, $(elem), url));
        });

        // Get details
        data = this.getDetailedDirections(data);

        return data;
    }

    extractBasicData (i, elem, url){
        const id = i;
        
        const urlParams = new URLSearchParams(url);
        const hasiera = urlParams.get("origin");
        const bukaera = urlParams.get("destination");

        // ^ erabiltzen da css_selector-ean regex erabiltzeko. 
        const denbora = {
            hasiera: elem.find("h1[id^='section-directions-trip-title-'] > span:nth-child(2) > span:nth-child(1)").text(),
            bukaera: elem.find("h1[id^='section-directions-trip-title-'] > span:nth-child(2) > span:nth-child(2)").text(),
            iraupena: elem.find("div[class='Fk3sm fontHeadlineSmall']").text(),
        }

        // Denborari formatua aldatu
        denbora.hasiera = moment(denbora.hasiera, "HH:mm").format("HH:mm");
        denbora.bukaera = moment(denbora.bukaera, "HH:mm").format("HH:mm");

        const details_selector = '#' + elem.find("img").attr("id");

        // return a json with the data
        const data = {
                id: id,
                hasiera: hasiera,
                bukaera: bukaera,
                denbora: denbora,
                details: details_selector
        }
        return data;
    }

    async getDetailedDirections (json) {
        for (let i = 0; i < json.length; i++) {
            json[i].details = await this.getDetails(json[i]);
        }
        return json;
    }

    async getDetails(json) {
        // String-a bada details-ak kargatu ez direla esan nahi du.
        if (typeof json.details === "string") {
            const details_html = await this.puppet.getDirectionDetailsHtml(json.details);

            const $ = cheerio.load(details_html);

            const informazioa = $("div.tUEI8e > span:nth-child(1)").text();
            
            const etapak = await this.extractEtapakData($('.M3pmwc').html());

            return {
                informazioa: informazioa,
                etapak: etapak
            };
        } else {
            return json.details;
        }
        
    }

    async extractEtapakData(etapak) {
        // id: number; // Identifikazioa (barnekoa)
        // izena: string;
        // helmuga: string; // Linearen helmuga
        // mota: GarraioMota;

        // hasiera: string; // Hasiera lekua
        // amaiera: string; // Amaiera lekua
        // denbora: {
        //     hasiera: string;
        //     amaiera: string;
        // };

        const $ = cheerio.load(etapak);
        const etapak_data = [];

        $("span[id^='transit_group_']").each((i, elem) => {
            const mota = $(elem).find("div:nth-child(2) > div:nth-child(2) > div:nth-child(7) > div:nth-child(1) > div:nth-child(4) > div:nth-child(2) > div:nth-child(1) > span:nth-child(1) > img:nth-child(1)").attr("alt");
            
            // is mota bus or train or tram
            if (mota === "bus", "train", "tram" && mota !== undefined) {
                etapak_data.push({
                    id: i,
                    izena: $(elem).find("div.voTEBc:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div:nth-child(2) > span:nth-child(1) > span:nth-child(1) > span:nth-child(1) > a:nth-child(1) > span:nth-child(2)").text(),
                    hasiera: $(elem).find("span.FzIExb > h2:nth-child(2)").text(),
                    amaiera: $(elem).find("div.FzIExb > h2:nth-child(2)").text(),
                    denbora: {
                        hasiera: $(elem).find("div:nth-child(1) > div:nth-child(1) > div:nth-child(2)").text(), 
                        bukaera: $(elem).find(".lEcnMb").text()
                                    + $(elem).find(".qbarme").text()
                                    + $(elem).find("div[class='lEcnMb pxLwif']").first().text()
                    },
                    mota: mota
                });
            }
        });

        console.log(etapak_data);

        return etapak_data;
    }

    finish() {
        this.puppet.close();
    }
}

const scraper = new Scraper();
scraper.getBasicDirections("https://www.google.com/maps/dir/?api=1&origin=Madrid&destination=Paris&travelmode=transit").then(
    data => console.log('Success:' + data))
.then(
    () => scraper.finish()
);


