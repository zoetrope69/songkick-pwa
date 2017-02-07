# [songkick.pink](https://songkick.pink)
_:nail_care: experimental progressive web app for songkick_

[![Build Status](https://travis-ci.org/zaccolley/songkick.pink.svg?branch=master)](https://travis-ci.org/zaccolley/songkick.pink) [![Dependancies](https://david-dm.org/zaccolley/songkick.pink/status.svg)](https://david-dm.org/zaccolley/songkick.pink)
[![Dev dependancies](https://david-dm.org/zaccolley/songkick.pink/dev-status.svg)](https://david-dm.org/zaccolley/songkick.pink?type=dev)
[![Greenkeeper badge](https://badges.greenkeeper.io/zaccolley/songkick.pink.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/zaccolley/songkick.pink/badge.svg)](https://snyk.io/test/github/zaccolley/songkick.pink)

![Screenshot of site when on a mobile](screenshot_mobile.png)

## Installation

**1. Clone this repo and install any dependancies:**

```sh
yarn install
```

or

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

**3. Generate a production build in `./build`:**

```sh
npm run build
```


**5. Start local production servers:**

```sh
npm start
```

---

_based on the preact boilerplate: https://github.com/developit/preact-boilerplate_
