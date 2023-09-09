import { Page } from "puppeteer";
import { scrapeLoading, sleep } from '../utils';
import { Prisma } from "@prisma/client";
import prismaClient from "../prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export default async function scrapeDataKecamatan(pages: Page[], info: any) {
    const page = pages[0]
    // get all filesname from data/kabupatens with fs
    const load = scrapeLoading('Kecamatan', 7_277)
    await sleep(2_000)
    await page.waitForSelector('body')
    
    
    async function doScrape(page: Page, url: string) {
        await page.goto(url, {
            waitUntil: "load"
        })

        const tableSelector = 'body table table:nth-child(2) table:nth-child(4) > tbody:not(.header_mentok)'
        await page.waitForSelector(tableSelector)
        const resultDataKec = await page.$eval(tableSelector, (tbody) => {
            const toNumber = (str?: string) => {
                if (str === undefined) return null
                return Number(str.trim().replace('.', '').replace(',', '.'))
            }

            return Object.values(tbody.childNodes).map((tr: any): Prisma.LocationCreateInput => {
                const td = tr.childNodes
                return {
                    nama: td[2].innerText,
                    alokasiKodePos: td[3].innerText.trim(),
                    jmlDesa: toNumber(td[4].innerText),
                    jmlPulau: toNumber(td[6].innerText),
                    kodeWilayah: td[8].innerText,
                    
                    type: td[10].innerText,
                    parentKodeWilayah: td[12].innerText, // nama kabupaten to search in below
                }
            })
        })

        await sleep(1_000)

        // scroll to bottom
        await page.evaluate(() => {
            window.scrollBy(0, document.body.scrollHeight)
        })

        const listKabupaten: {[kabKotName: string]: {
            id: number,
            kode: string,
        }} = {}

        for (const kec of resultDataKec) {
            if (listKabupaten[kec.parentKodeWilayah] === undefined) {
                const kab = await prismaClient.location.findFirst({
                    where: {
                        nama: kec.parentKodeWilayah, 
                        OR: [
                            {type: 'Kab.'},
                            {type: 'Kota'},
                        ]
                    }
                })

                listKabupaten[kec.parentKodeWilayah] = {
                    id: kab?.id,
                    kode: kab?.kodeWilayah,
                }
            }

            await prismaClient.location.create({
                data: {
                    ...kec,
                    parentId: listKabupaten[kec.parentKodeWilayah].id,
                    parentKodeWilayah: listKabupaten[kec.parentKodeWilayah].kode,
                    type: 'Kec'
                }
            }).catch((e: PrismaClientKnownRequestError) => {
                if (e.code == "P2002") {
                    console.log(`Kecamatan ${kec.nama} already exist`)                
                }
            })

            load.add(1)
        }

        // next page
        const currentPage = 'body table table:nth-child(2) center tbody > tr:nth-child(1) > td > b'
        const nextPage = await page.$eval(currentPage, (el: any): string|null => {
            if (el.nextElementSibling) {
                return el.nextElementSibling.href
            }
            return null
        })

        if (nextPage !== null) {
            return await doScrape(page, nextPage)
        }
        return
    }

    await doScrape(page, "https://nomor.net/_kodepos.php?_i=kecamatan-kodepos&daerah=&jobs=&perhal=1000&urut=&asc=001000&sby=000000&no1=2")

    load.success()
}
