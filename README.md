# [songkick.pink](https://songkick.pink)
_:nail_care: experimental progressive web app for songkick_
[![Build Status](https://travis-ci.org/zaccolley/songkick.pink.svg?branch=master)](https://travis-ci.org/zaccolley/songkick.pink) [![Dependancies](https://david-dm.org/zaccolley/songkick.pink/status.svg)](https://david-dm.org/zaccolley/songkick.pink)
[![Dev dependancies](https://david-dm.org/zaccolley/songkick.pink/dev-status.svg)](https://david-dm.org/zaccolley/songkick.pink?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/zaccolley/songkick.pink/badge.svg)](https://snyk.io/test/github/zaccolley/songkick.pink)
[![Greenkeeper badge](https://badges.greenkeeper.io/zaccolley/songkick.pink.svg)](https://greenkeeper.io/)

![Screenshot of site when on a mobile](screenshot_mobile.png)

## Installation

**1. Clone this repo and install any dependancies:**

```sh
npm install
```

**2. Add in environment variables:**

You'll need the following to be added to `.env` (see `.env-sample`):

1. Songkick API key (SONGKICK_API_KEY): https://www.songkick.com/developer
2. Server IP Address (SERVER_IP): `hostname -I`
3. Email address for notifs (VAPID_EMAIL)
4. VAPID public and private keys (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY): [`npm i -h web-push && web-push generate-vapid-keys`](https://github.com/web-push-libs/web-push#command-line)
5. Firebase Cloud Messaging API key (FCM_API_KEY): firebase.google.com/docs/cloud-messaging/

## Development Workflow


**3. Start a live-reload development server:**

```sh
npm run dev
```

> This is a full web server nicely suited to your project. Any time you make changes within the `src` directory, it will rebuild and even refresh your browser.

**4. Testing with `mocha`, `karma`, `chai`, `sinon` via `phantomjs`:**

```sh
npm test
```

> 🌟 This also instruments the code in `src/` using [isparta](https://github.com/douglasduteil/isparta), giving you pretty code coverage statistics at the end of your tests! If you want to see detailed coverage information, a full HTML report is placed into `coverage/`.

**5. Generate a production build in `./build`:**

```sh
npm run build
```

> You can now deploy the contents of the `build` directory to production!


**6. Start local production server with [serve](https://github.com/zeit/serve):**

```sh
npm start
```

> This is to simulate a production (CDN) server with gzip. It just serves up the contents of `./build`.

---


_based on the preact boilerplate: https://github.com/developit/preact-boilerplate_
