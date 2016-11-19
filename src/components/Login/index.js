import { h, Component } from 'preact';
import style from './style';

export default class Login extends Component {

  state = {
    username: ''
  };

  handleInput(e) {
    const username = e.target.value.trim();

    if (username.length > 0) {
      this.setState({ username });
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.changeUsername(this.state.username);
    this.props.login();
  }

  render() {
    const { username } = this.state;

    const button = {
      value: username.length === 0 ? 'Enter username' : 'Login',
      disabled: username.length === 0
    };

    return (
      <div class={style.loginPage}>
        <span class={style.logo}>Songkick</span>

        <form onSubmit={this.handleSubmit.bind(this)}>
          <h1 class={style.title}>Login</h1>

          <label for="username">Username</label>

          <input
            id="username"
            type="text"
            placeholder="Your username"
            value={this.state.username}
            oninput={this.handleInput.bind(this)}
            />

          <input
            type="submit"
            value={button.value}
            disabled={button.disabled} />
        </form>
      </div>
    );
  }
}
