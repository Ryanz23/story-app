# StoryApp - Platform Berbagi Cerita

StoryApp adalah aplikasi web untuk berbagi kisah hidup, pengalaman, dan inspirasi. Proyek ini menggunakan Webpack untuk proses bundling, Babel untuk transpile JavaScript, serta mendukung proses build dan serving aplikasi secara modern dan modular.

## Table of Contents

- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Features](#features)
- [Credits](#credits)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (disarankan versi 12 atau lebih tinggi)
- [npm](https://www.npmjs.com/) (Node package manager)

### Installation

1. Clone repository ini:
   ```shell
   git clone https://github.com/Ryanz23/story-app.git
   cd story-app
   ```
2. Ekstrak file jika perlu.
3. Install dependencies:
   ```shell
   npm install
   ```

## Scripts

- **Build for Production:**

  ```shell
  npm run build
  ```

  Build aplikasi untuk produksi ke direktori `dist` menggunakan konfigurasi `webpack.prod.js`.

- **Start Development Server:**

  ```shell
  npm run start-dev
  ```

  Menjalankan server pengembangan dengan live reload sesuai konfigurasi di `webpack.dev.js`.

- **Serve:**
  ```shell
  npm run serve
  ```
  Menyajikan konten dari direktori `dist` menggunakan [`http-server`](https://www.npmjs.com/package/http-server).

## Project Structure

Struktur proyek ini dibuat agar kode tetap modular dan mudah dikembangkan.

```text
starter-project/
├── dist/                   # File hasil build untuk produksi
├── src/                    # Source code utama proyek
│   ├── public/             # File publik
│   ├── scripts/            # File JavaScript aplikasi
│   │   └── index.js        # Entry point utama JavaScript
│   ├── styles/             # File CSS aplikasi
│   │   └── styles.css      # File CSS utama
│   └── index.html          # File HTML utama aplikasi
├── package.json            # Metadata dan dependencies proyek
├── package-lock.json       # Lock file npm
├── README.md               # Dokumentasi proyek
├── STUDENT.txt             # Informasi mahasiswa/pengembang
├── webpack.common.js       # Konfigurasi webpack umum
├── webpack.dev.js          # Konfigurasi webpack untuk development
└── webpack.prod.js         # Konfigurasi webpack untuk produksi
```

## Features

- Menampilkan daftar cerita dari API dengan tampilan seperti media sosial
- Menambah cerita baru dengan foto dari kamera atau upload, serta lokasi dari peta interaktif
- Peta interaktif untuk menampilkan lokasi setiap cerita
- Mendukung aksesibilitas dan View Transition API untuk pengalaman pengguna yang lebih baik
- Responsif dan nyaman digunakan di perangkat mobile

## Credits

Dikembangkan sebagai bagian dari pembelajaran pengembangan web intermediate.  
Gunakan, modifikasi, dan kembangkan sesuai kebutuhan Anda!

Made by: [Ryanz23](https://github.com/Ryanz23)