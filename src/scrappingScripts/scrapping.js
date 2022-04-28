const cheerio = require("cheerio");
const { Puppet } = require("./Puppet");
const moment = require("moment");

class Scraper {
    constructor() {
        this.puppet = new Puppet();
    }

    async getDirectionsWithoutRoute(url) {
        // Array for data storage
        let data = [];

        // Get data from maps
        const html = await this.puppet.openGoogleMaps(url);
        this.puppet.close();

        let $ = cheerio.load(html);

        // TODO simplify this
        // css regex erabiltzen da section-directions-trip duten div-ak lortzeko, nahi ditugunak. Child direnak erabili beharko litzateke.
        $("div.m6QErb:nth-child(4) div[id^='section-directions-trip']").each((i, elem) => {
            data.push(this.extractData(i, $(elem), url));
        });
        return data;
    }

    extractData (i, elem, url){
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

            // return a json with the data
            const data = {
                    id: id,
                    hasiera: hasiera,
                    bukaera: bukaera,
                    denbora: denbora,
            }
            return data;
    }

}

const scraper = new Scraper();
scraper.getDirectionsWithoutRoute("https://www.google.com/maps/dir/?api=1&origin=Zalla&destination=Bilbao&travelmode=transit")
    .then(data => console.log(data));

