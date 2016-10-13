import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Events extends Component {
  render() {

    const { events, title } = this.props;

    return (
      <div class={style.page}>
        <h1>{title ? title : 'Events'}</h1>

        <ol class={style.gigs}>
          {events.map(event => {
            const title = event.title ? event.title : event.performances.map(performance =>
              <span class={style[performance.type]}>{performance.name}</span>
            );

            return (
              <li class={style.gig}>
              <Link href={`/event/${event.id}`}>
                <span class={style.gigDetails}>
                  <time class={style.gigDate}
                        datetime={event.time.iso}
                        title={event.time.pretty.full}>
                    {event.time.pretty.short}
                  </time>
                  <span class={style.gigName}>{title}</span>
                  <span class={style.gigPlace}>{event.place.name}</span>
                </span>
                <span class={style.gigImage} style={{ backgroundImage: `url(${event.image})`}}>
                  {event.reason.attendance && event.reason.attendance === 'im_going' && (
                    <span class={style.attendance}>✔ Im going</span>
                  )}
                  {event.type && event.type === 'festival' && (
                    <span class={style.festival}>Festival</span>
                  )}
                </span>
              </Link>
              </li>
            );

          })}
        </ol>
      </div>
    );
  }
}
