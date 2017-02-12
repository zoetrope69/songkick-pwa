import { h, Component } from 'preact';
import style from './style';

import Track from '../Track';
import Badge from '../Badge';

export default class Artist extends Component {
  render() {
    const { artists, id } = this.props;

    const artist = artists.find(artist => artist.id === +id);

    let ArtistItem;

    if (artist) {
      ArtistItem = (
        <div>
          {artist.onTourUntil && <Badge artist={artist} />}

          <h1 class={style.title}>{artist.name}</h1>

          <h4>Music</h4>

          <Track name={artist.name} />
        </div>
      );
    }

    return (
      <div>
        <div class={style.animateIn}>
          <div class={style.headerImage}>
            {artist && (
              <img
                src={artist.image.src}
                style={artist.image.color ? {backgroundColor: artist.image.color} : {}}
                alt={`Image of ${artist.name}`} />
            )}
          </div>
        </div>
        <div class={`${style.animateIn} ${style.animateInUp}`}>
          <div class={`${style.page} ${style.panel}`}>
            {ArtistItem}
          </div>
        </div>
      </div>
    );
  }
}
