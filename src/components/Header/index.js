import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

import Icon from '../Icon';

export default class Header extends Component {
  render() {
    const { currentUrl, loggedIn, username } = this.props;

    const subPage = currentUrl.includes('/settings') || currentUrl.includes('/event/');

    return (
      <header class={style.header}>
        <Link href={`/`}>
          {subPage  ? (
            <div class={`${style.animateIn} ${style.animateInLeft}`}>
              <span class={style.back}>
                <span style={{float: 'left', marginRight: '.25em'}}>
                  <Icon name="chevronLeft" />
                </span>
                Back
              </span>
            </div>
          ) : (
            <span class={`${style.animateIn} ${style.animateInZoom}`}>
				      <span class={style.title}>Songkick</span>
            </span>
          )}
        </Link>
        {(!subPage && loggedIn) && (
          <Link class={style.settings} href="/settings">
            {username ? username : 'Settings'}
            <span style={{float: 'right', marginLeft: '.25em'}}>
              <Icon name="cog" />
            </span>
          </Link>
        )}
      </header>
    );
  }
}
