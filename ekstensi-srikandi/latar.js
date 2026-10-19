// Menyimpan kabar naskah dari SRIKANDI dan mencatat PDF yang diunduh dari SRIKANDI
const kunci = r => (r.nomor || "").replace(/\s+/g, "").toLowerCase() || "hal:" + (r.hal || "").toLowerCase().replace(/\s+/g, " ").slice(0, 160);

async function simpanNaskah(rs) {
  const { naskah = {} } = await chrome.storage.local.get("naskah"), kini = Date.now();
  let ubah = false;
  for (const r of rs) {
    if (!r || (!r.nomor && !r.hal)) continue;
    const k = kunci(r), lama = naskah[k] || {}, baru = { ...lama };
    for (const [f, v] of Object.entries(r)) if (v !== "" && v !== null && v !== undefined) baru[f] = v;
    if (lama.tte === true) baru.tte = true;                   // sekali ber-TTE tetap ber-TTE
    if (baru.tte === true && !lama.tteSejak) baru.tteSejak = kini;
    baru.dilihat = kini;
    if (JSON.stringify({ ...lama, dilihat: 0 }) !== JSON.stringify({ ...baru, dilihat: 0 })) ubah = true;
    naskah[k] = baru;
  }
  if (!ubah) return;
  const daftar = Object.entries(naskah).sort((a, b) => b[1].dilihat - a[1].dilihat).slice(0, 800); // simpan 800 terbaru
  await chrome.storage.local.set({ naskah: Object.fromEntries(daftar) });
}

chrome.runtime.onMessage.addListener(m => {
  if (!m) return;
  if (m.jenis === "naskah") simpanNaskah(m.data);
  if (m.jenis === "terakhir") chrome.storage.local.set({ terakhir: { ...m.data, kunci: kunci(m.data), at: Date.now() } });
});

chrome.downloads.onChanged.addListener(async d => {
  if (!d.state || d.state.current !== "complete") return;
  const [it] = await chrome.downloads.search({ id: d.id }); if (!it) return;
  if (!/srikandi/i.test([it.url, it.finalUrl, it.referrer].join(" "))) return;
  if (!/\.pdf$/i.test(it.filename || "") && !/pdf/i.test(it.mime || "")) return;
  const { unduhan = [], terakhir = null } = await chrome.storage.local.get(["unduhan", "terakhir"]);
  const baru = { file: String(it.filename || "").split(/[\\/]/).pop(), at: Date.now(),
    naskah: terakhir && Date.now() - terakhir.at < 30 * 60e3 ? { nomor: terakhir.nomor || "", hal: terakhir.hal || "" } : null };
  await chrome.storage.local.set({ unduhan: [baru, ...unduhan].slice(0, 300) });
});
