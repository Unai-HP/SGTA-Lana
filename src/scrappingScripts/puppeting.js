const puppeteer = require("puppeteer");
const fs = require('fs').promises;

class Puppet {

    constructor() {
        this.headless = true
        this.args = []
        this.browser = null;
        this.page = null;
    }

    //-----------------------------------------------------
    // Html getters

    async getPreferencedDirectionsHtml(pref, url = '') {
        let html = '';
        if (url !== '') {
            await this.openGoogleMaps(url);
        }

        await this.openPreference(pref);
        // Lehenegoa bidaien bidaien panela itxaroten du, bigarrena bidaiarik ez badago agertzen da. Bigarrena atazkatuta ez geratzeko erabiltzen da
        await this.page.waitForSelector(".etbuEf, #pane > div > div.e07Vkf.kA9KIf > div > div > div.hBX6ld.fontBodyMedium")
        html = await this.page.content();
        await this.closePreferences();

        return html;
    }

    async getDirectionDetailsHtml(selector) {
        const backSelector = ".ysKsp";
        // const panel_selector = "#pane > div > div.e07Vkf.kA9KIf > div > div > div.m6QErb";

        // console.log("\tWaiting for panel to appear...")
        // // wait for the panel to load
        // await this.page.waitForSelector(panel_selector)

        console.log("\tWaiting for selector (" + selector + ") to appear...")
        await this.page.waitForSelector(selector)
        await this.page.click(selector)

        // Lehenengo aldian bakarrik click bat egin behar da, baina hurrengoak 2
        try {
            await this.page.waitForSelector(selector)
            await this.page.click(selector)
        } catch (error) {
            console.log("\tFirst datails click.")
        }
        console.log("\tTrip details clicked.")

        console.log("\tWaiting for content to appear...")
        await this.page.waitForSelector("div.m6QErb:nth-child(2)")
        const html = await this.page.content();

        console.log("\tWaiting for back selector to appear...")
        await this.page.waitForSelector(backSelector)
        await this.page.click(backSelector)
        console.log("\tTrip details closed.")

        return html;
    }

    //-----------------------------------------------------
    // Navigation methods

    async getAllPreferenceDirections(url) {
        await this.openGoogleMaps(url);
        var htmls = {
            Bus: await this.getPreferencedDirectionsHtml('Bus'),
            Train: await this.getPreferencedDirectionsHtml('Train'),
            Tram: await this.getPreferencedDirectionsHtml('Tram'),
            Subway: await this.getPreferencedDirectionsHtml('Subway')
        }

        return htmls;
    }

    async openGoogleMaps(url) {
        const cookiesString = await fs.readFile('./cookies.json');
        const cookies = JSON.parse(cookiesString);

        this.browser = await puppeteer.launch({ headless: this.headless, env: { LANGUAGE: "en_US" } });
        this.page = await this.browser.newPage();
        await this.page.goto(url);

        // Lehenegoa bidaien bidaien panela itxaroten du, bigarrena bidaiarik ez badago agertzen da. Bigarrena atazkatuta ez geratzeko erabiltzen da
        await this.page.waitForSelector("div.m6QErb:nth-child(4), #pane > div > div.e07Vkf.kA9KIf > div > div > div.hBX6ld.fontBodyMedium")

        // Cookiak lortzeko
        // const cookies = await this.page.cookies();
        // await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
    }

    async openPreference(pref) {
        console.log("-> Preference: " + pref)
        console.log("\tOpening preference.")
        const opt_selector = "button.OcYctc"
        const bus_selector = ".U8X7Nb > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > label:nth-child(2)"
        const train_selector = ".U8X7Nb > div:nth-child(1) > div:nth-child(4) > div:nth-child(1) > label:nth-child(2)"
        const tram_selector = ".U8X7Nb > div:nth-child(1) > div:nth-child(5) > div:nth-child(1) > label:nth-child(2)"
        const subway_selector = ".U8X7Nb > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > label:nth-child(2)"

        // Preferentzia menua itxaron
        await this.page.waitForSelector("div.MlqQ3d:nth-child(2)")

        await this.page.waitForSelector(opt_selector)
        await this.page.click(opt_selector)

        switch (pref) {
            case 'Bus':
                await this.page.waitForSelector(bus_selector)
                await this.page.click(bus_selector) 
                break;
            case 'Train':
                await this.page.waitForSelector(train_selector)
                await this.page.click(train_selector)
                break;
            case 'Tram':
                await this.page.waitForSelector(tram_selector)
                await this.page.click(tram_selector)
                break;
            case 'Subway':
                await this.page.waitForSelector(subway_selector)
                await this.page.click(subway_selector)
                break;
        }

        await this.page.waitForSelector("div.m6QErb:nth-child(1)")
    }

    async closePreferences() {  
        console.log("-> Closing preferences. Starting...")      
        const bus_selector = "#transit-vehicle-prefer-0"
        const train_selector = "#transit-vehicle-prefer-2"
        const tram_selector = "#transit-vehicle-prefer-3"
        const subway_selector = "#transit-vehicle-prefer-1"
        const opt_selector = ".OcYctc > span:nth-child(1)"
        const close_selector = ".OcYctc"

        
        try {
            await this.page.click(opt_selector)
        } catch (error) {
            console.log("\tPreferentziak berriro irekiak.")
        }
        

        await this.page.waitForSelector(bus_selector)
        if (await this.page.$eval(bus_selector, el => el.checked)) {
            await this.page.waitForSelector(bus_selector)
            await this.page.click(bus_selector)
        }

        await this.page.waitForSelector(train_selector)
        if (await this.page.$eval(train_selector, el => el.checked)) {
            await this.page.waitForSelector(train_selector)
            await this.page.click(train_selector)
        }

        await this.page.waitForSelector(tram_selector)
        if (await this.page.$eval(tram_selector, el => el.checked)) {
            await this.page.waitForSelector(tram_selector)
            await this.page.click(tram_selector)
        }

        await this.page.waitForSelector(subway_selector)
        if (await this.page.$eval(subway_selector, el => el.checked)) {
            await this.page.waitForSelector(subway_selector)
            await this.page.click(subway_selector)
        }

        // close preferences
        await this.page.waitForSelector(close_selector)
        await this.page.click(close_selector)

        console.log("\tPreferences closed.")
    }

    async close() {
        await this.browser.close();
    }
}
exports.Puppet = Puppet;

// const puppet = new Puppet();
// puppet.openGoogleMaps('https://www.google.com/');