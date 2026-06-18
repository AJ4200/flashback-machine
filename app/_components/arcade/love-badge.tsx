export function LoveBadge() {
  return (
    <footer className="arcade-footer" aria-label="RetroNet credits and storage details">
      <div className="love-badge">
        <span className="pixel-heart" aria-hidden="true" />
        <span>made with love by</span>
        <a className="github-link" href="https://github.com/aj4200" target="_blank" rel="noreferrer">
          <span className="github-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.36 6.84 9.72.5.09.68-.22.68-.49v-1.72c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 7.01c.85 0 1.7.12 2.5.34 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.95.68 1.92v2.85c0 .27.18.59.69.49A10.17 10.17 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z" />
            </svg>
          </span>
          <span>aj4200</span>
        </a>
      </div>

      <details className="footer-details">
        <summary>storage / offline notes</summary>
        <div className="footer-detail-grid">
          <section>
            <strong>install</strong>
            <p>Adds RetroNet to your device as an app shell. It keeps the arcade launch experience available from your home screen or app list.</p>
          </section>
          <section>
            <strong>cache</strong>
            <p>Stores the app shell, icons, Ruffle runtime, game catalog, and any cached SWF files in browser cache storage for offline play.</p>
          </section>
          <section>
            <strong>saves</strong>
            <p>Game progress uses browser storage when a SWF supports it. RetroNet slots copy that Flash save data, not the live emulator RAM state.</p>
          </section>
        </div>
      </details>
    </footer>
  );
}
