/* eslint-disable no-console */

const DEBUG = false;

/**
 * When the user navigates to your site,
 * the browser tries to redownload the script file that defined the service worker in the background.
 * If there is even a byte's difference in the service worker file compared to what it currently has,
 * it considers it 'new'.
 */
const version = '5.0.1';

const { assets } = global.serviceWorkerOption;

const CACHE_NAME = version + (new Date).toISOString();

let assetsToCache = [...assets, './', '/assets/songkick-logo.svg'];

assetsToCache = assetsToCache.map((path) => {
  return new URL(path, global.location).toString();
});

// When the service worker is first added to a computer.
self.addEventListener('install', (event) => {
  // Perform install steps.
  if (DEBUG) {
    console.log('[SW] Install event');
  }

  // Add core website files to cache during serviceworker installation.
  event.waitUntil(
    global.caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(assetsToCache);
      })
      .then(() => {
        if (DEBUG) {
          console.log('Cached assets: main', assetsToCache);
        }
      })
      .catch((error) => {
        console.error(error);
        throw error;
      })
  );
});

// After the install event.
self.addEventListener('activate', (event) => {
  if (DEBUG) {
    console.log('[SW] Activate event');
  }

  // Clean the caches
  event.waitUntil(
    global.caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete the caches that are not the current one.
            if (cacheName.indexOf(CACHE_NAME) === 0) {
              return null;
            }
            return global.caches.delete(cacheName);
          })
        );
      })
  );
});

self.addEventListener('message', (event) => {
  switch (event.data.action) {
  case 'skipWaiting':
    if (self.skipWaiting) {
      self.skipWaiting();
    }
    break;
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore not GET request.
  if (request.method !== 'GET') {
    if (DEBUG) {
      console.log(`[SW] Ignore non GET request ${request.method}`);
    }
    return;
  }

  const requestUrl = new URL(request.url);

  // Ignore difference origin.
  if (requestUrl.origin !== location.origin) {
    if (DEBUG) {
      console.log(`[SW] Ignore difference origin ${requestUrl.origin}`);
    }
    return;
  }

  const resource = global.caches.match(request)
  .then((response) => {
    if (response) {
      if (DEBUG) {
        console.log(`[SW] fetch URL ${requestUrl.href} from cache`);
      }

      return response;
    }

    // Load and cache known assets.
    return fetch(request)
      .then((responseNetwork) => {
        if (!responseNetwork || !responseNetwork.ok) {
          if (DEBUG) {
            console.log(`[SW] URL [${
              requestUrl.toString()}] wrong responseNetwork: ${responseNetwork.status} ${responseNetwork.type}`);
          }

          return responseNetwork;
        }

        if (DEBUG) {
          console.log(`[SW] URL ${requestUrl.href} fetched`);
        }

        const responseCache = responseNetwork.clone();

        global.caches
          .open(CACHE_NAME)
          .then((cache) => {
            return cache.put(request, responseCache);
          })
          .then(() => {
            if (DEBUG) {
              console.log(`[SW] Cache asset: ${requestUrl.href}`);
            }
          });

        return responseNetwork;
      })
      .catch(() => {
        // User is landing on our page.
        if (event.request.mode === 'navigate') {
          return global.caches.match('./');
        }

        return null;
      });
  });

  event.respondWith(resource);
});


self.addEventListener('push', (event) => {
  console.log('Received a push message', event);

  let title = 'New concert!';

  const options = {
    icon: '/assets/158x158.png',
    tag: 'new-concert-'+new Date(),
    actions: [
      {
        action: 'track',
        title: 'Track event'
      }
    ]
  };

  if (event.data) {
    console.log('push data', event.data.json());
    const info = event.data.json();

    title = 'New concert for ' + info.artist.name;

    options.body = 'At: ' + info.location;
    options.tag = info.id;
    options.icon = 'https://images.sk-static.com/images/media/profile_images/artists/' + info.artist.id + '/huge_avatar';
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('On notification event: ', event);
  console.log('On notification click: ', event.notification.tag);
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then((clientList) => {
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      if (client.url === '/event/'+event.notification.tag && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow('/event/'+event.notification.tag);
    }
  }));
});
