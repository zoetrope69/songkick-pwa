import { h, Component } from 'preact';
import { Router } from 'preact-router';

import { events as getEvents, upcomingEvents as getUpcomingEvents, artists as getArtists } from './songkick';

import localforage from 'localforage';

import Header from './Header';

import Events from './Events';
import Event from './Event';

import Artists from './Artists';
import Artist from './Artist';

import Settings from './Settings';

export default class App extends Component {
  /** Gets fired when the route changes.
   *  @param {Object} event    "change" event from [preact-router](http://git.io/preact-router)
   *  @param {string} event.url  The newly routed URL
   */
  handleRoute = e => {
    window.scrollTo(0, 0); // scroll to the top

    const nextUrl = e.url;

    this.setState({ currentUrl: nextUrl });
  };

  state = {
    username: null,
    events: [],
    upcomingEvents: [],
    artists: [],
    currentUrl: window.location.pathname
  };

  fetchData() {
    const { username } = this.state;

    if (!username) {
      return false;
    }

    // events

    localforage.getItem('events')
      .then(events => {
        // if theres any events cached then set that as the state
        if (events) {
          this.setState({ events });
        }

        // now sync back up
        return getEvents(username)
          .then(events => {
            localforage.setItem('events', events);
            this.setState({ events });
          });
      })
      .catch(reason => console.error(reason));

      // upcomingEvents

    localforage.getItem('upcomingEvents')
      .then(upcomingEvents => {
        // if theres any upcomingEvents cached then set that as the state
        if (upcomingEvents) {
          this.setState({ upcomingEvents });
        }

        this.setState({ syncing: true });

        // now sync back up
        getUpcomingEvents(username)
          .then(upcomingEvents => {
            localforage.setItem('upcomingEvents', upcomingEvents);
            this.setState({ upcomingEvents, syncing: false, synced: true });
          })
          .catch(error => {
            this.setState({ error, syncing: false, synced: false });
          });

      })
      .catch(reason => console.error(reason));

      // artists

    localforage.getItem('artists')
      .then(artists => {
        // if theres any artists cached then set that as the state
        if (artists) {
          this.setState({ artists });
        }

        this.setState({ syncing: true });

        // now sync back up
        getArtists(username)
          .then(artists => {
            localforage.setItem('artists', artists);
            this.setState({ artists, syncing: false, synced: true });
          })
          .catch(error => {
            this.setState({ error, syncing: false, synced: false });
          });

      })
      .catch(reason => console.error(reason));
  }

  changeUsername(username) {
    if (username === this.state.username) {
      return false;
    }

    localforage.setItem('username', username);

    localforage.setItem('events', []);
    localforage.setItem('upcomingEvents', []);
    localforage.setItem('artists', []);
    this.setState({ username, events: [], upcomingEvents: [], artists: [] });
    this.fetchData();
  }

  componentWillMount() {
    localforage.getItem('username').then(username => this.setState({ username }));
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const { artists, currentUrl, events, upcomingEvents, username } = this.state;

    const allEvents = events.concat(upcomingEvents);

    return (
      <div id="app">
        <Header currentUrl={currentUrl} hasHeaderImage={currentUrl.includes('event/') || currentUrl.includes('artist/')} />
        <Router onChange={this.handleRoute}>
          <Events path="/" title="Plans" events={events} default />
          <Events path="/upcoming" title="Upcoming" events={upcomingEvents} />
          <Event path="/event/:id" events={allEvents} />
          <Artist path="/artist/:id" artists={artists} />
          <Settings path="/settings" username={username} changeUsername={this.changeUsername.bind(this)} />
        </Router>
      </div>
    );
  }
}
