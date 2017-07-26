require('dotenv').config();

if (!process.env.SONGKICK_API_KEY || !process.env.SERVER_IP || !process.env.FCM_API_KEY ||
    !process.env.VAPID_EMAIL || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY ||
    !process.env.NOTIFICATION_RATE) {
  return console.error('❗ Failed to load in the environment variables. Are they missing from the `.env` file?');
}

const inDevelopment = process.env.NODE_ENV !== 'production';

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');
const webPush = require('web-push');
const getColors = require('get-image-colors');

const low = require('lowdb');
const db = low('data/db.json');

function uniqueArray(array) {
  return [...new Set(array)];
}

function shuffleArray(array) {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// set some defaults if database file is empty
db.defaults({ users: [], colors: [] }).write();

// wipe users in development
if (inDevelopment) {
  db.set('users', []).write();
}

webPush.setGCMAPIKey(process.env.FCM_API_KEY);
webPush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const getColor = (buffer) => new Promise(resolve => {
  getColors(buffer, 'image/jpeg')
    .then(colors => colors[0]._rgb)
    .then(color => {
      resolve(`rgb(${color.slice(0, -1).join(',')})`);
    })
    .catch(error => {
      // console.error(error);
      resolve(false);
    });
});

const handleColors = (id, imageUrl) => {
  // check if we already have the colour
  const colorsItem = db.get('colors').find({ id }).value();
  if (colorsItem) {
    return colorsItem.color;
  }

  // get color for next time
  fetch(imageUrl.replace('large_avatar', 'medium_avatar'))
    .then(response => response.buffer())
    .then(getColor)
    .then(color => {
      // add new color to database file
      db.get('colors').push({ id, color }).write();
    });

  return false;
};

const uriPrefix = 'https://api.songkick.com/api/3.0/users';

const apiKey = process.env.SONGKICK_API_KEY;

const app = express();

const jsonParser = bodyParser.json();

if (inDevelopment) {
  const webpack = require('webpack');
  const devMiddleware = require('webpack-dev-middleware');
  const hotMiddleware = require('webpack-hot-middleware');
  const config = require('./webpack.config');

  const compiler = webpack(config);

  app.use(devMiddleware(compiler, {
    publicPath: config.output.publicPath,
    historyApiFallback: true
  }));

  app.use(hotMiddleware(compiler));
}

// Static files
app.use(express.static(inDevelopment ? 'src' : 'build'));

const loadData = (options) => new Promise((resolve, reject) => {
  if (!options.uri) {
    return reject('No uri');
  }

  const uri = options.uri;
  const page = options.page || 1;
  const maxPageAmount = 3;

  return fetch(`${uri}&page=${page}`)
    .then(response => response.json())
    .then(data => {
      if (!data.resultsPage || data.resultsPage.totalEntries <= 0) {
        return reject('No results');
      }

      let pageAmount = Math.ceil(data.resultsPage.totalEntries / data.resultsPage.perPage);

      // dont download the entire world
      if (pageAmount > maxPageAmount) {
        pageAmount = maxPageAmount;
      }

      if (data.resultsPage.page !== pageAmount) {
        return loadData({ uri, page: page + 1 })
          .then(newData => {
            if (typeof data.resultsPage.results.artist !== 'undefined') {
              data.resultsPage.results.artist = data.resultsPage.results.artist.concat(newData.resultsPage.results.artist);
            }

            if (typeof data.resultsPage.results.calendarEntry !== 'undefined') {
              data.resultsPage.results.calendarEntry = data.resultsPage.results.calendarEntry.concat(newData.resultsPage.results.calendarEntry);
            }

            return resolve(data);
          });
      }

      return resolve(data);
    })
    .catch(reject);
});

const getResults = (data) => data.resultsPage.results;

const getEvents = (data) => new Promise((resolve, reject) => {
  if (data.calendarEntry.length <= 0) {
    return reject('No events');
  }

  const events = data.calendarEntry.map(entry => {
    const event = entry.event;
    event.reason = entry.reason;
    return event;
  });

  resolve(events);
});

const getImage = (data) => {
  const IMAGE_PREFIX = 'https://images.sk-static.com/images/media/profile_images';

  if (typeof data.billing !== 'undefined' ) {
    return `${IMAGE_PREFIX}/artists/${data.artist.id}/large_avatar`;
  }

  if (data.type === 'Festival') {
    return `${IMAGE_PREFIX}/events/${data.id}/large_avatar`;
  }

  return '';
};

const processPerformances = (performances) => {
  return performances.map(performance => {
    const imageSrc = getImage(performance);
    const imageColor = handleColors(performance.artist.id, imageSrc);

    return {
      id: performance.artist.id,
      type: performance.billing,
      name: performance.artist.displayName,
      image: {
        color: imageColor,
        src: imageSrc
      }
    };
  });
};

function getOrdinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function formatDate(date, type) {
  date = date.trim(); // trim whitespace

  // if we only have the year add some time
  if (date.length === 10) {
    date += ' 00:00:00';
  }

  // replace - with /
  date = date.replace(/-/g, "/");

  // convert strings to date objects
  date = new Date(date);

  const monthNames = [
    'January', 'February', 'March',
    'April', 'May', 'June', 'July',
    'August', 'September', 'October',
    'November', 'December'
  ];

  let amPm = 'AM';
  let minutes = date.getMinutes();

  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  let hours = date.getHours();

  if (hours >= 12) {
    hours -= 12;
    amPm = 'PM';
  }

  const dateString = date.toDateString();
  const dayName = dateString.split(' ')[0];
  const day = date.getDate();
  const dayWithOrdinal = `${day}${getOrdinal(day)}`;
  const monthIndex = date.getMonth();
  const month = monthNames[monthIndex];
  const year = date.getFullYear();

  if (type === 'long') {
    return `${dayName} ${dayWithOrdinal} ${month} ${year}`;
  } else if ( type === 'short') {
    return `${dayName} ${dayWithOrdinal} ${month.substr(0, 3)} `;
  } else if ( type === 'time') {
    return `${hours}:${minutes} ${amPm}`;
  }

  return dateString;
}

const processEvents = (events) => events.map(event => {
  const date = `${event.start.date} ${event.start.time || ''}`;
  const imageSrc = getImage(event);
  const imageColor = handleColors(event.id, imageSrc);
  const newEvent = {
    id: event.id,
    reason: event.reason,
    type: event.type.toLowerCase(),
    performances: processPerformances(event.performance),
    time: {
      iso: date,
      pretty: {
        short: date ? formatDate(date, 'short') : 'Date TBC',
        full:  date ? formatDate(date, 'long') : 'Date to be confirmed',
        doors: date ? formatDate(date, 'time') : 'Doors to be confirmed'
      }
    },
    place: {
      name: event.venue.displayName,
      address: `${event.venue.displayName}, ${event.location.city}`,
      id: event.venue.id,
      uri: event.venue.uri,
      lat: event.venue.lat,
      lon: event.venue.lng
    },
    image: {
      color: imageColor,
      src: imageSrc
    },
    uri: event.uri
  };

  if (event.status === 'cancelled') {
    newEvent.cancelled = true;
  }

  if (newEvent.type === 'festival') {
    newEvent.title = event.displayName;
  }

  return newEvent;
});

function sortUniqueResults(arr) {
  if (arr.length === 0) {
    return arr;
  }

  // sort by id for removing duplicates
  arr = arr.sort((a, b) => {
    return a.id - b.id;
  });

  const newArr = [arr[0]];

  for (let i = 1; i < arr.length; i++) { // start loop at 1 as element 0 can never be a duplicate
    if (arr[i - 1].id !== arr[i].id) {
      newArr.push(arr[i]);
    }
  }

  arr = newArr;

  // sort by date
  arr = arr.sort((a, b) => {
    return new Date(a.start.date) - new Date(b.start.date);
  });

  return arr;
}

function events(username) {
  return new Promise((resolve, reject) => {
    let uri = `${uriPrefix}/${username}/calendar.json?apikey=${apiKey}&reason=attendance`;
    const events = loadData({ uri }).then(getResults).then(getEvents);

    uri = `${uriPrefix}/${username}/calendar.json?apikey=${apiKey}&reason=tracked_artist`;
    const upcomingEvents = loadData({ uri }).then(getResults).then(getEvents);

    Promise.all([upcomingEvents, events]).then(results => {
      results = [].concat(...results);
      results = sortUniqueResults(results);

      resolve(processEvents(results));
    }).catch(reject);
  });
}

// allow CORS
// TODO: do i need this if im on the same domain anyway?
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

if (process.env.NODE_ENV === 'production') {
  // only allow from this ip address
  app.use((req, res, next) => {
    if (req.ip !== process.env.SERVER_IP) { // Wrong IP address
      res.status(401);
      return res.send('Permission denied');
    }
    next(); // correct IP address, continue middleware chain
  });
}

app.get('/api', (req, res, next) => {
  res.status(404).json({ error: 'No username' });
});

const citymapperApiUrl = 'https://developer.citymapper.com/api/1'

app.post('/api/citymapper', jsonParser, (req, res, next) => {
  const { lat, lon, event } = req.body;

  if (!lat || !lon || !event) {
    return res.status(500).json({ error: "Didn't send the correct params to /api/citymapper" });
  }

  const uri = `${citymapperApiUrl}/traveltime/?startcoord=${lat},${lon}&endcoord=${event.place.lat},${event.place.lon}&key=${process.env.CITYMAPPER_API_KEY}`;

  return fetch(uri)
    .then(response => response.json())
    .then(data => {
      return res.json({ travelTime: data.travel_time_minutes });
    })
    .catch(error => {
      console.error(error);
      return res.status(500).json({ error: `Couldn't get Citymapper data: ${error}` });
    });
});

app.get('/api/events', (req, res, next) => {
  const { username } = req.query;
  if (!username) {
    return res.status(404).json({ error: 'No username sent' });
  }

  events(username)
    .then(events => res.json(events))
    .catch(error => res.status(500).json({ error }));
});

function pollForNewEvents() {
  // every for different events every (process.env.NOTIFICATION_RATE)
  setInterval(() => {
    const users = db.get('users').value();

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const { eventIds, username, subscriptions } = user;

      events(username)
        .then(events => {
          // find any events that aren't already cached
          // also discount anything thats been tracked as you don't need to be notified
          const newEvents = events.filter(event => !eventIds.includes(event.id))
                                  .filter(event => !event.reason.attendance)
                                  .filter(event => event.type !== 'Festival');


          console.info(`${newEvents.length} events for "${username}"`);

          // group events if there is more than 3
          if (newEvents.length > 5) {
            sendGroupEventsPushNotification(subscriptions, newEvents);
          } else {
            // send push notifs for each new event
            // pretty spammy, we should join these
            for (let i = 0; i < newEvents.length; i++) {
              const newEvent = newEvents[i];
              sendEventPushNotification(subscriptions, newEvent);
            }
          }

          // update event ids
          const newEventIds = events.map(event => event.id);
          db.get('users').find({ username }).assign({ eventIds: newEventIds }).write();
        })
        .catch(console.error);
    }
  }, process.env.NOTIFICATION_RATE);
}

