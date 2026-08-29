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

#### It has to feel like a game

He tried an earlier build and said it *"looks like a plain website"*, so the collectible half was
built properly: a card is a card — portrait, framed in metal that darkens with rarity, a name banner,
an art window, a text box at the foot, a rarity gem and a patterned back. Every face is inline SVG
drawn from a hash of the card's own name. Rare and gold carry a conic-gradient foil that moves when
you drag a finger across them. Opening a pack takes over the screen: a foil sachet tears, the stage
lights up behind it, and the cards come one at a time face-down for you to turn over yourself.
Sound is WebAudio generated at runtime — no files to load or go missing.

He looked at that and said: **"make this feel like a real game. Like a real mobile game."**

Which was fair, because the pack stage was the only screen that did. Everything around it was still
a 620-pixel document column on a light ground, with a magazine kicker and a headline at the top,
forty identical bordered paragraphs down the page, and — loudest of all — five `window.prompt()`
dialogs and a `confirm()` doing the work of a settings screen. The assets were a game. The shell was
a webpage with a game parked on one tab.

So v5 is the shell.

**Night is the default.** Not a dark theme: the only theme, with light left in as a legibility escape
hatch. A game is a lit object in a dark room.

**A HUD that never leaves.** Rank, the XP bar, the pot and the spares sit above every screen, on
every tab. Currency furniture that stays put is most of what separates a client from a document —
the app becomes a place you are in rather than a page you are reading. It is tappable: the crest
goes to the deck, the coin goes to the pot.

**A claim you can see from the door.** Today opens on a gold slab that says how many packs are
waiting and what one of them could finish, then three tiles, and nothing else above the fold. The
strapline, the page title and the paragraph about Malta are below them now.

**The reward falls out of the thing you touched.** Tapping the third pillar used to re-render the
page and show a green snackbar, and then you had to navigate to another tab to collect. Now the
tile stamps under your thumb, the pot value flies from it to the HUD chip, and a full-screen
celebration fires. It still does not open the pack for you — nothing here acts on your behalf.

**No browser dialogs.** The rate, the bedtime, the reward names, the spend log, the basecamp, the
reset and the trophy claims all go through one in-app bottom sheet with a promise-based API. A
native `prompt()` renders in whatever the browser feels like and says *web page* louder than
anything else on the screen.

**Everything is drawn.** The bottom bar has real SVG icons with a badge that counts the packs
waiting, not five unicode dingbats. Buttons have physics — a three-pixel lower edge that collapses
when pressed. Screens fade and lift rather than swapping innerHTML, and re-drawing the screen you
are already on no longer throws you back to the top of it.

**The typeface is on the device.** Bricolage Grotesque, Instrument Sans and JetBrains Mono are
self-hosted in `app/fonts/` (regenerate with `node scripts/fetch-fonts.mjs`), so the game keeps its
face on a plane and opening it tells Google nothing. `app/sw.js` caches the shell, so it installs to
the home screen and still opens with no signal.

Reduced motion turns all of it off — no confetti, no transitions, no card flip — and every card is
face up.

#### And then the home screen was still too long

First pass got the top of Today right — claim slab, three tiles — and then let it become a document
again underneath: a freeze explainer with five dots and two paragraphs, a panel about Malta's hours,
the rationale for bedtime, a full write-up of the place of the day with its own four buttons. Two
thousand one hundred and eighty pixels. He looked at it and asked why it was not simple to digest and
start playing, which was the right question.

So: **anything that is a thing you do is a row you tap. Anything that is a reason is behind it.**

