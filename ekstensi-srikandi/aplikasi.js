// Jembatan ke aplikasi Surat Menyurat: menyerahkan kabar SRIKANDI yang tersimpan di ekstensi
const serahkan = async () => {
  try {
    const d = await chrome.storage.local.get(["naskah", "unduhan"]);
    window.postMessage({ __dariEkstensiSrikandi: 1, versi: chrome.runtime.getManifest().version,
      naskah: Object.values(d.naskah || {}), unduhan: d.unduhan || [] }, "*");
  } catch (e) { /* ekstensi dimuat ulang: muat ulang halaman */ }
};
window.addEventListener("message", e => { if (e.source === window && e.data && e.data.__mintaKabarSrikandi) serahkan(); });
chrome.storage.onChanged.addListener((c, area) => { if (area === "local" && (c.naskah || c.unduhan)) serahkan(); });
document.addEventListener("DOMContentLoaded", serahkan);
