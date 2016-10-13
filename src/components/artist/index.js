import { h, Component } from 'preact';
import style from './style';

export default class Artist extends Component {
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
    const { artists, id } = this.props;

    const artist = artists.find(artist => artist.id === +id);
    const name = artist.name;

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
    const { artists, id } = this.props;
    const { track, playing, audio } = this.state;

    const artist = artists.find(artist => artist.id === +id);

    const trackLoaded = track && track.artists && track.artists.length;

    const trackArtists = trackLoaded ? track.artists.map(artist => artist.name).join(', ') : '';

    return (
      <div>
        <div class={style.image}>
          <img src={artist.image} alt={`Image of ${artist.name}`} />
        </div>
        <div class={style.panel}>
          <h1 class={style.title}>{artist.name}</h1>

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
