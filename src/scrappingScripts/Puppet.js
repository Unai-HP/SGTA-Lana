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
        await this.page.waitForNavigation();
        const html = await this.page.content();
        this.browser.close();
        return html;
    }

    async getDirections() {
        return this.page.content();
    }

    async close() {
        await this.browser.close();
    }
}
exports.Puppet = Puppet;
