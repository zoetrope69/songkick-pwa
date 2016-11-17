import { h, Component } from 'preact';
import style from './style';

export default class Track extends Component {
  state = {
    playing: false
  };

  sanitizeQuery(query) {
    query = query.toLowerCase(); // to lower case
    query = query.replace(/(dj set)/g, ''); // remove dj set info from name
    query = query.replace(/(official)/g, ''); // remove official info from name
    query = query.replace(/\./g, ''); // remove .s
    return query;
  }

  findArtist(query) {
    query = this.sanitizeQuery(query);
    const url = 'https://api.spotify.com/v1/search' +
                `?q=${query}` +
                '&type=artist' +
                '&limit=1';

                console.log(url);

    return new Promise((resolve, reject) => {
      return fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            return reject(data.error.message);
          }

          if (data.artists.total <= 0) {
            return reject(`Spotify found no artists with query: "${query}".`);
          }

          const items = data.artists.items;

          const item = items.find(item => item.name.toLowerCase() === query);

          if (!item) {
            return reject(`No artist called "${query}".`);
          }

          return resolve(item.id);
        })
        .catch(reject);
    });
  }

  getTopTrack(id) {
    const url = `https://api.spotify.com/v1/artists/${id}/top-tracks` +
                '?country=GB' +
                '&limit=1';

    return fetch(url).then(response => response.json());
  }

  getTopTrackInfo(data) {
    return new Promise((resolve, reject) => {
      const { name } = this.props;
        if (data.error) {
          return reject(data.error.message);
        }

      // return nothing if no data sent to template
      if (data.tracks.length <= 0) {
        reject('No tracks for this artist');
      }

      const tracks = data.tracks;

      let track = tracks.find(track => track.artists[0].name.toLowerCase() === name.toLowerCase());

      if (!track) {
        track = tracks[0];
      }

      if (track.album.images.length > 0) {
        track.image = track.album.images[1].url;
      }

      resolve(track);
    });
  }

  getMusic() {
    const { name } = this.props;

    this.findArtist(name)
      .then(this.getTopTrack)
      .then(this.getTopTrackInfo.bind(this))
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
      audio.addEventListener('paused', this.pauseAudio);
      audio.addEventListener('ended', this.stopAudio);

      this.setState({ audio });
    }

    if (playing) {
      this.pauseAudio();
    } else {
      this.playAudio();
    }
  }

  render() {
    const { track, playing } = this.state;

    if (!track || !track.artists || track.artists.length <= 0) {
      return false;
    }

    const trackArtists = track.artists.map(artist => artist.name).join(', ');

    return (
      <div class={style.track}>
        <div class={`${style.cover} ${playing ? style.coverPlaying : ''}`}
             style={{ backgroundImage: `url(${track ? track.image : ''})` }}
             onClick={this.handleClick.bind(this)}
             />
         <a class={style.info} href={track ? track.external_urls.spotify : '#'} target="_blank">
           <span>{track && track.name}</span>
           <span>{track && trackArtists}</span>
           <span>{track && track.album.name}</span>
         </a>
      </div>
		);
  }
}
