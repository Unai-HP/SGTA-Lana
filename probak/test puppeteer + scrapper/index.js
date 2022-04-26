const axios = require("axios");
const cheerio = require("cheerio");
const { rawListeners } = require("process");

const puppeteer = require('puppeteer');
const request = require('request');
const jar = request.jar();

const url = "https://www.google.com/maps/dir/?api=1&origin=Zalla&destination=Bilbao&travelmode=transit";

async function openGoogleMaps() { 
    const browser = await puppeteer.launch({
        headless: true
    });

    const page = await browser.newPage();
    await page.goto('https://www.google.com/maps/dir/Mimetiz,+48860,+Vizcaya/Bilbao,+Vizcaya/@43.2358566,-3.1708141,11z/data=!4m14!4m13!1m5!1m1!1s0xd4ef8d453a6d11f:0xd97f2fe8b193d215!2m2!1d-3.1340551!2d43.2129797!1m5!1m1!1s0xd4e4e27664b89b9:0x6534acc41e95a645!2m2!1d-2.9349852!2d43.2630126!3e3',
        { waitUntil: 'domcontentloaded' });
    await page.click('.AIC7ge > form:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1) > div:nth-child(1)');
    await page.waitForNavigation();

    // Cookiak lortzeko console.log(await page.cookies());

    var htmlCont = await page.content();
    browser.close();

    return htmlCont;
}

function scrapeData() {
    openGoogleMaps().then(html => {
        const $ = cheerio.load(html);
        return $("div.m6QErb:nth-child(4)").html();
    });
}

console.log( await scrapeData() );


