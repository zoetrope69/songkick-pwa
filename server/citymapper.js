require('dotenv').config();

if (!process.env.CITYMAPPER_API_KEY) {
  return console.error('❗ Failed to load in CITYMAPPER_API_KEY. Is it missing from the `.env` file?');
}

const fetch = require('node-fetch');

const { CITYMAPPER_API_KEY } = process.env;
const CITYMAPPER_API_ROOT = 'https://developer.citymapper.com/api/1';

function getTravelTime(lat, lon, event) {
  return new Promise((resolve, reject) => {
    const uri = `${CITYMAPPER_API_ROOT}/traveltime/?startcoord=${lat},${lon}&endcoord=${event.place.lat},${event.place.lon}&key=${CITYMAPPER_API_KEY}`;

    return fetch(uri)
      .then(response => response.json())
      .then(data => {
        if (data.error_message) {
          return reject(`Couldn't get Citymapper data: ${data.error_message}`);
        }

        return resolve(data.travel_time_minutes);
      })
      .catch(error => {
        return reject(`Couldn't get Citymapper data: ${error}`);
      });
  });
}

module.exports = {
  getTravelTime
};