The board is now the claim slab, the three, bedtime as one row, the shift bar, three chips
(freezes, today's gap, where you are standing), two rows for the day's one line and the place of the
day, and the ladder. Every one of them opens a sheet carrying the prose that used to be stacked on
the screen — not a word of it was cut, it just stopped being the first thing you have to read.
**1,224 pixels.** Bedtime is violet rather than green, because it is the keystone but it is not one
of the three and it should not look like it earns the pack.

#### And then the shape was wrong, not the paint

Three rounds of making the rows nicer, and it still read as a settings screen —
because it was one. Every element on Today was the same object: `[icon] [title]
[sentence] [value]`, stacked seven deep. Restyling a list does not turn it into a
game, and two of those rows carried a full sentence of description.

So the fourth pass changed the shape.

**One hero.** The day is a single object: three arc segments around a prize, with
the count in the middle. It is the progress bar, the goal and the claim button
at once, and when a pack is waiting the centre turns gold, breathes, and *is* the
button. A pillar that is carried rather than earned — Stopped, at the weekend —
ghosts its segment in rather than lighting it, so the ring never looks like the
app handed him a third of the day.

**Three objects, not three rows.** The pillars are big discs in a row: icon,
one-word label, streak. No descriptions. The definitions appear once, as a single
line, until the first day is ever recorded, and then never again.

**One strip.** Bed, freezes, the gap and where he is standing are four chips with
one number each.

**Everything else is below the fold or behind a tap.** The place of the day and
the day's one line are two rows under *Also today*; the shift bar is eight pixels
tall with no words on it and the whole Malta explanation sits in the sheet behind
it.

Today went from 2,180px of stacked rows to **1,077px** with a hero you can read in
half a second.

#### The collection stopped being a filing cabinet

The Cards tab used to be one column of all seventeen sets: **16,856 pixels** of mostly identical
face-down backs, with no filter and nothing sticky. It is now one set at a time behind a rail that
stays on screen, with a progress ring per set, an All / Missing / Held filter, and a count you can
read at a glance. Same content, 1,651 pixels.

And a card he does not hold is now shown as **its own face, drained of colour** — never as a back.
He has to be able to see what he is missing and what it would take. Tapping one used to answer
"what is this card?" with a face-down back captioned *not found yet*, which is the one place that
question ever gets asked.

Each art window also takes a hue from the card's own name, so the frame still tells you the rarity
and the picture now tells you which card it is. Eleven hawker cards were eleven grey bowls with
slightly different backdrops; they are eleven different cards now.

#### Spares

Seventy-two per cent of everything he will ever pull is a card he already holds. That was worth
nothing, which meant most packs paid out nothing and there was no reason to open the app on a day
with none waiting.

Now a duplicate is worth **spares** — 4 for a common, 10 an uncommon, 25 a rare — and spares make a
card he is missing, at 30, 70 or 160. He picks the card; nothing is chosen for him.

They are deliberately **not money**. They never appear on the Pot screen, nothing converts between
the two, and they cannot buy a pack: a pack is what the three pillars earned or it is not a pack.
The pot is real dollars at a rate he set, and the moment anything converts into it the app is back
to deciding what his consistency is worth. Like the pack counts, spares are recomputed from the
record rather than incremented, so the number cannot drift.

#### The weekend was breaking a streak it had no right to

"Stopped" means finishing when the shift finishes. There is no Malta shift on a Saturday, so it
could not be ticked honestly — and the streak walker counted every Saturday and Sunday as a miss,
quietly eating his freezes two at a time.

A pillar is now only owed on a day it is possible to do. Stopped is carried at the weekend, Trained
and Family still count every day (parkrun is Saturday 07:30 and keeps its teeth), and a weekend with
a run and a call home is a full day. This is the same rule his Mandarin study already runs on:
weekdays only, the weekend absorbed rather than counted as a failure. It only ever adds days —
nothing already earned can go down — so the first open after this lands with a pile of packs.

#### The pot

His idea, and better than the one I offered. XP is a score you cannot do anything with; the pot is
real money. Every full day is worth a rate **he sets**, because a rate the app picked would be the
app deciding what his consistency is worth. Everything else scales off it — a seven-day run pays
double, a finished set triple, a trophy five times. It accumulates with no cap and no expiry, and he
logs what he spends so the number stays true.

At the default five dollars a day, a perfect run to the end of the deck is about **$1,125**. That is
a flight home, which is the thing money is actually for here.

#### Cards, packs and progression

**188 cards across 18 sets.** Singapore is most of it — Hawker, Kopitiam, Singlish, Everyday,
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

**Mandarin is thirty real words.** He is learning it — 36 sessions logged, a best streak of nine,
and a vocabulary bank of thirty words with characters, pinyin, HSK levels and his own mnemonics. The
set is that bank, not an invention: the character fills the art window, the pinyin is the card's
name, the HSK level *is* the rarity, and the line drawn under each character is its tone, because
his study log records the tone pairs he keeps dropping. It is the only decoration in the deck that
is also the lesson. It opens at seven full days. Hokkien stays a trophy rather than a set, because
it only happens by happening, with people.

**Gold cards are never in packs.** Seven of them, claimed by hand, because they can only be earned by
happening: a hawker order with no phrasebook, a first Hokkien exchange with his partner's family, his
mum through the gate at Changi, the hours agreed, a second client signed, the first thing he
publishes that is his, and a thirty-day streak.

**Rewards** are real treats at 7, 30 and 90 day streaks, written by him. The app only decides when
they are earned, because a treat granted on a Tuesday is not a reward.

#### Why the deck kept growing

The first version ran out. Simulated at perfect play — all three pillars, every day — the 90-card
deck was **complete on day 31**. Every pack after that was pure duplicates, and the collection died
at exactly the point the habit would have been forming.

So there is a second season: six more sets — Coffee, Deep Cuts, Sheffield and Before, The
Newsletter, Straight Up Growth, The Industry — and then Mandarin, for 188 cards across
18 sets. They are **locked**,
and shown as doors rather than hidden, because a door you can see is a different reason to come back
than a gap you can fill.

They open on **full days, not on rank**. Gating them on rank was circular: cards give XP, XP opens
sets, sets give cards, and every door opened inside a month. Days are immune to that, they are
legible on the door itself, and consistency is the thing that should be buying this. The gates are
7, 14, 30, 50, 75, 105 and 140 full days, which puts completion comfortably past a year in practice.

Ranks were recalibrated too. The whole deck plus a year of full days is worth about 12,750 XP; the
old top rank sat at 5,200, so the last title arrived long before the last card.

#### The year, written down

He has an SpLD around short-term memory and said so plainly. A year is exactly the span he will not
be able to reconstruct in December — so the app writes it down all the way through and hands it back
in one piece: full days, longest run, cards, sets, trophies, what the pot bought, where he went, and
every line he typed into "one thing today". Those lines are the only part he cannot get anywhere
else. It unlocks on 1 December.

#### On streaks

An earlier version refused streaks on principle. He asked for them, with *"rewards and collectibles
so that it's genuinely gamified"*, and that was his call to make rather than mine.

So each pillar carries its own streak, plus **five freezes a month, spent by hand**. The first
version spent them automatically the moment the streak walker found a gap — which meant they were
gone before he knew a day had gone wrong, and a safety net you cannot feel is not a safety net. Now
nothing is spent unless he presses the button, a frozen day is a decision with a date on it, and the
pips show what is left without arithmetic. A frozen day carries the run across without counting
toward it, and earns no pack and no money — the run survives, but a day he did not do is not a day
he did. Streaks only count from the
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

State lives in `localStorage` under `daylight.v4` — the key did not change for v5, because every
field the old app wrote still means the same thing and the new ones default empty. An existing save
opens straight into the new shell with its days, cards, pot and freezes intact.

Export before clearing browser data, and treat phone and laptop as separate copies. Everything goes
through `load()` and `save()` at the top of the script, so a backend is a two-function change.

### Not yet built

- **The Telegram check-in** — a morning message that asks what the first block is and expects a
  reply. The mechanic that actually works on you, and the main thing still missing.
- **Calendar awareness** — the day shape is derived from fixed times rather than read from
  Outlook, so a meeting landing at 11:00 does not yet dent the free window.
- **Shared state across devices**, which follows from having a backend.
