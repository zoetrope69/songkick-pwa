import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

import Icon from '../Icon';

export default class Settings extends Component {
  render() {
    const { logout, username } = this.props;

    return (
      <div class={style.page}>
        <div class={style.animateIn}>
          <h1 class={style.title}>{username ? username : 'Settings'}</h1>
        </div>
        <div class={`${style.animateIn} ${style.animateInZoomUp}`}>
          <button class={style.button} onClick={logout}>Logout</button>
        </div>
      </div>
    );
  }
}
