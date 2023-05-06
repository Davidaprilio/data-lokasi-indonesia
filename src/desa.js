const { Page } = require("puppeteer");
const { saveToFile, scrapeLoading } = require('./utils');
const fs = require('fs');

/** @param {Page[]} pages */
async function scrapeDataDesa(pages, info) {
    // get all filesname from data/kecamatans with fs
    const filenames = fs.readdirSync(__dirname + '/../data/kecamatans');
    const load = scrapeLoading('Desa', info.data.desa_kel)

    /** @param {Page} page */
    async function doScrape(page, dataListKecamatan) {
        const dataKec = dataListKecamatan.pop()
        if (dataKec === undefined) return true

        await page.goto(dataKec.detail_link);

        const dataDesa = await page.$eval('body table table:nth-child(2) table:nth-child(4) > tbody', (tbody) => {
            return Object.values(tbody.childNodes).map(tr => {
                if(tr.nodeName === "#text" ) return null
                const td = tr.querySelectorAll('td')
                if(isNaN(td[0].innerText)) return null
                return {
                    no: td[0].innerText,
                    kodepos: td[1].innerText.replace('Kode POS ',''),
                    name: td[2].innerText,
                    detail_link: td[2].firstElementChild.href,
                    kode: td[3].innerText,
                }
            }).filter(d => d !== null)
        })

        saveToFile('desa/kec_'+dataKec.kode, dataDesa)
        load.add(dataDesa.length)

        if(dataListKecamatan.length) return doScrape(page, dataListKecamatan)
        return true
    }

    for (const filename of filenames) {
        const dataList = require('../data/kecamatans/' + filename);
        await Promise.all(pages.map(async (page) => await doScrape(page, dataList)))
    }
}

module.exports = scrapeDataDesa