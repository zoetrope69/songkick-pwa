import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

import Track from '../Track';
import Icon from '../Icon';
import Badge from '../Badge';

export default class Event extends Component {
  componentDidUpdate() {
    const { lat, lon, covered } = this.state;
    const { events, id } = this.props;
    const event = events.find(event => event.id === +id);

    this.constructCityMapperUri();

    if (!lat && !lon && (typeof covered === 'undefined') && event) {
      this.getLocation().then(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        this.setState({ lat, lon });

        this.isAreaCovered();
      });
    }
  }

  getLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, error => {
        console.error('Couldnt get user location');
        if (error.code.TIMEOUT) {
          console.error("The user didn't accept the callout");
          reject();
        }
      });
    });
  }

  constructCityMapperUri() {
    const { events, id } = this.props;
    const event = events.find(event => event.id === +id);
    const { lat, lon } = this.state;

    if (!lat || !lon || !event) {
      return;
    }

    let citymapperUri = `https://citymapper.com/directions?endcoord=${event.place.lat},${event.place.lon}&endname=${event.place.name}&endaddress=${event.place.name},${event.place.city},${event.place.country}`;

    if (lat && lon) {
      citymapperUri += `&startcoord=${lat},${lon}`;
    }

    // if event has a valid time
    if (event.time.iso) {
      citymapperUri += `&arriveby=${event.time.iso}`;
    }

    this.setState({ citymapperUri });
  }

  travelTime(covered) {
    const { events, id } = this.props;
    const event = events.find(event => event.id === +id);

    const { lat, lon } = this.state;
    console.log('ttt');

    const uri = `https://developer.citymapper.com/api/1/traveltime/?startcoord=${lat},${lon}&endcoord=${event.place.lat},${event.place.lon}&key=5f92d4bdcd86ce36bebefdbe596b5d65`;
    console.log(uri);

    const data = {
      travel_time_minutes: 41
    };

    this.setState({ travelTime: data.travel_time_minutes });
  }

  isAreaCovered() {
    const { lat, lon } = this.state;

    const citymapperApiKey = '5f92d4bdcd86ce36bebefdbe596b5d65';
    const uri = `https://developer.citymapper.com/api/1/singlepointcoverage/?coord=${lat},${lon}&key=${citymapperApiKey}`;
    // console.log(uri);

    // fetch(uri).then(console.log);
    const data = {
      points: [{
        covered: true,
        coord: [ 51.5602477, -0.09887]
      }]
    };
    const covered = data.points[0].covered;
    console.log('covered', covered);
    this.travelTime(covered);
  }

  render() {
    const { events, id } = this.props;
    const { citymapperUri, travelTime } = this.state;

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
          <p><small>{event.place.city}, {event.place.country}</small></p>
          <a class={style.button} href={citymapperUri ? citymapperUri : ''} target="_blank">
            Get directions here… {travelTime ? <small>(~{travelTime} mins)</small> : ''}
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
