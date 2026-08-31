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

#### The app had no front door

Four passes at making Today look like a game, and it still opened badly — because
every one of them was designed for somebody who already knew what the app was.
A person seeing it for the first time got a loaded HUD, two currencies reading
zero, a ring claiming 1/3 with nothing done, and a line about Mandarin opening in
seven days. Roughly twenty-five pieces of information before they had touched
anything.

Real games never cold-open like that. They show a title, hand you *one* action,
pay you immediately, and only then reveal the rest.

**The gate.** A title screen: the mark, the name, and one sentence — *a day fixed
to Malta, lived in Singapore.* Shown once, ever.

**The tutorial board.** The first session is a dial, one question and three
buttons. No chips, no Also today, no ladder, no currencies. It lasts until he has
done the loop once *and been paid for it* — the world arrives when the first pack
closes, not on his first tap.

**Nothing appears until it means something.** The pot chip is hidden until there
is money in it, spares until a card has been pulled twice, the XP figure until
there is XP, the ladder until three full days. The board grows as he does.

An existing save skips all of it: any save with days in it is treated as already
onboarded.

#### The dial (since unrolled into the sky)

For two versions the hero was a 24-hour dial — Malta's shift shaded onto the
rim, the three on an inner ring, the payout in the middle, the sun as the
hand. It was the right idea drawn as the wrong object: a circular widget
parked on top of a sky that was already there. The teardown (below) unrolled
it — the arc across the sky *is* the clock now, and the payout is the gem.

#### "There's still no tutorial"

There was one. He could not reach it, and that is the same thing.

The first-run flow was gated on `S.onboarded`, and any save with days in it was
migrated straight past it — his has months. The replay lived at the very bottom
of More, under forty rows of history, four thousand pixels down a screen nobody
scrolls. Built, shipped, unreachable.

So the tutorial is now a proper **coach mark**: the board dims, one control is
cut out of the dark with a gold ring around it, and one sentence sits beside it
in its own card. Three steps — tap a pillar, finish the day, open the pack —
with progress pips and a way out on every one. A tap anywhere lands on the
highlighted control, which is more forgiving than making him hit it exactly.

It runs in two modes off the same three steps. On a **first run** each step
waits for the thing to actually be done before it moves on, so it cannot get
ahead of him. A **replay** from More is a tour: every step is shown in order, a
tap advances it, and nothing is ticked on his behalf. That distinction is the
whole fix — the condition-driven version, replayed on a board where the pillars
are already ticked, skipped its first two steps and opened on *"That is a
pack."*

And **"How this works" is now the first row of More**, not the last.

#### "It's not beautiful at all"

Every screenshot he sent was taken between 21:00 and 00:30, at which point the
app was two greys and a card. The thing is called *Daylight*.

**The sky is the time of day.** Seven phases — deep night, dawn, morning, day,
golden hour, dusk, night — set on load and re-checked every minute. Each is
three layers stacked the way a sky actually stacks: a band of light sitting on
the horizon, a wash coming down from the zenith, and the body of the sky between
them, with a fine grain over the top. The first attempt centred the horizon a
screen and a bit below the bottom edge, so golden hour arrived as a brown
rectangle; it sits just above the nav bar now and the palettes are pushed hard
enough that the seven are unmistakably different rooms. Every panel is glass
over it rather than a solid fill, so the hour reads through the whole app.

**The three have their own colours.** Resting, they were three identical grey
slabs, which reads as three disabled controls — the single loudest reason the
board looked dead in a screenshot. Trained is blue, Family is rose, Stopped is
gold. Done is still jade whichever one it is, so the state language does not
move.

#### Three screens that were still documents

Today was a game. Pot, Threads and More were a spreadsheet, an essay and a log
file, and between them they were most of *"overwhelming with information."*

**Pot** was a five-row ledger with a total. It is a vault now: the number, then
one bar showing where the money came from with four keys under it, then the
spending as receipts. 2,384px → 1,600px, and *"1 seven-day runs"* and *"1
trophies"* got their grammar back.

