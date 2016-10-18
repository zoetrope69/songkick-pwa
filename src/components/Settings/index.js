import { h, Component } from 'preact';
import style from './style';

function debounce(fn, delay) {
  let timer = null;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}

export default class Settings extends Component {

  handleInput(e) {
    const value = e.target.value;
    this.props.changeUsername(value);
  }

  render() {

    return (
      <div class={style.page}>
        <h1 class={style.title}>Settings</h1>

        <label>Username</label>
        <input type="text" value={this.props.username} onInput={debounce(this.handleInput.bind(this), 200)} />
      </div>
    );
  }
}
