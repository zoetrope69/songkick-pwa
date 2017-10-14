import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

import Icon from '../Icon';

export default class Settings extends Component {
  createSpotifyAuthUrl() {
    const SPOTIFY_CLIENT_ID = 'f7d952560796423ebeb13917d8c658fb';
    const SPOTIFY_REDIRECT_URI = 'http://localhost:8011';

    const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${SPOTIFY_REDIRECT_URI}`

    return spotifyAuthUrl;
  }

  render() {
    const { logout, username, spotifyAccessCode } = this.props;

    return (
      <div class={style.page}>
        <div class={style.animateIn}>
          <h1 class={style.title}>{username ? username : 'Settings'}</h1>
        </div>
        <div class={`${style.animateIn} ${style.animateInZoomUp}`}>
          <a class={`${style.button} ${style.buttonSpotify}`} href={this.createSpotifyAuthUrl()}>
            <Icon name={spotifyAccessCode ? 'check' : 'external'} /> {spotifyAccessCode ? 'Spotify authorized' : 'Authorize Spotify'}
          </a>
          <button class={style.button} onClick={logout}>Logout</button>
        </div>
      </div>
    );
  }
}
