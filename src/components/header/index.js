import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Header extends Component {
  render() {
    return (
      <header class={style.header}>
        <Link href={`/`}>
          <h1 class={style.title}>Songkick</h1>
        </Link>
        <div class={style.linkGroup}>
          <Link class={style.link} href={`/`}>Plans</Link>
          <Link class={style.link} href={`/settings`}>Settings</Link>
        </div>
      </header>
    );
  }
}
