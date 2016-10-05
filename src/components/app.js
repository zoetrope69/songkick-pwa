import { h, Component } from 'preact';
import { Router } from 'preact-router';
import moment from 'moment';
import fetchJsonp from 'fetch-jsonp';

const username = 'zaccolley';
const apiKey = 'sqcuaFOxKzXLxuc7';
const concertsUri = `https://api.songkick.com/api/3.0/users/${username}/calendar.json?reason=attendance&apikey=${apiKey}`;
const plansUri = `https://api.songkick.com/api/3.0/users/${username}/events.json?apikey=${apiKey}`;

import Header from './header';
import Home from './home';
import Event from './event';

const loadData = (uri) => fetchJsonp(uri, { jsonpCallback: 'jsoncallback' }).then(response => response.json());

const getEvents = (data, type) => {
  if (type === 'concerts') {
    return data.resultsPage.results.calendarEntry.map(entry => entry.event);
  }

  return data.resultsPage.results.event;
};

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
        doors: event.start.datetime ? moment(event.start.datetime).format('h:mm:ss a') : 'Doors to be confirmed'
      }
    },
    place: {
      name: `${event.venue.displayName}, ${event.location.city}`,
      id: event.venue.id,
      uri: event.venue.uri,
      lat: event.venue.lat,
      lon: event.venue.lng
    },
    image: getImage(event)
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
    events: []
  };

  componentDidMount() {
    loadData(plansUri)
      .then(data => getEvents(data, 'plans'))
      .then(processEvents)
      .then(events => this.setState({ events }));
  }

  render() {
    const { events } = this.state;
    const loaded = !!events.length;

    return (
      <div id="app">
        <Header />
        {loaded ? (
          <Router onChange={this.handleRoute}>
            <Home path="/" events={events} />
            <Event path="/event/:id" events={events} />
          </Router>
        ) : (
          <div style={{ padding: '1em 0.5em', minHeight: '100%', width: '100%' }}>
            <h1>Loading</h1>
          </div>
        )}
      </div>
    );
  }
}
