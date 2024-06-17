/**
 * @file Service worker
 *
 * @module service-worker
 */
/**
 * Code from example Parceljs service worker {@link https://parceljs.org/languages/javascript/#service-workers}
 */
import { manifest, version } from '@parcel/service-worker';

const APP_KEY = 'ClickAndCrawl:';

/**
 * Remove duplicates from the manifest.
 * @param {string[]} manifest
 * @returns {string[]}
 */
function removeDuplicates(manifest) {
  return manifest.filter((value, index) => manifest.indexOf(value) === index);
}
/**
 * Convert the version into a unique key for this app.
 * @returns {string}
 */
function getVersionedCacheKey() {
  return `${APP_KEY}[${version}]`;
}

/**
 * Test if cache key belongs to this app even if different version.
 * @param {string} key
 * @returns {boolean}
 */
function isThisApp(key) {
  return key.startsWith(APP_KEY);
}

/**
 * Install the cache.
 */
async function install() {
  console.debug(
    `[Service worker] Installing version ${version} and pre-caching`
  );
  const cache = await caches.open(getVersionedCacheKey());
  for (const entry of manifest) {
    console.debug(`Manifest ${entry}`);
  }
  await cache.addAll(removeDuplicates(manifest));
}

/**
 * Activate the cache.
 */
async function activate() {
  console.debug(`[Service worker] Activating`);
  const keys = await caches.keys();
  const promises = [];
  for (const key of keys) {
    if (isThisApp(key) && key !== getVersionedCacheKey()) {
      promises.push(caches.delete(key));
    }
  }
  await Promise.all(promises);
}

/**
 * Completely remove the cache.
 */
export async function deleteAllCaches() {
  console.info('Deleting all service worker caches.');
  const promises = [];
  const keys = await caches.keys();
  for (const key of keys) {
    if (isThisApp(key) && key !== getVersionedCacheKey()) {
      promises.push(caches.delete(key));
    }
  }
  await Promise.all(promises);
}

/**
 * Respond to a FetchEvent and return value from the cache or the network.
 * @param {Request} request
 * @returns {Response}
 */
async function cacheThenNetwork(request) {
  const cacheName = getVersionedCacheKey();
  let cachedResponse = await caches.match(request, { cacheName: cacheName });
  if (cachedResponse) {
    console.log('[Service worker] Found response in cache:', cachedResponse);
    return cachedResponse;
  }
  cachedResponse = await caches.match(request, {
    ignoreSearch: true,
    cacheName: cacheName,
  });
  if (cachedResponse) {
    console.log(
      '[Service worker] Found response in cache ignoring search:',
      cachedResponse
    );
    return cachedResponse;
  }
  console.log('[Service worker] No cache so resorting to network');
  return fetch(request);
}

self.addEventListener('install', (e) => e.waitUntil(install()));
self.addEventListener('activate', (e) => e.waitUntil(activate()));

self.addEventListener('fetch', (e) =>
  e.respondWith(cacheThenNetwork(e.request))
);
