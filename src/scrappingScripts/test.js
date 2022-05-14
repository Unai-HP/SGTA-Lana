// load json file
const fs = require('fs');
const json = JSON.parse(fs.readFileSync('data.json', 'utf8'));

var denb_itin = denb_itin = [];
var final_json = [];
for (var garraioa = 0; garraioa < json.length; garraioa++) {
    const ident = JSON.stringify({
        denbora: json[garraioa].denbora,
        iterazioak: json[garraioa].iterazioak
    })
    if (!denb_itin.includes(ident)) {
        final_json.push(json[garraioa]);
        denb_itin.push(ident);
    }
}

fs.writeFileSync('Test.json', JSON.stringify(final_json, null, 2));