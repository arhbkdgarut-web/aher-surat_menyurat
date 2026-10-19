# Surat Menyurat BKD Garut

Aplikasi untuk membuat **Nota Dinas** dan **Surat Dinas** dengan kop Badan Kepegawaian dan Diklat Kabupaten Garut.

Buka aplikasinya di: https://arhbkdgarut-web.github.io/aher-surat_menyurat/

- Cetak / PDF langsung dari browser, atau unduh sebagai file Word (.docx).
- Arsip nota tersimpan di browser masing-masing pengguna, tidak dikirim ke internet.
  Gunakan **Arsip → Unduh cadangan (.json)** secara berkala.
- Isi bisa menjorok ke dalam: tekan **Tab** di awal baris (Shift+Tab untuk mengembalikan).
  Baris menjorok di bawah rincian seperti `Waktu : 1. Hari Senin s.d Kamis` menjadi sub-rinciannya
  (contoh lengkap: surat undangan di Arsip).
- Mulai halaman 2 diberi nomor halaman di tengah atas.
- **Surat baru** membuka galeri 15 konsep baku (undangan, permohonan, pemberitahuan, penyampaian,
  jawaban, usul ke BKN, nota dinas laporan/persetujuan/tindak lanjut). Isian dalam `[kurung siku]`
  ditandai kuning dan ditunjuk satu per satu dari daftar periksa.
- Surat apa pun di Arsip (misalnya yang ditempel dari SRIKANDI) bisa **Jadikan templat**.
- Alur naskah: Konsep → Diperiksa → Disetujui → Ditandatangani → Terkirim, dengan riwayat dan saringan di Arsip.
- **Kabar SRIKANDI** (ekstensi Chrome, folder `ekstensi-srikandi/`, unduh `ekstensi-srikandi.zip`):
  cukup buka SRIKANDI, status naskah terbaca sendiri. Di Arsip muncul "✓ Sudah ber-TTE di SRIKANDI, siap diunduh",
  lalu "✓ PDF ber-TTE tersimpan" setelah PDF diunduh. Nomor dari SRIKANDI ikut terisi. Cara pasang: lihat `BACA-SAYA.txt`.
