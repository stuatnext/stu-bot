# stu-bot

## Before Four

A personal time app built around one constraint: the working day starts at **16:00 SGT**, so
all the discretionary time sits *before* it. The app treats that window as a real, finite
resource with a hard deadline, rather than as "free time".

Live prototype: `app/index.html` — a single self-contained file, no build step.
Open it in a browser or serve it with `npx serve app`.

### The model

A weekday is three named blocks, shaped by when the shift starts:

| Block | Default | Purpose |
|---|---|---|
| Warm-up | 08:00–10:30 | Movement, food, small stuff. Nothing that needs your best brain. |
| **Peak** | **10:30–14:30** | Sharpest hours, and the last before work. **One thing only.** |
| Runway | 14:30–16:00 | Land the plane. Food, reset, into the shift. |

Free days get a looser three-block shape (Morning / Afternoon / Evening) with the peak
carrying into the afternoon.

Everything you might spend time on is a **thing**, tagged with one of four categories —
Health, Craft, People, Life — plus how long it usually takes, how much brain it needs
(low / steady / deep), and a target of how many times a week it should happen. That target
is what makes neglect measurable.

### The five views

- **Today** — the day bar, the one thing claiming your Peak block, and each block's contents.
- **Now** — the anti-drift screen. Say how long you've got and how your head feels; it ranks
  what to do. Ranking weighs fit, energy match, and how overdue something is; inside the Peak
  block it promotes deep work and buries admin.
- **Week** — set the one thing for each day ahead, and see weekly targets vs. actuals.
- **Things** — the pool, plus the times that define your day shape.
- **Review** — the honest number: what share of your free window you actually claimed, where
  the hours went by category, and what's slipping.

### Storage

Prototype state lives in `localStorage` on the device, with JSON export/import in
**Things → Your data**. Export before clearing browser data. All reads and writes go
through the `STORE` object at the top of the script, so swapping in a backend is a
single-object change.

### Not yet built

- **Telegram bot.** The message content already exists — *Copy today's brief* on the Today
  screen generates exactly what the morning nudge will say. What's missing is the sender.
- **Calendar sync.** Blocks are currently derived from fixed times rather than read from a
  real calendar, so a meeting landing at 11:00 doesn't yet dent the Peak block.
- **Shared state across devices.** Follows from having a backend.
