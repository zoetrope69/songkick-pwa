import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Artists extends Component {
  render() {

    return (
      <div class={style.page}>
        <h1>Artists</h1>
        <ul>
        {this.props.artists.map(artist => (
          <li class={style.artist}>
          <Link href={`/artist/${artist.id}`}>
            <img src={artist.image} alt={`Image of ${artist.name}`} width={20} />
            {artist.name}
          </Link>
          </li>
        ))}
        </ul>
      </div>
    );
  }
}
