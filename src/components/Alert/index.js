import { h, Component } from 'preact';
import style from './style';

import Icon from '../Icon';

export default class Alert extends Component {
  render() {
    const { error, loading, synced, syncing } = this.props;

    if (!loading && !error && !syncing && !synced) {
      return;
    }

    let content;
    let icon;
    if (error) {
      icon = <Icon name="warning" />;
      content = "Couldn't sync. :(";
    } else if (loading) {
      icon = <Icon name="refresh" />;
      content = 'Loading…';
    } else if (syncing) {
      icon = <Icon name="refresh" />;
      content = 'Data syncing…';
    } else if (synced) {
      icon = <Icon name="check" />;
      content = 'Data synced!';
    }

    return (
      <div class={`${style.alert} ${synced && style.alertSynced} ${error && style.alertError}`}>
        <span class={style.icon}>{icon}</span>
        {content}
      </div>
    );
  }
}
