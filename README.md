# RetroNet Arcade

RetroNet is an immersive retro browser arcade for classic Flash games. It uses the open source [Ruffle](https://ruffle.rs/) Flash emulator, a neon pixel-art interface, local save slots, fullscreen play, SWF downloads, and PWA offline caching.

Made with love by aj4200.

## Features

- Ruffle-powered SWF playback from `public/games`
- Pixel arcade UI with boot splash, fake loader, CRT scanlines, neon colors, and transitions
- Searchable game cabinet generated from `public/games/flashlist.json`
- Fullscreen cabinet mode
- Download button for the selected `.swf`
- Three manual save-data slots per game for Flash games that write browser save data
- Automatic Ruffle SharedObject persistence through browser storage
- Installable PWA with manifest icons and service worker
- Offline app shell, local Ruffle runtime, and on-demand game caching
- `cache game` for one cartridge or `cache all` for the full local library

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4 import pipeline
- Ruffle `@ruffle-rs/ruffle`
- Custom service worker at `public/sw.js`

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Start the production server after building:

```bash
pnpm start
```

## Adding Games

Put `.swf` files in:

```text
public/games
```

Then add each file name to:

```text
public/games/flashlist.json
```

Example:

```json
[
  "Pacman.swf",
  "Tetris.swf"
]
```

The app reads this list at runtime and builds the cabinet wall automatically.

## Offline PWA

RetroNet includes:

- `app/manifest.ts` for install metadata
- `public/icons/*` for install icons
- `public/sw.js` for offline caching
- Local Ruffle files in `public/ruffle`

When the app loads, it registers the service worker and caches the app shell, manifest, icons, game list, Ruffle JS, and Ruffle WASM files.

Games are cached in two ways:

- Selecting or playing a game lets the service worker cache that SWF as it is fetched.
- Press `cache game` to store the selected game for offline play.
- Press `cache all` to store every game in `flashlist.json`. This can take time and use a lot of browser storage because the library contains large SWF files.

For the most reliable install/offline test, run the production build over HTTPS or use a browser that allows service workers on `localhost`.

## Saves

Ruffle persists Flash SharedObject data in browser storage. RetroNet adds three visible save-data slots per game by copying and restoring that browser save data, then reloading the current game.

These are not true emulator save states. Ruffle's web player does not currently expose a full runtime/RAM snapshot API, so RetroNet cannot reliably resume an arbitrary exact frame unless the game itself has written save data.

Browser storage is local to the origin. Changing domains, clearing site data, or using a private window can remove saves and offline cache data.

## Important Files

- `app/page.tsx` - small route entry that renders the arcade app
- `app/_components/arcade` - visual arcade components
- `app/_hooks` - boot, game catalog, Ruffle, PWA, and save-slot behavior
- `app/_lib` - shared constants, game helpers, save helpers, and TypeScript types
- `app/globals.css` - pixel arcade styling, responsive cabinet, CRT effects
- `app/layout.tsx` - metadata and pixel font
- `app/manifest.ts` - PWA manifest
- `app/icon.tsx` - generated app icon
- `app/apple-icon.tsx` - generated Apple touch icon
- `public/sw.js` - service worker
- `public/games/flashlist.json` - game catalog
- `public/ruffle` - local Ruffle runtime

## Notes

Some Flash games may need network access internally, use unsupported ActionScript behavior, or save progress differently. Ruffle compatibility varies by game, but RetroNet keeps the emulator runtime and local SWFs available offline once cached.
