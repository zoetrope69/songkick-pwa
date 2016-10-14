import moment from 'moment';
import fetchJsonp from 'fetch-jsonp';

const uriPrefix = 'https://api.songkick.com/api/3.0/users';
const apiKey = 'sqcuaFOxKzXLxuc7';

const loadData = (options) => new Promise((resolve, reject) => {
  if (!options.uri) {
    return reject('No uri');
  }

  const uri = options.uri;
  const page = options.page || 1;

  fetchJsonp(`${uri}&page=${page}`, { jsonpCallback: 'jsoncallback' })
    .then(response => response.json())
    .then(data => {
      if (!data.resultsPage || data.resultsPage.totalEntries <= 0) {
        return reject('No results');
      }

      const pageAmount = Math.ceil(data.resultsPage.totalEntries / data.resultsPage.perPage);

      if (data.resultsPage.page !== pageAmount) {
        loadData({ uri, page: page + 1 })
          .then(newData => {
            if (typeof data.resultsPage.results.artist !== 'undefined') {
              data.resultsPage.results.artist = data.resultsPage.results.artist.concat(newData.resultsPage.results.artist);
            }

            if (typeof data.resultsPage.results.calendarEntry !== 'undefined') {
              data.resultsPage.results.calendarEntry = data.resultsPage.results.calendarEntry.concat(newData.resultsPage.results.calendarEntry);
            }

            return resolve(data);
          })
          .catch(reject);
      } else {
        return resolve(data);
      }
    })
    .catch(reject);
});

const getResults = (data) => new Promise((resolve, reject) => {
  resolve(data.resultsPage.results);
});

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

const getArtists = (data) => new Promise((resolve, reject) => {
  if (data.artist.length <= 0) {
    return reject('No artists');
  }

  const artists = data.artist.map(artist => {
    artist.name = artist.displayName;
    artist.image = getImage(artist);
    return artist;
  });

  resolve(artists);
});

const getImage = (data) => {
  const IMAGE_PREFIX = 'https://images.sk-static.com/images/media/profile_images';

  if (typeof data.onTourUntil !== 'undefined') {
    return `${IMAGE_PREFIX}/artists/${data.id}/huge_avatar`;
  }

  if (data.type === 'Festival') {
    return `${IMAGE_PREFIX}/events/${data.id}/huge_avatar`;
  }

  if (data.performance.length > 0) {
    return `${IMAGE_PREFIX}/artists/${data.performance[0].artist.id}/huge_avatar`;
  }

  return '';
};

const processPerformances = (performances) => {
  return performances.map(performance => {
    return {
      id: performance.artist.id,
      type: performance.billing,
      name: performance.artist.displayName
    };
  });
};

const processEvents = (events) => events.map(event => {
  const date = `${event.start.date} ${event.start.time}`;
  const newEvent = {
    id: event.id,
    reason: event.reason,
    type: event.type.toLowerCase(),
    performances: processPerformances(event.performance),
    time: {
      iso: date,
      pretty: {
        short: date ? moment(date).format('ddd D MMM') : 'Date TBC',
        full:  date ? moment(date).format('dddd Do MMMM YYYY') : 'Date to be confirmed',
        doors: date ? moment(date).format('h:mm a') : 'Doors to be confirmed'
      }
    },
    place: {
      name: `${event.venue.displayName}, ${event.location.city}`,
      id: event.venue.id,
      uri: event.venue.uri,
      lat: event.venue.lat,
      lon: event.venue.lng
    },
    image: getImage(event),
    uri: event.uri
  };

  if (newEvent.type === 'festival') {
    newEvent.title = event.displayName;
  }

  return newEvent;
});

export function artists(username) {
  const uri = `${uriPrefix}/${username}/artists/tracked.json?apikey=${apiKey}`;
  return loadData({ uri }).then(getResults).then(getArtists);
}

export function events(username) {
  const uri = `${uriPrefix}/${username}/calendar.json?apikey=${apiKey}&reason=attendance`;
  return loadData({ uri }).then(getResults).then(getEvents).then(processEvents);
}

export function upcomingEvents(username) {
  const uri = `${uriPrefix}/${username}/calendar.json?apikey=${apiKey}&reason=tracked_artist`;
  return loadData({ uri }).then(getResults).then(getEvents).then(processEvents);
}
