# FlashBack Machine Game Library

Each emulator has its own folder and catalog file. Add game files to the matching folder, then add each filename to that folder's JSON catalog.

- Flash: `public/games/flash/flashlist.json`
- Game Boy: `public/games/gba/gbalist.json`
- JS DOS: `public/games/jsdos/jsdoslist.json`
- MAME: `public/games/mame/mamelist.json`
- NES: `public/games/nes/neslist.json`
- PlayStation 2: `public/games/ps2/ps2list.json`
- Sega: `public/games/sega/segalist.json`

PlayStation 2 games use the experimental Play! browser emulator. See `public/games/ps2/README.md` for supported file formats and compatibility notes.

Game Boy, Game Boy Color, and Game Boy Advance games use the mGBA core. Add `.gb`, `.gbc`, or `.gba` ROMs to `public/games/gba` and list their exact filenames in `gbalist.json`.
