import 'whatwg-fetch'
const loadData = (uri) => new Promise((resolve, reject) => {
  if (!uri) {
    return reject('No uri');
  }

  return fetch(uri)
    .then(response => response.json())
    .then(data => {
      if (data.length <= 0) {
        return reject('No results');
      }

      return resolve(data);
    })
    .catch(reject);
});

export function getEvents(username) {
  return loadData(`/api/events?username=${username}`);
}

export function getArtists(username) {
  return loadData(`/api/artists?username=${username}`);
}
