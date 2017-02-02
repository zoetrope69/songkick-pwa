import { h, Component } from 'preact';
import { Router, route } from 'preact-router';

import {
  getEvents,
  getArtists
} from '../lib/songkick';

import localforage from 'localforage';

import Header from './Header';
import Nav from './Nav';
import Alert from './Alert';

import Events from './Events';
import Event from './Event';

import Artists from './Artists';
import Artist from './Artist';

import Settings from './Settings';

import Login from './Login';

const initialState = {
  events: [],
  artists: [],
  loggedIn: false,
  synced: false,
  syncing: false,
  username: ''
};

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
    ...initialState,
    currentUrl: window.location.pathname,
    loading: true,
    error: ''
  };

  fetchData(username) {
    if (!username) {
      return false;
    }

    const loadEvents = localforage.getItem('events').then(events => {
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
    });

    const loadArtists = localforage.getItem('artists').then(artists => {
      // if theres any artists cached then set that as the state
      if (artists) {
        this.setState({ artists });
      }

      // now sync back up
      return getArtists(username)
        .then(artists => {
          localforage.setItem('artists', artists);
          this.setState({ artists });
        });
    });

    this.setState({ syncing: true, synced: false });

    Promise.all([loadEvents, loadArtists]).then(values => {
      this.setState({ syncing: false, synced: true });
    }).catch(error => {
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
    route('/');
  }

  login(username) {
    this.changeUsername(username);
    this.setState({ loggedIn: true });
    localforage.setItem('loggedIn', true);
  }

  clearData() {
    localforage.clear();
    this.setState({ ...initialState });
  }

  componentWillMount() {
    localforage.getItem('username').then(username => {
      this.setState({ username });
      this.fetchData(username);

      localforage.getItem('loggedIn').then(loggedIn => {
        this.setState({ loggedIn, loading: false });
      });
    });
  }

  render() {
    const {
      artists,
      currentUrl,
      error,
      events,
      loading,
      loggedIn,
      synced,
      syncing,
      username
    } = this.state;

    let routes;

    if (!loading) {
      if (loggedIn) {
        routes = (
          <Router onChange={this.handleRoute}>
            <Events path="/" events={events} default />
            <Event path="/event/:id" events={events} />
            <Artists path="/artists" artists={artists} />
            <Artist path="/artist/:id" artists={artists} />
            <Settings path="/settings" title={username} logout={this.logout.bind(this)} />
          </Router>
        );
      } else {
        routes = (
          <Router onChange={this.handleRoute}>
            <Login path="/"
              login={this.login.bind(this)}
              changeUsername={this.changeUsername.bind(this)}
              default />
          </Router>
        );
      }
    }

    return (
      <div id="app" class={loggedIn ? 'logged--in' : 'logged--out'}>
        {loggedIn && (
        <div>
          <Header currentUrl={currentUrl} loggedIn={loggedIn} username={username} />
          <aside>
            <Nav currentUrl={currentUrl} loggedIn={loggedIn}  />
            <Alert error={error} loading={loading} synced={synced} syncing={syncing} />
          </aside>
        </div>
        )}
        <main>
          {routes}
        </main>
      </div>
    );
  }
}
