# FlashBack Machine

FlashBack Machine is an immersive retro browser arcade for classic Flash, DOS, Game Boy, MAME, NES, PlayStation 2, and Sega games. It uses Ruffle, js-dos, and bundled WebAssembly emulators inside a neon pixel-art interface with local save slots, fullscreen play, downloads, and PWA offline caching.

Made with love by aj4200.

## Features

- Ruffle-powered SWF playback from `public/games/flash`
- Game Boy, Game Boy Color, and Game Boy Advance playback through the bundled mGBA RetroArch core
- js-dos playback from `public/games/jsdos`
- NES playback with automatic fallback across the bundled Nestopia, FCEUmm, and QuickNES RetroArch cores
- Experimental PlayStation 2 playback through the bundled Play! WebAssembly emulator
- MAME playback with automatic fallback across the bundled MAME 2003-Plus, MAME 2003, and MAME 2000 RetroArch cores
- Sega playback through the bundled Genesis Plus GX RetroArch core
- Pixel arcade UI with boot splash, fake loader, CRT scanlines, neon colors, and transitions
- Searchable game cabinet generated from each emulator catalog
- Collapsible emulator selector, live startup terminal, and in-screen loading/error feedback
- Per-emulator keyboard and Gamepad API mappings with plug-and-play standard-layout Xbox 360 controller defaults
- Load supported game files directly from your device without adding them to the hosted catalog
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
public/games/gba/gbalist.json
public/games/jsdos/jsdoslist.json
public/games/mame/mamelist.json
public/games/nes/neslist.json
public/games/ps2/ps2list.json
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
public/games/gba/
public/games/jsdos/
public/games/mame/
public/games/nes/
public/games/ps2/
public/games/sega/
```

NES and MAME note: The player starts with the broad-compatibility core and retries another bundled core when it detects a ROM load error. Arcade ROM sets still need to match a core's supported game and ROM version; the fallback can help with version mismatches but cannot supply missing files or BIOS images.

PS2 note: The experimental Play! browser emulator supports `.iso`, `.cso`, `.chd`, `.isz`, `.bin`, and `.elf` game images without a BIOS file. Game compatibility and performance vary, and larger images need enough browser memory. The bundled Play! runtime is under `public/emulators/ps2`, is sourced from [Play!](https://github.com/jpd002/Play-), and is distributed with its license.

Game Boy note: The bundled mGBA core supports `.gb`, `.gbc`, and `.gba` ROMs. The runtime files and mGBA license are in `public/emulators/retroarch`.

Controller note: Open `controller setup` in the right-side memory panel to see connected gamepads, remap keyboard keys or gamepad buttons for the selected emulator, and restore that emulator's defaults. Standard-layout Xbox 360 USB controllers use the preset mapping; other Gamepad API controllers can be remapped. The left stick and D-pad both control directions. Mapped keyboard and gamepad inputs are forwarded to the active player surface rather than activating browser controls. Custom mappings are saved in this browser.

Local file note: Use `load local file` above the memory panel to load a game from your device. Supported extensions follow the active emulator's catalog formats: Flash `.swf`; Game Boy `.gb`, `.gbc`, `.gba`; JS-DOS `.jsdos`; MAME `.zip`, `.7z`, `.chd`; NES `.nes`, `.fds`, `.unf`, `.unif`; PS2 `.iso`, `.cso`, `.chd`, `.isz`, `.bin`, `.elf`; and SEGA `.md`, `.gen`, `.smd`, `.bin`, `.sms`, `.gg`, `.sg`, `.cue`, `.iso`, `.chd`. Files are loaded in your browser and are not uploaded to the server or retained after the page is closed.

## Offline PWA

FlashBack Machine includes:

- `app/manifest.ts` for install metadata
- `public/icons/*` for install icons
- `public/sw.js` for offline caching
- Local Ruffle files in `public/ruffle`
- Local RetroArch cores in `public/emulators/retroarch`
- The mGBA core is cached with the other emulator runtimes for offline use

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
