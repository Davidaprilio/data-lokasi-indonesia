-- CreateTable
CREATE TABLE `locations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `parentId` INTEGER NULL,
    `kodeWilayah` VARCHAR(191) NOT NULL,
    `parentKodeWilayah` VARCHAR(191) NULL,
    `nama` VARCHAR(191) NOT NULL,
    `digit1_kode_pos` VARCHAR(191) NULL,
    `alokasiKodePos` VARCHAR(191) NULL,
    `realitaKodePos` VARCHAR(191) NULL,
    `jmlKotaKab` INTEGER NULL,
    `jmlKota` INTEGER NULL,
    `jmlKab` INTEGER NULL,
    `jmlKec` INTEGER NULL,
    `jmlDesa` INTEGER NULL,
    `jmlPulau` INTEGER NULL,
    `luasWilayah` DOUBLE NULL,
    `jumlahPenduduk` INTEGER NULL,
    `type` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `locations_nama_kodeWilayah_key`(`nama`, `kodeWilayah`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
