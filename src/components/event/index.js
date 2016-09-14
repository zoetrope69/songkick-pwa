import { h, Component } from 'preact';
import style from './style';
const qwest = require('qwest');
qwest.setDefaultOptions({ cache: true });

export default class Event extends Component {
  state = {
    playing: false,
    album: {},
    audio: null
  };

  searchSpotify(query) {
    const url = new URL('https://api.spotify.com/v1/search');
    url.searchParams.append('q', query);
    url.searchParams.append('type', 'album');

    return new Promise(resolve =>
      qwest.get(url).then((xhr, data) => resolve(data))
    );
  }

  getAlbumInfo(data) {
    // return nothing if no data sent to template
    if (typeof data.albums === 'undefined' || data.albums.items.length <= 0) {
      return false;
    }

    const items = data.albums.items;
    const item = items[0];
    if (item.images.length > 0) {
      item.image = item.images[0].url;
    }

    return item;
  }

	// gets called when this route is navigated to
  componentDidMount() {
    const { events, id } = this.props;

    const event = events.find(event => event.id === +id);
    const name = event.performances[0].name;

    this.searchSpotify(name).then(this.getAlbumInfo).then(album => this.setState({ album }));
  }

	// gets called just before navigating away from the route
  componentWillUnmount() {}

  handleClick() {
    const { playing, album, audio } = this.state;

    if (!album) {
      return false;
    }

    if (!audio) {
      return qwest.get(`https://api.spotify.com/v1/albums/${album.id}`)
        .then((xhr, data) => {
          const audio = new Audio(data.tracks.items[0].preview_url);

          audio.play();
          this.setState({ playing: true, audio });

          audio.addEventListener('ended', () => this.setState({ playing: false }));
        });
    }

    if (playing) {
      audio.pause();
      this.setState({ playing: false });
    } else {
      audio.play();
      this.setState({ playing: true });
    }
  }

  render() {
    const { events, id } = this.props;
    const { album, playing, audio } = this.state;

    const event = events.find(event => event.id === +id);

    const title = event.performances.map(performance => {
      if (performance.type === 'headline') {
        return performance.name;
      }

      return (
        <small>{performance.name}</small>
      );
    });

    const albumLoaded = (album.images && album.images.length > 0);

    console.log(album.images);

    return (
      <div>
        <div class={style.image} style={{ backgroundImage: `url(${event.image})` }}>
        {albumLoaded && (
          <div class={`${style.cover} ${playing ? style.coverPlaying : ''}`}
               style={{
                 backgroundImage: `url(${album.images[2].url})`
               }}
               onClick={this.handleClick.bind(this)} />
        )}
        </div>
        <div class={style.panel}>
          <h1 class={style.title}>{title}</h1>
          <h2 class={style.place}>{event.place.name}</h2>
        </div>
      </div>
		);
  }
}