**Threads** was six paragraphs stacked in a column — three thousand pixels of
reading before you found a button. It is a quest log: a countdown at the top, a
segmented bar showing how many are cleared, then one card per thread where the
**next action is the loud line** and the reasoning is folded behind *"Why this
one."* 2,962px → 2,153px.

**More** was 4,113px of history with the settings at the bottom. The list of
things you can actually do is at the top now, as a proper settings list with
icons and chevrons; the last ten days show, the rest fold away. 4,113px →
2,255px.

#### The front door was a document

After all of that, opening `stuatnext.github.io/stu-bot/` still landed on a
landing page — cards, prose, a link to the app somewhere in the middle. Every
judgment of "does this feel like a game" started on a page that wasn't one.

The root redirects straight into the game now. What the landing page linked —
the calendars, the plan, the paperwork — is a menu group in More, and the
October draft was already in Threads. The files themselves stay where they
were (`docs/`, `cal/`), so nothing shared or bookmarked breaks.

Two more things a game does that this didn't:

**A title card on every launch.** The boot screen was a spinner, which says
"website loading". It is the title now — the sun mark over the sky the app is
about to open onto, the wordmark, the one line — held for a beat and dissolved.
The spinner is gone.

**A place, not a gradient.** Singapore stands on the horizon behind every
screen — the Esplanade domes, the CBD, Marina Bay Sands, the Flyer, the
supertrees — drawn as one inline-SVG silhouette, tinted by the same sky
variables as everything else, standing on top of the tab bar. Stars come out
through dusk, night and deep night, three of them twinkling (none under
reduced motion). The browser chrome follows too: `theme-color` is re-set to
the sky's own base colour every minute, so even Safari's frame is part of the
scene.

#### v15: it reaches out, and it remembers

Three asks: a real game lives on the home screen and interrupts you; a bad
month should be *remembered*, not reset, "so we can learn from it"; and the
game should produce "something to download and give back to Claude to keep
optimising."

**The nudge.** You → *Put it on your Home Screen* (native prompt where the
browser offers one, instruction sheet on iOS — where installing is also what
unlocks push). Then *The evening nudge*: the phone mints a push subscription
against the VAPID public key in `data.js`, copies it to the clipboard, and
one paste into the repo secret `PUSH_SUBSCRIPTION` arms the scheduler —
`.github/workflows/nudge.yml`, a cron at 14:15 UTC (22:15 Singapore, no DST
to chase). The payload is deliberately dumb; the words are written on the
device: the app mirrors today's shape into a cache the service worker can
read, so the notification says "Family and Stopped are still open. 12 days
on the line." — or, if the day is already in, says so and asks nothing. The
sender (`scripts/send-push.mjs`) no-ops until the secrets exist and never
learns anything about the day.

**The months shelf.** Nothing resets and nothing is deleted. Every month
derives its ledger from the record at render time — full days, the best run
held (carried across month boundaries), misses split pillar × weekday, and
one computed lesson line ("Family broke 2 times — 2 of them on Thursdays").
On the 1st, the closed month is held up once on Today ("August, filed."),
then lives permanently in You. A day still being played is never counted as
broken.

**The coach file.** You → *Send the record to Claude* writes
`daylight-coach-<date>.md`: instructions at the top, one JSON block below —
the full save plus derived analytics (month ledgers, quest completion,
lived cards, chip rewards). Hand it to any Claude session and the file
tells it what to do: find the pattern, judge the mechanics against the
data, propose the smallest tuning. The contract lives in `docs/coaching.md`
— tune, don't redesign; the record is never rewritten; the file never gets
committed.

Also fixed: the service-worker precache had missed the Nunito files since
v12, so offline fell back off the app's own typeface.

#### v14: the game starts giving orders

