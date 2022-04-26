// use Puppeteer
const puppeteer = require('puppeteer');

(async () => {
    //open a tab
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    await page.goto('https://www.google.com/maps/dir/Mimetiz,+48860,+Vizcaya/Bilbao,+Vizcaya/@43.2358566,-3.1708141,11z/data=!4m14!4m13!1m5!1m1!1s0xd4ef8d453a6d11f:0xd97f2fe8b193d215!2m2!1d-3.1340551!2d43.2129797!1m5!1m1!1s0xd4e4e27664b89b9:0x6534acc41e95a645!2m2!1d-2.9349852!2d43.2630126!3e3');
    // click ok to googles before you continue
    await page.click('.AIC7ge > form:nth-child(2) > div:nth-child(1) > div:nth-child(1) > button:nth-child(1) > div:nth-child(1)');
    // wait for the page to load
    await page.waitForNavigation();
    // click on #section-directions-trip-0 > div:nth-child(2) > div:nth-child(2) > div:nth-child(4)
    await page.click('#section-directions-trip-0 > div:nth-child(2) > div:nth-child(2) > div:nth-child(4)');
    await page.screenshot({ path: 'example.png' });

    await browser.close();
})();
