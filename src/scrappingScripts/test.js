// open data.json
const fs = require('fs');
const data = fs.readFileSync('data.json', 'utf8');
var json = JSON.parse(data);

var denb_itin = denb_itin = [];
var final_json = [];
for (let garraioa = 0; garraioa < json.length; garraioa++) {
    const ident = JSON.stringify({
        denbora: json[garraioa].denbora,
        iterazioak: json[garraioa].iterezaioak
    })
    if (!denb_itin.includes(ident)) {
        final_json.push(json[garraioa]);
        denb_itin.push(ident);
    }
}
console.log(JSON.stringify(final_json, null, 2));