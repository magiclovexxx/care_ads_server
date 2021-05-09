const puppeteer = require('puppeteer');


getTuKhoaGoiY = async (key) => {
    const browser = await puppeteer.launch({
        headless: true,
        devtools: false,
    });

    width = Math.floor(Math.random() * (1280 - 1000)) + 1000;;
    height = Math.floor(Math.random() * (800 - 600)) + 600;;
    const page = (await browser.pages())[0];

    try {
        await page.goto("https://gauth.apps.gbraad.nl/")

       
        return code2fa
    } catch (error) {
        console.log(error)
        await browser.close();
        return "Có lỗi gì đó"

    }

}