import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

import Badge from '../Badge';

export default class Events extends Component {
  render() {
    const { events } = this.props;

    let EventsList;

    if (events.length <= 0) {
      EventsList = [];
      const placeholderAmount = 10;
      for (let i = 0; i < placeholderAmount; i++) {
        EventsList.push(<li class={`${style.gig} ${style.gigPlaceholder}`}></li>);
      }
    } else {
      EventsList = events.map((event, i) => {
        const isFestival = !!event.title;
        const isLast = i === events.length - 1;
        const title = isFestival ? event.title : event.performances.map(performance =>
          <span class={style[performance.type]}>{performance.name}</span>
        );

        // check to see if similar repeat events
        const repeatEvent = (!isFestival && !isLast && (event.performances[0].name === events[i+1].performances[0].name));

        return (
          <li class={`${style.gig} ${repeatEvent ? style.gigRepeat : {}}`}>
          <Link href={`/event/${event.id}`}>
            <span class={style.gigImage} style={{ backgroundImage: `url(${event.image})`}}>
              <Badge event={event} rotate={true} />
            </span>
            <span class={style.gigDetails}>
              <time class={style.gigDate}
                    datetime={event.time.iso}
                    title={event.time.pretty.full}>
                {event.time.pretty.short}
              </time>
              <span class={style.gigName}>{title}</span>
              <span class={style.gigPlace}>{event.place.name}</span>
            </span>
          </Link>
          </li>
        );
      });
    }

    return (
      <div class={style.page}>
        <h1 class={style.title}>Events</h1>
        <ol class={style.gigs}>
          {EventsList}
        </ol>
      </div>
    );
  }
}
