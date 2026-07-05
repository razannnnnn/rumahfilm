# 🎬 RumahFilm

Personal media server lokal — streaming film dari server langsung ke browser di jaringan LAN rumah.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-38bdf8?style=flat-square&logo=tailwindcss)
![Motion](https://img.shields.io/badge/Motion-latest-purple?style=flat-square)
![TMDB](https://img.shields.io/badge/TMDB-API-01b4e4?style=flat-square)

---

## ✨ Fitur

- 🎥 **Streaming video** — support MP4, MKV, AVI, MOV, dan format lainnya via HTTP range request
- 🖼️ **Metadata otomatis** — poster, backdrop, rating, overview, dan genre dari TMDB API
- 🎞️ **Hero banner carousel** — auto-slide dengan animasi Motion
- 🔍 **Search & filter genre** — cari film dan filter berdasarkan genre
- 📝 **Subtitle otomatis** — baca file `.srt` dan konversi ke VTT untuk ditampilkan di player
- ▶️ **Custom video player** — play/pause, skip ±10s, volume, fullscreen, subtitle toggle, brightness
- ⌨️ **Keyboard shortcut** — Space, ←→ skip, ↑↓ volume, F fullscreen, M mute, C subtitle
- 📍 **Progress nonton** — simpan posisi terakhir per film, resume otomatis
- 🕐 **Riwayat tontonan** — history film yang pernah ditonton
- 📁 **File explorer** — browse, upload, rename, download, dan hapus file dari browser
- 📊 **Monitor server** — pantau CPU, RAM, suhu, storage, dan IP server secara realtime
- 🌙 **Dark / Light mode** — toggle tema dengan animasi smooth
- 📱 **Responsive** — sidebar drawer di mobile, layout menyesuaikan semua ukuran layar
- 🔐 **Auth** — proteksi halaman admin dengan NextAuth.js (Credentials)
- 📬 **Request film** — form request film (terintegrasi Google Sheets)
- ✅ **Admin approve request** — kelola request film, ubah status, dan catatan

---

## 🏗️ Arsitektur

```
┌──────────────────────────┐       ┌──────────────────────────┐
│   Frontend (Next.js)     │ ────▶ │   Server (Express.js)    │
│   Local / Vercel         │       │   api-rumahfilm.razn.my.id│
│   Browser LAN            │       │   STB HG680P / VPS       │
└──────────────────────────┘       └──────────────────────────┘
                                           │
                                           ▼
                                  ┌──────────────────────┐
                                  │   Hardisk Eksternal  │
                                  │   /mnt/harddisk/Film │
                                  └──────────────────────┘
```

---

## 🛠️ Tech Stack

| Bagian | Teknologi |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v3 |
| Animasi | Motion |
| Metadata | TMDB API v3 |
| Auth | NextAuth.js (Credentials Provider) |
| Database Request | Google Sheets API |
| Backend Server | Express.js |
| Streaming | HTTP Range Request |
| Server OS | Armbian Linux (ARM64) |

---

## 📁 Struktur Project

```
rumahfilm/
├── src/
│   ├── app/
│   │   ├── layout.jsx                  ← Root layout + providers
│   │   ├── page.jsx                    ← Home (hero carousel + grid film)
│   │   ├── loading.jsx                 ← Global loading spinner
│   │   ├── error.jsx                   ← Global error (STB offline detect)
│   │   ├── not-found.jsx               ← 404 page
│   │   ├── globals.css                 ← Tailwind + custom scrollbar
│   │   ├── providers.jsx               ← ThemeProvider wrapper
│   │   │
│   │   ├── film/[id]/page.jsx          ← Detail film + metadata TMDB
│   │   ├── watch/[id]/page.jsx         ← Video player streaming
│   │   ├── history/page.jsx            ← Riwayat tontonan
│   │   ├── explorer/page.jsx           ← File explorer browser
│   │   ├── monitor/page.jsx            ← Monitor server realtime
│   │   ├── login/page.jsx              ← Halaman login admin
│   │   ├── about/page.jsx              ← Halaman tentang
│   │   ├── request/page.jsx            ← Form request film
│   │   ├── admin/requests/page.jsx     ← Admin kelola request film
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/     ← NextAuth handler
│   │       ├── films/route.js          ← Proxy daftar film dari server
│   │       ├── stream/[id]/route.js    ← Proxy stream video
│   │       ├── subtitle/[id]/route.js  ← Proxy subtitle
│   │       ├── metadata/route.js       ← Fetch metadata dari TMDB
│   │       ├── system/route.js         ← Proxy monitor server
│   │       ├── explorer/               ← CRUD file (read, delete, mkdir,
│   │       │                              rename, edit/upload, download)
│   │       └── requests/               ← CRUD request film (Google Sheets)
│   │
│   └── components/
│       ├── Sidebar.jsx                 ← Navigasi sidebar + dark mode toggle
│       ├── SidebarWrapper.jsx          ← Wrapper sidebar + overlay mobile
│       ├── Navbar.jsx                  ← Top navbar mobile
│       ├── FilmCard.jsx                ← Card poster film
│       ├── FilmGrid.jsx                ← Grid + search + filter genre
│       ├── HeroBanner.jsx              ← Carousel hero banner motion
│       ├── VideoPlayer.jsx             ← Custom video player
│       ├── STBStatus.jsx               ← Status koneksi server
│       └── PageLoadingSpinner.jsx      ← Loading spinner
│
├── src/lib/
│   ├── cache.js                        ← Cache metadata ke file JSON
│   ├── history.js                      ← Riwayat tontonan (localStorage)
│   └── googleSheets.js                 ← Google Sheets API client
│
├── src/proxy.js                        ← Middleware (auth + rate limiting)
├── server.js                           ← Express backend
├── config.js                           ← Konfigurasi path & TMDB key
└── .env.local                          ← Environment variables
```

---

## 🚀 Instalasi & Setup

### Prerequisites
- Node.js v20+
- FFmpeg (untuk konversi subtitle .srt ke .vtt)
- NPM / PNPM

### 1. Clone & Install

```bash
git clone https://github.com/razannnnnn/rumahfilm.git
cd rumahfilm
npm install
```

### 2. Environment Variables

Buat file `.env.local`:

```env
# TMDB
TMDB_API_KEY=your_tmdb_api_key

# Backend server
STB_URL=https://api-rumahfilm.razn.my.id
NEXT_PUBLIC_STB_URL=https://api-rumahfilm.razn.my.id

# NextAuth
NEXTAUTH_SECRET=generate_random_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password

# Backend STB config
FILM_PATH=/home/razan/film

# Google Sheets (opsional — untuk fitur request film)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
```

### 3. Jalankan Development

```bash
npm run dev
```

Buka `http://localhost:3000`.

### 4. Build & Deploy

```bash
npm run build
npm start
```

---

## 🔐 Admin Credentials

Login di `/login` dengan credentials yang diset di `.env.local`:

| Variable | Default |
|----------|---------|
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | _(terserah kamu)_ |

---

## 🎮 Keyboard Shortcut Video Player

| Tombol | Fungsi |
|--------|--------|
| `Space` / `K` | Play / Pause |
| `←` | Mundur 10 detik |
| `→` | Maju 10 detik |
| `↑` | Volume naik |
| `↓` | Volume turun |
| `F` | Toggle fullscreen |
| `M` | Mute / Unmute |
| `C` | Toggle subtitle |
| `?` | Tampilkan shortcut |

---

## 📝 Format Penamaan File

Film harus dinamai dengan format berikut agar metadata TMDB otomatis terdeteksi:

```
Judul Film (Tahun).ext
```

Contoh:
```
Spider-Man No Way Home (2021).mkv
Bad Boys Ride or Die (2024).mp4
Sully (2016).mp4
```

Subtitle (opsional) harus berada di folder yang sama dengan nama yang sama:
```
Sully (2016).srt
```

---

## 🖥️ Spesifikasi Server

| Komponen | Spesifikasi |
|----------|-------------|
| Device | STB HG680P |
| OS | Armbian Linux (ARM64) |
| Storage OS | eMMC 59.5GB |
| Storage Film | Hardisk Eksternal NTFS 931.5GB |

---

## 🌐 Environment Variables Reference

| Variable | Wajib | Deskripsi |
|----------|-------|-----------|
| `TMDB_API_KEY` | ✅ | API key dari themoviedb.org |
| `STB_URL` | ✅ | URL backend server (tanpa `NEXT_PUBLIC_`) |
| `NEXT_PUBLIC_STB_URL` | ✅ | URL backend server (client-side) |
| `NEXTAUTH_SECRET` | ✅ | Secret untuk JWT token |
| `NEXTAUTH_URL` | ✅ | URL frontend untuk NextAuth |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Base URL frontend |
| `ADMIN_USERNAME` | ✅ | Username login admin |
| `ADMIN_PASSWORD` | ✅ | Password login admin |
| `FILM_PATH` | ✅ | Path folder film di backend server |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | ❌ | Untuk fitur request via Google Sheets |
| `GOOGLE_PRIVATE_KEY` | ❌ | Private key service account |
| `GOOGLE_SPREADSHEET_ID` | ❌ | ID spreadsheet Google Sheets |

---

## 📄 License

MIT License — bebas digunakan dan dimodifikasi untuk keperluan pribadi.

---

<p align="center">Dibuat dengan ❤️ untuk nonton film di rumah</p>
