import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Header extends Component {
  render() {
    const { currentUrl, loggedIn } = this.props;

    if (!loggedIn) {
      return;
    }

    const subPage = currentUrl.includes('/settings') || currentUrl.includes('/event/') || currentUrl.includes('/artist/');

    return (
      <nav class={`${style.nav} ${subPage ? style.navHidden : ''}`}>
        <Link class={`${style.navItem} ${currentUrl === '/' && style.navItemActive}`} href="/">Events</Link>
        <Link class={`${style.navItem} ${currentUrl === '/artists' && style.navItemActive}`} href="/artists">Artists</Link>
      </nav>
    );
  }
}
