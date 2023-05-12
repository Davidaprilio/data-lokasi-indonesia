const fs = require('fs');
const listProvinsi = require('../data/provinsi_detail.json');
const listKabupatenType = require('../data/kabupatens/prov_11_aceh-nad-.json')
const listKecamatanType = require('../data/kecamatans/kab_11.01.json')
const listDesaType = require('../data/desa/kec_11.01.01.json')
const { saveToFile, slugable } = require('./utils');

// make directory if not exist
const rootDir = '../json/semantic/prov';

/** @param {listProvinsi[value]} provinsi */
const makeDataProvinsi = (provinsi) => ({
    code: provinsi.provinsi.kode,
    name: provinsi.provinsi.name,
    jumlah: {
        kota: provinsi.kota_kab.jml_kota,
        kabupaten: provinsi.kota_kab.jml_kab,
        kecamatan: provinsi.kecamatan.total,
        desa: provinsi.desa.total
    }
})

/** @param {listKabupatenType[value]} kabupaten */
const makeDataKabupaten = (kabupaten) => ({
    code: kabupaten.kode.replaceAll('.', ''),
    type: kabupaten.type,
    name: kabupaten.name,
    fullname: `${kabupaten.type} ${kabupaten.name}`,
    jumlah: {
        kecamatan: parseInt(kabupaten.kecamatan.jumlah),
        desa: parseInt(kabupaten.desa.jumlah)
    }
})

const makeDataKecamatan = (kecamatan) => {
    return {
        code: kecamatan.kode.replaceAll('.', ''),
        name: kecamatan.name,
        count: {
            desa: parseInt(kecamatan.desa.jumlah)
        }
    }
}

async function saveFile(path, object) {
    let i = 1;
    while (fs.existsSync(path + '.json')) {
        path = `${path}-${i}`;
        i++;
        console.log('rename file to', path);
    }
    return await saveToFile(path, object);
}

async function run() {
    await saveFile(`${rootDir}/index`, listProvinsi.map(provinsi => makeDataProvinsi(provinsi)));

    // create kabupaten each provinsi kode
    for (const provinsi of listProvinsi) {
        const pathProvinsi = `${rootDir}/${provinsi.provinsi.kode}`;
        
        // detail file
        await saveFile(`${pathProvinsi}/index`, makeDataProvinsi(provinsi))
        
        const filenameKabupaten = `prov_${provinsi.provinsi.kode}_${slugable(provinsi.provinsi.name)}.json`;
        /** @type {listKabupatenType} */
        const listKabupaten = require(`../data/kabupatens/${filenameKabupaten}`);

        // list file
        await saveFile(`${pathProvinsi}/kab/index`, listKabupaten.map(kabupaten => makeDataKabupaten(kabupaten)));

        // create kecamatan each kabupaten kode
        for (const kabupaten of listKabupaten) {
            const codeKab = kabupaten.kode.replaceAll('.', '');
            const pathKabupaten = `${pathProvinsi}/kab/${codeKab}`;

            // detail file
            await saveFile(`${pathKabupaten}/index`, makeDataKabupaten(kabupaten));

            /** @@type {listKecamatanType} */
            const listKecamatan = require(`../data/kecamatans/kab_${kabupaten.kode}.json`);

            // list file
            await saveFile(`${pathKabupaten}/kec/index`, listKecamatan.map(kecamatan => makeDataKecamatan(kecamatan)));

            // create desa each kecamatan kode
            for (const kecamatan of listKecamatan) {
                const codeKec = kecamatan.kode.replaceAll('.', '');
                const pathKecamatan = `${pathKabupaten}/kec/${codeKec}`;

                // detail file
                await saveFile(`${pathKecamatan}/index`, makeDataKecamatan(kecamatan));

                /** @@type {listDesaType} */
                const listDesa = require(`../data/desa/kec_${kecamatan.kode}.json`);

                // list file
                await saveFile(`${pathKecamatan}/desa/index`, listDesa.map(desa => ({
                    code: desa.kode.replaceAll('.', ''),
                    name: desa.name,
                    poscode: desa.kodepos,
                })))

                // detail desa 
                for (const desa of listDesa) {
                    const codeDesa = desa.kode.replaceAll('.', '');
                    const pathDesa = `${pathKecamatan}/desa/${codeDesa}`;

                    // detail file
                    await saveFile(`${pathDesa}/index`, {
                        code: desa.kode.replaceAll('.', ''),
                        name: desa.name,
                        poscode: desa.kodepos,
                        provinsi: {
                            code: provinsi.provinsi.kode,
                            name: provinsi.provinsi.name,
                        },
                        kabupaten: {
                            code: kabupaten.kode.replaceAll('.', ''),
                            name: kabupaten.name,
                        },
                        kecamatan: {
                            code: kecamatan.kode.replaceAll('.', ''),
                            name: kecamatan.name,
                        }
                    });
                }
            }

        }
    }    
}
run();
