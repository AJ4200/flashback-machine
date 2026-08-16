# FlashBack Machine

FlashBack Machine is an immersive retro browser arcade for classic Flash, DOS, MAME, NES, and Sega games. It uses Ruffle, js-dos, and bundled RetroArch WebAssembly cores inside a neon pixel-art interface with local save slots, fullscreen play, downloads, and PWA offline caching.

Made with love by aj4200.

## Features

- Ruffle-powered SWF playback from `public/games/flash`
- js-dos playback from `public/games/jsdos`
- NES playback through the bundled Nestopia RetroArch core
- MAME playback through the bundled MAME 2003-Plus RetroArch core
- Sega playback through the bundled Genesis Plus GX RetroArch core
- Pixel arcade UI with boot splash, fake loader, CRT scanlines, neon colors, and transitions
- Searchable game cabinet generated from each emulator catalog
- Fullscreen cabinet mode
- Download button for the selected game file
- Three manual save-data slots for browser-backed save data
- Installable PWA with manifest icons and service worker
- Offline app shell, local emulator runtimes, and on-demand game caching
- `cache game` for one cartridge or `cache all` for the full local library

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4 import pipeline
- Ruffle `@ruffle-rs/ruffle`
- js-dos
- RetroArch Emscripten cores from `@rebitplay/retroarch-emscripten`
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

Each emulator has a game folder and a JSON catalog. Put files in the matching folder, then list each exact filename in that folder's catalog.

```text
public/games/flash/flashlist.json
public/games/jsdos/jsdoslist.json
public/games/mame/mamelist.json
public/games/nes/neslist.json
public/games/sega/segalist.json
```

Example catalog:

```json
[
  "Pacman.swf",
  "Tetris.swf"
]
```

The app reads this list at runtime and builds the cabinet wall automatically.

Supported game folders:

```text
public/games/flash/
public/games/jsdos/
public/games/mame/
public/games/nes/
public/games/sega/
```

MAME note: MAME is not universal by file extension alone. Arcade zip contents must match the selected core's romset. This build defaults to MAME 2003-Plus and also ships MAME 2000/MAME 2003 assets for future core switching.

## Offline PWA

FlashBack Machine includes:

- `app/manifest.ts` for install metadata
- `public/icons/*` for install icons
- `public/sw.js` for offline caching
- Local Ruffle files in `public/ruffle`
- Local RetroArch cores in `public/emulators/retroarch`

When the app loads, it registers the service worker and caches the app shell, manifest, icons, catalogs, Ruffle files, and RetroArch core files.

Games are cached in two ways:

- Selecting or playing a game lets the service worker cache that game file as it is fetched.
- Press `cache game` to store the selected game for offline play.
- Press `cache all` to store every game in the active emulator catalog. This can take time and use a lot of browser storage.

For the most reliable install/offline test, run the production build over HTTPS or use a browser that allows service workers on `localhost`.

## Saves

Some runtimes persist game data in browser storage. FlashBack Machine adds three visible save-data slots per game by copying and restoring that browser save data, then reloading the current game.

These are not true emulator save states. FlashBack Machine cannot reliably resume an arbitrary exact frame unless the game or runtime has written save data.

Browser storage is local to the origin. Changing domains, clearing site data, or using a private window can remove saves and offline cache data.

## Important Files

- `app/page.tsx` - small route entry that renders the arcade app
- `app/_components/arcade` - visual arcade components
- `app/_hooks` - boot, game catalog, emulator player, PWA, and save-slot behavior
- `app/_lib` - shared constants, game helpers, save helpers, and TypeScript types
- `app/globals.css` - pixel arcade styling, responsive cabinet, CRT effects
- `app/layout.tsx` - metadata and pixel font
- `app/manifest.ts` - PWA manifest
- `app/icon.tsx` - generated app icon
- `app/apple-icon.tsx` - generated Apple touch icon
- `public/sw.js` - service worker
- `public/games/*/*list.json` - emulator game catalogs
- `public/ruffle` - local Ruffle runtime
- `public/emulators/retroarch` - local RetroArch cores

## Notes

Some games may need network access internally, use unsupported runtime behavior, require BIOS files, or save progress differently. FlashBack Machine keeps the emulator runtimes and local game files available offline once cached, but ROM compatibility still depends on the chosen emulator core and the exact game dump.
