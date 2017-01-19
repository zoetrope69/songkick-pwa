import { h, Component } from 'preact';
import { Router } from 'preact-router';

import { events as getEvents, upcomingEvents as getUpcomingEvents, artists as getArtists } from './songkick';

import localforage from 'localforage';

import Header from './Header';
import Alert from './Alert';

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
    artists: [],
    currentUrl: window.location.pathname,
    error: '',
    events: [],
    loading: false,
    loggedIn: false,
    synced: false,
    syncing: false,
    upcomingEvents: [],
    username: ''
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

        this.setState({ syncing: true, synced: false });

        // now sync back up
        return getEvents(username)
          .then(events => {
            localforage.setItem('events', events);
            this.setState({ events, syncing: false, synced: true });
          });
      })
      .catch(error => {
        this.setState({ error, syncing: false, synced: false });
      });

    // upcomingEvents

    localforage.getItem('upcomingEvents')
      .then(upcomingEvents => {
        // if theres any upcomingEvents cached then set that as the state
        if (upcomingEvents) {
          this.setState({ upcomingEvents });
        }

        this.setState({ syncing: true, synced: false });

        // now sync back up
        return getUpcomingEvents(username)
          .then(upcomingEvents => {
            localforage.setItem('upcomingEvents', upcomingEvents);
            this.setState({ upcomingEvents, syncing: false, synced: true });
          });
      })
      .catch(error => {
        this.setState({ error, syncing: false, synced: false });
        console.error(error);
      });

    // artists

    localforage.getItem('artists')
      .then(artists => {
        // if theres any artists cached then set that as the state
        if (artists) {
          this.setState({ artists });
        }

        this.setState({ syncing: true, synced: false });

        // now sync back up
        return getArtists(username)
          .then(artists => {
            localforage.setItem('artists', artists);
            this.setState({ artists, syncing: false, synced: true });
          });
      })
      .catch(error => {
        this.setState({ error, syncing: false, synced: false });
        console.error(error);
      });
  }

  changeUsername(username) {
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

  login(username) {
    this.changeUsername(username);
    this.setState({ loggedIn: true });
    localforage.setItem('loggedIn', true);
  }

  clearData() {
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
        this.setState({ loggedIn, loading: false });
      });
    });
  }

  render() {
    const { loading, synced, syncing, error, artists, currentUrl,
            events, upcomingEvents, username, loggedIn } = this.state;

    const allEvents = events.concat(upcomingEvents);

    let routes = (
      <Router onChange={this.handleRoute}>
        <Login path="/"
          login={this.login.bind(this)}
          changeUsername={this.changeUsername.bind(this)}
          default />
      </Router>
    );

    if (loggedIn) {
      routes = (
        <Router onChange={this.handleRoute}>
          <Events path="/" title="Plans" events={events} default />
          <Events path="/upcoming" title="Upcoming" events={upcomingEvents} />
          <Event path="/event/:id" events={allEvents} />
          <Artists path="/artists" artists={artists} />
          <Artist path="/artist/:id" artists={artists} />
        </Router>
      );
    }

    if (loading) {
      routes = <div></div>;
    }

    return (
      <div id="app">
        <Header currentUrl={currentUrl} loggedIn={loggedIn} />
        {routes}
        <Alert error={error} loading={loading} synced={synced} syncing={syncing} />
      </div>
    );
  }
}
