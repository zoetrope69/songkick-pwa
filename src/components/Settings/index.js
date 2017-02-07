import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Settings extends Component {
  render() {
    const { logout, title } = this.props;
    return (
      <div class={style.page}>
        <div class={style.animateIn}>
          <h1 class={style.title}>{title ? title : 'Settings'}</h1>
        </div>
        <div class={`${style.animateIn} ${style.animateInZoomUp}`}>
          <button class={style.button} onClick={logout}>Logout</button>
        </div>
      </div>
    );
  }
}
