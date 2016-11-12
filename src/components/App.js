import { h, Component } from 'preact';
import { Router } from 'preact-router';

import { events as getEvents, upcomingEvents as getUpcomingEvents, artists as getArtists } from './songkick';

import localforage from 'localforage';

import Header from './Header';

import Events from './Events';
import Event from './Event';

import Artists from './Artists';
import Artist from './Artist';

import Login from './Login';

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
    loggedIn: false,
    username: null,
    events: [],
    upcomingEvents: [],
    artists: [],
    currentUrl: window.location.pathname,
    syncing: false,
    synced: false,
    loaded: false
  };

  fetchData(username) {
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
            this.setState({ events, syncing: false, synced: true });
          })
          .catch(error => {
            this.setState({ error, syncing: false, synced: false });
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

    this.clearData();

    localforage.setItem('username', username);
    this.setState({ username });

    this.fetchData(username);
  }

  logout() {
    this.clearData();
    this.setState({ loggedIn: false });
    localforage.setItem('loggedIn', false);
  }

  login() {
    this.setState({ loggedIn: true });
    localforage.setItem('loggedIn', true);
  }

  clearData() {
    localforage.setItem('loggedIn', false);
    localforage.setItem('username', '');
    localforage.setItem('events', []);
    localforage.setItem('upcomingEvents', []);
    localforage.setItem('artists', []);
    this.setState({ username: '', events: [], upcomingEvents: [], artists: [] });
  }

  componentDidMount() {
    localforage.getItem('username').then(username => {
      this.setState({ username });
      this.fetchData(username);

      localforage.getItem('loggedIn').then(loggedIn => {
        this.setState({ loggedIn, loaded: true });
        this.fetchData(loggedIn);
      });
    });
  }

  render() {
    const { loaded, synced, error, artists, currentUrl, events, upcomingEvents, username, loggedIn } = this.state;

    if (!loaded) {
      return (
        <div style={{width:'100%', height:'100%', background: '#f2f2f2', padding: '0.25em', fontSize: '3em', fontWeight: 800}}>Loading...</div>
      );
    }

    const allEvents = events.concat(upcomingEvents);

    const routes = loggedIn ? (
      <div>
        <Header currentUrl={currentUrl} hasHeaderImage={currentUrl.includes('event/') || currentUrl.includes('artist/')} />
        <Router onChange={this.handleRoute}>
          <Events path="/" title="Plans" events={events} default />
          <Events path="/upcoming" title="Upcoming" events={upcomingEvents} />
          <Event path="/event/:id" events={allEvents} />
          <Artists path="/artists" artists={artists} />
          <Artist path="/artist/:id" artists={artists} />
        </Router>
      </div>
    ) : (
      <Router onChange={this.handleRoute}>
        <Login path="/"
          login={this.login.bind(this)}
          synced={synced}
          events={allEvents}
          error={error}
          username={username}
          changeUsername={this.changeUsername.bind(this)}
          default />
      </Router>
    );

    return (
      <div id="app">
        {routes}
      </div>
    );
  }
}
