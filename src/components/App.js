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
    username: 'zaccolley',
    events: [],
    upcomingEvents: [],
    artists: [],
    syncing: false,
    synced: false,
    error: '',
    currentUrl: window.location.pathname
  };

  fetchData() {
    const { username } = this.state;

    // events

    localforage.getItem('events')
      .then(events => {
        // if theres any events cached then set that as the state
        if (events) {
          this.setState({ events });
        }

        this.setState({ syncing: true });

        // now sync back up
        getEvents(username)
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

    // localforage.getItem('upcomingEvents')
    //   .then(upcomingEvents => {
    //     // if theres any upcomingEvents cached then set that as the state
    //     if (upcomingEvents) {
    //       this.setState({ upcomingEvents });
    //     }
    //
    //     this.setState({ syncing: true });
    //
    //     // now sync back up
    //     getUpcomingEvents(username)
    //       .then(upcomingEvents => {
    //         localforage.setItem('upcomingEvents', upcomingEvents);
    //         this.setState({ upcomingEvents, syncing: false, synced: true });
    //       })
    //       .catch(error => {
    //         this.setState({ error, syncing: false, synced: false });
    //       });
    //
    //   })
    //   .catch(reason => console.error(reason));
    //
    //   // artists
    //
    // localforage.getItem('artists')
    //   .then(artists => {
    //     // if theres any artists cached then set that as the state
    //     if (artists) {
    //       this.setState({ artists });
    //     }
    //
    //     this.setState({ syncing: true });
    //
    //     // now sync back up
    //     getArtists(username)
    //       .then(artists => {
    //         localforage.setItem('artists', artists);
    //         this.setState({ artists, syncing: false, synced: true });
    //       })
    //       .catch(error => {
    //         this.setState({ error, syncing: false, synced: false });
    //       });
    //
    //   })
    //   .catch(reason => console.error(reason));
  }

  changeUsername(username) {
    this.setState({ username });

    this.fetchData();
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const { artists, currentUrl, events, upcomingEvents, username, syncing, synced, error } = this.state;

    const allEvents = events.concat(upcomingEvents);

    return (
      <div id="app">
        <Header currentUrl={currentUrl}
                syncing={syncing}
                synced={synced}
                error={error}
                hasHeaderImage={currentUrl.includes('event/') || currentUrl.includes('artist/')} />
        <Router onChange={this.handleRoute}>
          <Events path="/" title="Plans" events={events} />
          <Events path="/upcoming" title="Upcoming" events={upcomingEvents} />
          <Event path="/event/:id" events={allEvents} />
          <Artists path="/artists" artists={artists} />
          <Artist path="/artist/:id" artists={artists} />
          <Settings path="/settings" username={username} changeUsername={this.changeUsername.bind(this)} />
        </Router>
      </div>
    );
  }
}
