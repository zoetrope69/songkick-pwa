import { h, Component } from 'preact';
import { Router } from 'preact-router';

import { events, artists, upcomingEvents } from './songkick';

import Header from './header';

import Events from './events';
import Event from './event';

import Artists from './artists';
import Artist from './artist';

import Settings from './settings';

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
    artists: [],
    events: [],
    upcomingEvents: [],
    currentUrl: window.location.pathname
  };

  fetchData() {
    const { username } = this.state;

    events(username)
      .then(events => this.setState({ events }))
      .catch(reason => console.error(reason));

    upcomingEvents(username)
      .then(upcomingEvents => this.setState({ upcomingEvents }))
      .catch(reason => console.error(reason));

    artists(username)
      .then(artists => this.setState({ artists }))
      .catch(reason => console.error(reason));
  }

  changeUsername(username) {
    this.setState({ username });

    this.fetchData();
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const { artists, currentUrl, events, upcomingEvents, username } = this.state;

    const Loading = (
      <div style={{ padding: '1em 0.75em' }}>
        <h1 style={{ fontSize: '3em', color: '#868686' }}>Loading...</h1>
      </div>
    );

    return (
      <div id="app">
        <Header currentUrl={currentUrl} hasHeaderImage={currentUrl.includes('event/') || currentUrl.includes('artist/')} />
        {events.length > 0 ? (
        <Router onChange={this.handleRoute}>
          <Events path="/" title="Plans" events={events} />
          <Events path="/upcoming" title="Upcoming" events={upcomingEvents} />
          <Event path="/event/:id" events={events} />
          <Artists path="/artists" artists={artists} />
          <Artist path="/artist/:id" artists={artists} />
          <Settings path="/settings" username={username} changeUsername={this.changeUsername.bind(this)} />
        </Router>
        ) : Loading}
      </div>
    );
  }
}
