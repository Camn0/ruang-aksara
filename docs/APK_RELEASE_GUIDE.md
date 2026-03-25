# APK Release Guide

This guide details the process of wrapping the Ruang Aksara PWA into an Android APK using Trusted Web Activity (TWA).

## Requirements
- Node.js and NPM
- JDK 17 or later
- Android SDK (Command line tools or Android Studio)
- Bubblewrap CLI: `npm i -g @bubblewrap/cli`

## Configuration
The application is configured with the following parameters (see `public/.well-known/assetlinks.json`):
- Package Name: `com.ruangaksara.twa`
- Host: `ruang-aksara.vercel.app`
- SHA256 Fingerprint: `81:30:B1:1E:C7:42:6F:41:99:98:17:A6:BD:A2:9E:9E:BE:0C:55:5F:43:06:4C:82:D3:35:21:12:11:1A:91:56`

## Build Procedure

### 1. Initialize TWA
Run bubblewrap in a dedicated folder (e.g., `/twa`):
```bash
bubblewrap init --manifest=https://ruang-aksara.vercel.app/manifest.json
```
Follow the prompts and use the package name above.

### 2. Generate Assetlinks
Ensure your `assetlinks.json` is correctly deployed to the production server. The SHA256 must match your signing key.

### 3. Build APK
```bash
bubblewrap build
```

### 4. Output
The project will generate several files:
- `app-release-signed.apk`: The production-ready APK.
- `app-release.aab`: The Android App Bundle for Google Play Store.

## Maintenance
- Keystore: Keep your `.keystore` file and password secure. Losing it prevents updates to existing Play Store entries.
- Updates: Re-run `bubblewrap build` whenever you make major changes to the PWA manifest or service worker.
