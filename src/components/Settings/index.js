import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Settings extends Component {
  render() {
    const { logout, title } = this.props;
    return (
      <div class={style.page}>
        <h1 class={style.title}>{title ? title : 'Settings'}</h1>
        <button class={style.button} onClick={logout}>Logout</button>
      </div>
		);
  }
}
