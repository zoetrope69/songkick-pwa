import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Header extends Component {
  render() {
    const { hasHeaderImage } = this.props;
    return (
      <header class={`${style.header} ${hasHeaderImage ? style.headerHasHeaderImage : ''}`}>
        <Link href={`/`}>
          <h1 class={style.title}>Songkick</h1>
        </Link>
        <div class={style.linkGroup}>
          <Link class={style.link} href={`/`}>Plans</Link>
          <Link class={style.link} href={`/upcoming`}>Upcoming</Link>
          <Link class={style.link} href={`/artists`}>Artists</Link>
        </div>
      </header>
    );
  }
}
