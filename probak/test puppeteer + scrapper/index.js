const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const pretty = require("pretty"); 

// URL of the page we want to scrape
const url = "https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3";

// Async function which scrapes the data
async function scrapeData() {
    try {
        // Fetch HTML of the page we want to scrape
        const { data } = await axios.get(url);
        // Load HTML we fetched in the previous line
        const $ = cheerio.load(data);
        // show all the data in terminal
        console.log($.html());
    } catch (error) {
        console.log(error);
    }
  }
  // Invoke the above function
  scrapeData();


