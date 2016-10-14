import { h, Component } from 'preact';
import style from './style';

import Track from '../Track';

export default class Artist extends Component {
  render() {
    const { artists, id } = this.props;
    const { track, playing, audio } = this.state;

    const artist = artists.find(artist => artist.id === +id);

    let ArtistItem;

    if (artist) {
      ArtistItem = (
        <div>
          <h1 class={style.title}>{artist.name}</h1>

          <h4>Music</h4>

          <Track name={artist.name} />
        </div>
      );
    }

    return (
      <div>
        <div class={style.headerImage}>
          {artist && <img src={artist.image} alt={`Image of ${artist.name}`} />}
        </div>
        <div class={`${style.page} ${style.panel}`}>
          {ArtistItem}
        </div>
      </div>
		);
  }
}
