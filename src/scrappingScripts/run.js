// load scrapping.js
const { Manipulator } = require('./scrapping.js');

const scraper = new Manipulator();
 // var informazioa = null;
const fs = require('fs');
// //data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
scraper.getBasicData('Sodupe', "Bilbo").then(data => {
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    // scraper.finish();
    scraper.getDetailedDirections(data).then(data => {
        // save data to file
        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
        scraper.finish();
    })
})  