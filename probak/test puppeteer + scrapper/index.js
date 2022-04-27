const axios = require("axios");
const cheerio = require("cheerio");
const { rawListeners } = require("process");

const puppeteer = require('puppeteer');
const request = require('request');
const jar = request.jar();

const url = "https://www.google.com/maps/dir/?api=1&origin=Zalla&destination=Bilbao&travelmode=transit";

async function openGoogleMaps() { 
    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();
    await page.goto(url);
    await page.click('.AIC7ge > form:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1) > div:nth-child(1)');
    await page.waitForNavigation();

    // Cookiak lortzeko console.log(await page.cookies());

    var htmlCont = await page.content();
    browser.close();

    return htmlCont;
}

async function scrapeData() {
    const $ = cheerio.load(await openGoogleMaps());
    return $("div.m6QErb:nth-child(4)").html();
}
scrapeData().then(console.log);



