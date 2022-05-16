// load scrapping.js
const { Manipulator } = require('./scrapping.js');

// async function run(){
//     while (true) {
//         const scraper = new Manipulator();
//         // var informazioa = null;
//         const fs = require('fs');
//         // //data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
//         await scraper.getBasicData('Bilbo', "Donostia").then(async data => {
//             fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
//             scraper.finish();
//             // await scraper.getDetailedDirections(data).then(data => {
//             //     // save data to file
//             //     fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
//             //     scraper.finish();
//             // })
//         }) 
//     }
// }
// run();

const scraper = new Manipulator();
// var informazioa = null;
const fs = require('fs');
// //data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
scraper.getBasicData('Bilbo', "Sodupe").then(async data => {
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    // scraper.finish();
    // scraper.getDetailedDirections(data).then(data => {
    //     // save data to file
    //     fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    //     scraper.finish();
    // })
}) 