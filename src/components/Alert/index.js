import { h, Component } from 'preact';
import style from './style';

import Icon from '../Icon';

export default class Alert extends Component {
  render() {
    const { error, loading, synced, syncing } = this.props;

    if (!loading && !error && !syncing && !synced) {
      return;
    }

    let text;
    let icon;
    if (error) {
      icon = <Icon name="warning" />;
      text = "Couldn't sync.";
    } else if (loading) {
      icon = <Icon name="refresh" />;
      text = 'Loading…';
    } else if (syncing) {
      icon = <Icon name="refresh" />;
      text = 'Data syncing…';
    } else if (synced) {
      icon = <Icon name="check" />;
      text = 'Data synced!';
    }

    return (
      <div class={`${style.alert} ${synced && style.alertSynced} ${error && style.alertError}`}>
        <span class={style.icon}>{icon}</span>
        <span class={style.text}>{text}</span>
      </div>
    );
  }
}
