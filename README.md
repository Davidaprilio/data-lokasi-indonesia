# Data Lokasi Indonesia 2023

Repo ini menyediakan data lokasi (Provinsi, Kabupaten, Kecamatan dan Desa + kodepos) dalam bentuk static file json. Data ini bersumber/diambil dari nomor.net. Data lokasi dapat dipanggil sebagai API static. [Lihat Demo](https://davidaprilio.github.io/data-lokasi-indonesia/demo.html)

## Penggunaan API
Berikut cara menggunakan static file ini
**[BaseUrl]**: `https://davidaprilio.github.io/data-lokasi-indonesia/json/`

---
**Semantic Version**
Format:
`/semantic/prov/{prov.code}/kab/{kab.code}/kec/{kec.code}/desa/{desa.code}`

| Name | Endpoint |
|--|--|
| Daftar provinsi | [/semantic/prov](https://davidaprilio.github.io/data-lokasi-indonesia/json/semantic/prov) |
| Detail provinsi | [/semantic/prov/11](https://davidaprilio.github.io/data-lokasi-indonesia/json/semantic/prov/11) |
| Daftar kabupaten | [/semantic/prov/11/kab](https://davidaprilio.github.io/data-lokasi-indonesia/json/semantic/prov/11/kab) |
| Detail kabupaten | [/semantic/prov/11/kab/1105](https://davidaprilio.github.io/data-lokasi-indonesia/json/semantic/prov/11/kab/1105) |
| Daftar kecamatan | [/semantic/prov/11/kab/1105/kec](https://davidaprilio.github.io/data-lokasi-indonesia/json/semantic/prov/11/kab/1105/kec) |
| Detail kecamatan | [/semantic/prov/11/kab/1105/kec/110507](https://davidaprilio.github.io/data-lokasi-indonesia/json/semantic/prov/11/kab/1105/kec/110507) |
| Daftar desa | [/semantic/prov/11/kab/1105/kec/110507/desa](https://davidaprilio.github.io/data-lokasi-indonesia/json/semantic/prov/11/kab/1105/kec/110507/desa) |
| Detail desa | [/semantic/prov/11/kab/1105/kec/110507/desa/1105072002](https://davidaprilio.github.io/data-lokasi-indonesia/json/semantic/prov/11/kab/1105/kec/110507/desa/1105072002) |

---
**Simple Version**

| Name | Endpoint | |
|--|--|--|
| Daftar provinsi | [/simple/provinsi](https://davidaprilio.github.io/data-lokasi-indonesia/json/simple/provinsi) | ambil daftar provinsi |
| Daftar kabupaten | [/simple/kabupaten/{provinsi.code}](https://davidaprilio.github.io/data-lokasi-indonesia/json/simple/kabupaten/11) (11)| ambil daftar kabupaten dari kode provinsi |
| Daftar kecamatan | [/simple/kecamatan/{kabupaten.code}](https://davidaprilio.github.io/data-lokasi-indonesia/json/simple/kecamatan/1105) (1105)| ambil daftar kecamatan dari kode kabupaten |
| Daftar desa | [/simple/desa/{kecamatan.code}](https://davidaprilio.github.io/data-lokasi-indonesia/json/simple/desa/110507) (110507) | ambil daftar desa dari kode kecamatan |


---

## Consume with Api Client - (ApiDaerah)
Kebetulan saya sudah membuat Module [ApiDaerah Client](https://github.com/Davidaprilio/laravel-api-daerah#api-client) untuk menghandle select option menampilkan data secara otomatis, yang dapat juga digunakan di api statis ini atau api lain yang memiliki metode endpoint yang sama.

```js
const apiDaerah = new ApiDaerah({
	baseUrl: 'https://davidaprilio.github.io/data-lokasi-indonesia/json/simple',
	provinsi: {
        value: 'code',
        text: 'name',
        endpoint: '/provinsi',
    },
    kabupaten: {
        value: 'code',
        text: 'fullname',
        endpoint: '/kabupaten/:id', // :id wajib diisi jika mau custom
    },
    kecamatan: {
        value: 'code',
        text: 'name',
        endpoint: '/kecamatan/:id',
    },
    desa: {
        value: 'code',
        text: 'name',
        endpoint: '/desa/:id',
    },
    enabled:  {
        desa:  true, // nyalakan fiture desa (default false)
    }
})
```

Penggunaan lebih lanjut bisa dilihat di [ApiDaerah Client](https://github.com/Davidaprilio/laravel-api-daerah#api-client)