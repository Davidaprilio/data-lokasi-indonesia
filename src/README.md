# Data Lokasi Indonesia 2023 - Scraper

### Installation
```
git clone 
cd repo
yarn install
```

### Usage
```
# to scrape all data
node src/index.js 

# for specific scrapes of data
node src/index.js --provinsi
node src/index.js --kabupaten --no-info
```
 - **--provinsi**: mencari data provinsi
 - **--kabupaten**: mencari data kabupaten *(scrape data provinsi dulu)*
 - **--kecamatan**: mencari data kecamatan *(scrape data kabupaten dulu)*
 - **--desa**: mencari data desa *(scrape data kecamatan dulu)*
 - **--no-info**: mejalankan scrap data tanpa cek info jumlah lokasi
 - **--info**: hanya mencari info data jumlah lokasi saat ini
```