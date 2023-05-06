const { Page } = require("puppeteer");
const { saveToFile, scrapeLoading } = require('./utils');

/** @param {Page[]} pages */
async function scrapeDataProvinsi(pages, info) {
    const page = pages[0]

    const load = scrapeLoading('Provinsi', info.provinsi)
    await page.goto('https://kodepos.nomor.net/_kodepos.php?_i=provinsi-kodepos&sby=000000');
    await page.waitForSelector('body')

    /** @type {string[][]} */
    const dataRows = await page.$eval('body table table:nth-child(2) table:nth-child(4) > tbody', function (tbody) {
        return Object.values(tbody.childNodes).map(
            tr => Object.values(tr.childNodes).map(
                td => (td.innerText || '').replaceAll('\n', ' ').trim()
            )
        )
    })
    saveToFile('provinsi_simple', dataRows)

    const data = await page.$eval('body table table:nth-child(2) table:nth-child(4) > tbody', function (tbody) {
        return Object.values(tbody.childNodes).map(tr => {
            const td = tr.childNodes
            if(isNaN(td[0].innerText)) return null
            return {
                no: td[0].innerText,
                provinsi: {
                    kode: td[10].innerText,
                    name: td[1].innerText,
                    href: td[1].childNodes[0].href
                },
                kodepos: {
                    digit1: td[2].innerText.split('dan').map(digit => parseInt(digit.trim())),
                    range: td[3].innerText.split(':')[1].trim().split(' - ')
                },
                kota_kab: {
                    total: parseInt(td[4].innerText.trim()),
                    href: td[4].firstElementChild.href,
                    jml_kota: parseInt(td[5].innerText),
                    jml_kab: parseInt(td[6].innerText)
                },
                kecamatan: {
                    total: parseInt(td[7].innerText),
                    href: td[7].firstElementChild.href
                },
                desa: {
                    total: parseInt(td[8].innerText),
                    href: td[8].firstElementChild.href
                },
                pulau: {
                    total: parseInt(td[9].innerText),
                    href: td[9].firstElementChild.href
                },
            }
        }).filter(d => d !== null)
    })
    load.add(data.length)
    saveToFile('provinsi_detail', data)
    
    load.success()
    return data
}

module.exports = scrapeDataProvinsi