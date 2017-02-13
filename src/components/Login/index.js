import { h, Component } from 'preact';
import style from './style';

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
						class={style.button}
            value={button.value}
          />
        </form>
      </div>
    );
  }
}