His list, all four of it: make the app time-aware with real tips; make the
cards *useful* — "a tip or an action or a challenge"; milestone ceremonies
"like those alcoholics anonymous things", with bigger rewards beyond 90
days; and protect the record.

**The hour points at a row.** `nextUp()` reads the clock against the Malta
shift — train before it wakes, family in the Sheffield-friendly window, stop
when it closes — and that row wears a NOW pill and speaks an actual tip
("About 07:00 in Sheffield right now - a good window") instead of its
static gloss. Tips rotate by day hash so two mornings never repeat.

**Every card now asks something.** One held card a day becomes the side
quest under the chest — a dashed card with a doable line built from the
card itself ("Return the tray, and one that is not yours"), one swap a day,
and *Did it* pays +10 spares, +20 XP and marks the card **lived**: a gold
tick on its face and its ask pinned to its sheet forever. ~20 cards carry
hand-written challenges; the rest build theirs from their set's template.

**Chips.** The AA medallion, taken seriously: 1 day white, 7 bronze,
30 silver, 90 gold, 180 emerald, 365 diamond — minted by the longest run
ever held and never taken back. Crossing a threshold live replaces the
daily fanfare with a full-screen ceremony (dark room, one coin, confetti);
chips already earned before v14 are backfilled quietly, and day one's chip
stays quiet during the tutorial so the first pack remains the lesson. The
case lives in You, and every chip carries a reward he names himself —
a chip without a treat is a badge, and badges stop working.

**The record survives the phone.** Back up = one tap in You (share sheet
on iOS, download elsewhere, clipboard as the last door); restore = paste
the file back, double-confirmed with the day count shown. Once the record
holds a week and hasn't been saved out for a month, You opens with a
banner saying exactly how many days live only on this phone.

#### v13: cards that explain themselves

Happy with v12, he asked the two questions the cards had never answered:
what do they do, and why are they ugly. Both were the product's fault.

**What they do is now on the screen.** A dismissible card at the top of the
Cards tab says it once, plainly: souvenirs of the Singapore year that do
nothing except get collected - full days earn packs, duplicates melt into
spares, spares craft missing cards, finished sets pay the pot - with the two
exceptions named (Mandarin is real vocabulary; Trophies are claimed, never
pulled).

**The faces stopped being generated squiggles.** All 158 non-Mandarin cards
now wear one big glyph from the platform's own emoji set - drawn by
professionals, familiar at a glance, zero bytes shipped - over the tint
hashed from the card's name: the crab on Chilli crab, the phone on A
Wednesday call, the pot on Bak kut teh. Mandarin keeps the character as its
face with the tone underneath, because there the face is the lesson. Rarity
frames, foil, spares and crafting untouched.

#### v12: his brief, at last

Thirteen rounds in, he was asked instead of guessed at. His answers, in his
own words: *"like a training app - a consistency training app - probably a
little like Duolingo"*; keep *"definitely the unlockables and the money
pot"*; the cards, the pot and the history are sacred; and it is allowed to
get as heavy as it needs.

So v12 is a consistency-training app in the Duolingo school. Clean light
ground, white cards with soft borders, Nunito (one variable file) heavy and
rounded on everything interactive, and buttons with a hard bottom edge that
physically collapses under the thumb. The stat bar carries the **streak
flame** (consecutive full days, frozen days carrying), the pot and the
spares. Today is the daily session: a greeting, **the sky card** (Daylight's
hour-driven soul, demoted from world to watch face - mini arc, sun or moon
at now, Malta's band), **the week strip** (seven days: green tick, ice, or
hollow), the **three things as big pressable quest rows** with their
definitions and per-pillar flames, and **the pack card** with a progress bar
that becomes the gold open-me button when the day lands. Full days now end
in real canvas confetti.

The world experiment (buddy, phone booth, hills) lasted one round; it was a
guess, and the owner's answer was better. Cards and You restyled to match;
the coach and every mechanic untouched; build stamped v12.

#### v11: a world, and someone living in it

