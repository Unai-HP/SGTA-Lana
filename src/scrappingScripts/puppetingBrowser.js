const { bus } = require("ionicons/icons");
const { re } = require("mathjs");
const puppeteer = require("puppeteer");
const fs = require('fs').promises;
const { PuppetPage } = require('./puppetingPage.js');

class PuppetBrowser {

    constructor() {
        this.headless = false
        this.args = ["--no-sandbox", "--disable-dev-shm-usage"]
        this.browser = null;
    }

    async getAllPreferenceDirections(url) {
        await this.openBrowser();

        const bus_page = new PuppetPage(await this.openPage(url));
        const train_page = new PuppetPage(await this.openPage(url));
        const tram_page = new PuppetPage(await this.openPage(url));
        const subway_page = new PuppetPage(await this.openPage(url));

        var bus_data = []
        var train_data = []
        var tram_data = []
        var subway_data = []
        await Promise.resolve([
            bus_page.getPreferencedDirectionsHtml('Bus')
            .then(data => bus_data = data),
            train_page.getPreferencedDirectionsHtml('Train')
            .then(data => train_data = data),
            tram_page.getPreferencedDirectionsHtml('Tram')
            .then(data => tram_data = data),
            subway_page.getPreferencedDirectionsHtml('Subway')  
            .then(data => subway_data = data)
        ])

        var htmls = {
            Bus: bus_data,
            Train: train_data,
            Tram: tram_data,
            Subway: subway_data
        }

        console.log("Htmls: " + htmls)
        return htmls;
    }

    async openBrowser() {
        this.browser = await puppeteer.launch({ headless: this.headless, env: { LANGUAGE: "en_US" }, args: this.args, ignoreDefaultArgs: ['--disable-extensions'] });
    }

    async openPage(url){
        var page = await this.browser.newPage();
        await page.goto(url);

        // Lehenegoa bidaien bidaien panela itxaroten du, bigarrena bidaiarik ez badago agertzen da. Bigarrena atazkatuta ez geratzeko erabiltzen da
        await page.waitForSelector("div.m6QErb:nth-child(4), .hBX6ld")

        // Cookiak lortzeko
        // const cookies = await this.page.cookies();
        // await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
        return page
    }

    async close() {
        await this.browser.close();
    }
}
exports.PuppetBrowser = PuppetBrowser;