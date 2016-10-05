import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Home extends Component {
  render() {

    const { events } = this.props;

    return (
      <div class={style.home}>
        <h1>Plans</h1>
        <p>These are your plans.</p>

        <ol class={style.gigs}>
          {events.map(event => {
            const title = event.performances.map(performance => {
              if (performance.type === 'headline') {
                return performance.name;
              }

              return (
                <small>{performance.name}</small>
              );
            });

            return(
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
                <span class={style.gigImage} style={{ backgroundImage: `url(${event.image})`}} />
              </Link>
              </li>
            );

          })}
        </ol>
      </div>
    );
  }
}
