import { Page } from "puppeteer";
import { scrapeLoading, sleep } from '../utils';
import { Prisma } from "@prisma/client";
import prismaClient from "../prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export default async function scrapeDataDesa(pages: Page[], info: any) {
    const page = pages[0]
    // get all filesname from data/kecamatans with fs
    const load = scrapeLoading('Desa', 83_763)
    await sleep(2_000)
    await page.waitForSelector('body')

    load.add(30_000)
    async function doScrape(page: Page, url: string) {
        await page.goto(url, {
            waitUntil: 'load',
            timeout: 0
        });

        const tbodySelector = 'body table table:nth-child(2) table:nth-child(4) > tbody:not(.header_mentok)'
        await page.waitForSelector(tbodySelector)

        await sleep(1_000)
    
        const dataDesa = await page.$eval(tbodySelector, (tbody) => {
            return Object.values(tbody.childNodes).map((tr: any): Prisma.LocationCreateInput => {
                const td = tr.childNodes
                return {
                    nama: td[3].innerText,
                    alokasiKodePos: td[1].innerText.trim(),
                    kodeWilayah: td[5].innerText,
                    type: 'desa',
                    
                    parentKodeWilayah: td[7].innerText, // nama kabupaten to search in below
                }
            })
        })

        await sleep(1_000)

        // scroll to bottom
        await page.evaluate(() => {
            window.scrollBy(0, document.body.scrollHeight)
        })

        const listKec: {[kecName: string]: {
            id: number,
            kode: string,
        }} = {}

        for (const desa of dataDesa) {
            if (listKec[desa.parentKodeWilayah] === undefined) {
                const kab = await prismaClient.location.findFirst({
                    where: {
                        nama: desa.parentKodeWilayah, 
                        type: 'kec',
                    }
                })

                listKec[desa.parentKodeWilayah] = {
                    id: kab?.id,
                    kode: kab?.kodeWilayah,
                }
            }

            await prismaClient.location.create({
                data: {
                    ...desa,
                    parentId: listKec[desa.parentKodeWilayah].id,
                    parentKodeWilayah: listKec[desa.parentKodeWilayah].kode,
                    type: 'desa'
                }
            }).catch((e: PrismaClientKnownRequestError) => {
                if (e.code == "P2002") {
                    console.log(`Desa ${desa.nama} already exist`)                
                }
            })

            load.add(1)
        }

        // next page
        const currentPage = 'body table table:nth-child(2) center tbody > tr:nth-child(1) > td > b'
        const nextPage = await page.$eval(currentPage, (el: any): string|null => {
            if (el.nextElementSibling?.tagName == 'BR') {
                return el.nextElementSibling.nextElementSibling.href
            } else if (el.nextElementSibling?.tagName == 'A') {
                return el.nextElementSibling.href
            }
            return null
        })

        if (nextPage !== null) {
            return await doScrape(page, nextPage)
        }
        return
    }

    // await doScrape(page, "https://nomor.net/_kodepos.php?_i=desa-kodepos&daerah=&jobs=&perhal=5000&urut=&asc=000101&sby=000000&no1=2")
    await doScrape(page, "https://www.nomor.net/_kodepos.php?_i=desa-kodepos&daerah=&jobs=&perhal=5000&urut=&asc=000101&sby=000000&no1=25001&no2=30000&kk=7")

    load.success()
}
