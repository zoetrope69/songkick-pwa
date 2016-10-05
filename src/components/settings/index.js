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

    const { events } = this.props;

    return (
      <div class={style.settings}>
        <h1>Settings</h1>
        <p>These are your settings.</p>

        <label>Username</label>
        <input type="text" value={this.props.username} onInput={debounce(this.handleInput.bind(this), 200)} />
      </div>
    );
  }
}
