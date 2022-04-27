const puppeteer = require("puppeteer");

class Puppet {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async openGoogleMaps(url) {
        this.browser = await puppeteer.launch({ headless: true });
        this.page = await this.browser.newPage();
        await this.page.goto(url);
        await this.page.click('.AIC7ge > form:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1) > div:nth-child(1)');
        await this.page.waitForSelector("div.m6QErb:nth-child(4)");
        return this.page.content();
    }

    async getDirections() {
        return this.page.content();
    }

    async close() {
        await this.browser.close();
    }
}
exports.Puppet = Puppet;
// open google maps and close
// const p = new Puppet();
// p.openGoogleMaps('https://www.google.com/maps/dir/?api=1&origin=Zalla&destination=Bilbao&travelmode=transit').then(async () => {
//     p.close();
// });
