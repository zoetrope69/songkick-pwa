import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import { h, render } from 'preact';
import './style';

let root;
function init() {
  let App = require('./components/App').default;

  // if no service worker just create app
  if (!('serviceWorker' in navigator)) {
    root = render(<App registration={false} />, document.body, root);
  }

  // register a service worker
  runtime.register().then((registration) => {
    root = render(<App registration={registration} />, document.body, root);
  });
}

init();

if (module.hot) {
  module.hot.accept('./components/App', () => requestAnimationFrame( () => {
    flushLogs();
    init();
  }) );

  // optional: mute HMR/WDS logs
  let log = console.log,
    logs = [];
  console.log = (t, ...args) => {
    if (typeof t==='string' && t.match(/^\[(HMR|WDS)\]/)) {
      if (t.match(/(up to date|err)/i)) logs.push(t.replace(/^.*?\]\s*/m,''), ...args);
    }
    else {
      log.call(console, t, ...args);
    }
  };
  let flushLogs = () => console.info(`%c🚀 ${logs.splice(0,logs.length).join(' ')}`, 'color:#888;');
}
