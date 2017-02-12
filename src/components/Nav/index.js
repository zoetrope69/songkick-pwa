import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Header extends Component {
  render() {
    const { currentUrl, loggedIn } = this.props;

    if (!loggedIn) {
      return;
    }

    return (
      <nav class={style.nav}>
        <Link class={`${style.navItem} ${currentUrl === '/' && style.navItemActive}`} href="/">Events</Link>
        <Link class={`${style.navItem} ${currentUrl === '/artists' && style.navItemActive}`} href="/artists">Artists</Link>
      </nav>
    );
  }
}
