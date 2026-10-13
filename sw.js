/* ブラックジャック — 電波が無くても開けるようにするための小さな仕掛け */
const V = "blackjack-v4";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-32.png", "./icon-180.png", "./icon-192.png", "./icon-512.png",
               "./se/chip_1.mp3", "./se/chip_2.mp3", "./se/chip_3.mp3", "./se/chip_4.mp3", "./se/chip_5.mp3", "./se/chip_6.mp3", "./se/chips_1.mp3", "./se/chips_2.mp3", "./se/chips_3.mp3", "./se/chips_4.mp3", "./se/chips_5.mp3", "./se/chips_6.mp3", "./se/deal_1.mp3", "./se/deal_2.mp3", "./se/deal_3.mp3", "./se/deal_4.mp3", "./se/deal_5.mp3", "./se/deal_6.mp3", "./se/deal_7.mp3", "./se/deal_8.mp3", "./se/flip_1.mp3", "./se/flip_2.mp3", "./se/flip_3.mp3", "./se/flip_4.mp3"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).catch(() => {}));
});

/* 同じ github.io の下にほかのアプリもあるので、消すのは自分（blackjack-）の古い控えだけ */
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith("blackjack-") && k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;          // 文字の書体などの外部通信は素通し
  if (e.request.method !== "GET") return;

  // 本体は「まず新しいものを取りに行く」。取れなければ手元の控えを出す
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request)
        .then(r => { const c = r.clone(); caches.open(V).then(x => x.put("./index.html", c)); return r; })
        .catch(() => caches.match("./index.html").then(r => r || caches.match("./")))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
