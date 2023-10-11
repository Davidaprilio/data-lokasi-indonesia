import { Page } from "puppeteer";
import { scrapeLoading,sleep } from '../utils';
import { Prisma } from "@prisma/client";
import prismaClient from "../prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export default async function scrapeDataKabupaten(pages: Page[], info: any) {
    const page = pages[0]
    await scrapeDataTambahanKabupaten(page)
    return
    const load = scrapeLoading('Kabupaten', 514)
    await sleep(2_000)
    await page.waitForSelector('body')

    await page.goto('https://nomor.net/_kodepos.php?_i=kota-kodepos&sby=000000', {
        waitUntil: 'load'
    });
    await page.waitForSelector('body table table:nth-child(2) table:nth-child(4) > tbody:not(.header_mentok)')
    const allKotaKab = await page.$eval('body table table:nth-child(2) table:nth-child(4) > tbody:not(.header_mentok)', (tbody) => {
        const toNumber = (str?: string) => {
            if (str === undefined) return null
            return Number(str.trim().replace('.', '').replace(',', '.'))
        }

        return Object.values(tbody.childNodes).map((tr: any): Prisma.LocationCreateInput => {
            const td = tr.childNodes
            return {
                nama: td[2].innerText,
                alokasiKodePos: td[3].innerText.trim(),
                realitaKodePos: td[4].innerText.trim(),
                jmlKec: toNumber(td[5].innerText),
                jmlDesa: toNumber(td[6].innerText),
                jmlPulau: toNumber(td[7].innerText),
                kodeWilayah: td[8].innerText,
                type: td[1].innerText,

                parentKodeWilayah: td[9].innerText, // ini nama provinsi to search in below
            }
        })
    })

    const listProvinsi: {[provName: string]: {
        id: number,
        kode: string,
    }} = {}

    console.log('\n');
    console.log("Total data: ", allKotaKab.length);
    console.log('\n');    

    for (const kk of allKotaKab) {
        if (listProvinsi[kk.parentKodeWilayah] === undefined) {
            const prov = await prismaClient.location.findFirst({where: {nama: kk.parentKodeWilayah, type: 'prov'}})
            listProvinsi[kk.parentKodeWilayah] = {
                id: prov?.id,
                kode: prov?.kodeWilayah,
            }
        }
        
        await prismaClient.location.create({
            data: {
                ...kk,
                parentId: listProvinsi[kk.parentKodeWilayah].id,
                parentKodeWilayah: listProvinsi[kk.parentKodeWilayah].kode
            }
        }).catch((e: PrismaClientKnownRequestError) => {
            if (e.code == "P2002") {
                console.log(`Kabupaten ${kk.nama} already exist`)                
            }
        })
        load.add(1)
    }

    load.success()
    await scrapeDataTambahanKabupaten(page)

    return
}


async function scrapeDataTambahanKabupaten(page: Page) {
    const load = scrapeLoading('Kabupaten Additional Info', 514)
    await page.goto('https://www.nomor.net/_kodepos.php?_i=uuri-kota&daerah=&jobs=&perhal=700&urut=&asc=010000&sby=000000&no1=2', {
        waitUntil: 'load'
    })
    await page.waitForSelector('body')

    const data = await page.$eval('body table table:nth-child(2) table:nth-child(4) > tbody:not(.header_mentok)', 
    function (tbody) {
        const toNumber = (str?: string) => {
            if (str === undefined) return null
            return Number(str.trim().replaceAll('.', '').replace(',', '.'))
        }


        return Object.values(tbody.childNodes).map((tr: any): Prisma.LocationUpdateInput => {
            const td = tr.childNodes
            return {
                type: td[2].innerText,
                nama: td[4].innerText,
                luasWilayah: toNumber(td[8].querySelector('td:nth-child(1) > b:nth-child(3)').innerText.replace(' km²', '')),
                jumlahPenduduk: toNumber(td[8].querySelector('td:nth-child(1) > b:nth-child(1)').innerText),
            }
        })
    })

    for (const prov of data) {
        await prismaClient.location.updateMany({
            where: {
                nama: prov.nama as string,
                type: prov.type as string
            },
            data: {
                luasWilayah: prov.luasWilayah,
                jumlahPenduduk: prov.jumlahPenduduk
            }
        })
        load.add(1)
    }

    load.success()
    return
}
