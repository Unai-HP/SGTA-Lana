const cheerio = require("cheerio");
const { Puppet } = require("./Puppet");

class Scraper {
    constructor() {
        this.puppet = new Puppet();
    }

    async getDirectionsWithoutRoute(url) {
        // Get data from maps
        const html = await this.puppet.openGoogleMaps(url);
        this.puppet.close();

        let $ = cheerio.load(html);

        // TODO simplify this
        // css regex erabiltzen da section-directions-trip duten div-ak lortzeko, nahi ditugunak. Child direnak erabili beharko litzateke.
        $("div.m6QErb:nth-child(4) div[id^='section-directions-trip']").each(function(i, elem) {
            console.log("Elementua: ", $(this).html(), "\n\n");
        });
    }

    extractInfoFromDirection(div) {
        console.log("Successfully extracted data from google maps");
    }
}

const scraper = new Scraper();
scraper.getDirectionsWithoutRoute("https://www.google.com/maps/dir/?api=1&origin=Zalla&destination=Bilbao&travelmode=transit")

