import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Header extends Component {
  render() {
    return (
      <header class={style.header}>
        <Link class={style.link} href={`/`}>Plans</Link>
        <h1 class={style.title}>Songkick</h1>
      </header>
    );
  }
}
