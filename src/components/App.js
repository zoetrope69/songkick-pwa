import { h, Component } from 'preact';
import { Router } from 'preact-router';

import { events, artists, upcomingEvents } from './songkick';

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

    const allEvents = events.concat(upcomingEvents);

    return (
      <div id="app">
        <Header currentUrl={currentUrl} hasHeaderImage={currentUrl.includes('event/') || currentUrl.includes('artist/')} />
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
