import { h, Component } from 'preact';
const geomicons = require('geomicons-open');

export default class Icon extends Component {
  render() {
    const { name, size } = this.props;

    if (!name || name.length <= 0) {
      return;
    }

    const style = {
      width: '1em',
      fill: 'currentcolor',
      transform: 'translateY(.125em)'
    };

    return (
      <svg viewBox="0 0 32 32" style={style}>
        <title>{name} icon</title>
        <path d={geomicons[name]} />
      </svg>
    );
  }
}
