-- CreateTable
CREATE TABLE `Location` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `digit1_kode_pos` VARCHAR(191) NOT NULL,
    `alokasiKodePos` VARCHAR(191) NOT NULL,
    `realitaKodePos` VARCHAR(191) NOT NULL,
    `jmlKotaKab` INTEGER NOT NULL,
    `jmlKota` INTEGER NOT NULL,
    `jmlKab` INTEGER NOT NULL,
    `jmlKec` INTEGER NOT NULL,
    `jmlDesa` INTEGER NOT NULL,
    `jmlPulau` INTEGER NOT NULL,
    `kodeWilayah` VARCHAR(191) NOT NULL,
    `luasWilayah` DOUBLE NOT NULL,
    `jumlahPenduduk` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
