# stu-bot

## Daylight

A day planner for a shift that is fixed to Malta and lived in Asia.

**Live:** https://stuatnext.github.io/stu-bot/ (once Pages is switched on — see below)
**The plan:** [`docs/plan.html`](docs/plan.html) — start here
**The October ask:** [`docs/proposal.html`](docs/proposal.html) — drafted, for the week of 27 Oct
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

**Daylight** is bespoke to one situation: an expat on European hours, running a Singapore company
that holds his Employment Pass, wanting a routine he can keep. The brief was *keep me accountable,
help me plan, help me build a routine, help me make the most of my time.*

Everything hangs off the fact that shapes every day: **work is fixed to head office in Malta, not to
where he is standing.** The shift is derived from Malta local time and the EU daylight-saving dates,
so it correctly becomes 17:00–midnight in Singapore from late October — a thing that happens to him
rather than something anyone decided.

**Today** — the shift bar with a live marker; today's **gap** inside the shift, which he declares,
because there are one-to-two-hour holes in his calendar and that is where a weekday routine can
actually live; **bedtime**, the keystone he named himself; **the three**; one line for the day; and
one place with the words to say when he gets there.

**The three** are his own priorities in his own order — **Trained, Family, Stopped** (finishing when
the shift finishes). Building a presence came fourth when he ranked them, so it is a thread in
**Next** rather than something measured daily.

**Next** — countdown, and the six threads running, each with exactly one next action.
**Trips** — the schedule to January and the UK day count against the Statutory Residence Test.
**Say** — the phrasebook. **Log** — the day record and the district collection.

#### It has to look like a game

He tried an earlier build and said it *"looks like a plain website"* — which it did. Rounded
rectangles with text in them are a webpage no matter what the text says.

So a card is now a card: portrait, framed in metal that darkens with rarity, a name banner across
the top, an art window, a text box at the foot, a rarity gem in the corner, and a patterned back.
Every face is drawn as inline SVG from a hash of the card's own name — one of eight backdrops
behind a per-set emblem, offset, rotated and scaled — so eleven hawker cards are eleven different
pictures rather than eleven identical bowls. Rare and gold cards carry a conic-gradient foil that
moves when you drag a finger across them.

Opening a pack takes over the screen. A foil sachet tears, the stage lights up behind it, and the
cards come one at a time face-down for you to turn over yourself. Turning one plays a synthesised
flip; a rare fires sparks, a shine sweep and an arpeggio. The score lands at the end, and a level-up
gets its own line. Sound is WebAudio generated at runtime — no files to load or go missing — and
mutes from the header.

The three pillars stopped being three panels with buttons inside them and became three tiles you tap
directly, with pips at the top showing how close today is to earning a pack. Rewards became a track:
a progress ring per tier, the real-life prize as the headline, and the trophies moved here from the
log so they sit beside the prizes rather than in a table.

Reduced motion turns all of it off and shows every card at once.

#### Cards, packs and progression

**90 cards across 11 sets.** Singapore is most of it — Hawker, Kopitiam, Singlish, Everyday,
Heritage, Green, Islands and Edges — but the deck deliberately reaches past it, because he is barely
in Singapore between September and Christmas. **Two Hours Out** is weekend range he can work from:
Batam, Bangkok, Penang, Yogyakarta, Luang Prabang. **The Road** is where this year actually takes
him: Valletta, Sofia, Hudson Yards, Sheffield, the red-eye. **Home** is the things you notice you
miss — and doubles as raw material for the nostalgia newsletter.

**Sets are the hook.** Rarity tiers are a list; sets give you something to be *one card from
finishing*, and the Cards screen leads with whichever that is. A completed set is worth 100.

**Ranks, not levels.** XP comes from cards held, full days, places visited and completed sets, and
the rank says something rather than being a number: *Just landed → Two months in → Finding your way →
Regular → Local-ish → Knows a guy → Gives directions → Been here years → Institution.*

**Two kinds of pack.** A full day earns a standard pack of three. Every seventh consecutive full day
earns a **streak pack** — five cards, better odds — so a streak feels different from a good day.
Counts are recomputed from the record rather than incremented, so they cannot drift, and pulls prefer
cards not yet held.

**Gold cards are never in packs.** Seven of them, claimed by hand, because they can only be earned by
happening: a hawker order with no phrasebook, a first Hokkien exchange with his partner's family, his
mum through the gate at Changi, the hours agreed, a second client signed, the first thing he
publishes that is his, and a thirty-day streak.

**Rewards** are real treats at 7, 30 and 90 day streaks, written by him. The app only decides when
they are earned, because a treat granted on a Tuesday is not a reward.

#### On streaks

An earlier version refused streaks on principle. He asked for them, with *"rewards and collectibles
so that it's genuinely gamified"*, and that was his call to make rather than mine.

So each pillar carries its own streak, plus **two freezes a month**: a missed day spends a freeze and
the run survives, rather than a single bad night wiping three weeks. Streaks only count from the
first day a pillar was ever recorded, so the period before he started using the app is not treated as
a wall of failures. Badges unlock on totals, and the collection is Singapore's districts — most of
which he has never visited.

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
