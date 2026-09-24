# prelegal
A platform for drafting common legal agreements

**Status:** Work in progress — expected to be completed within 1 week (target: 2026-09-23).

https://nareshribabu.github.io/prelegal/

## Running locally

The app is packaged as a single Docker container (FastAPI backend serving
the statically built Next.js frontend), with a SQLite database that is
recreated from scratch on every start.

```bash
# Mac
scripts/start-mac.sh
scripts/stop-mac.sh

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```

Once running, the app is available at http://localhost:8000.
