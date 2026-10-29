# FlashBack Machine Game Library

Each emulator has its own folder and catalog file. Add game files to the matching folder, then add each filename to that folder's JSON catalog.

- Flash: `public/games/flash/flashlist.json`
- Game Boy: `public/games/gba/gbalist.json`
- Java ME (J2ME): `public/games/j2me/j2melist.json` (`.jar` files, run by FreeJ2ME on CheerpJ; needs an internet connection for the CheerpJ runtime, proxied via `/cheerpj`)
- JS DOS: `public/games/jsdos/jsdoslist.json`
- MAME: `public/games/mame/mamelist.json`
- NES: `public/games/nes/neslist.json`
- PlayStation 2: `public/games/ps2/ps2list.json`
- Sega: `public/games/sega/segalist.json`
- PC Engine/TurboGrafx-16: `public/games/pcengine/pcenginelist.json`

PlayStation 2 games use the experimental Play! browser emulator. See `public/games/ps2/README.md` for supported file formats and compatibility notes.

Game Boy, Game Boy Color, and Game Boy Advance games use the mGBA core. Add `.gb`, `.gbc`, or `.gba` ROMs to `public/games/gba` and list their exact filenames in `gbalist.json`.

PC Engine/TurboGrafx-16 games use the Mednafen PCE Fast core. Add `.pce` ROMs to `public/games/pcengine` and list their exact filenames in `pcenginelist.json`.

Alternatively, use the arcade's `load local file` control to open a supported game file from your device in the browser. Local files are not uploaded or added to these catalogs.