function sendGroupEventsPushNotification(subscriptions, events) {
  if (!events) {
    return console.error('No events');
  }

  const artistNames = shuffleArray(uniqueArray(events.map(event => event.performances[0].name)));

  let artistNameString = '';

  const MAX_ARTIST_NAME_LENGTH = 8;
  if (artistNames.length > MAX_ARTIST_NAME_LENGTH) {
    artistNameString += artistNames.slice(0, MAX_ARTIST_NAME_LENGTH).join(', ');
    artistNameString += ' & more...';
  } else {
    artistNameString += artistNames.join(', ');
  }

  const data = {
    title: `🔥 ${events.length} new events!`,
    body: artistNameString,
    icon: 'https://songkick.pink/assets/icon/badge.png',
    badge: 'https://songkick.pink/assets/icon/badge.png',
    actions: [
      { action: 'plans', title: '📅 See your plans' }
    ],
    data: {
      uri: 'https://songkick.com'
    },
    requireInteraction: true
  };

  sendPushNotification(subscriptions, data);
}

function sendEventPushNotification(subscriptions, event) {
  if (!event) {
    return console.error('No event');
  }

  const icons = ['🎵','🎶','🎤'];
  const randomIcon = icons[Math.floor(Math.random() * icons.length)];

  const data = {
    title: `${randomIcon} ${event.performances[0].name}`,
    body: `📍 ${event.place.name}\n🗓️ ${event.time.pretty.short}`,
    icon: event.image.src || 'https://songkick.pink/assets/icon/badge.png',
    badge: 'https://songkick.pink/assets/icon/badge.png',
    actions: [
      { action: 'track', title: '🔖 Track' },
      { action: 'buy_tickets', title: '🎫 Get tickets' }
    ],
    data: {
      uri: event.uri
    },
    requireInteraction: true
  };

  sendPushNotification(subscriptions, data);
}

