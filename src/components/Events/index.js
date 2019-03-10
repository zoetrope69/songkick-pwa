import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

import Badge from '../Badge';

const PlaceholderEventsList = ({ className }) => {
  return (
    <ol class={className}>
      {Array.from({ length: 10 }, () => (
        <li class={`${style.gig} ${style.gigPlaceholder}`}></li>
      ))}
    </ol>
  );
};

const EventsList = ({ className, events, filtered }) => {
  return (
    <ol class={className}>
      {events
        .filter((event, i) => {
          const dateNow = new Date();
          const eventDateInFourHours = new Date(event.time.iso);
          eventDateInFourHours.setHours(eventDateInFourHours.getHours() + 4);
          const dateHasntPassed = eventDateInFourHours >= dateNow;
          return dateHasntPassed;
        })
        .map((event, i) => {
          const isFestival = !!event.title;
          const isLast = i === events.length - 1;
          const title = isFestival ? event.title : event.performances.map(performance =>
            <span class={style[performance.type]}>{performance.name}</span>
          );

          // check to see if similar repeat events
          const repeatEvent = (!isFestival && !isLast && (event.performances[0].name === events[i + 1].performances[0].name));

          const imageStyle = {};

          if (event.image.color) {
            imageStyle.backgroundColor = event.image.color;
          }

          if (event.image.src) {
            imageStyle.backgroundImage = `url(${event.image.src})`;
          }

          return (
            <li class={`${style.gig} ${repeatEvent ? style.gigRepeat : ''}`}>
              <Link href={`/event/${event.id}`}>
                <span class={style.gigImage} style={imageStyle} />
                <span class={style.gigDetails}>
                  {!filtered && <Badge event={event} small={true} />}
                  <span class={style.gigName}>{title}</span>
                  <time class={style.gigDate}
                    datetime={event.time.iso}
                    title={event.time.pretty.full}>
                    {event.time.pretty.short}
                  </time>
                  <span class={style.gigPlace}>{event.place.name}</span>
                </span>
              </Link>
            </li>
          );
        })}
    </ol>
  );
};

export default class Events extends Component {
  constructor() {
    super();

    this.handleClick = this.handleClick.bind(this);
  }

  state = {
    areEventsFiltered: true
  }

  handleClick() {
    this.setState({ areEventsFiltered: !this.state.areEventsFiltered });
  }

  render() {
    const { events } = this.props;

    const filtered = this.state.areEventsFiltered;
    const filteredEvents = !filtered ? events : events.filter(event => {
      return event.reason.attendance === 'im_going';
    });

    const noEvents = filteredEvents.length === 0;
    const listClassName = `${style.gigs} ${style.animateIn} ${style.animateInZoomUp}`;

    return (
      <div class={style.page}>
        <div class={style.animateIn}>
          <h1 class={style.title}>Events</h1>
        </div>

        {noEvents ? (
          <PlaceholderEventsList className={listClassName} />
        ) : (
          <EventsList
            className={listClassName}
            events={filteredEvents}
            filtered={filtered}
          />
        )}

        <button class={style.button} onClick={this.handleClick}>
          {filtered ? 'Show other events' : 'Hide other events'}
        </button>
      </div>
    );
  }
}
