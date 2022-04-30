const puppeteer = require("puppeteer");

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

    async getDirectionDetailsHtml(selector, pref = '') {
        console.log('\tGetting details for: ' + selector);
        const backSelector = ".ysKsp";

        console.log('Preference' + pref);
        if (pref !== '') {
            await this.openPreference(pref);
        }

        // wait a second
        await this.page.waitFor(2000);

        await this.page.waitForSelector(selector)
        await this.page.click(selector)
        // Lehenengo aldian bakarrik click bat egin behar da, baina hurrengoak 2
        try {
            // wait a second
            await this.page.waitFor(2000);
            await this.page.click(selector)
        } catch (error) {
            console.log("\t\tFirst datails click.")
        }

        console.log("\t\tTrip details clicked.")

        await this.page.waitForSelector(backSelector)
        await this.page.waitForSelector(backSelector)

        // Get html
        const html = await this.page.content();

        await this.page.click(backSelector)

        await this.page.waitForSelector(selector)

        console.log("\t\tTrip details closed.")

        return html;
    }

    async openGoogleMaps(url) {
        this.browser = await puppeteer.launch({ headless: this.headless });
        this.page = await this.browser.newPage();
        await this.page.goto(url);

        await this.page.waitForSelector(".AIC7ge > form:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1) > div:nth-child(1)"),
        await this.page.click('.AIC7ge > form:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1) > div:nth-child(1)'),
        await this.page.waitForSelector("div.m6QErb:nth-child(4)")
    }

    async getPreferenceDirectionsAllHtml(url) {
        await this.openGoogleMaps(url);
        var htmls = [];

        htmls.push(await this.getPreferenceByTypeHtml('Bus'));
        htmls.push(await this.getPreferenceByTypeHtml('Train'));
        htmls.push(await this.getPreferenceByTypeHtml('Tram'));
        htmls.push(await this.getPreferenceByTypeHtml('Subway'));

        return htmls;
    }

    async getPreferenceByTypeHtml(type, url = '') {
        if (url !== '') {
            await this.openGoogleMaps(url);
        }

        await this.openPreference(type);
        const html = await this.page.content();
        console.log("\t\t" + type + " preferences closed.")
        await this.closePreferences();

        return html;

    }

    async openPreference(pref) {
        const opt_selector = ".OcYctc > span:nth-child(1)"
        await this.page.waitForSelector(opt_selector)
        await this.page.click(opt_selector)
        await this.page.waitForSelector("div.MlqQ3d:nth-child(2)")

        switch (pref) {
            case 'Bus':
                await this.page.click("#transit-vehicle-prefer-0")
                break;
            case 'Train':
                await this.page.click("#transit-vehicle-prefer-2")
                break;
            case 'Tram':
                await this.page.click("#transit-vehicle-prefer-3")
                break;
            case 'Subway':
                await this.page.click("#transit-vehicle-prefer-1")
                break;
        }

        await this.page.waitForNavigation({
            waitUntil: 'networkidle2',
        });
    }

    async closePreferences() {  
        console.log("\t\tClosing preferences.")      
        const bus_selector = "#transit-vehicle-prefer-0"
        const train_selector = ".U8X7Nb > div:nth-child(1) > div:nth-child(4) > div:nth-child(1) > label:nth-child(2)"
        const tram_selector = ".U8X7Nb > div:nth-child(1) > div:nth-child(5) > div:nth-child(1) > label:nth-child(2)"
        const subway_selector = ".U8X7Nb > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > label:nth-child(2)"
        const close_selector = ".OcYctc > span:nth-child(2)"

        await this.page.waitForSelector(bus_selector)
        if (await this.page.$eval(bus_selector, el => el.checked)) {
            await this.page.click(bus_selector)
        }

        await this.page.waitForSelector(train_selector)
        if (await this.page.$eval(train_selector, el => el.checked)) {
            await this.page.click(train_selector)
        }

        await this.page.waitForSelector(tram_selector)
        if (await this.page.$eval(tram_selector, el => el.checked)) {
            await this.page.click(tram_selector)
        }

        await this.page.waitForSelector(subway_selector)
        if (await this.page.$eval(subway_selector, el => el.checked)) {
            await this.page.click(subway_selector)
        }

        // close preferences
        await this.page.waitForSelector(close_selector)
        await this.page.click(close_selector)
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