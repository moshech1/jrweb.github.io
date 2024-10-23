var cacheName = `scratchjr-1.0.0`;
var contentToCache = [
    '/vendors/snap/snap.svg-min.js',
    '/index9.js'
];

self.addEventListener("install", (e) => {
    console.log("[Service Worker] Install");
    self.skipWaiting();
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log("[Service Worker] Caching all: app shell and content");
            return cache.addAll(contentToCache);
        })
    );
});

self.addEventListener("activate", function (e) {
    console.log("[Service Worker] Activated");
    e.waitUntil(
        caches
            .keys()
            .then((keyList) => {
                return Promise.all(
                    keyList.map((key) => {
                        if (key !== cacheName) {
                            console.log(
                                "[Service Worker] Removing old cache",
                                key
                            );
                            return caches.delete(key);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// Fetching content using Service Worker
self.addEventListener("fetch", function (e) {
    if (
        e.request.method === "GET" &&
        e.request.url.indexOf("api") < 0 &&
        e.request.url.indexOf("localhost") < 0 &&
        e.respondWith
    ) {
        e.respondWith(
            caches.match(e.request).then(function (r) {
                if (r) {
                    console.log(
                        "[Service Worker] Fetching from cache:",
                        e.request.url
                    );
                    return r;
                }
                return fetch(e.request)
                    .then((res) => {
                        console.log(
                            "[Service Worker] Fetching resource:",
                            e.request.url
                        );
                        if (
                            e.request.url.indexOf("bundle") >= 0 ||
                            e.request.url.indexOf("common") >= 0
                        ) {
                            return caches
                                .open(cacheName)
                                .then(function (cache) {
                                    console.log(
                                        "[Service Worker] Caching new resource: " +
                                            e.request.url
                                    );
                                    cache.put(e.request, res.clone());
                                    return res;
                                });
                        }
                        return res;
                    })
                    .catch((error) => {
                        console.log(
                            "[Service Worker] Fetching resource Failed:",
                            e.request.url,
                            error
                        );
                    });
            })
        );
    }
});
