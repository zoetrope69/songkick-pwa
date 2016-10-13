import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Header extends Component {
  render() {
    const { currentUrl, hasHeaderImage } = this.props;
    return (
      <header class={`${style.header} ${hasHeaderImage ? style.headerHasHeaderImage : ''}`}>
        <Link href={`/`}>
          <h1 class={style.title}>Songkick</h1>
        </Link>
        <div class={style.linkGroup}>
          <Link class={`${style.link} ${currentUrl === '/' && style.linkActive}`} href={`/`}>Plans</Link>
          <Link class={`${style.link} ${currentUrl === '/upcoming' && style.linkActive}`} href={`/upcoming`}>Upcoming</Link>
          {/* <Link class={`${style.link} ${currentUrl === '/artists' && style.linkActive}`} href={`/artists`}>Artists</Link> */}
        </div>
      </header>
    );
  }
}
