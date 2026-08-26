# stu-bot

## Daylight

A day planner for a shift that is fixed to London and lived in Asia.

**Live:** https://stuatnext.github.io/stu-bot/ (once Pages is switched on — see below)
**The plan:** [`docs/plan.html`](docs/plan.html) — start here
**The business side:** [`docs/admin.html`](docs/admin.html) — structure, filings, insurance
**Design brief:** [`docs/design-brief.html`](docs/design-brief.html)

### Turning Up

`docs/plan.html` is the research and the plan, and it is the thing to read first. It is built on one
sentence: **"the biggest thing I've sustained is consistency with work. Waking up and turning up.
Everything else has faded away."** Two years of evidence that work sticks and self-directed goals do
not. So the design rule is that anything given the properties of work — a time you did not choose,
someone expecting you, a role, no daily decision — will hold, and anything that looks like a personal
goal will not.

It covers the work-pass question that gates the fallback plan, the arithmetic behind the October ask,
the walk (protected, not optimised), a sequenced plan with one anchor at a time, why cooking belongs
in the morning, and an ideas bank sorted by *when things happen* rather than what they are.

The correction it makes to everything below: **178 ideas is a decision you have to make every day,
and a habit tracker is a promise to yourself.** Neither looks like work, which is why neither held.

### One Client

`docs/admin.html` covers Strait Up Growth. The headline is not compliance, it is concentration: NEXT
pays the company, the company pays the salary, the salary holds the Employment Pass, and the pass is
the right to live here — four things hanging off one contract, with none of an employee's notice or
redundancy protection. **A second client is not a Plan B, it is what stops the visa depending on one
company's budget cycle.**

It also corrects two things: the pass is sponsored by his own company, so there is no secondary
employment restriction and client work needs nobody's consent; and October is a supplier
renegotiation rather than an HR request, so scope and rate belong in one document rather than being
split. Plus the filing calendar, the Skills Development Levy that one-person foreign-owned companies
routinely miss, three insurance gaps, and why the nominee directorship is sitting on a friend.

### The idea

Work runs 08:00–15:00 UTC. That is fixed to head office, not to where you are sitting, so the
same shift lands at a different local hour in every country:

| | Local work hours | Free morning | Evening |
|---|---|---|---|
| Dubai | 12:00–19:00 | 4h | 4h |
| Colombo, Delhi | 13:30–20:30 | 5.5h | 2.5h |
| Bangkok, Hanoi, Jakarta | 15:00–22:00 | 7h | 1h |
| **Singapore** | **16:00–23:00** | **8h** | **none** |
| Tokyo | 17:00–00:00 | 9h | none |
| Sydney | 18:00–01:00 | 10h | none |

Two lines describe the whole thing: **free morning equals your UTC offset, and evening equals
eight hours minus it.** Flying west trades one for the other, hour for hour. Set your basecamp in
the header and the day bar, the countdown and the suggestions all reshape around it.

### The bot is the point

An app you have to open is a promise you make to yourself, and those have not worked here. The bot
is the opposite: it reaches out, asks a question, and writes down whether you answered. **The record
is kept in this repository, not by you.**

It runs on GitHub Actions cron. No server, nothing to host, nothing to maintain.

| Time (SGT) | What it does |
|---|---|
| 08:30 | Names today's focus from the rotation and asks for your first action, in one line |
| 15:00 | Picks up replies, one hour before the shift |
| 22:00 | Asks whether the thing you named actually happened |

Replies come back through Telegram's `getUpdates`, so no webhook and no public endpoint. The first
substantive reply of the day becomes the day's commitment; a later "yes" or "no" closes it. Say
nothing and that is recorded as silence, which is the entire point — and the next morning it says
so, by name.

`bot/state.json` is committed after every run. On GitHub Pages that file is the same origin as the
app, so **the app reads it directly** and shows what you actually committed to and kept. You never
type any of it in.

**Setup, once.** Message `@BotFather` on Telegram to make a bot and get its token, then
`@userinfobot` for your chat id. Put both in **Settings → Secrets and variables → Actions** as
`TELEGRAM_TOKEN` and `TELEGRAM_CHAT_ID`. Then Actions → *Daylight bot* → *Run workflow* to test it.

