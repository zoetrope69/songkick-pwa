import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Header extends Component {
  render() {
    const { currentUrl, hasHeaderImage } = this.props;
    return (
      <header class={`${style.header} ${hasHeaderImage ? style.headerHasHeaderImage : ''}`}>
        <Link href={`/`}>
          {currentUrl === '/' || currentUrl === '/upcoming' || currentUrl === '/settings'  ? (
            <h1 class={style.title}>Songkick</h1>
          ) : (
            <span class={style.back}>Back</span>
          )}
        </Link>
        <nav class={style.nav}>
          <Link class={`${style.navItem} ${currentUrl === '/' && style.navItemActive}`} href="/">Plans</Link>
          <Link class={`${style.navItem} ${currentUrl === '/upcoming' && style.navItemActive}`} href="/upcoming">Upcoming</Link>
        </nav>
      </header>
    );
  }
}
