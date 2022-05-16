const puppeteer = require("puppeteer");
const fs = require('fs').promises;

class PuppetPage {
    constructor(page) {
        this.page = page;
    }

    //-----------------------------------------------------
    // Html getters

    async getPreferencedDirectionsHtml(pref, url = '') {
        const directions_selector = "#section-directions-trip-0"
        const no_direction_selector = ".hBX6ld"

        let html = '';
        if (url !== '') {
            await this.openGoogleMaps(url);
        }

        await this.openPreference(pref);
        // Lehenegoa bidaien bidaien panela itxaroten du, bigarrena bidaiarik ez badago agertzen da. Bigarrena atazkatuta ez geratzeko erabiltzen da
        await Promise.race([
            this.page.waitForSelector(directions_selector, {visible: true}), 
            this.page.waitForSelector(no_direction_selector, {visible: true})
        ])
        // Beheko zatia kargatzea itxaron ere. Denbora gehiago ematen dio.
        await this.page.waitForSelector(".etbuEf, .hBX6ld", {visible: true})
        html = await this.page.content();
        await this.closePreferences();

        return html;
    }

    async getDirectionDetailsHtml(selector) {
        const backSelector = ".ysKsp";
        const panel_selector = "#section-directions-trip-0"
        const lower_side_selector = ".dH9bXe";
        
        await this.page.waitForSelector(panel_selector, {visible: true})
        await this.page.waitForSelector(lower_side_selector, {visible: true})

        // Itxaron direkzioak kargatu harte
        console.log("\tWaiting for "+selector+" to appear..")
        await this.page.waitForSelector(selector, {visible: true})
        
        console.log("\tDirections loaded, now clicking selector "+selector+"...")
        do {
            try {
                await this.page.click(selector)
                console.log("\tDirections clicked.")
            } catch (error) {
                console.log("\t"+error)
            }
            await this.page.waitForTimeout(250)
        } while (await this.page.$(selector, {visible: true}) !== null)        
        
        console.log("\tTrip details clicked.")
        console.log("\tWaiting for content to appear...")
    
        await this.page.waitForSelector("div.m6QErb:nth-child(2)", {visible: true })
        const html = await this.page.content();

        console.log("\tWaiting for back selector to appear...")
        await this.page.waitForSelector(backSelector, { visible: true })
        await this.page.click(backSelector)
        console.log("\tTrip details closed.")

        // wait for panel reload
        await this.page.waitForSelector(".miFGmb > div:nth-child(1), .hBX6ld")

        return html;
    }

    //-----------------------------------------------------
    // Navigation methods

    async openPreference(pref) {
        console.log("-> Preference: " + pref)
        console.log("\tOpening preference.")
        const opt_selector = "button.OcYctc"
        const bus_selector = "#transit-vehicle-prefer-0"
        const train_selector = "#transit-vehicle-prefer-2"
        const tram_selector = "#transit-vehicle-prefer-3"
        const subway_selector = "#transit-vehicle-prefer-1"

        // const [response] = await Promise.all([
        //     this.page.waitForSelector(opt_selector, { visible: true }),
        //     this.page.click(opt_selector),
        // ]);

        console.log("\tWaiting for preference selector to appear...")
        // Details klikatzean "option eremua itxi egiten da beraz kasu honetan berriro ireki beharko dugu"
        while(await this.page.$(".OcYctc > span:nth-child(2)[style='']") === null) {
            console.log("\tOpening options tab again...")
            await this.page.waitForSelector(opt_selector, { visible: true, timeout: 5000 })
            await this.page.click(opt_selector)
            await this.page.waitForTimeout(250)
        }
        

        await this.page.waitForSelector("div.MlqQ3d:nth-child(2)", { visible: true })
        .then( async () => await this.page.waitForSelector(".OcYctc", { visible: true }))
        switch (pref) {
            case 'Bus':
                console.log("\tClicking bus selector " + bus_selector)
                await this.clickLoop(bus_selector)
                break;
            case 'Train':
                console.log("\tClicking train selector " + train_selector)
                await this.clickLoop(train_selector)
                break;
            case 'Tram':
                console.log("\tClicking tram selector " + tram_selector)
                await this.clickLoop(tram_selector)
                break;
            case 'Subway':
                console.log("\tClicking subway selector " + subway_selector)
                await this.clickLoop(subway_selector);
                break;
        }

        // Wait for the page to load, or if there are no results, wait for the error message
        await this.page.waitForSelector("#section-directions-trip-0, .hBX6ld", { visible: true })
        await this.page.waitForSelector(".dH9bXe, .hBX6ld", { visible: true })

        
    }

    async clickLoop(selector) {
        while (await this.page.$eval(selector, s => s.checked === false)) {
            try {
                await this.page.click(selector);
                clicked = true;
            } catch (error) {
                console.log("\tError clicking selector.");
            }
        }
    }

    async closePreferences() {  
        console.log("-> Closing preferences. Starting...")      
        const bus_selector = "#transit-vehicle-prefer-0"
        const train_selector = "#transit-vehicle-prefer-2"
        const tram_selector = "#transit-vehicle-prefer-3"
        const subway_selector = "#transit-vehicle-prefer-1"
        const opt_selector = ".OcYctc > span:nth-child(1)"
        const close_selector = ".OcYctc > span:nth-child(2)"

        await this.page.waitForSelector(".OcYctc", { visible: true })

        // Details klikatzean "option eremua itxi egiten da beraz kasu honetan berriro ireki beharko dugu"
        while(await this.page.$(".OcYctc > span:nth-child(2)[style='']") === null) {
            console.log("\tOpening options tab again...")
            await this.page.waitForSelector(opt_selector, { visible: true, timeout: 5000 })
            await this.page.click(opt_selector)
            await this.page.waitForTimeout(250)
        }
        

        await this.page.waitForSelector(bus_selector, { visible: true })
        if (await this.page.$eval(bus_selector, el => el.checked)) {
            await this.page.waitForSelector(bus_selector, { visible: true })
            await this.page.click(bus_selector)
        }

        await this.page.waitForSelector(train_selector, { visible: true })
        if (await this.page.$eval(train_selector, el => el.checked)) {
            await this.page.waitForSelector(train_selector, { visible: true })
            await this.page.click(train_selector)
        }

        await this.page.waitForSelector(tram_selector, { visible: true })
        if (await this.page.$eval(tram_selector, el => el.checked)) {
            await this.page.waitForSelector(tram_selector, { visible: true })
            await this.page.click(tram_selector)
        }

        await this.page.waitForSelector(subway_selector, { visible: true })
        if (await this.page.$eval(subway_selector, el => el.checked)) {
            await this.page.waitForSelector(subway_selector, { visible: true })
            await this.page.click(subway_selector)
        }

        // close preferences
        await this.page.waitForSelector(close_selector, { visible: true })
        await this.page.click(close_selector)

        // wait for panel to reload
        await this.page.waitForSelector(".miFGmb > div:nth-child(1), div.m6QErb:nth-child(4)", {visible: true })

        console.log("\tPreferences closed.")
    }
}
exports.PuppetPage = PuppetPage;