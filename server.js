require('dotenv').config();

if (!process.env.SONGKICK_API_KEY || !process.env.SERVER_IP) {
  return console.error('❗ Failed to load in the environment variables. Are they missing from the `.env` file?');
}

const inDevelopment = process.env.NODE_ENV !== 'production';

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');
const getColors = require('get-image-colors');

const low = require('lowdb');
const db = low('data/db.json');

// set some defaults if database file is empty
db.defaults({ colors: [] }).write();

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

  if (data.performance && data.performance.length > 0) {
    return `${IMAGE_PREFIX}/artists/${data.performance[0].artist.id}/large_avatar`;
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
  res.status(404).json({ error: 'Incorrect path. Did you mean /api/events' });
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
});
