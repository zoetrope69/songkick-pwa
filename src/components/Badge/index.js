import { h, Component } from 'preact';
import style from './style';

import Icon from '../Icon';

export default class Badge extends Component {
  render() {
    const { artist, event, rotate } = this.props;

    if (!event && !artist) {
      return;
    }

    if (artist && artist.onTourUntil) {
      return (
        <span class={`${style.badge} ${rotate ? style.badgeRotate : {}} ${style.badgeOnTour}`}>
          <Icon name="calendar" /> On tour
        </span>
      );
    }

    if (event.reason.attendance) {
      if (event.reason.attendance === 'im_going') {
        return (
          <span class={`${style.badge} ${rotate ? style.badgeRotate : {}} ${style.badgeGoing}`}>
            <Icon name="check" /> Going
          </span>
        );
      } else if (event.reason.attendance === 'i_might_go') {
        return (
          <span class={`${style.badge} ${rotate ? style.badgeRotate : {}} ${style.badgeMaybe}`}>
            <Icon name="bookmark" /> Maybe
          </span>
        );
      }
    } else if (event.type && event.type === 'festival') {
      return (
        <span class={`${style.badge} ${rotate ? style.badgeRotate : {}} ${style.badgeFestival}`}>
          <Icon name="star" /> Festival
        </span>
      );
    }

    return;
  }
}
