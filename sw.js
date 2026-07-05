const CACHE_NAME = "oikko-v2";

const urlsToCache = [

"/",

"/index.html",
"/signin.html",
"/signup.html",
"/dashboard.html",
"/members.html",
"/member-details.html",
"/profile.html",
"/admin.html",
"/payment.html",
"/monthly-report.html",
"/yearly-report.html",
"/pending-members.html",

"/css/style.css",

"/js/firebase.js",
"/js/main.js",
"/js/dashboard.js",
"/js/members.js",
"/js/member-details.js",
"/js/profile.js",
"/js/admin.js",
"/js/payment.js",
"/js/monthly-report.js",
"/js/yearly-report.js",
"/js/pending-members.js",

"/manifest.json",

"/icons/icon-192.png",
"/icons/icon-512.png"

];

// Install
self.addEventListener("install", (event) => {

event.waitUntil(

caches.open(CACHE_NAME)

.then((cache) => cache.addAll(urlsToCache))

.then(() => self.skipWaiting())

);

});

// Activate
self.addEventListener("activate", (event) => {

event.waitUntil(

caches.keys().then((cacheNames) => {

return Promise.all(

cacheNames.map((cache) => {

if (cache !== CACHE_NAME) {

return caches.delete(cache);

}

})

);

})

);

self.clients.claim();

});

// Fetch
self.addEventListener("fetch", (event) => {

event.respondWith(

caches.match(event.request)

.then((response) => {

return response || fetch(event.request);

})

);

});