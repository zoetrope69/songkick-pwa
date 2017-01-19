import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Header extends Component {
  render() {
    const { currentUrl, loggedIn, username } = this.props;

    const hasHeaderImage = currentUrl.includes('event/') || currentUrl.includes('artist/');
    const backActive = currentUrl === '/' || currentUrl === '/upcoming' || currentUrl === '/artists' || currentUrl === '/settings';

    return (
      <div>
        <header class={`${style.header} ${hasHeaderImage ? style.headerHasHeaderImage : ''}`}>
          <Link href={`/`}>
            {!hasHeaderImage  ? (
              <h1 class={style.title}>Songkick</h1>
            ) : (
              <span class={style.back}>Back</span>
            )}
          </Link>
        </header>
        {!hasHeaderImage && loggedIn && (
          <nav class={style.nav}>
            <Link class={`${style.navItem} ${currentUrl === '/' && style.navItemActive}`} href="/">Plans</Link>
            <Link class={`${style.navItem} ${currentUrl === '/upcoming' && style.navItemActive}`} href="/upcoming">Upcoming</Link>
            <Link class={`${style.navItem} ${currentUrl === '/artists' && style.navItemActive}`} href="/artists">Artists</Link>
            <Link class={`${style.navItem} ${currentUrl === '/settings' && style.navItemActive}`} href="/settings">{username ? username : 'Settings'}</Link>
          </nav>
        )}
      </div>
    );
  }
}
