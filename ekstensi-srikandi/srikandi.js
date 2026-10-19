// Mengenali naskah di SRIKANDI (dari data server dan dari tabel di layar) beserta status TTE-nya
const NOMOR = /\b\d{3}(?:\.\d{1,4}){0,6}\s*\/\s*[A-Za-z0-9.\-]+(?:\s*\/\s*[A-Za-z0-9.\-]+)+/;
const BELUM = /belum|menunggu|proses|draf|konsep|ditolak|dikembalikan|revisi|batal|perlu|antri|pending/i;
const SUDAH = /sudah\s*(di)?\s*(tte|ttd|tanda\s*tangan)|telah\s*ditandatangani|ditandatangani|signed|selesai|terkirim|sudah\s*dikirim|tte\s*berhasil|final/i;
const statusTte = t => { t = String(t || ""); if (BELUM.test(t)) return SUDAH.test(t) && !/belum/i.test(t) ? true : false; return SUDAH.test(t) ? true : null; };
const bersih = s => String(s == null ? "" : s).replace(/\s+/g, " ").trim();

function dariJson(j) {
  const out = []; let n = 0;
  const jalan = (o, d) => {
    if (!o || typeof o !== "object" || d > 8 || n > 5000) return; n++;
    if (Array.isArray(o)) { o.slice(0, 2000).forEach(x => jalan(x, d + 1)); return; }
    let nomor = "", hal = "", st = "", tt = null, tgl = "";
    for (const [k, v] of Object.entries(o)) {
      if (v && typeof v === "object") { jalan(v, d + 1); continue; }
      const s = bersih(v), kl = k.toLowerCase();
      if (!nomor && /nomor|no_?surat|no_?naskah|number/.test(kl) && NOMOR.test(s)) nomor = s.match(NOMOR)[0].replace(/\s+/g, "");
      else if (!hal && /perihal|^hal$|^hal_|_hal$|subject|judul|ringkas/.test(kl) && s.length >= 4 && s.length <= 400) hal = s;
      else if (/status|tahap|state|posisi|keterangan_ttd/.test(kl) && s && s.length <= 80) st += (st ? " · " : "") + s;
      else if (/(^|_)(is_?)?(ttd|tte|signed|ditandatangani|sudah_?ttd|sudah_?tte)($|_)/.test(kl)) {
        if (v === true || v === 1 || /^(1|true|ya|y|sudah)$/i.test(s)) tt = true;
        else if ((v === false || v === 0 || /^(0|false|tidak|belum)$/i.test(s)) && tt === null) tt = false;
      }
      else if (!tgl && /tanggal|tgl|date/.test(kl) && /\d{4}-\d{2}-\d{2}/.test(s)) tgl = s.match(/\d{4}-\d{2}-\d{2}/)[0];
    }
    if ((nomor || hal) && (nomor || st || tt !== null)) {
      const t = tt !== null ? tt : statusTte(st);
      out.push({ nomor, hal, status: st, tte: t, tanggal: tgl, url: location.href });
    }
  };
  jalan(j, 0);
  return out;
}

// Baris tabel / kartu yang memuat nomor naskah atau status
function barisNaskah(b) {
  const t = bersih(b.innerText); if (t.length < 10 || t.length > 2000) return null;
  const sel = [...b.querySelectorAll("td,[role=cell],[role=gridcell],mat-cell")].map(c => bersih(c.innerText)).filter(Boolean);
  const m = t.match(NOMOR);
  const hal = (sel.length ? sel : (b.innerText || "").split(/\n+/).map(bersih)).filter(s => !NOMOR.test(s) && s.length >= 8 && statusTte(s) === null).sort((a, c) => c.length - a.length)[0] || "";
  const st = statusTte(sel.length ? sel.filter(s => s !== hal).join(" ") : t.replace(hal, " ")); // status dibaca di luar teks perihal
  if (!m && (st === null || sel.length < 2)) return null;
  const a = b.querySelector("a[href]:not([href^='javascript'])");
  return { nomor: m ? m[0].replace(/\s+/g, "") : "", hal, status: t.slice(0, 160), tte: st, url: a ? a.href : location.href };
}
const BARIS = "tr,[role=row],mat-row,li,.card,.list-group-item";
function dariLayar() {
  const out = [];
  document.querySelectorAll(BARIS).forEach(b => { if (b.querySelector(BARIS)) return; const r = barisNaskah(b); if (r) out.push(r); });
  return out;
}

const kirim = (data, jenis = "naskah") => { try { chrome.runtime.sendMessage({ jenis, data }); } catch (e) { /* ekstensi dimuat ulang */ } };
window.addEventListener("message", e => {
  if (e.source !== window || !e.data || !e.data.__kabarSrikandi) return;
  const r = dariJson(e.data.json); if (r.length) kirim(r);
});
let tunda = null;
const pindai = () => { clearTimeout(tunda); tunda = setTimeout(() => { const r = dariLayar(); if (r.length) kirim(r); }, 800); };
const mulai = () => { pindai(); new MutationObserver(pindai).observe(document.body, { childList: true, subtree: true, characterData: true }); };
if (document.body) mulai(); else document.addEventListener("DOMContentLoaded", mulai);
// Naskah yang terakhir diklik (misalnya tombol Unduh di barisnya): untuk mencocokkan PDF yang diunduh
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest(BARIS); const r = b && barisNaskah(b);
  if (r) kirim(r, "terakhir");
  else { const m = bersih(document.body.innerText).match(NOMOR); if (m) kirim({ nomor: m[0].replace(/\s+/g, ""), hal: "", url: location.href }, "terakhir"); }
}, true);
