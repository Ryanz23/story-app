# StoryApp - Platform Berbagi Cerita

StoryApp adalah aplikasi web untuk berbagi kisah hidup, pengalaman, dan inspirasi. Proyek ini menggunakan Webpack untuk proses bundling, Babel untuk transpile JavaScript, serta menerapkan modularisasi kode modern. Aplikasi ini juga sudah mendukung autentikasi (login/register), proteksi halaman, dan routing berbasis hash.

## Table of Contents

- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Features](#features)
- [Deployment](#deployment)
- [Credits](#credits)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (disarankan versi 12 atau lebih tinggi)
- [npm](https://www.npmjs.com/) (Node package manager)

### Installation

1. Clone repository ini:
   ```sh
   git clone https://github.com/Ryanz23/story-app.git
   cd story-app
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

## Scripts

- **Build for Production:**
  ```sh
  npm run build
  ```
  Build aplikasi untuk produksi ke direktori `dist` menggunakan konfigurasi `webpack.prod.js`.

- **Start Development Server:**
  ```sh
  npm run start-dev
  ```
  Menjalankan server pengembangan dengan live reload sesuai konfigurasi di `webpack.dev.js`.

- **Serve Production Build:**
  ```sh
  npm run serve
  ```
  Menyajikan konten dari direktori `dist` menggunakan [`http-server`](https://www.npmjs.com/package/http-server).

## Project Structure

Struktur proyek ini dibuat agar kode tetap modular dan mudah dikembangkan.

```text
story-app/
├── public/                 # File publik
├── dist/                   # File hasil build untuk produksi
├── src/                    # Source code utama proyek
│   ├── scripts/            # File JavaScript aplikasi
│   │   ├── index.js        # Entry point utama JavaScript
│   │   ├── routes/         # Routing dan mapping halaman
│   │   └── pages/          # Halaman-halaman aplikasi (home, login, register, dll)
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

- **Autentikasi:** Login dan register, token disimpan di localStorage.
- **Proteksi Halaman:** Halaman utama (`/`) otomatis redirect ke login jika belum login.
- **Routing Hash:** Navigasi antar halaman menggunakan hash (`#/route`).
- **Daftar Cerita:** Menampilkan daftar cerita dari API dengan tampilan seperti media sosial.
- **Tambah Cerita:** Menambah cerita baru dengan foto dari kamera/upload dan lokasi dari peta interaktif.
- **Peta Interaktif:** Menampilkan lokasi setiap cerita.
- **Aksesibilitas:** Mendukung skip link dan View Transition API.
- **Responsif:** Nyaman digunakan di perangkat mobile.

## Deployment

Aplikasi dideploy ke layanan static hosting Netlify.

**URL Netlify:**  
[https://story-web-app.netlify.app/#/](https://story-web-app.netlify.app/#/)

- Jika user belum login dan mengakses root (`/#/`), otomatis akan diarahkan ke halaman login.
- Jika tidak mengarah pada halaman login silakan refresh halaman

## Credits

Dikembangkan sebagai bagian dari pembelajaran pengembangan web intermediate.  
Gunakan, modifikasi, dan kembangkan sesuai kebutuhan Anda!

Made by: [Ryanz23](https://github.com/Ryanz23)