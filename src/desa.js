const { Page } = require("puppeteer");
const { saveToFile, scrapeLoading } = require('./utils');
const fs = require('fs');

/** @param {Page[]} pages */
async function scrapeDataDesa(pages, info) {
    // get all filesname from data/kecamatans with fs
    const filenames = fs.readdirSync(__dirname + '/../data/kecamatans');
    const load = scrapeLoading('Desa', info?.data?.desa_kel)

    /** @param {Page} page */
    async function doScrape(page, dataListKecamatan, index) {
        pages[index].total_work = (pages[index].total_work || 0) + 1 
        const dataKec = dataListKecamatan.pop()
        if (dataKec === undefined) return true

        // chek if file exist
        if(fs.existsSync(__dirname + '/../data/desa/kec_'+dataKec.kode+'.json')) {
            const dataDesa = require('../data/desa/kec_'+dataKec.kode+'.json')
            load.add(dataDesa.length)
            pages[index].skip_scrape = (pages[index].skip_scrape || 0) + 1
        } else {
            await page.goto(dataKec.detail_link);
            await page.waitForSelector('body')
    
            try {
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
            } catch (error) {
                console.log('error', dataKec.kode);
                console.log('error', error.message, error.stack);
                return false
            }
        }

        if(dataListKecamatan.length) return doScrape(page, dataListKecamatan, index)
        return true
    }

    for (const filename of filenames) {
        const dataList = require('../data/kecamatans/' + filename);
        await Promise.all(pages.map(async (page, index) => await doScrape(page, dataList, index)))
    }

    load.success()
    console.log(
        pages.map((page, index) => ({
            page: index,
            total: page.total_work
        }))
    );
}

module.exports = scrapeDataDesa