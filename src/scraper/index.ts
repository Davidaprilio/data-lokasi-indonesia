import { argsExist, makeArray, env } from '../utils';
import puppeteer, { Page } from 'puppeteer'
import scrapeDataProvinsi from './provinsi';
import scrapeDataKabupaten from './kabupaten';
import scrapeDataKecamatan from './kecamatan';
import scrapeDataDesa from './desa';

const isWith = {
    provinsi: argsExist('--provinsi'),
    kabupaten: argsExist('--kabupaten'),
    kecamatan: argsExist('--kecamatan'),
    desa: argsExist('--desa'),
};
type ArgsCli = typeof isWith
type KeyIsWith = keyof ArgsCli

const ENV = {
    USE_PAGES_KABUPATEN: Number(env('PAGES_KABUPATEN', 10))
}

const isNotSelectedAll = Object.entries(isWith).every(([_, value]) => !value)
if (isNotSelectedAll) {
    Object.keys(isWith).forEach((key) => {
        isWith[key as KeyIsWith] = true
    })
    console.log('Scrape All Data');
} else {
    console.log('Scrape Data:', Object.keys(isWith).filter((key) => isWith[key as KeyIsWith]).join(', '));
}

async function start() {
    const browser = await puppeteer.launch({
        headless: env('HEADLESS', 'new') as (boolean|"new"),
    });
    const pages = await browser.pages()
    
    async function usePage(pageLength: number) {
        if (pages.length < pageLength) {
            const missingPage = pageLength - pages.length
            pages.push(...await Promise.all(makeArray(missingPage).map(() => browser.newPage())))
        }
        return pages
    }

    let info = {};
    // if (!argsExist('--no-info')) {
    //     const load = loading('Getting information data ...')
    //     info = await getInformation(pages[0])
    //     load.stop().clear()
    //     console.log('Informasi:');
    //     console.log(`\n${info.info.text}\n`);
    //     console.log('Data tersedia:');
    //     console.log('Provinsi:', info.info.provinsi);
    //     console.log('Kabupaten:', info.data.kota_kab);
    //     console.log('Kecamatan:', info.data.kecamatan);
    //     console.log('Kelurahan:', info.data.desa_kel, '\n');
    // }
    if (argsExist('--info')) return await browser.close()

    if (isWith.provinsi) await scrapeDataProvinsi(pages, info)

    if (isWith.kabupaten) await scrapeDataKabupaten(pages, info)

    if (isWith.kecamatan) await scrapeDataKecamatan(pages, info)

    if (isWith.desa) await scrapeDataDesa(pages, info)

    console.log("\n============ Scraping Finished ============");
    // await browser.close();
}

/** @param {puppeteer.Page} page */
async function getInformation(page: Page) {
    await page.goto('https://www.nomor.net/_kodepos.php?_i=kode-wilayah')
    const info = await page.$$eval('body ul.ulwi > li', (li: any) => {
        const parseToNumber = (text: any) => parseInt(text.replaceAll('.','').trim())
        return {
            text: Object.values(li).filter((_, index) => index < 5).map((li: any) => li.innerText).join("\n"),
            provinsi: parseToNumber(li[0].firstElementChild.innerText),
            kota_kab: parseToNumber(li[1].querySelector('b:nth-child(1)').innerText),
            kota: parseToNumber(li[1].querySelector('b:nth-child(2)').innerText),
            kabupaten: parseToNumber(li[1].querySelector('b:nth-child(3)').innerText),
            kecamatan: parseToNumber(li[2].querySelector('b:nth-child(1)').innerText),
            desa_kel: parseToNumber(li[3].querySelector('b:nth-child(1)').innerText),
            desa: parseToNumber(li[3].querySelector('b:nth-child(3)').innerText),
            kelurahan: parseToNumber(li[3].querySelector('b:nth-child(2)').innerText),
        }
    })

    await page.goto('https://www.nomor.net/_kodepos.php?_i=kota-kodepos&sby=000000')
    const dataKotaKab = await page.$$eval('font', (fonts: any) => parseInt(fonts[15].innerText.replaceAll('.','').trim()))
    
    await page.goto('https://www.nomor.net/_kodepos.php?_i=kecamatan-kodepos&sby=000000')
    const dataKecamatan = await page.$$eval('font', (fonts: any) => parseInt(fonts[16].innerText.replaceAll('.','').trim()))
    
    await page.goto('https://www.nomor.net/_kodepos.php?_i=desa-kodepos&sby=000000')
    const dataDesaKel = await page.$$eval('font', (fonts: any) => parseInt(fonts[15].innerText.replaceAll('.','').trim()))

    return {
        data: {
            kecamatan: dataKecamatan,
            desa_kel: dataDesaKel,
            kota_kab: dataKotaKab,
        },
        info
    }
}

start()
