import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

import Badge from '../Badge';

export default class Artists extends Component {
  render() {
    const { artists } = this.props;

    let ArtistsList;

    if (artists.length > 0) {
      ArtistsList = artists.map(artist => {
        const imageStyle = {};

        if (artist.image.color) {
          imageStyle.backgroundColor = artist.image.color;
        }

        if (artist.image.src) {
          imageStyle.backgroundImage = `url(${artist.image.src})`;
        }

        return (
          <li class={style.artist}>
            <Link href={`/artist/${artist.id}`} style={imageStyle}>
              <span class={style.title}>
                {artist.name}
                {artist.onTourUntil && <Badge artist={artist} small={true} />}
              </span>
            </Link>
          </li>
        );
      });
    }

    return (
      <div class={style.page}>
        <div class={style.animateIn}>
          <h1 class={style.title}>Artists</h1>
        </div>
        <ul class={`${style.artists} ${style.animateIn} ${style.animateInZoom}`}>
          {ArtistsList}
        </ul>
      </div>
    );
  }
}
