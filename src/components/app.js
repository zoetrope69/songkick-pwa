import { h, Component } from 'preact';
import { Router } from 'preact-router';
import moment from 'moment';
import fetchJsonp from 'fetch-jsonp';

const apiKey = 'sqcuaFOxKzXLxuc7';

import Header from './header';
import Home from './home';
import Settings from './settings';
import Event from './event';

const loadData = (uri) => fetchJsonp(uri, { jsonpCallback: 'jsoncallback' }).then(response => response.json());

const getEvents = (data, type) => new Promise((resolve, reject) => {
  if (!data.resultsPage || data.resultsPage.totalEntries <= 0) {
    return reject('No events');
  }

  if (type === 'concerts') {
    return resolve(data.resultsPage.results.calendarEntry.map(entry => entry.event));
  }

  resolve(data.resultsPage.results.event);
});

const getImage = (event) => {
  const IMAGE_PREFIX = 'https://images.sk-static.com/images/media/profile_images';

  if (event.type === 'Festival') {
    return `${IMAGE_PREFIX}/events/${event.id}/huge_avatar`;
  }

  return `${IMAGE_PREFIX}/artists/${event.performance[0].artist.id}/huge_avatar`;
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
  return {
    id: event.id,
    performances: processPerformances(event.performance),
    time: {
      iso: event.start.datetime,
      pretty: {
        short: event.start.datetime ? moment(event.start.datetime).format('ddd D MMM') : 'Date TBC',
        full:  event.start.datetime ? moment(event.start.datetime).format('dddd Do MMMM YYYY') : 'Date to be confirmed',
        doors: event.start.datetime ? moment(event.start.datetime).format('h:mm a') : 'Doors to be confirmed'
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
});

export default class App extends Component {
  /** Gets fired when the route changes.
   *  @param {Object} event    "change" event from [preact-router](http://git.io/preact-router)
   *  @param {string} event.url  The newly routed URL
   */
  handleRoute = e => {
    this.currentUrl = e.url;
  };

  state = {
    username: 'zaccolley',
    events: []
  };

  changeUsername(username) {
    this.setState({ username });
    this.getEvents();
  }

  getEvents() {
    const concertsUri = `https://api.songkick.com/api/3.0/users/${this.state.username}/calendar.json?reason=attendance&apikey=${apiKey}`;
    const plansUri = `https://api.songkick.com/api/3.0/users/${this.state.username}/events.json?apikey=${apiKey}`;

    loadData(plansUri)
      .then(data => getEvents(data, 'plans'))
      .then(processEvents)
      .then(events => this.setState({ events }))
      .catch(reason => console.error(reason));
  }

  componentDidMount() {
    this.getEvents();
  }

  render() {
    const { events, username } = this.state;

    return (
      <div id="app">
        <Header />
        {events.length > 0 ? (
        <Router onChange={this.handleRoute}>
          <Home path="/" events={events} />
          <Settings path="/settings" username={username} changeUsername={this.changeUsername.bind(this)} />
          <Event path="/event/:id" events={events} />
        </Router>
        ) : (
          <div style={{ padding: '1em 0.75em' }}>
            <h1>Loading...</h1>
          </div>
        )}
      </div>
    );
  }
}
