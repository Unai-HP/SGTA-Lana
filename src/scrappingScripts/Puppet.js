const { unwatchFile } = require("fs");
const puppeteer = require("puppeteer");
const fs = require('fs').promises;

class Puppet {
    browser
    page
    headless = true

    constructor() {
        this.browser = null;
        this.page = null;
    }

    async getDirectionsHtml(url) {
        await this.openGoogleMaps(url);
        return this.page.content();
    }

    async getDirectionDetailsHtml(selector) {
        console.log('\tGetting details for: ' + selector);
        const backSelector = ".ysKsp";

        await this.page.waitForSelector(selector)
        await this.page.click(selector)
        // Lehenengo aldian bakarrik click bat egin behar da, baina hurrengoak 2
        try {
            await this.page.waitForSelector(selector)
            await this.page.click(selector)
        } catch (error) {
            console.log("\t\tFirst datails click.")
        }

        console.log("\t\tTrip details clicked.")

        await this.page.waitForNavigation({
            waitUntil: 'networkidle2',
        });
        // wait for 1 second
        await this.page.waitForTimeout(1000);

        // Get html
        const html = await this.page.content();

        // wait for 2 seconds
        await this.page.waitForTimeout(2000);
        await this.page.waitForSelector(backSelector)
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
        // wait for 2 seconds
        await this.page.waitForTimeout(2000);

        let html = '';
        if (url !== '') {
            await this.openGoogleMaps(url);
        }

        console.log("\t\tOpening preferences. Type: " + pref)
        await this.openPreference(pref);

        // wait for 2 seconds
        await this.page.waitForTimeout(2000);
        await this.page.waitForSelector(".m6QErb:nth-child(4)")
        .then(async () => {
            html = await this.page.content();
            console.log("\t\t" + pref + " preferences closed.");
        })
        
        await this.closePreferences();

        if (html == '') {
            this.getDirectionDetailsHtml(pref);
        } else {
            return html;
        }

    }

    async openPreference(pref) {
        console.log("\t\tOpening preferences. Preference: " + pref)
        const opt_selector = ".OcYctc > span:nth-child(1)"
        const bus_selector = "#transit-vehicle-prefer-0"
        const train_selector = "#transit-vehicle-prefer-2"
        const tram_selector = "#transit-vehicle-prefer-3"
        const subway_selector = "#transit-vehicle-prefer-1"

        this.page.waitForNavigation({
            waitUntil: 'networkidle2',
        });

        await this.page.waitForSelector(opt_selector)
        await this.page.click(opt_selector)

        switch (pref) {
            case 'Bus':
                console.log("\t\t\tOpening Bus preferences.")
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

        // wait for 2 seconds
        await this.page.waitForTimeout(2000);
    }

    async closePreferences() {  
        console.log("\t\tClosing preferences.")      
        const bus_selector = "#transit-vehicle-prefer-0"
        const train_selector = "#transit-vehicle-prefer-2"
        const tram_selector = "#transit-vehicle-prefer-3"
        const subway_selector = "#transit-vehicle-prefer-1"
        const opt_selector = ".OcYctc > span:nth-child(1)"
        const close_selector = ".OcYctc > span:nth-child(2)"

        
        try {
            await this.page.click(opt_selector)
        } catch (error) {
            console.log("\t\tPreferentziak berriro irekiak.")
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
        
        await this.page.goBack();

        // wait for 2 seconds
        await this.page.waitForTimeout(2000);
    }

    async close() {
        await this.browser.close();
    }
}
exports.Puppet = Puppet;
// const puppet = new Puppet();
// puppet.getPreferenceBusHtml("https://www.google.com/maps/dir/?api=1&origin=Zalla&destination=Bilbao&travelmode=transit").then(
// //() => puppet.getDirectionDetailsHtml("#section-directions-trip-title-3")
// )