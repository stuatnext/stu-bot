# Daylight tests

Walks (one per feature) and a sweep across every tab, day, hour and phone size. They drive the real
app in headless Chromium with a fixed clock and a seeded save. Nothing here is part of the app.

```bash
cd tests && npm install
npm run walks              # PASS/FAIL lines per walk
node sweep.mjs 0 6 & ...   # shard the sweep: node sweep.mjs <shard> <of>
```

`CHROMIUM=/path/to/chrome` overrides the browser (defaults to `/opt/pw-browsers/chromium`).
