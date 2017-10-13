import { h, Component } from 'preact';
import svg from './svg';

export default class Icon extends Component {
  render() {
    const { name, size, style } = this.props;

    if (!name || name.length <= 0) {
      return;
    }

    if (!svg[name]) {
      console.error('No icon named:', name);
    }

    const iconStyle = {
      ...style,
      width: '1em',
      height: '1em',
      fill: 'currentcolor',
      transform: 'translateY(.125em)'
    };

    return (
      <svg viewBox="0 0 32 32" style={iconStyle}>
        <title>{name} icon</title>
        <path d={svg[name]} />
      </svg>
    );
  }
}
