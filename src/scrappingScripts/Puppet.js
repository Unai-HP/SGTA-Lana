const puppeteer = require("puppeteer");

class Puppet {
    browser
    page

    constructor() {
        this.browser = null;
        this.page = null;
    }

    async openGoogleMaps(url) {
        this.browser = await puppeteer.launch({ headless: false });
        this.page = await this.browser.newPage();
        await this.page.goto(url);

        await this.page.waitForSelector(".AIC7ge > form:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1) > div:nth-child(1)"),
        await this.page.click('.AIC7ge > form:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1) > div:nth-child(1)'),
        await this.page.waitForSelector("div.m6QErb:nth-child(4)")
        const html = await this.page.content();
        return html;
    }

    async getDirectionsHtml() {
        return this.page.content();
    }

    async close() {
        await this.browser.close();
    }

    async getDetailsHtml(selector) {
        const backSelector = ".ysKsp";

        await this.page.waitFor(2000)

        await this.page.waitForSelector(selector)
        await this.page.click(selector)

        console.log("Trip details clicked")
        
        // wait a second for the details to load
        await this.page.waitFor(2000)
        await this.page.click(backSelector)

        console.log("Trip details closed")

        await this.browser.close();
    }
}
exports.Puppet = Puppet;
const puppet = new Puppet();
puppet.openGoogleMaps("https://www.google.com/maps/dir/?api=1&origin=Zalla&destination=Bilbao&travelmode=transit").then(
    data => puppet.getDetailsHtml('#section-directions-trip-0')
);