Edit `bot/config.json` to change the weekday rotation or the habits it asks about. Preview any
message without sending it:

```
python3 bot/daylight.py --dry-run morning
```

### The four views

- **Today** — habits grouped by anchor, one suggestion sized to the hours actually left, and the
  week's guaranteed slots.
- **Ideas** — 178 of them across Singapore, the region, and things needing no travel. Filter by
  time available, whether it is raining, and whether someone else is coming. Roll for another.
- **Where** — every basecamp in range with its local working hours and a verdict.
- **Review** — routine held as a rolling share rather than a streak, so one bad morning costs a
  fraction; category balance against weekly targets; places been.

### Habits

Habits are anchored to moments that already happen rather than to clock times: **on waking**,
**mid-morning**, **before the shift**, **after the shift**. Those times are derived from your wake
time and when the shift lands locally, so they move with you when you change basecamp.

Each habit carries a **bad day version** — the two-minute one you can always manage. What keeps a
habit alive is doing the small one, not skipping.

Three deliberate choices:

- **No streaks.** Each habit shows fourteen days as squares plus a percentage. One miss costs a
  fourteenth, not the lot. Faint squares are days it did not apply.
- **Never miss twice.** The only alarm the app raises. Miss once and nothing happens — that is
  normal. Miss the next applicable day and it says so, by name, at the top of Today.
- **New habits do not nag.** Something you have never done is not "at risk", it is just new, so it
  stays quiet until you have actually started it.

### The coffee directory

Under **Ideas -> Coffee** there are two layers. The curated 47 entries carry notes and take part in
the suggestion roll. Below them sits the full directory: **608 coffee places** across 38 districts,
searchable by name, filterable by district, and sortable by distance from where you are. Each row
links out to Google Maps, and ticking one logs it.

The directory is deliberately kept out of the suggestion pool: 608 unannotated rows would swamp
every roll and there is nothing useful to say about most of them.

**Provenance.** Extracted from `destroyedbyBrian/SpatiaLynk_recommender`, a public Singapore
points-of-interest dataset of 5,452 places, filtered to the `cafe` category plus anything whose name
matches coffee, kopi, kopitiam, roaster, espresso and similar, then de-duplicated by name and
location. The upstream dataset does not state its own source, so treat it as best-effort: some
places will have closed, and there are no opening hours. Overpass, data.gov.sg and OneMap are all
better sources and all blocked from the environment this was built in - a clean OpenStreetMap pull
would be the right way to refresh it.

### Editing the ideas library

It is a plain array near the top of the script in `app/index.html`, marked `LIB_ROWS`. Each row is:

```js
["Title", "Where", hours, "category", "scope", "flags", "One line on why."]
```

`category` is one of `build`, `move`, `enjoy`, `discover`, `campaign`. `scope` is `sg`, `reg`
(the region) or `home`. `flags` is a string containing `i` for indoors — meaning it works in the
rain — and `p` for good with someone else. Regional trips use `10` hours for a day trip and `48`
for a weekend. Add a row and it appears immediately; no build step.

### GitHub Pages

The repository is already laid out for it: `index.html` at the root redirects to `app/`,
`.nojekyll` stops Jekyll processing, and `.github/workflows/pages.yml` deploys the root on every
push to `main`.

To switch it on: **Settings → Pages → Source → GitHub Actions**. Merge this branch to `main`
first, or point Pages at this branch directly under *Deploy from a branch* if you would rather not
merge yet.

> A note on that workflow file. The previous scheduling bot in `stuatnext/stu-time-bot` never ran
> a single time, because `.github/workflows` there is a *file* rather than a directory. Actions
> only reads YAML inside that folder, so nothing was ever registered. It was never abandoned.

### Storage

State lives in `localStorage` under `daylight.v2`, with export and import in **Review**. Export
before clearing browser data, and treat phone and laptop as separate copies. Everything goes
through the `STORE` object at the top of the script, so a backend is a single-object change.

### Not yet built

- **The Telegram check-in** — a morning message that asks what the first block is and expects a
  reply. The mechanic that actually works on you, and the main thing still missing.
- **Calendar awareness** — the day shape is derived from fixed times rather than read from
  Outlook, so a meeting landing at 11:00 does not yet dent the free window.
- **Shared state across devices**, which follows from having a backend.
