# stu-bot

## Daylight

A day planner for a shift that is fixed to London and lived in Asia.

**Live:** https://stuatnext.github.io/stu-bot/ (once Pages is switched on — see below)
**The plan:** [`docs/plan.html`](docs/plan.html) — start here
**The calendars:** [`cal/`](cal/) — subscribe once, in Apple Calendar
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

`docs/admin.html` covers Strait Up Growth, and it is no longer a housekeeping page. His partner is
Singaporean and he is here indefinitely — and Singapore recognises neither same-sex partnerships nor
same-sex marriages performed abroad, so there is no Dependant's Pass or LTVP through him. The chain
is: **NEXT's contract → the company → the salary → the Employment Pass → permission to live in the
same country as his partner.** Four links, one client, no floor.

So permanent residence is the item that changes the shape of his life rather than tidying it, and
the compliance work is really the evidence file for that application. The page also covers the
filing calendar, the Skills Development Levy that one-person foreign-owned companies routinely miss,
three insurance gaps, the nominee directorship sitting on a friend, and the UK side — non-resident
landlord status, why ISA contributions have to stop, the US estate-tax trap on US-domiciled ETFs,
and the fact that with no CPF and no auto-enrolment, nothing is saving for him at all any more.

### Three calendars

`cal/build.py` generates three subscribable `.ics` feeds, served from Pages, that Apple Calendar
subscribes to and refreshes on its own. This is the answer to the real problem with the app: **an app
you have to open is a promise to yourself, and those fade.** Apple Calendar is already open on his
phone and his partner's.

| Feed | Holds | Share with partner |
|---|---|---|
| **Anchors** | parkrun Sat 07:30, Mum Wed 14:30, text Kelvin | **Yes** |
| **The Year** | NEXTPredict, the October conversation, the visit window, the PR window | **Yes** |
| **Admin** | Filings, insurance, NRL1, NI, SDL monthly | No |

Times in Anchors are **floating** — no timezone — so 07:30 stays 07:30 in Sheffield. A routine that
survives travel is the whole point, given that travel is what has killed every previous one.

Subscribed calendars are read-only on the phone, which is a feature: these are things decided once,
so they stop being negotiable at eight in the morning. Regenerate with `python3 cal/build.py` and
every subscriber picks it up.

### The app

**Daylight** is bespoke to one situation: an expat on European hours, building a name in prediction
markets, running a Singapore company that holds his Employment Pass, and wanting to give something
back. The brief was *keep me accountable, help me plan, help me build a routine, help me make the
most of my time.*

Everything hangs off the one fact that shapes every day: **work is fixed to London, not to where he
is standing.** So the first thing on the screen is a bar showing where the shift falls today, which
reshapes when the basecamp changes — flying west trades morning for evening, hour for hour.

**Today** — the shift bar, yesterday's commitment and whether it happened, one line for today, the
four ingredients, and one place to go with the exact words to say when you get there.

**Next** — a countdown to the nearest milestone, then the six threads actually running (the October
ask, a second client, getting family here, knowing anyone here, something he owns, the admin), each
with exactly one next action. A thread with three next actions has none.

**Say** — the phrasebook. Kopi modifiers, hawker etiquette, three Hokkien phrases. Permanently one
tap away rather than something to learn, because there is a diagnosed short-term memory difficulty
in play.

**Log** — days named and kept, places been. No streak and no target: a record, so it is not being
held in his head.

Two deliberate refusals: **nothing can be failed** (no streaks, no chains, no resets) and **nothing
depends on remembering**.

A third was removed after he pushed back on it. The real barrier turned out to be *"I get scared of
ordering"* rather than not knowing where to go — so an earlier version graded places by nerve and
weighted half the suggestions toward ones that asked nothing of him. He said *"I'm not looking for
you to protect me. Being scared isn't a reason to not consider something,"* which was correct. The
grade is now a plain description of what kind of place it is — outdoors, counter service, hawker
stall — and the filter is a preference he sets rather than a ramp built for him.

State lives in `localStorage` under `daylight.v4`.

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
