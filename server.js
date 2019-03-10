require('dotenv').config();

if (!process.env.SERVER_IP) {
  console.error('❗ Failed to load in SERVER_IP. Is it missing from the `.env` file?');
  process.exit();
}

const { SERVER_IP, NODE_ENV, PORT } = process.env;
const IN_PRODUCTION = NODE_ENV === 'production';

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const { events } = require('./server/songkick');
const { searchDice } = require('./server/dice');

const app = express();

app.use(bodyParser.json());

if (!IN_PRODUCTION) {
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
const staticFileDirectory = IN_PRODUCTION ? 'build' : 'src';
app.use(express.static(path.join(__dirname, staticFileDirectory)));

// allow CORS
// TODO: do i need this if im on the same domain anyway?
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

if (IN_PRODUCTION) {
  // only allow from this ip address
  app.use((req, res, next) => {
    if (req.ip !== SERVER_IP) { // Wrong IP address
      res.status(401);
      return res.send('Permission denied. Wrong IP Address.');
    }
    next(); // correct IP address, continue middleware chain
  });
}

app.get('/api', (req, res, next) => {
  res.status(404).json({ error: 'Incorrect path. Did you mean /api/events or /api/dice?' });
});


app.get('/api/dice', (req, res) => {
  const { searchTerm } = req.query;

  if (!searchTerm) {
    return res.status(404).json({ error: 'No search term sent' });
  }

  return searchDice(searchTerm)
    .then(results => res.json(results))
    .catch(error => res.status(500).json({ error }));
});

app.get('/api/events', (req, res, next) => {
  const { username } = req.query;

  if (!username) {
    return res.status(404).json({ error: 'No username sent' });
  }

  return events(username)
    .then(events => res.json(events))
    .catch(error => res.status(500).json({ error }));
});

// Send everything else to react-router
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build/index.html'));
});

app.listen(PORT || 8000, (err) => {
  if (err) {
    return console.error(err);
  }

  console.info(`🌐  Listening at http://localhost:${PORT || 8000}/`);
  console.info(`${IN_PRODUCTION ? '🚀  Production' : '🛠  Development'} mode`);
});
