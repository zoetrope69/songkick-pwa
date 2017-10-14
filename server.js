require('dotenv').config();

if (!process.env.SERVER_IP || !process.env.CITYMAPPER_API_KEY) {
  return console.error('❗ Failed to load in the environment variables. Are they missing from the `.env` file?');
}

const inDevelopment = process.env.NODE_ENV !== 'production';

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const { events } = require('./songkick');

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
const staticFileDirectory = inDevelopment ? 'src' : 'build';
app.use(express.static(path.join(__dirname, staticFileDirectory)));

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

const citymapperApiUrl = 'https://developer.citymapper.com/api/1';

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

  console.info(`🌐  Listening at http://localhost:${process.env.PORT || 8000}/`);
  console.info(`${inDevelopment ? '🛠  Development' : '🚀  Production'} mode   `);
});
