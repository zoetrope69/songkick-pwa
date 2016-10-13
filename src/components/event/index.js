import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Event extends Component {
  state = {
    playing: false
  };

  findArtist(query) {
    const url = new URL('https://api.spotify.com/v1/search');
    url.searchParams.append('q', query);
    url.searchParams.append('type', 'artist');
    url.searchParams.append('limit', '1');

    return new Promise((resolve, reject) => {
      return fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.artists.total <= 0) {
            reject(`Spotify found no artist called "${query}".`);
          }

          const items = data.artists.items;
          const id = items[0].id;
          resolve(id);
        })
        .catch(reject);
    });
  }

  getTopTrack(id) {
    const url = new URL(`https://api.spotify.com/v1/artists/${id}/top-tracks`);
    url.searchParams.append('country', 'GB');
    url.searchParams.append('limit', '1');

    return fetch(url).then(response => response.json());
  }

  getTopTrackInfo(data) {
    return new Promise((resolve, reject) => {
      // return nothing if no data sent to template
      if (data.tracks.length <= 0) {
        reject('No tracks for this artist');
      }

      const tracks = data.tracks;
      const track = tracks[0];
      if (track.album.images.length > 0) {
        track.image = track.album.images[1].url;
      }

      resolve(track);
    });
  }

  getMusic() {
    const { events, id } = this.props;

    const event = events.find(event => event.id === +id);
    const name = event.performances[0].name;

    this.findArtist(name)
      .then(this.getTopTrack)
      .then(this.getTopTrackInfo)
      .then(track => this.setState({ track }));
  }

	// gets called when this route is navigated to
  componentDidMount() {
    this.getMusic();
  }

	// gets called just before navigating away from the route
  componentWillUnmount() {
    if (this.state.audio) {
      this.stopAudio();
    }
  }

  playAudio () {
    this.state.audio.play();
    this.setState({ playing: true });
  }

  pauseAudio () {
    this.state.audio.pause();
    this.setState({ playing: false });
  }

  stopAudio () {
    this.state.audio.pause();
    this.setState({ playing: false, audio: null });
  }

  handleClick() {
    const { playing, track } = this.state;
    let { audio } = this.state;

    if (!track) {
      return false;
    }

    if (!audio) {
      audio = new Audio(track.preview_url);
      audio.addEventListener('ended', () => this.setState({ playing: false }));

      this.setState({ audio });
    }

    if (playing) {
      this.pauseAudio();
    } else {
      this.playAudio();
    }
  }

  render() {
    const { events, id } = this.props;
    const { track, playing, audio } = this.state;

    const event = events.find(event => event.id === +id);

    const title = event.title ? event.title : event.performances.map(performance => (
      <Link class={style[performance.type]} href={`/artist/${performance.id}`} >
        {performance.name}
      </Link>
    ));

    const trackLoaded = track && track.artists && track.artists.length;

    const trackArtists = trackLoaded ? track.artists.map(artist => artist.name).join(', ') : '';

    return (
      <div>
        <div class={style.image}>
          <img src={event.image} alt={`Image of ${title}`} />
        </div>
        <div class={style.panel}>
          <time class={style.date} datetime={event.time.iso}>
            {event.time.pretty.full}
          </time>
          {event.reason.attendance && event.reason.attendance === 'im_going' && (
            <span class={style.attendance}>✔ Im going</span>
          )}

          {event.type && event.type === 'festival' && (
            <span class={style.festival}>Festival</span>
          )}

          <h1 class={style.title}>{title}</h1>
          <h3 class={style.place}>{event.place.name}</h3>

          <h4>Tickets</h4>

          <a class={style.hyperlink} href={event.uri} target="_blank">Buy tickets!</a>

          <h4>Venue & Directions</h4>

          <p>{event.place.name}</p>

          <a class={style.hyperlink} href={`https://www.google.com/maps?saddr=My+Location&daddr=${event.place.name}`} target="_blank">
            Get directions here…
          </a>

          <h4>Doors Open</h4>

          <p>{event.time.pretty.doors}</p>

          <h4>Lineup</h4>

          {event && event.performances && (
            <ol>
              {event.performances.map(performance => (
                <li>{performance.name} {performance.type === 'headline' && <small>Headliner</small>}</li>
              ))}
            </ol>
          )}

          {track && track.image && (
          <div>
            <h4>Music</h4>

            <div class={style.track}>
              <div class={`${style.cover} ${playing ? style.coverPlaying : ''}`}
                   style={{ backgroundImage: `url(${track ? track.image : ''})` }}
                   onClick={this.handleClick.bind(this)}
                   />
               <a class={style.trackInfo} href={track ? track.external_urls.spotify : '#'} target="_blank">
                 <span>{track && track.name}</span>
                 <span>{track && trackArtists}</span>
                 <span>{track && track.album.name}</span>
               </a>
            </div>
          </div>
          )}
        </div>
      </div>
		);
  }
}
