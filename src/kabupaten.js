const { Page } = require("puppeteer");
const { saveToFile, scrapeLoading } = require('./utils');

/** @param {Page[]} pages */
async function scrapeDataKabupaten(pages, info) {
    const load = scrapeLoading('Kabupaten', info.data.kota_kab)
    const dataProvinsi = require('../data/provinsi_detail.json');

    async function doScrape(page, dataProvinsi) {
        const data = dataProvinsi.pop()
        if (data === undefined) return true
        await page.goto(data.provinsi.href+'&perhal=100');

        const dataKabupaten = await page.$eval('body table table:nth-child(2) table:nth-child(4) > tbody', (tbody) => {
            return Object.values(tbody.childNodes).map(tr => {
                const td = tr.childNodes
                if(isNaN(td[0].innerText)) return null
                return {
                    no: td[0].innerText,
                    type: td[1].innerText,
                    name: td[2].innerText,
                    detail_link: td[2].firstElementChild.href,
                    kodepos: td[3].innerText.split(':')[1].trim().split(' - '),
                    kecamatan: {
                        href: td[4].firstElementChild.href,
                        jumlah: td[4].innerText
                    },
                    desa: {
                        href: td[5].firstElementChild.href,
                        jumlah: td[5].innerText
                    },
                    pulau: td[6].firstElementChild ? {
                        href: td[6].firstElementChild.href,
                        jumlah: td[6].innerText
                    } : null,
                    kode: td[7].innerText
                }
            }).filter(d => d !== null)
        })

        saveToFile('kabupatens/prov_'+data.provinsi.kode, dataKabupaten)
        load.add(dataKabupaten.length)
        if(dataProvinsi.length) return doScrape(page, dataProvinsi)
        return true
    }

    await Promise.all(pages.map(async(page) => await doScrape(page, dataProvinsi)))

    load.success()
}

module.exports = scrapeDataKabupaten