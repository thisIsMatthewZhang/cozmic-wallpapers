# Cozmic Wallpapers Cloud Functions

This folder contains the Firebase Cloud Functions backend for privileged server work.

## Commands

Run these from the repo root:

```sh
npm run functions:build
npm run functions:serve
npm run functions:deploy
```

Or run the same scripts directly inside `functions/`.

## Request Security

Protected endpoints should verify these before doing privileged work:

- `Authorization: Bearer <Firebase Auth ID token>`
- `X-Firebase-AppCheck: <Firebase App Check token>`

Keep Firebase Admin SDK imports inside this folder only. The Expo app should call deployed HTTPS functions rather than importing backend code.

## Apple In-App Purchase

Set `APPLE_APP_ID` to the numeric Apple ID from App Store Connect before deploying production purchase verification. Sandbox verification does not require it. The Apple root certificates in `certs/` are public trust anchors used to verify StoreKit signed transactions.
