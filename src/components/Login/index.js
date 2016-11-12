import { h, Component } from 'preact';
import style from './style';

export default class Login extends Component {

  handleInput(e) {
    const value = e.target.value;
    this.props.changeUsername(value);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.login();
  }

  render() {
    const { events, error, synced } = this.props;

    const invalidUser = events.length <= 0 || error;

    const button = {
      value: invalidUser ? 'Enter user with events' : 'Login',
      disabled: invalidUser
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
            onChange={this.handleInput.bind(this)}
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
