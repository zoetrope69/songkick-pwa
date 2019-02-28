const fetch = require('node-fetch');

const uriPrefix = 'https://dice.fm/_data/search/events;query=';

const loadData = (options) => new Promise((resolve, reject) => {
  const {
    query
  } = options;

  if (!query) {
    return reject('No query');
  }

  return fetch(`${uriPrefix}${query}`)
    .then(response => response.json())
    .then(data => {
      if (!data || data.length <= 0) {
        return reject('No results');
      }

      return resolve(data);
    })
    .catch(reject);
});

function searchDice(query) {
  return loadData({
    query
  });
}

module.exports = {
  searchDice
};