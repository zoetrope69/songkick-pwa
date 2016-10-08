import { h, Component } from 'preact';
import { Router } from 'preact-router';
import moment from 'moment';
import fetchJsonp from 'fetch-jsonp';

const apiKey = 'sqcuaFOxKzXLxuc7';

import Header from './header';
import Events from './events';
import Event from './event';
import Settings from './settings';

const loadData = (uri) => fetchJsonp(uri, { jsonpCallback: 'jsoncallback' }).then(response => response.json());

const getEvents = (data) => new Promise((resolve, reject) => {
  if (!data.resultsPage || data.resultsPage.totalEntries <= 0) {
    return reject('No events');
  }

  const events = data.resultsPage.results.calendarEntry.map(entry => {
    const event = entry.event;
    event.reason = entry.reason;
    return event;
  });

  resolve(events);
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
  const newEvent = {
    id: event.id,
    reason: event.reason,
    type: event.type.toLowerCase(),
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

  if (newEvent.type === 'festival') {
    newEvent.title = event.displayName;
  }

  return newEvent;
});

export default class App extends Component {
  /** Gets fired when the route changes.
   *  @param {Object} event    "change" event from [preact-router](http://git.io/preact-router)
   *  @param {string} event.url  The newly routed URL
   */
  handleRoute = e => {
    window.scrollTo(0, 0); // scroll to the top
    
    this.currentUrl = e.url;
    this.setState({ currentUrl: e.url });
  };

  state = {
    username: 'zaccolley',
    events: [],
    currentUrl: window.location.pathname
  };

  changeUsername(username) {
    this.setState({ username });
    this.getEvents();
  }

  getEvents() {
    const concertsUri = `https://api.songkick.com/api/3.0/users/${this.state.username}/calendar.json?reason=tracked_artist&apikey=${apiKey}`;

    loadData(concertsUri)
      .then(getEvents)
      .then(processEvents)
      .then(events => this.setState({ events }))
      .catch(reason => console.error(reason));
  }

  componentDidMount() {
    this.getEvents();
  }

  render() {
    const { events, username, currentUrl } = this.state;

    return (
      <div id="app">
        <Header hasHeaderImage={currentUrl.includes('event/')} />
        {events.length > 0 ? (
        <Router onChange={this.handleRoute}>
          <Events path="/" title="Plans" events={events.filter(event => event.reason.attendance)} />
          <Events path="/upcoming" title="Upcoming" events={events.filter(event => !event.reason.attendance)} />
          <Event path="/event/:id" events={events} />
          <Settings path="/settings" username={username} changeUsername={this.changeUsername.bind(this)} />
        </Router>
        ) : (
          <div style={{ padding: '1em 0.75em' }}>
            <h1 style={{ fontSize: '3em', color: '#868686' }}>Loading...</h1>
          </div>
        )}
      </div>
    );
  }
}
