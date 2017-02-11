import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

import Track from '../Track';
import Icon from '../Icon';
import Badge from '../Badge';

export default class Event extends Component {
  render() {
    const { events, id } = this.props;

    const event = events.find(event => event.id === +id);

    let EventItem;
    let title;

    if (event) {
      title = event.title ? event.title : event.performances.map(performance => (
        <Link class={style[performance.type]} href={`/artist/${performance.id}`} >
          {performance.name}
        </Link>
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
          <a class={style.button} href={event.uri} target="_blank">Buy tickets!</a>
        </section>

        <section>
          <h4><Icon name="pin" /> Venue & Directions</h4>
          <p>{event.place.name}</p>
          <a class={style.button} href={`http://maps.google.com/?q=${event.place.name}`} target="_blank">
          Get directions here…
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
                <Link href={`/artist/${performance.id}`}>
                  <img src={performance.image.src} style={performance.image.color ? {backgroundColor: performance.image.color} : {}} alt={`Image of ${performance.name}`} />
                  <span class={performance.type === 'headline' ? style.headliner : {}}>{performance.name}</span>
                </Link>
                <Track name={performance.name} />
              </li>
            ))}
          </ol>
        </section>
      </div>
      );
    }

    return (
      <div>
        <div class={style.animateIn}>
          <div class={style.headerImage}>
            {event && (
              <img
                src={event.image.src}
                style={event.image.color ? {backgroundColor: event.image.color} : {}}
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