With delivery fixed, the deeper verdict still stood: every version had been
the same five nouns rearranged - sun-on-arc, a pack box, three labelled
circles, a skyline, a dock. Recoloured, recomposed, still the same
furniture. What separates an app with game styling from a game is that a
game has a world with someone in it.

**The buddy.** A small round fellow in a coral tee and a sun cap. He
breathes while he waits, hops along the path to whichever place is tapped
(the state saves first; the walk is presentation), and cheers with his arms
up when the day lands. The speech bubble is his now - the app stops
narrating and the character talks.

**Places, not circles.** Trained is a blue-awning gym kiosk, Family is a
rose phone booth, Stopped is the office - whose windows go dark when he has
actually stopped. Done pops a jade tick over the building; a no-shift day
greys the office out.

**Ground and weather.** Rolling hill bands the path winds through, tinted
by the hour - green under a blue sky, dusky at golden hour, near-ink at
night; outlined clouds drift while the sky is light; the chest sits on a
grass knoll. The city and the stars stay.

#### v10: the round where nothing was redesigned

He reviewed v8 and said only the colours changed; he reviewed v9 and called
it mild layout changes - while the builds on `main` were unrecognisable from
one another. The explanation was not taste. `sw.js` carries the comment
"Bump VERSION with every release" and it read `daylight-v7` through both
redesigns: his browser's service worker served CSS and JS cache-first by
URL, the URLs never changed, `sw.js` itself never changed, so **his phone
kept rendering the three-round-old build while being told it was new work.**

So v10 ships no design at all. It ships delivery:

- the service worker is **network-first for everything** (the cache exists
  so the game opens on a plane, not to save requests - one player, tiny
  files, freshness wins);
- every asset URL carries a **`?v=` build stamp**, so even a stale
  cache-first worker misses its cache on the very next page load;
- the **build number is painted on the title card** (bottom-right) and at
  the foot of You - what the phone is running is now visible, to him and
  to whoever ships the next round.

The rule for every future release: bump `VERSION` in `sw.js`, bump the
`?v=` stamp, bump `BUILD` in `app.js`. Three places, one number.

#### v9: the layout restarts too

v8 changed the paint and kept the body: header bar, arc, centred thing,
headline, three-in-a-row, tab bar. A centred column is web grammar however
it is coloured. Mobile-game grammar is a world with UI in the corners and a
journey through the middle - so the column is gone.

**The day is a saga map.** A dotted trail winds up the screen through the
three things as zigzag stops - each a big colour disc with its name and its
definition on a plate under it - from where he starts at the bottom to the
chest at the top by the city. Cleared stops turn green behind him. A red
"you are here" pin bobs on the next stop, and the day's one line is a
speech bubble above the pin, not a headline floating in space. When the
three are cleared the pin reaches the chest and the chest goes gold,
wiggles, and says so on its own tag.

**UI in the corners.** The level crest sits top-left, the currency pills
top-right; the full-width header bar and the XP strip are deleted (the XP
ring lives on the crest, the rank name in You). The dock stays.

**The entrance is staged along the path**: the trail fades in, the stops
pop bottom-to-top, the chest lands, the pin and bubble arrive last, and
none of it replays on a mid-play re-render or under reduced motion.

#### v8: the picture restarts

v7 rebuilt the code from scratch and he said, correctly, that it looked
exactly the same - because it did: the CSS was ported, and a redesign you
cannot see in a screenshot is not a redesign. Ten rounds of dark, moody and
glassy had been iterated, never questioned.

v8 questions it. The register flips to **sticker-bright**: vivid flat skies
that still follow the actual hour - a real blue day, a hot pink dawn, a
proper indigo night with stars - with every surface a cream card carrying a
thick ink outline and a hard shadow. Buttons are chunky and physically
pressable; the three pillars are full-colour discs with white icons; the
day's pack is a gold sticker that wiggles when it is ready; the sun is flat,
bold and outlined; the dock is a cream slab with a sunny active pill. No
glass, no grain, no grey-on-grey anywhere.

