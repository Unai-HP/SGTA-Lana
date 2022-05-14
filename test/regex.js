function ampmto24h(h, a) {
    h = parseInt(h)
    if (a.toLowerCase() === "am" && h === 12) h = 0
    if (a.toLowerCase() === "pm") {
        if (h !== 12) h += 12
    }
    let emaitza = h.toString()
    return (emaitza.length === 1) ? "0" + emaitza : emaitza
}

function a(a, b, c) {
    let iraupenaRegEx = /^((?<d>[0-9]{1,2}) day[s]?)?[ ]?((?<h>[0-9]{1,2}) hr)?[ ]?((?<m>[0-9]{1,2}) min)?$/gm;
    let orduaRegEx = /(?<h>[0-9]{1,2}):(?<m>[0-9]{2}) (?<a>(AM|PM))/gm;

    let hasieraMatch = orduaRegEx.exec(a);
    orduaRegEx.lastIndex = 0;
    let amaieraMatch = orduaRegEx.exec(b);
    let iraupenaMatch = iraupenaRegEx.exec(c);

    denbora = {};
    denbora.hasiera = ampmto24h(hasieraMatch['groups']['h'], hasieraMatch['groups']['a']) + ":" + hasieraMatch['groups']['m']
    denbora.amaiera = ampmto24h(amaieraMatch['groups']['h'], amaieraMatch['groups']['a']) + ":" + amaieraMatch['groups']['m']
    denbora.iraupena = ((iraupenaMatch['groups']['d'] !== undefined) ? ((iraupenaMatch['groups']['d'].length === 1?'0':'')+iraupenaMatch['groups']['d'] + ":") : "00:") + 
        ((iraupenaMatch['groups']['h'] !== undefined) ? (iraupenaMatch['groups']['h'].length === 1?'0':'')+iraupenaMatch['groups']['h'] + ":" : "00:") +
        ((iraupenaMatch['groups']['m'] !== undefined) ? (iraupenaMatch['groups']['m'].length === 1?'0':'')+iraupenaMatch['groups']['m'] : "00")

    console.log(a+"->"+denbora.hasiera)
    console.log(b+"->"+denbora.amaiera)
    console.log(c+"->"+denbora.iraupena)
}

a('10:57 AM','12:16 PM', '1 hr 19 min')
a('11:27 AM','1:01 PM','1 hr 34 min')
a('6:27 PM', '6:03 AM', '10 days 4 hr')
a('1:27 PM','12:40 PM','23 hr 13 min')
a('1:27 PM', '6:00 PM (Sunday)', '1 day 5 hr')
a('11:32 AM','12:01 PM','29 min')