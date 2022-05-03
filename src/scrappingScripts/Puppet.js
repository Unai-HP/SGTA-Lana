const puppeteer = require("puppeteer");
const fs = require('fs').promises;

class Puppet {
    browser
    page
    headless = false

    constructor() {
        this.browser = null;
        this.page = null;
    }

    async getDirectionsHtml(url) {
        await this.openGoogleMaps(url);
        return this.page.content();
    }

    async getDirectionDetailsHtml(selector) {
        console.log('\tGetting details html for: ' + selector);
        const backSelector = ".ysKsp";

        // wait for the panel to load
        await this.page.waitForSelector(".miFGmb", { timeout: 100000 })

        await this.page.waitForSelector(selector, { timeout: 100000 })
        await this.page.click(selector)

        // Lehenengo aldian bakarrik click bat egin behar da, baina hurrengoak 2
        try {
            await this.page.waitForSelector(selector, { timeout: 100000 })
            await this.page.click(selector)
        } catch (error) {
            console.log("\t\tFirst datails click.")
        }

        console.log("\t\tTrip details clicked.")

        await this.page.waitForSelector(".M3pmwc", { timeout: 100000 })

        // Get html
        const html = await this.page.content();


        await this.page.waitForSelector('.szK3Wb', { timeout: 100000 })
        await this.page.waitForSelector(backSelector, { timeout: 100000 })
        await this.page.click(backSelector)

        console.log("\t\tTrip details closed.")

        return html;
    }

    async openGoogleMaps(url) {
        const cookiesString = await fs.readFile('./cookies.json');
        const cookies = JSON.parse(cookiesString);

        this.browser = await puppeteer.launch({ headless: this.headless });
        this.page = await this.browser.newPage();
        await this.page.setCookie(...cookies);
        await this.page.goto(url);

        await this.page.waitForSelector("div.m6QErb:nth-child(4)")

        // Cookiak lortzeko
        // const cookies = await this.page.cookies();
        // await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
    }

    async getPreferenceDirectionsAllHtml(url) {
        await this.openGoogleMaps(url);
        var htmls = {
            Bus: await this.getPreferencedDirectionsByTypeHtml('Bus'),
            Train: await this.getPreferencedDirectionsByTypeHtml('Train'),
            Tram: await this.getPreferencedDirectionsByTypeHtml('Tram'),
            Subway: await this.getPreferencedDirectionsByTypeHtml('Subway')
        }

        return htmls;
    }

    async getPreferencedDirectionsByTypeHtml(pref, url = '') {

        let html = '';
        if (url !== '') {
            await this.openGoogleMaps(url);
        }

        await this.openPreference(pref);

        // wait for 2 seconds
        //await this.page.waitForTimeout(2000);

        await this.page.waitForSelector(".etbuEf")

        html = await this.page.content();
        
        await this.closePreferences();

        if (html == '') {
            this.getDirectionDetailsHtml(pref);
        } else {
            return html;
        }

    }

    async openPreference(pref) {
        console.log("-> Preference: " + pref)
        console.log("\tOpening preference.")
        const opt_selector = "button.OcYctc"
        const bus_selector = "#transit-vehicle-prefer-0"
        const train_selector = "#transit-vehicle-prefer-2"
        const tram_selector = "#transit-vehicle-prefer-3"
        const subway_selector = "#transit-vehicle-prefer-1"

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
    }

    async closePreferences() {  
        console.log("\tClosing preferences. Starting...")      
        const bus_selector = "#transit-vehicle-prefer-0"
        const train_selector = "#transit-vehicle-prefer-2"
        const tram_selector = "#transit-vehicle-prefer-3"
        const subway_selector = "#transit-vehicle-prefer-1"
        const opt_selector = ".OcYctc > span:nth-child(1)"
        const close_selector = ".OcYctc > span:nth-child(2)"

        
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