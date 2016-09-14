import { h, Component } from 'preact';
import { Router } from 'preact-router';
const qwest = require('qwest');
qwest.setDefaultOptions({ cache: true });

const username = 'zaccolley';
const apiKey = 'sqcuaFOxKzXLxuc7';
const concertsUri = `https://api.songkick.com/api/3.0/users/${username}/calendar.json?reason=attendance&apikey=${apiKey}`;
const plansUri = `https://api.songkick.com/api/3.0/users/${username}/events.json?apikey=${apiKey}`;

import Header from './header';
import Home from './home';
import Event from './event';

const loadData = (uri) => new Promise((resolve, reject) => {
  qwest.get(uri).then((xhr, data) => resolve(data));
});

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
    time: event.start.datetime,
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

    console.log('state', this.state);

    return (
      <div id="app">
        <Header />
        {loaded && (
        <Router onChange={this.handleRoute}>
          <Home path="/" events={events} />
          <Event path="/event/:id" events={events} />
        </Router>
        )}
      </div>
    );
  }
}
