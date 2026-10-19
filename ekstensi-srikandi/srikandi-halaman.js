// Berjalan di halaman SRIKANDI: ikut membaca jawaban server (JSON) yang memang diterima halaman,
// lalu menyerahkannya ke srikandi.js. Tidak mengirim apa pun ke luar komputer.
(() => {
  const serahkan = (json, url) => window.postMessage({ __kabarSrikandi: 1, json, url }, location.origin);
  const periksa = (teks, url) => {
    if (!teks || teks.length > 5e6) return;
    const c = teks.trimStart()[0]; if (c !== "{" && c !== "[") return;
    try { serahkan(JSON.parse(teks), String(url || "")); } catch (e) { /* bukan JSON */ }
  };
  const f = window.fetch;
  if (f) window.fetch = function (...a) {
    const p = f.apply(this, a);
    p.then(r => { try { if (/json/i.test(r.headers.get("content-type") || "")) r.clone().text().then(t => periksa(t, r.url)).catch(() => {}); } catch (e) {} }).catch(() => {});
    return p;
  };
  const X = XMLHttpRequest.prototype, buka = X.open, kirim = X.send;
  X.open = function (m, u) { this.__urlKabar = u; return buka.apply(this, arguments); };
  X.send = function () {
    this.addEventListener("load", () => {
      try {
        if (this.responseType === "" || this.responseType === "text") periksa(this.responseText, this.__urlKabar);
        else if (this.responseType === "json" && this.response) serahkan(this.response, this.__urlKabar);
      } catch (e) {}
    });
    return kirim.apply(this, arguments);
  };
})();
