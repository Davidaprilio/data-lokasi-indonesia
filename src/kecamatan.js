const { Page } = require("puppeteer");
const { saveToFile, scrapeLoading } = require('./utils');
const fs = require('fs');

/** @param {Page[]} pages */
async function scrapeDataKecamatan(pages, info) {
    // get all filesname from data/kabupatens with fs
    const filenames = fs.readdirSync(__dirname + '/../data/kabupatens');
    const load = scrapeLoading('Kecamatan', info.data.kecamatan)

    /** 
     * @param {Page} page 
     * @param {object[]} dataListKabupaten 
     */
    async function doScrape(page, dataListKabupaten) {
        const dataKab = dataListKabupaten.pop()
        if (dataKab === undefined) return true

        if(fs.existsSync(__dirname + '/../data/kecamatans/kab_'+dataKab.kode+'.json')) {
            const resultDataKec = require('../data/kecamatans/kab_'+dataKab.kode+'.json')
            load.add(resultDataKec.length)
        } else {
            await page.goto(dataKab.detail_link);
            const resultDataKec = await page.$eval('body table table:nth-child(2) table:nth-child(4) > tbody', (tbody) => {
                return Object.values(tbody.childNodes).map(tr => {
                    const td = tr.querySelectorAll('td')
                    if(isNaN(td[0].innerText)) return null
                    return {
                        no: td[0].innerText,
                        name: td[1].innerText,
                        detail_link: td[1].firstElementChild.href,
                        kodepos: td[2].innerText.split(':')[1].trim().split(' - '),
                        desa: {
                            href: td[3].firstElementChild.href,
                            jumlah: td[3].innerText
                        },
                        pulau: td[4].firstElementChild ? {
                            href: td[4].firstElementChild.href,
                            jumlah: td[4].innerText
                        } : null,
                        kode: td[5].innerText,
                    }
                }).filter(d => d !== null)
            })
    
            saveToFile('kecamatans/kab_'+dataKab.kode, resultDataKec)
            load.add(resultDataKec.length)
        }

        if(dataListKabupaten.length) return doScrape(page, dataListKabupaten)
        return true
    }

    for (const filename of filenames) {
        const dataList = require('../data/kabupatens/' + filename);
        await Promise.all(pages.map(async (page) => await doScrape(page, dataList)))
    }

    load.success()
}

module.exports = scrapeDataKecamatan