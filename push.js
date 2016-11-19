const webpush = require('web-push');
const url = require('url');

// VAPID keys should only be generated only once.
const vapidKeys = webpush.generateVAPIDKeys();

webpush.setVapidDetails(
  'mailto: hi@zaccolley.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);


// This is the same output of calling JSON.stringify on a PushSubscription
const subscriptions = [];

const events = [
  {
    id: 28189059,
    artist: {
      id: 8736834,
      name: 'PC Music'
    },
    location: 'Heaven, London, UK'
  },
  {
    id: 27923349,
    artist: {
      id: 2332370,
      name: 'Gold Panda'
    },
    location: 'Oval Space, London, UK'
  }
];

for (let i = 0; i < events.length; i++) {
  const event = events[i];

  for (let j = 0; j < subscriptions.length; j++) {
    const subscription = subscriptions[j];

    console.log('Send notif ('+j+')', new Date());
    webpush.sendNotification(subscription);
  }
}
