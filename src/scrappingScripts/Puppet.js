const puppeteer = require("puppeteer");

class Puppet {
    browser
    page

    constructor() {
        this.browser = null;
        this.page = null;
    }

    async getDirectionsHtml(url) {
        await this.openGoogleMaps(url);
        return this.page.content();
    }

    async openGoogleMaps(url) {
        this.browser = await puppeteer.launch({ headless: true });
        this.page = await this.browser.newPage();
        await this.page.goto(url);

        await this.page.waitForSelector(".AIC7ge > form:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1) > div:nth-child(1)"),
        await this.page.click('.AIC7ge > form:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1) > div:nth-child(1)'),
        await this.page.waitForSelector("div.m6QErb:nth-child(4)")
    }

    

    async getDirectionDetailsHtml(selector) {
        console.log('\tGetting details for: ' + selector);

        const backSelector = ".ysKsp";

        await this.page.waitForSelector(selector)
        await this.page.click(selector)
        // Lehenengo aldian bakarrik click bat egin behar da, baina hurrengoak 2
        try {
            await this.page.click(selector)
        } catch (error) {
            console.log("\t\tFirst datails click.")
        }

        console.log("\t\tTrip details clicked.")

        await this.page.waitForSelector(backSelector)

        // Get html
        const html = await this.page.content();

        await this.page.click(backSelector)

        await this.page.waitForSelector(selector)

        console.log("\t\tTrip details closed.")

        return html;
    }

    async close() {
        await this.browser.close();
    }
}
exports.Puppet = Puppet;
// const puppet = new Puppet();
// puppet.openGoogleMaps("https://www.google.com/maps/dir/?api=1&origin=Zalla&destination=Bilbao&travelmode=transit").then(
//     data => puppet.getDirectionDetailsHtml('#section-directions-trip-0')
// );
