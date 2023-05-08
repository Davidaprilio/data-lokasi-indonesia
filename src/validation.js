const { loading, slugable } = require('./utils')
const listProvinsi = require('../data/provinsi_detail.json')
const listKabupatenType = require('../data/kabupatens/prov_11_aceh-nad-.json')
const listKecamatanType = require('../data/kecamatans/kab_11.01.json')
const listDesaType = require('../data/desa/kec_11.01.01.json')

/** @param {listProvinsi[value]} provinsi */
function validation(provinsi) {
    const load = loading(`Checking ${provinsi.provinsi.name}`)
    
    /** @type {listKabupatenType} */
    let listKabupaten = {}
    try {
        listKabupaten = require(`../data/kabupatens/prov_${provinsi.provinsi.kode}_${slugable(provinsi.provinsi.name)}.json`)
    } catch (error) {
        return load.fail(
            `${provinsi.provinsi.name} - tidak ada data kabupaten`
        )
    }
    const kabupatenValid = provinsi.kota_kab.total == listKabupaten.length
    
    if (!kabupatenValid) return load.fail(
        `${provinsi.provinsi.name} - kabupaten kurang (${listKabupaten.length}/${provinsi.kota_kab.total})`
    )

    for (const kabupaten of listKabupaten) {
        /** @type {listKecamatanType} */
        let listKecamatan = {}
        try {
            listKecamatan = require(`../data/kecamatans/kab_${kabupaten.kode}.json`)
        } catch (error) {
            return load.fail(
                `${provinsi.provinsi.name} - kabupaten ${kabupaten.name} - tidak ada data kecamatan`
            )
        }
        const kecamatanValid = kabupaten.kecamatan.jumlah == listKecamatan.length

        if (!kecamatanValid) return load.fail(
            `${provinsi.provinsi.name} - kabupaten ${kabupaten.name} - kecamatan kurang (${listKecamatan.length}/${kabupaten.kecamatan.jumlah})`
        )

        for (const kecamatan of listKecamatan) {
            /** @type {listDesaType} */
            let listDesa = {}
            try {
                listDesa = require(`../data/desa/kec_${kecamatan.kode}.json`)
            } catch (error) {
                return load.fail(
                    `${provinsi.provinsi.name} - kabupaten ${kabupaten.name} - kecamatan ${kecamatan.name} - tidak ada data desa`
                )
            }
            const desaValid = kecamatan.desa.jumlah == listDesa.length

            // load fail
            if (!desaValid) return load.fail(
                `${provinsi.provinsi.name} - kabupaten ${kabupaten.name} - kecamatan ${kecamatan.name} - desa kurang (${listDesa.length}/${kecamatan.desa.jumlah})`
            )
        }
    }

    load.succeed(`${provinsi.provinsi.name} - Valid`)
}

for (const provinsi of listProvinsi) {
    validation(provinsi)
}