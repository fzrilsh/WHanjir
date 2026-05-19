<div align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="WHanjir logo">
  <h1>WHanjir</h1>
  <p><strong>Visualisasi Prediksi Banjir Berbasis Peta Interaktif</strong></p>
  <p>Jakarta Barat &mdash; Real-Time</p>
  <br>
</div>

---

## Tentang Proyek

WHanjir adalah aplikasi pemetaan interaktif yang membantu masyarakat Jakarta mengetahui potensi genangan banjir secara **real-time**. Berbeda dengan aplikasi navigasi biasa, WHanjir fokus pada penyediaan informasi spasial yang akurat agar pengguna bisa mengambil keputusan antisipatif &mdash; seperti memutar haluan atau memilih jalur alternatif &mdash; sebelum terjebak di area terdampak banjir.

Aplikasi ini dikembangkan sebagai proyek mata kuliah **Human and Computer Interaction (HCI)** &mdash; Semester Genap 2025/2026.

### Target Pengguna

- Pengemudi ojek (konvensional maupun berbasis aplikasi)
- Kurir dan pekerja lapangan
- Pelaku usaha kecil dengan mobilitas tinggi
- Siapa pun yang ingin tahu: &ldquo;Apakah jalan yang akan saya lalui aman dari banjir?&rdquo;

---

## Anggota Kelompok &mdash; Kelas LH01

| NPM | Nama |
|---|---|
| 2902659922 | **Fazril Syaveral Hillaby** |
| 2902636856 | Juan Kevin Utomo |
| 2902655104 | Kent Afyan Diswara |
| 2902636250 | Rooney Elvis Liu |
| 2902635714 | Sam Bryan Nixon |

---

## Fitur-Fitur

### Peta Interaktif Real-Time

Peta menampilkan kondisi jalan di Jakarta Barat dengan tiga kategori visual:

| Status | Warna | Skor Risiko |
|---|---|---|
| <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#BA1A1A;vertical-align:middle;margin-right:4px;"></span> **Banjir Parah** | <span style="color:#BA1A1A;">Merah</span> | &ge; 70 |
| <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#FFBA52;vertical-align:middle;margin-right:4px;"></span> **Ter genang** | <span style="color:#E88502;">Kuning</span> | 40 &ndash; 69 |
| <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#34C759;vertical-align:middle;margin-right:4px;"></span> **Aman** | <span style="color:#34C759;">Hijau</span> | &lt; 40 |

### Pencarian Jalan &amp; Kelurahan

Cari nama jalan atau kelurahan &mdash; langsung ditampilkan status risikonya lengkap dengan skor.

### Tampilan Area (Thematic View)

Lihat risiko banjir per kelurahan dalam tampilan area berwarna &mdash; memudahkan melihat wilayah mana yang perlu diwaspadai secara keseluruhan.

### Rute Alternatif

Tentukan titik tujuan, sistem akan menampilkan rute tercepat yang bisa diikuti. Garis rute dirancang dengan outline putih agar tetap terlihat jelas meski melewati jalan dengan status risiko tinggi.

### Lokasi Pengguna (GPS)

Fitur geolokasi menunjukkan posisi kamu di peta secara langsung, sehingga kamu bisa melihat apakah posisi saat ini berada di area aman atau terdampak.

### Mode Terang / Gelap

Sesuaikan tampilan peta dengan preferensi:

- **Terang** &mdash; untuk penggunaan siang hari
- **Gelap** &mdash; nyaman dipakai di malam hari
- **Ikut Sistem** &mdash; otomatis mengikuti tema perangkat kamu

Pengaturan tersimpan otomatis, tidak perlu mengatur ulang setiap kali membuka aplikasi.

### Aplikasi Web Progresif (PWA)

WHanjir bisa diinstal langsung ke layar beranda HP seperti aplikasi native. Setelah diinstal:

- Buka seperti aplikasi biasa (tanpa browser)
- Loading lebih cepat berkat cache cerdas
- Notifikasi update otomatis

### Data Real-Time

Data risiko banjir diperbarui secara otomatis setiap beberapa menit &mdash; tanpa perlu me-refresh halaman manual. Jika koneksi terputus, aplikasi akan menampilkan pemberitahuan yang jelas.

---

## Cara Menjalankan

### Syarat Sistem

- **Node.js** versi 18 atau lebih baru
- **Python** versi 3.10 atau lebih baru (untuk backend)

### Langkah-Langkah

```bash
# 1. Clone repositori
git clone https://github.com/fzrilsh/WHanjir.git
cd WHanjir

# 2. Install dependensi frontend
npm install

# 3. Copy environment variables
cp .env.example .env
# Sesuaikan VITE_API_HOST dan VITE_API_PORT dengan alamat backend

# 4. Jalankan mode development
npm run dev
```

Untuk backend (server data), lihat petunjuk di repositori backend terpisah.

### Mode Preview (Production Build)

```bash
npm run build
npm run preview
```

---

## Teknologi yang Digunakan

| Teknologi | Kegunaan |
|---|---|
| React | Kerangka kerja antarmuka |
| Vite | Build tool &mdash; cepat dan ringan |
| Tailwind CSS | Styling antarmuka |
| MapLibre GL JS | Peta interaktif (open-source) |
| Socket.IO | Komunikasi data real-time |
| Flask | Backend API server |
| PWA (Vite Plugin) | Kemampuan instalasi offline |

---

<div align="center">
  <p><sub>Dikembangkan untuk tugas mata kuliah HCI &mdash; Semester Genap 2025/2026</sub></p>
  <p><sub>Universitas Bina Nusantara</sub></p>
</div>
