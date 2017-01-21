import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Header extends Component {
  render() {
    const { currentUrl, loggedIn, username } = this.props;

    const hasHeaderImage = currentUrl.includes('event/') || currentUrl.includes('artist/');

    return (
      <header class={`${style.header} ${hasHeaderImage ? style.headerHasHeaderImage : ''}`}>
        <Link href={`/`}>
          {!hasHeaderImage  ? (
            <h1 class={style.title}>Songkick</h1>
          ) : (
            <span class={style.back}>Back</span>
          )}
        </Link>
        {loggedIn && (
          <Link class={style.settings} href="/settings">{username ? username : 'Settings'}</Link>
        )}
      </header>
    );
  }
}
