import { Page } from "puppeteer"
import { scrapeLoading } from '../utils';
import { Prisma } from "@prisma/client";
import prismaClient from "../prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export default async function scrapeDataProvinsi(pages: Page[], info: any) {
    const page = pages[0]

    const load = scrapeLoading('Provinsi', info.provinsi)
    await page.goto('https://nomor.net/_kodepos.php?_i=provinsi-kodepos&daerah=&jobs=&perhal=60&urut=&asc=000011111&sby=000000', {
        waitUntil: 'load'
    });
    await page.waitForSelector('body')

    const data = await page.$eval('body table table:nth-child(2) table:nth-child(4) > tbody:not(.header_mentok)', 
    function (tbody) {
        const toNumber = (str?: string) => {
            if (str === undefined) return null
            return Number(str.trim().replace('.', '').replace(',', '.'))
        }

        return Object.values(tbody.childNodes).map((tr: any): Prisma.LocationCreateInput => {
            const td = tr.childNodes
            return {
                nama: td[1].innerText,
                digit1KodePos: td[2].innerText,
                alokasiKodePos: td[3].innerText,
                realitaKodePos: td[4].innerText.trim(),
                jmlKotaKab: toNumber(td[5].innerText),
                jmlKota: toNumber(td[6].innerText),
                jmlKab: toNumber(td[7].innerText),
                jmlKec: toNumber(td[8].innerText),
                jmlDesa: toNumber(td[9].innerText),
                jmlPulau: toNumber(td[10].innerText),
                kodeWilayah: td[12].innerText,
                luasWilayah: 0,
                jumlahPenduduk: 0,
                type: "prov",
            }
        })
    })

    // ambil data terakhir
    data.splice(-1, 1)
    load.add(data.length)
    console.log('\n');
    console.table(data);
    await prismaClient.location.createMany({data}).catch((e: PrismaClientKnownRequestError) => {
        if (e.code == "P2002") {
            console.log("DataProvinsi already exist")
        }
    })

    load.success()
    await scrapeDataTambahanProvinsi(page)

    return data
}


async function scrapeDataTambahanProvinsi(page: Page) {
    const load = scrapeLoading('Provinsi Additional Info', 38)
    await page.goto('https://www.nomor.net/_kodepos.php?_i=uuri-provinsi&sby=000000', {
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
                nama: td[2].innerText,
                ibukotaId: td[6].innerText,
                luasWilayah: toNumber(td[9].innerText),
                jumlahPenduduk: toNumber(td[8].innerText),
            }
        })
    })

    for (const prov of data) {
        let nameIbukota = prov.ibukotaId as string
        switch (nameIbukota) {
            case 'Jakarta': nameIbukota = 'DKI Jakarta'; break
        }
        let ibuKota = await prismaClient.location.findFirst({
            where: {
                nama: nameIbukota,
                type: {
                    in: [ 'Kab.', 'Kota' ]
                }
            }
        })

        if (ibuKota) {
            await prismaClient.location.updateMany({
                where: {
                    nama: prov.nama as string,
                    type: 'prov'
                },
                data: {
                    ibukotaId: ibuKota.id,
                    luasWilayah: prov.luasWilayah,
                    jumlahPenduduk: prov.jumlahPenduduk
                }
            })
        } else {
            const province = await prismaClient.location.findFirstOrThrow({
                where: {
                    nama: prov.nama as string,
                    type: 'prov'
                }
            }) 
            await prismaClient.location.updateMany({
                where: {
                    nama: prov.nama as string,
                    type: 'prov'
                },
                data: {
                    luasWilayah: prov.luasWilayah,
                    jumlahPenduduk: prov.jumlahPenduduk,
                    ibukotaId: province.id
                }
            })
        }
        load.add(1)
    }

    load.success()
    return
}