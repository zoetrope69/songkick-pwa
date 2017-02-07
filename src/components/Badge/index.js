import { h, Component } from 'preact';
import style from './style';

import Icon from '../Icon';

export default class Badge extends Component {
  render() {
    const { artist, event, small } = this.props;

    if (!event && !artist) {
      return;
    }

    if (artist && artist.onTourUntil) {
      return (
        <span class={`${style.badge} ${small ? style.badgeSmall : {}} ${style.badgeOnTour}`}>
          <Icon name="calendar" /> On tour
        </span>
      );
    }

    if (event.cancelled) {
      return (
        <span class={`${style.badge} ${small ? style.badgeSmall : {}} ${style.badgeCancelled}`}>
          <Icon name="close" /> Cancelled
        </span>
      );
    }

    if (event.reason.attendance) {
      if (event.reason.attendance === 'im_going') {
        return (
          <span class={`${style.badge} ${small ? style.badgeSmall : {}} ${style.badgeGoing}`}>
            <Icon name="check" /> Going
          </span>
        );
      } else if (event.reason.attendance === 'i_might_go') {
        return (
          <span class={`${style.badge} ${small ? style.badgeSmall : {}} ${style.badgeMaybe}`}>
            <Icon name="bookmark" /> Maybe
          </span>
        );
      }
    } else if (event.type && event.type === 'festival') {
      return (
        <span class={`${style.badge} ${small ? style.badgeSmall : {}} ${style.badgeFestival}`}>
          <Icon name="star" /> Festival
        </span>
      );
    }

    return;
  }
}