function sendInitPushNotification(subscription) {
  const data = {
    title: '👍 Push notifications enabled',
    body: "You'll recieve push notifications for new events",
    icon: 'https://songkick.pink/assets/icon/badge.png',
    badge: 'https://songkick.pink/assets/icon/badge.png'
  };

  sendPushNotification([subscription], data);
}

function sendPushNotification(subscriptions, data) {
  if (!subscriptions || !data) {
    return console.error('No subscriptions or no data');
  }

  for (let i = 0; i < subscriptions.length; i++) {
    const subscription = subscriptions[i];
    webPush.sendNotification(subscription, JSON.stringify(data)).catch(console.error);
  }
}

app.post('/api/pushSubscription', jsonParser, (req, res) => {
  const { subscription, username } = req.body;

  const user = db.get('users').find({ username });
  const userData = user.value();

  // if no user
  if (!userData) {
    // add subscription with latest event ids
    events(username)
      .then(events => {
        const eventIds = events.map(event => event.id);
        const subscriptions = [subscription];
        db.get('users').push({ username, eventIds, subscriptions }).write();
        sendInitPushNotification(subscription);
      })
      .catch(console.error);

    return res.sendStatus(201);
  }

  // check if already subscribed
  const subscriptions = userData.subscriptions;
  const userSubscription = subscriptions.find(s => s.endpoint === subscription.endpoint);

  if (!userSubscription) {
    // add new subscription
    subscriptions.push(subscription);
    user.assign({ subscriptions }).write();
    sendInitPushNotification(subscription);
  }

  res.sendStatus(201);
});

app.delete('/api/pushSubscription', jsonParser, (req, res) => {
  const { subscription, username } = req.body;

  const user = db.get('users').find({ username });
  const userData = user.value();

  // if no user
  if (!userData) {
    return res.sendStatus(404);
  }

  let subscriptions = userData.subscriptions;
  const userSubscriptionIndex = subscriptions.findIndex(s => s.endpoint === subscription.endpoint);

  if (userSubscriptionIndex === -1) {
    return res.sendStatus(404);
  }

  // remove subscription from array
  subscriptions = subscriptions.splice(userSubscriptionIndex, 1);
  user.assign({ subscriptions }).write();

  // A real world application would store the subscription info.
  // we'd stick this data into subscriptions
  res.sendStatus(201);
});

// Send everything else to react-router
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.listen(process.env.PORT || 8000, (err) => {
  if (err) {
    return console.error(err);
  }

  console.info(`🌐 Listening at http://localhost:${process.env.PORT || 8000}/`);
  console.info(`${inDevelopment ? '🛠 Development' : '🚀 Production'} mode   `);

  pollForNewEvents();
  console.info('Polling for new events');
});
