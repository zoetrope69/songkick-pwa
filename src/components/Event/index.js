import { h, Component } from 'preact';
import style from './style';

import Track from '../Track';
import Icon from '../Icon';
import Badge from '../Badge';

export default class Event extends Component {

  state = {
    shareButtonVisible: false
  }

  componentWillMount() {
    this.constructDiceUri();
    this.isShareAvailable();
  }

  constructDiceUri() {
    const { events, id } = this.props;
    const event = events.find(event => event.id === +id);

    if (!event.performances[0].name || !event.place.name) {
      return;
    }

    fetch(`/api/dice?searchTerm=${event.performances[0].name} ${event.place.name}`)
      .then(response => response.json())
      .then(data => {
        if (data.length === 0) {
          return;
        }

        const diceUriPart = data[0].perm_name;

        if (!diceUriPart) {
          return;
        }

        const diceUri = `https://dice.fm/event/${diceUriPart}`;

        this.setState({ diceUri });
      });
  }

  formatDate(date) {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  }

  getDates(event) {
    const HOURS = 3;
    const start =  new Date(event.time.iso);
    const end = new Date(start);
    end.setHours(end.getHours() + HOURS);

    return {
      start: this.formatDate(start),
      end: this.formatDate(end)
    };
  }

  googleCalendar() {
    const { events, id } = this.props;
    const event = events.find(event => event.id === +id);

    const title = event.title ? event.title : event.performances[0].name;

    const dates = this.getDates(event);

    const href = encodeURI([
      'https://www.google.com/calendar/render',
      '?action=TEMPLATE',
      `&text=🎶 ${title} @ ${event.place.name}`,
      `&dates=${dates.start}/${dates.end}`,
      `&details=${event.uri}`,
      `&location=${event.place.address}`,
      '&sprop=&sprop=name:'
    ].join(''));

    return href;
  }

  isShareAvailable() {
    if ('share' in navigator) {
      this.setState({ shareButtonVisible: true });
    }
  }

  handleShare() {
    const { events, id } = this.props;
    const event = events.find(event => event.id === +id);

    const title = event.title ? event.title : event.performances[0].name;

    navigator.share({
      title,
      text: `🎶 Check out: ${title} @ ${event.place.name}.`,
      url: event.uri
    })
      .then(() => console.log('Successful share'))
      .catch(error => console.log('Error sharing:', error));
  }

  render() {
    const { events, id, spotifyAccessCode } = this.props;
    const { diceUri, shareButtonVisible } = this.state;

    const event = events.find(event => event.id === +id);

    let EventItem;
    let title;

    if (event) {
      title = event.title ? event.title : event.performances.map(performance => (
        <a rel="noopener" class={style[performance.type]} href={`https://www.songkick.com/artists/${performance.id}`} >
          {performance.name}
        </a>
      ));

      EventItem = (
        <div>
          <Badge event={event} />

          <time class={style.date} datetime={event.time.iso}>
            {event.time.pretty.full}
          </time>

          <h1 class={style.title}>{title}</h1>
          <h3 class={style.place}>{event.place.name}</h3>

          <section>
            <h4><Icon name="shoppingCart" /> Tickets</h4>
            <a rel="noopener" class={`${style.button} ${style.buttonSongkick}`} href={event.uri} target="_blank">
            Songkick
            </a>
            {diceUri && (
              <a rel="noopener" rel="noreferrer" class={`${style.button} ${style.buttonDice}`} href={diceUri} target="_blank">
            Dice
              </a>
            )}
          </section>

          <section>
            <h4><Icon name="pin" /> Venue & Directions</h4>
            <p>{event.place.name}</p>
            {event.place.city && (<p><small>{event.place.city}</small></p>)}
            {event.place.country && (<p><small>{event.place.country}</small></p>)}
            <a
              rel="noopener" rel="noreferrer"
              class={`${style.button} ${style.buttonGoogle}`}
              href={`http://maps.google.com/?q=${event.place.name}`}
              target="_blank">
            Google Maps
            </a>
          </section>

          <section>
            <h4><Icon name="clock" /> Doors Open</h4>
            <p>{event.time.pretty.doors}</p>
          </section>

          <section>
            <h4><Icon name="musicNote" /> Lineup</h4>
            <ol>
              {event.performances.map(performance => (
                <li class={style.artist}>
                  <a href={`https://www.songkick.com/artists/${performance.id}`}>
                    <img src={performance.image} alt={`Image of ${performance.name}`} />
                    <span class={performance.type === 'headline' ? style.headliner : {}}>{performance.name}</span>
                  </a>
                  {spotifyAccessCode && (
                    <Track name={performance.name} spotifyAccessCode={spotifyAccessCode} />
                  )}
                </li>
              ))}
            </ol>
          </section>
        </div>
      );
    }

    return (
      <div>
        <div class={style.animateIn} style={{ overflow: 'hidden' }}>
          <div class={style.headerImage}>
            <div class={style.headerButtons}>
              <a rel="noopener" rel="noreferrer" href={this.googleCalendar()} target="_blank">
                <Icon name="calendar" />
              </a>
              {shareButtonVisible && (
                <button onClick={this.handleShare.bind(this)}>
                  <Icon name="share" />
                </button>
              )}
            </div>
            {event && (
              <img
                src={event.image}
                alt="Image for event" />
            )}
          </div>
        </div>
        <div class={`${style.animateIn} ${style.animateInUp}`}>
          <div class={`${style.page} ${style.panel}`}>
            {EventItem}
          </div>
        </div>
      </div>
    );
  }
}
