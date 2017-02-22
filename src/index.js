import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import { h, render } from 'preact';
import './style';

function renderApp(registration = 'false') {
  const App = require('./components/App').default;
  root = render(<App registration={registration} />, document.body, root);
}

let root;

function init() {
  // if in development or no service worker support
  if (process.env.NODE_ENV === 'development' || !('serviceWorker' in navigator)) {
    // dont register a service worker
    return renderApp();
  }

  // register a service worker and give it to the app
  runtime.register().then(renderApp);
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
