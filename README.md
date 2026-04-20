# 🎬 RumahFilm

Personal media server lokal yang dibangun dengan Next.js — streaming film dari hardisk langsung ke browser di jaringan LAN rumah.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-38bdf8?style=flat-square&logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-latest-purple?style=flat-square)
![TMDB](https://img.shields.io/badge/TMDB-API-01b4e4?style=flat-square)

---

## ✨ Fitur

- 🎥 **Streaming video** — support MP4, MKV, AVI, MOV, dan format lainnya via HTTP range request
- 🖼️ **Metadata otomatis** — poster, backdrop, rating, overview, dan genre dari TMDB API
- 🎞️ **Hero banner carousel** — auto-slide dengan animasi Framer Motion
- 🔍 **Search & filter genre** — cari film dan filter berdasarkan genre
- 📝 **Subtitle otomatis** — baca file `.srt` dan konversi ke VTT untuk ditampilkan di player
- ▶️ **Custom video player** — play/pause, skip ±10s, volume, fullscreen, subtitle toggle, brightness
- ⌨️ **Keyboard shortcut** — Space, ←→ skip, ↑↓ volume, F fullscreen, M mute, C subtitle
- 📍 **Progress nonton** — simpan posisi terakhir per film, resume otomatis
- 🕐 **Riwayat tontonan** — history film yang pernah ditonton
- 📁 **File explorer** — browse, upload, rename, download, dan hapus file dari browser
- 📊 **Monitor STB** — pantau CPU, RAM, suhu, storage, dan IP STB secara realtime
- 🌙 **Dark / Light mode** — toggle tema dengan animasi smooth
- 📱 **Responsive** — sidebar drawer di mobile, layout menyesuaikan semua ukuran layar
- 🔐 **Auth** — proteksi halaman admin dengan NextAuth.js

---

## 🏗️ Arsitektur

```
┌─────────────────────────┐          ┌───────────────────────┐
│   Vercel (Frontend)     │ ──────▶  │  STB HG680P (Backend) │
│   Next.js App           │          │   Express.js API      │
│   rumahfilm.vercel.app  │          │   stb.razan.web.id    │
└─────────────────────────┘          └───────────────────────┘
                                          │
                                          ▼
                                 ┌──────────────────────┐
                                 │  Hardisk Eksternal   │
                                 │  /mnt/harddisk/Film  │
                                 └──────────────────────┘
```

---

## 🛠️ Tech Stack

| Bagian | Teknologi |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v3 |
| Animasi | Framer Motion |
| Metadata | TMDB API v3 |
| Auth | NextAuth.js |
| Backend STB | Express.js |
| Deploy Frontend | Vercel |
| Deploy Backend | PM2 di STB HG680P (Armbian) |

---

## 📁 Struktur Project

```
rumahfilm/
├── src/
│   └── app/
│       ├── layout.jsx
│       ├── page.jsx                  ← Home (hero carousel + grid film)
│       ├── film/[id]/page.jsx        ← Detail film
│       ├── watch/[id]/page.jsx       ← Video player
│       ├── history/page.jsx          ← Riwayat tontonan
│       ├── explorer/page.jsx         ← File explorer
│       ├── monitor/page.jsx          ← Monitor STB
│       └── api/
│           ├── films/route.js        ← Proxy ke STB
│           ├── stream/[id]/route.js  ← Proxy stream video
│           ├── metadata/route.js     ← Fetch TMDB
│           ├── subtitle/[id]/route.js← Proxy subtitle
│           ├── explorer/route.js     ← Proxy file explorer
│           ├── system/route.js       ← Proxy monitor STB
│           └── auth/                 ← NextAuth handler
├── src/components/
│   ├── Sidebar.jsx                   ← Navigasi + dark mode toggle
│   ├── FilmCard.jsx                  ← Card poster film
│   ├── FilmGrid.jsx                  ← Grid + search + filter genre
│   ├── HeroBanner.jsx                ← Carousel hero banner
│   └── VideoPlayer.jsx               ← Custom video player
├── src/lib/
│   ├── cache.js                      ← Cache metadata ke file JSON
│   └── history.js                    ← Riwayat tontonan (localStorage)
├── server.js                         ← Express backend untuk STB
└── config.js                         ← Konfigurasi path & TMDB key
```

---

## 🚀 Instalasi

### Prerequisites
- Node.js v20+
- FFmpeg (untuk subtitle)
- PM2 (untuk deploy di STB)

### Frontend (Vercel)

```bash
git clone https://github.com/razannnnnn/rumahfilm.git
cd rumahfilm
npm install
```

Buat file `.env.local`:
```env
TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_BASE_URL=https://rumahfilm.vercel.app
NEXT_PUBLIC_STB_URL=https://your-stb-domain.com
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://rumahfilm.vercel.app
```

Deploy ke Vercel:
```bash
vercel deploy
```

### Backend STB (Armbian)

```bash
git clone https://github.com/razannnnnn/rumahfilm.git
cd rumahfilm
npm install

# Buat .env
echo "FILMS_PATH=/mnt/harddisk/Film" > .env
echo "ALLOWED_ORIGIN=https://rumahfilm.vercel.app" >> .env
echo "PORT=4000" >> .env

# Jalankan dengan PM2
pm2 start server.js --name "rumahfilm-api"
pm2 startup && pm2 save
```

### Mount hardisk eksternal

```bash
sudo mkdir -p /mnt/harddisk
sudo mount /dev/sdb1 /mnt/harddisk

# Auto-mount saat boot
echo "/dev/sdb1  /mnt/harddisk  ntfs  defaults,nofail  0  0" | sudo tee -a /etc/fstab
```

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

## 🖥️ Hardware

| Komponen | Spesifikasi |
|----------|-------------|
| Device | STB HG680P |
| OS | Armbian Linux (ARM64) |
| Storage OS | eMMC 59.5GB |
| Storage Film | Hardisk Eksternal NTFS 931.5GB |

---

## 📸 Screenshot

> Coming soon

---

## 📄 License

MIT License — bebas digunakan dan dimodifikasi untuk keperluan pribadi.

---

<p align="center">Dibuat dengan ❤️ untuk nonton film di rumah</p>
