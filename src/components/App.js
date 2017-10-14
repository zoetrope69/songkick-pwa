import { h, Component } from 'preact';
import { Router, route } from 'preact-router';

import { getEvents } from '../lib/songkick';

import localforage from 'localforage';

import Header from './Header';
import Alert from './Alert';

import Events from './Events';
import Event from './Event';

import Settings from './Settings';

import Login from './Login';

const initialState = {
  events: [],
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


  authenticateSpotify(location) {
    // if we're calling back from spotify grab the access code, store it for later and redirect
    const accessTokenString = '#access_token=';
    if (!location.hash.includes(accessTokenString)) {
      return;
    }

    const spotifyAccessCode = location.hash.split('&')[0].substr(accessTokenString.length);
    localforage.setItem('spotifyAccessCode', spotifyAccessCode);

    this.setState({ spotifyAccessCode });
  }

  fetchData(username) {
    if (!username) {
      return false;
    }

    this.setState({ syncing: true, synced: false });

    localforage.getItem('spotifyAccessCode').then(spotifyAccessCode => {
      if (!spotifyAccessCode) {
        return;
      }

      return this.setState({ spotifyAccessCode });
    });

    localforage.getItem('events').then(events => {
      // if theres any events cached then set that as the state
      if (events) {
        this.setState({ events });
      }

      // now sync back up
      return getEvents(username)
        .then(events => {
          localforage.setItem('events', events);
          this.setState({ events });
          this.setState({ syncing: false, synced: true });
        });
    }).catch(error => {
      console.error(error);
      this.setState({ error, syncing: false, synced: false });
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
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }

  componentDidMount() {
    this.authenticateSpotify(window.location);
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
      currentUrl,
      error,
      events,
      loading,
      loggedIn,
      synced,
      syncing,
      username,
      spotifyAccessCode
    } = this.state;

    const {
      registration
    } = this.props;

    let routes;

    if (!loading) {
      if (loggedIn) {
        routes = (
          <Router onChange={this.handleRoute}>
            <Events
              path="/"
              events={events}
              default />
            <Event
              path="/event/:id"
              events={events}
              spotifyAccessCode={spotifyAccessCode} />
            <Settings
              path="/settings"
              username={username}
              registration={registration}
              spotifyAccessCode={spotifyAccessCode}
              logout={this.logout.bind(this)} />
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
            <Alert error={error} loading={loading} synced={synced} syncing={syncing} />
          </div>
        )}
        <main>
          {routes}
        </main>
      </div>
    );
  }
}
