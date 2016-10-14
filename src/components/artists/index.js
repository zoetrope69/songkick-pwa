import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Artists extends Component {
  render() {
    const { artists } = this.props;

    let ArtistsList;

    if (artists.length > 0) {
      ArtistsList = artists.map(artist => (
        <li class={style.artist}>
        <Link href={`/artist/${artist.id}`}>
          <img src={artist.image} alt={`Image of ${artist.name}`} width={50} />
          <span>{artist.name}</span>
        </Link>
        </li>
      ));
    }

    return (
      <div class={style.page}>
        <h1>Artists</h1>
        <ul>
        {ArtistsList}
        </ul>
      </div>
    );
  }
}
