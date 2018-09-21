var CACHE_NAME = 'restaurant-cache-v1';
// Adding all files to cache array needed for the website to function
var urlsToCache = [
  '/',
  '/css/styles.css',
  '/images/1-800.jpg',
  '/images/1-300.jpg',
  '/images/2-800.jpg',
  '/images/2-300.jpg',
  '/images/3-800.jpg',
  '/images/3-300.jpg',
  '/images/4-800.jpg',
  '/images/4-300.jpg',
  '/images/5-800.jpg',
  '/images/5-300.jpg',
  '/images/6-800.jpg',
  '/images/6-300.jpg',
  '/images/7-800.jpg',
  '/images/7-300.jpg',
  '/images/8-800.jpg',
  '/images/8-300.jpg',
  '/images/9-800.jpg',
  '/images/9-300.jpg',
  '/images/10-800.jpg',
  '/images/10-300.jpg',
  '/img/2.jpg',
  '/img/3.jpg',
  '/img/4.jpg',
  '/img/5.jpg',
  '/img/6.jpg',
  '/img/7.jpg',
  '/img/8.jpg',
  '/img/9.jpg',
  '/img/10.jpg',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js'
];

// When the service worker is installed after registration, open cache and add all resources to it.
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

//When the service worker is hit with a request from the website, open cache and return response if found,
//else return response from the network

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