Two colour systems keep it legible at every hour: the sky variables flip per
phase (including the colour of anything written directly on the sky), while
the cream card system is fixed, so the UI pops identically at noon and at
midnight. The dark-mode/light-mode toggle is gone - the hour is the theme.
The pack-opening stage keeps its dark room on purpose: a ceremony wants a
spotlight.

#### v7: delete everything and start again

He looked at Today's book and the one-thing sheet and said: *confusing, not
useful, not built as a real mobile game — delete everything and start again,
build each element and animation an individual beautiful file.* All three
orders are carried out in v7.

**Deleted.** The five-tab planner is gone. Threads, Trips, the Phrasebook,
the Recap, the book, gaps, bedtime, kept-promises, the place of the day,
badges, rewards — every surface written in riddles is out of the game. The
save is untouched (same key, same fields, a nine-generation-old save opens
with its days, cards, pot and freezes intact), and the paper lives on at
`docs/` and `cal/`, linked from inside the game.

**Three screens.** *Today* — the scene: the sky arc, the gem, three ability
buttons that carry their own definitions. *Cards* — the collection, the
packs, the doors, the ladder. *You* — rank, the pot, the three streaks with
their freezes, and the switches. Every string on all three passes the
stranger test.

**Individual files.** The single 4,500-line `index.html` is gone. The game
is now `app/css/*` and `app/js/*` — one concern per file, each readable on
its own, loaded in dependency order, still buildless: what is in the folder
is what runs. `data.js` says what exists; `state.js` is every rule;
`scene.js`, `collection.js`, `you.js` are the screens; `fx.js` is everything
the player feels; `sky.js` is the hour; `coach.js` is the tutorial;
`app.js` is wiring.

**Choreography.** Arriving on Today stages its entrance — the arc draws
itself, the sun blooms, the gem drops, the orbs rise one after another. A
pillar landing bursts in its own colour; the third is the full ceremony.
Re-renders mid-play never replay the entrance, and reduced motion skips all
of it.

#### The teardown: Today became a scene

He asked for a redesign from scratch three times, and got increments three
times — each round rebuilt the worst screen, which quietly rebuilt most of
the app, but the play screen kept its webpage bones: a header bar, a widget,
a headline, buttons, then more page below the fold. A real mobile game's home
screen is a scene you stand in, not a column you read down. So the column is
gone:

**One viewport, no scrolling.** Today is exactly the height of the screen.
The sky fills it, the city stands on the horizon, and nothing is below the
fold because there is no fold.

**The sky is the instrument.** The dial is gone; its outer ring is unrolled
across the sky — one arc from midnight to midnight with noon at the apex,
Malta's shift drawn along it as the bright band, and the sun (the moon, once
it is down) riding it at *now*. A widget parked on the world was still a
widget. The world tells you the state.

**The gem.** What the day pays floats in the middle: three pips, one per
pillar in its own colour, lighting jade as each lands; all three turns it
gold and it becomes the button that opens the pack.

**The three say what they mean.** He looked at "Trained" and asked what it
constitutes — a label without its definition is a quiz. The pillars are
ability buttons now: a coloured disc, the label, and the definition on the
button itself. *Trained — gym, a run, or a long walk. Family — a real talk
with home. Stopped — ended when the shift did.* On weekends "Stopped" says
"no shift today" instead of the jargon "carried".

**Everything else is in the book.** The chips and the Also-today rows —
bed, freezes, the gap, the place, one thing today — live behind one button,
"Today's book", a bottom sheet where every row opens its own ask. The season
ladder moved to the Deck, where progression belongs. The tab bar became a
floating dock with the city showing behind it.

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

The repository is laid out for it: `index.html` at the root redirects straight
into the game at `app/` (the landing page it used to be is gone — its links live
under More), `.nojekyll` stops Jekyll processing, and
`.github/workflows/pages.yml` deploys the root on every push to `main`.

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
