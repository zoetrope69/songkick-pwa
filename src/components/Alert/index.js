import { h, Component } from 'preact';
import style from './style';

export default class Alert extends Component {
  render() {
    const { error, loading, synced, syncing } = this.props;

    if (!loading && !error && !syncing && !synced) {
      return;
    }

    let content;
    if (error) {
      content = "Couldn't sync. :(";
    } else if (loading) {
      content = 'Loading…';
    }  else if (syncing) {
      content = 'Data syncing…';
    } else if (synced) {
      content = 'Data synced!';
    }

    return (
      <div class={`${style.alert} ${synced && style.alertSynced} ${error && style.alertError}`}>
        {content}
      </div>
    );
  }
}
