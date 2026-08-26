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

**Daylight** is one place a day, and the exact words to say when you get there.

It used to be a day planner with 178 ideas and a directory of 608 cafes. That was wrong, and the
reason it was wrong only became clear late: *"I get really nervous going to a new place because I get
scared of ordering."* A directory answers **where**. The actual barrier is **what to say at the
counter** — which is why 608 cafes went unused.

So the app was rebuilt around that. One suggestion per day, never a list. Each place carries a
script, and the script is set in the largest type on the page, because it gets read one-handed while
standing in a queue.

Every place has a **nerve level**:

| | What it means |
|---|---|
| **Nothing to order** | Parks, trails, temples, museums. No transaction, no talking. |
| **Order in English** | A counter, a menu, a normal sentence. |
| **Hawker stall** | Local codes help, and the phrasebook is one tap away. |

A **Something easier** button drops the whole app to the first level on a bad day, and any hawker
suggestion carries the escape hatch: *point and hold up one finger — that is what half the queue is
doing.*

**Phrasebook** is permanently one tap away rather than something to learn, because there is a
diagnosed short-term memory difficulty in play and remembering the kopi grid is not the job. It
covers the kopi modifiers, hawker etiquette — chope with a tissue packet, return your tray, go at
14:00 not 12:30 — and three Hokkien phrases worth having at a Singaporean family table.

**Anchors** holds the two fixed points: parkrun on Saturday at 07:30, and the Wednesday 14:30 call
home. **Been** is a list that gets longer. No streaks, no targets, nothing to break.

State lives in `localStorage` under `daylight.v3`.

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
