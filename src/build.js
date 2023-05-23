const fs = require('fs');
const listProvinsi = require('../data/provinsi_detail.json');
const listKabupatenType = require('../data/kabupatens/prov_11_aceh-nad-.json')
const listKecamatanType = require('../data/kecamatans/kab_11.01.json')
const listDesaType = require('../data/desa/kec_11.01.01.json')
const { saveToFile, slugable, loading } = require('./utils');

// make directory if not exist
const rootDirSemantic = '../json/semantic/prov';
const rootDirSimple = '../json/simple';

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
    const loader = loading('Building data')
    loader.text = 'create provinsi data'
    await saveFile(`${rootDirSemantic}/index`, listProvinsi.map(provinsi => makeDataProvinsi(provinsi)));
    await saveFile(`${rootDirSimple}/provinsi/index`, listProvinsi.map(provinsi => makeDataProvinsi(provinsi)));

    // create kabupaten each provinsi kode
    for (const provinsi of listProvinsi) {
        loader.text = `${provinsi.provinsi.name} - create kabupaten data`
        const pathProvinsi = `${rootDirSemantic}/${provinsi.provinsi.kode}`;
        
        // detail file
        const detailDataProvinsi = makeDataProvinsi(provinsi)
        await saveFile(`${pathProvinsi}/index`, detailDataProvinsi)
        
        const filenameKabupaten = `prov_${provinsi.provinsi.kode}_${slugable(provinsi.provinsi.name)}.json`;
        /** @type {listKabupatenType} */
        const listKabupaten = require(`../data/kabupatens/${filenameKabupaten}`);

        // list file
        const listDataKabupaten = listKabupaten.map(kabupaten => makeDataKabupaten(kabupaten))
        await saveFile(`${pathProvinsi}/kab/index`, listDataKabupaten);
        await saveFile(`${rootDirSimple}/kabupaten/${detailDataProvinsi.code}/index`, listDataKabupaten);

        // create kecamatan each kabupaten kode
        for (const kabupaten of listKabupaten) {
            loader.text = `${provinsi.provinsi.name} - ${kabupaten.name} - create kecamatan data`
            const codeKab = kabupaten.kode.replaceAll('.', '');
            const pathKabupaten = `${pathProvinsi}/kab/${codeKab}`;

            // detail file
            const detailDataKab = makeDataKabupaten(kabupaten);
            await saveFile(`${pathKabupaten}/index`, detailDataKab);

            /** @@type {listKecamatanType} */
            const listKecamatan = require(`../data/kecamatans/kab_${kabupaten.kode}.json`);

            // list file
            const listDataKecamatan = listKecamatan.map(kecamatan => makeDataKecamatan(kecamatan))
            await saveFile(`${pathKabupaten}/kec/index`, listDataKecamatan);
            await saveFile(`${rootDirSimple}/kecamatan/${detailDataKab.code}/index`, listDataKecamatan);

            // create desa each kecamatan kode
            for (const kecamatan of listKecamatan) {
                loader.text = `${provinsi.provinsi.name} - ${kabupaten.name} - ${kecamatan.name} - create desa data`
                const codeKec = kecamatan.kode.replaceAll('.', '');
                const pathKecamatan = `${pathKabupaten}/kec/${codeKec}`;

                // detail file
                const detailDataKec = makeDataKecamatan(kecamatan)
                await saveFile(`${pathKecamatan}/index`, detailDataKec);

                /** @@type {listDesaType} */
                const listDesa = require(`../data/desa/kec_${kecamatan.kode}.json`);

                // list file
                const listDataDesa = listDesa.map(desa => ({
                    code: desa.kode.replaceAll('.', ''),
                    name: desa.name,
                    poscode: desa.kodepos,
                }))
                await saveFile(`${pathKecamatan}/desa/index`, listDataDesa)
                await saveFile(`${rootDirSimple}/desa/${detailDataKec.code}/index`, listDataDesa);

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
    loader.succeed('Build Success')
}
run();
