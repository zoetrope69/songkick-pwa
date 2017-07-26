import { h, Component } from 'preact';
import style from './style';

import Icon from '../Icon';

export default class Login extends Component {

  state = {
    username: ''
  };

  handleInput(e) {
    const username = e.target.value.trim();

    this.setState({ username });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.login(this.state.username);
  }

  render() {
    const { username } = this.state;

    const button = {
      value: username.length === 0 ? 'Enter username' : 'Login',
      disabled: username.length === 0
    };

    return (
      <div class={`${style.animateIn} ${style.animateInZoom}`}>
        <span class={style.logo}>Songkick</span>

        <form onSubmit={this.handleSubmit.bind(this)} class={`${style.animateIn} ${style.animateInZoomUp}`}>
          <label for="username">What's your Songkick username?</label>

          <input
            id="username"
            type="text"
            placeholder="janesmith123"
            value={this.state.username}
            oninput={this.handleInput.bind(this)}
            required
          />

          <input
            type="submit"
						class={`${style.button} ${style.buttonPrimary}`}
            value={button.value}
          />

        <a class={style.button}
              href="https://accounts.songkick.com/signup/new?source_product=skweb&login_success_url=https%3A%2F%2Fsongkick.pink&signup_success_url=https%3A%2F%2Fsongkick.pink"
              target="_blank">
            Sign up <Icon name="external" style={{ marginLeft: '0.25em' }} />
          </a>
        </form>
      </div>
    );
  }
}
