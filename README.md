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

#### v88: the third batch, and near on weekdays, trips at the weekend

The third set of screenshots was mostly lists, and mostly suppliers. `MY_CAFES_3` adds the three real
cafés: Cowpresso Coffee Roasters (about 11km, 4.7 from 1,291 reviews), The Coffee Roaster Cafe (about
8km) and Homebody Café (about 15km, homemade matcha). Left out: machine and bean suppliers (BrewRatio,
Alliance, Speedy3dcreations), a powder wholesaler, Coffee Bean (a chain, 3.5), Yue Hwa (a department
store) and three places with only a handful of reviews. Yahava and Compound were already in. It lands
once, via `seed88`.

The distances in the screenshots (Yue Hwa Chinatown 1.2km, Plaza Singapura 2.9km) put him around
Chinatown and Tanjong Pagar. So `coffeePick` now splits the list:
- **Weekdays** pick somewhere near: Bugis, Rochor, Kampong Glam, Little India, Jalan Besar, Lavender,
  Balestier, Novena, Geylang and so on.
- **Weekends**, with no shift after, pick a trip out: the east coast, the north-east, and anything
  marked km or trip (`COFFEE_TRIP`, `cafeTrip`).

The pools go in this order: his places that fit the day, then stock places that fit, then any of his,
then any stock. The card, the road and the plan step add "· a trip out" and "Make a morning of it" to a
trip pick (`cafeWhere`, `coffeeWhen`).

#### v87: the north-east batch

He sent five more screenshots, covering Hougang, Kovan, Serangoon Gardens, Seletar Hills and Buangkok,
plus one place further away. `MY_CAFES_2` adds ten:
- TheDuckCoffee (Buangkok)
- Saba' Coffee Co. (Kovan)
- 301 brews (Hougang). It's home-based, so message ahead.
- Cafe 2BL and Prox Coffee (Seletar Hills)
- 48 Richards Place Coffee and Coffee Deli (Serangoon Gardens)
- Coffee Room (Serangoon)
- The Joy Kopi 鼎悦茶室 (Hougang)
- Yahava KoffeeWorks, about 12km away

Left out: chains (Cotti, Luckin), food courts, a grocery, anything rated 3.9 or lower, and a drinks shop
with four reviews. The Bendemeer map was a repeat of the first batch.

Each batch lands once (`seed87`), through the shared `mergeCafes`. A list he's trimmed isn't refilled,
and a place he already had isn't added twice.

#### v86: his coffee places

He sent five Google Maps screenshots of coffee places. They cover the east (Bedok, Chai Chee, Marine
Parade, Katong, Joo Chiat), Geylang and Kallang, and up to Balestier, Novena and across to Bugis.

`MY_CAFES` in `dayplan.js` holds the 42 worth going to, each with its area and what it is. Google's
rating on the day is kept in the note.
- **27 specialty places and cafés,** for example Compound Coffee Co., Bolder Brews, Analogue
  Anonymous, Optional Coffee, No. 36, Nami by Kyuukei, Common Man, Dutch Colony, Zerah, Symmetry,
  Kurasu, Madras Coffee House, and Bacha as a treat.
- **15 kopitiams and kopi stalls,** for example Lau Ka Kopitiam, Soon Hong Coffee Stall, 148 Hot &
  Cold Drinks, Marine Parade Coffee & Drinks and Chop Hua Heng.
- **Left out:** food courts, anything rated 3.7 or lower, and places that aren't really coffee (a
  seafood restaurant, a pork noodle stall, a hotel).

They join his list once (`seed86`). Anything he'd already added stays, and nothing is added twice. The
coffee step picks one he hasn't been to each day, from these first.

Verified:
- **New walk:** the 42 are in and his own entry is kept, the left-outs aren't there, picks come from
  his places and skip one he's been to, a different place most days, the road and the sheet show place
  and area, and the seed runs once.
- **Every earlier walk passes.**

#### v85: the protein shake, and heads-ups instead of weird-time pings

> *"I also have a Ninja blender. I do enjoy a protein shake... frozen fruit, some milk, usually oat
> milk... Don't know when I should do that in the day. Also, the phone notifications are popping up at
> weird times... I would rather get a notification half an hour or an hour before I need to do
> something."*

**The shake.**
- It has its own step in the day. On a gym day it comes straight after the gym and the shower; on
  other days it goes in the long gap between the focus block and the next meal.
- *Did it* asks which milk and logs the real protein: a 24g scoop plus cow's milk (about 34g), soy
  (about 33g) or oat (about 27g). The note is honest: oat milk isn't unhealthy, it's just low in
  protein (about 1g per 100ml against about 3.4g for cow's), and brands often add sugar and oil.
- The last milk is remembered. The shake is logged as a snack, so it adds to the day's protein, and
  undo takes it off.
- The Ninja shake is a breakfast idea too. The "uses what's at home" tag now covers the shake as well
  as the yoghurt.

**Heads-ups.**
- **Before:** five fixed pings, at 08:07 (before he was up), 12:20, 15:40, 22:15 and 23:40.
- **Now:** `nudge.yml` fires 30–60 minutes before real blocks of his day:

  | When | What |
  |---|---|
  | 08:35 | the day's shape |
  | 09:50 | the coffee or the focus block |
  | 12:35 | the clean, Mandarin or the call home |
  | 45 minutes before Malta | 15:15, or 16:15 in the European winter |
  | 19:02 | date nights |
  | 30 minutes before stopping | 22:30, or 23:30 in winter |
  | 23:05 | wind-down, weekends only |

- `scripts/push-schedule.mjs` decides whether each one goes today:
  - workdays only for the shift and stop pings, and weekends only for the wind-down
  - only the right half of each summer/winter pair (Malta keeps European daylight saving, and the
    Singapore times move on 25 October)
  - Mondays and Fridays from 2 November for date nights
  - nothing at all on the trip days in `bot/push.json`
- The app mirrors today's plan to the service worker, which writes the words from it. For example:
  - "At 10:20: Coffee somewhere new — In 30 minutes. Chye Seng Huat Hardware…"
  - "Malta at 16:00 — In 45 minutes. Eat first: …"
  - "Wrap up at 23:00 — Half an hour left. Then wash it off, night moisturiser and wind down. Bed at
    23:45."
- Small routine steps are never the subject of a heads-up.
- The morning ping lists the next three things with their times.
- An ill day is quiet: "Rest today".
- If the app hasn't been opened that day, the ping falls back to the old words rather than yesterday's
  plan.
- The nudge sheet in You describes the new times.

Verified:
- **`push85` (13 checks):** the schedule rules for summer and winter workdays, weekends, Sunday, the
  trip days and date nights.
- **`shake85` (15 checks):**
  - the shake's place in the plan on gym and rest days
  - the milk sheet and the logged grams, and undo
  - the plan in the mirror
  - the service worker's own `composeNudge`, run on that real mirrored plan in Node: the focus, shift,
    stop, morning and date-night wording, ill, and a day the app wasn't opened
- **Other checks:** every earlier walk passes. The sweep is clean: 576 loads and 5,184 renders, with 0 problems.

#### v84: breakfast first, breakfast ideas, his own coffee places, and cleaning

> *"I personally prefer to have breakfast before. Wake up, come round, hydrate, have a coffee, have
> breakfast... it'd be nice to have suggestions... same with the coffee places... I basically just want a
> new one to go to every day... I also need a block of time each week... to clean the house."*

- **Mornings are in his order.** Come round (water first, then a coffee), breakfast (a 30-minute slot,
  so it settles), then the gym, then the shower and the routine. *Mornings* in *Your week* switches
  back to gym first. Either order is fine for a session this size, and the sheet says so.
- **24 breakfast ideas.** Each has its protein, how long it takes, what it needs and how to make it.
  - About half use the Greek yoghurt and frozen fruit already at home. The rest are things to want
    another day: kaya toast with three eggs, chicken porridge, shakshuka, protein pancakes, beans on toast.
  - The breakfast step shows the day's idea, and it's the first tap when logging breakfast.
  - The Food tab lists them all under *Breakfast ideas*.
  - The yoghurt he mentioned is marked as bought, once (`seedOnce`).
- **His own coffee places.** *Coffee places* in *Your week* opens a box to paste a list, one per line
  (*Name — area — note* if he likes). His places come first, a new one each coffee day, and the stock
  list is only a fallback. Coffee somewhere new is now on every day except Sunday, and the pick changes
  daily rather than weekly.
- **Cleaning.** By default it's a room a day, 15–20 minutes at midday when the cafés are full anyway:
  bathroom on Monday and Friday, kitchen on Tuesday, bedroom (fresh sheets) on Wednesday, living room
  on Thursday, floors on Saturday, nothing on Sunday. *Cleaning* in *Your week* switches to one big
  90-minute clean on Wednesday, or off. Each day in the week panel shows its room, and the step ticks
  and untick like the rest.
- **Fixed:** the app only keeps save keys it has a default for. The new settings (`bfFirst`,
  `cleanMode`, `seed84`) are now in `load()`'s defaults, and the walk checks they survive a reload.

Verified:
- **New walk (24 checks):**
  - the seed, and the order with breakfast before the gym
  - the idea on the step, logged in one tap
  - daily rotation, and the Food list
  - pasting places: areas are read and duplicates dropped, and his places come first
  - the week settings, gym first, the weekly clean, the clean ticked and taken back
  - Sunday has no clean
  - it all survives a reload
- **Sweep:** 576 loads and 5,184 renders, with 0 problems. It caught a long breakfast name overflowing
  the Food header on one day; the header now reads "24 ideas".
- **Earlier walks:** they pass, with the Monday and breakfast expectations moved to the new order.

#### v83: the home kit, and an ill day

> *"I have bought at home an ab wheel, and we have a 10 kilogram kettlebell now... so even when I don't
> feel like going to the gym, I still do something. Unfortunately, today I have a cold... I'm pretty tired
> as well."*

**A home session built from what is at home.**
- A day at home (*Not up to the gym today?* → *At home, with the kit*) is now a proper session: the same
  day of the split as the gym, built from one kettlebell, the ab wheel and the floor, in about half an
  hour. `HOME_BY` in `data.js` holds the moves for each day:

  | Day | Moves |
  |---|---|
  | Push | push-up, kettlebell overhead press, ab wheel rollout, floor press, chair dip |
  | Pull | one-arm kettlebell row, kettlebell deadlift, kettlebell curl, reverse snow angel, dead bug, halo |
  | Legs | kettlebell goblet squat, kettlebell Romanian deadlift, ab wheel rollout, kettlebell reverse lunge, glute bridge |
  | Arms & Abs | curl, dip, rollout, halo, side plank, dead bug |

- **One bell means the weight never goes up.** A kettlebell move's target is the bell, and progress
  comes from reps and then tempo: "one bell, so the next step is slower — three seconds down". It never
  suggests a heavier bell you don't own.
- **A ten-minute version:** *Ten minutes at home* runs the first two moves and still counts as Trained.
- **Every new move has its how-to.** The ab wheel starts from the knees, and rolls only as far as your
  lower back stays flat, with a wall as a stop.
- **Home kit** on the Gym tab records what's there. If a move needs something you don't have, it
  becomes its floor version: no bell turns the bell moves into floor moves, and no wheel turns the
  rollout into a dead bug. Hotels still get the room session.
- **In the living room**, the gym prompts "Taken?" and "Swap the machine" read "Too hard today?" and
  "Swap the move".

**Ill.**
- *I'm ill* (under *Not up to the gym today?* or in *Your day*) explains the rule people use for
  training with a cold. Above the neck (a blocked nose, a scratchy throat), a gentle walk is fine if you
  feel up to it. Below the neck (your chest, a temperature, aches), rest, full stop.
- An ill day treats Train the way the weekend treats Stop: it's not owed, so Family and Stop still make
  the day and the run is safe.
- The plan switches to vegetate, the bubble says "Rest is the training", and the Gym tab says so first,
  with a *Feeling better* button to undo it.

Verified:
- **New walk (22 checks):**
  - the kit is the first home answer
  - a home session is built from the kit
  - the bell target stays on the bell and moves on to tempo
  - variants with no bell, no wheel and neither
  - a hotel still gets the room session
  - the kit editor
  - every home move has a how-to
  - the neck-rule sheet
  - an ill day carries Train, removes the station, vegetates the plan and changes the bubble
  - Family and Stop still make the day
  - feeling better, and being ill again from *Your day*
- **Other checks:** every earlier walk passes. The sweep now includes an ill save: 576 loads and 5,184 renders, with 0 problems.

#### v82: the day in order, and a week that goes somewhere

> *"Right now things aren't in order from when I wake up to when I start work... I'd first come round,
> maybe gym, go for a coffee, do some extra curricular work, life admin, learn something... I like to
> try new places for coffee but hate going during lunchtime... community, volunteering... Strait Up
> Growth... Mandarin... But other times I just want to vegetate... very little time or energy after
> work... I want the routine built chronologically, and each day of the week to help me towards my
> goals."*

The time he has is the morning: Malta starts at 16:00 (17:00 from late October), and he is up at 08:30.
So everything that moves his life goes before the shift, and the evening asks for nothing except
stopping on time. New `dayplan.js`:

**The day, in order.** `dayPlan()` lays out the whole day from waking to bed:
- come round
- the gym (on a session day)
- moisturiser, sunscreen, breakfast
- coffee somewhere new
- the day's focus block
- Mandarin and life admin
- the family call in the UK's morning
- the pre-shift meal, Malta, and stopping on time
- the night routine and bed

Where it shows up:
- **Start the day** walks the steps in that order, with the time on each step.
- **The road** draws its stations at those times.
- **The Start button** begins at the step that's due now: coming round at 08:30, not a breakfast five
  hours cold.
- **The new *Day* button** beside Start opens the whole day as a list. The current step is lit, Malta
  and bed are shown as markers, and tapping a row starts the run there.

**Coffee somewhere new.** Coffee goes before 11:45, or after 14:00 if the lunch crowd has already
started. Each week has one pick, and every place you log goes into a coffee passport. On a rest day the
walk goes to the coffee, so one trip also counts as Trained.

**The week.** Each day has one focus:

| Day | Focus | Extras |
|---|---|---|
| Mon | Strait Up Growth | |
| Tue | Mandarin | coffee, life admin |
| Wed | Community | |
| Thu | Strait Up Growth | coffee |
| Fri | Name & network | life admin |
| Sat | Community | coffee |
| Sun | Vegetate | |

- Any day can be changed on the You tab under *Your week*, including its coffee and admin.
- Away from home the day is the trip, so there's no focus.

**Quest lines from level zero.** Each focus has a step-by-step line, and each step pays XP to its skill:
- **Strait Up Growth** starts with one sentence (the offer), then the list of ten people, the first
  messages, a case study (never anything from NEXT), LinkedIn, follow-ups, a real conversation and a
  proposal.
- **Community** starts with picking where to volunteer (Willing Hearts, Food from the Heart,
  giving.sg), then a first shift and a group that meets when he's free.
- **Mandarin** starts with the words he already has, then ordering kopi, finding a class, and a first
  lesson.
- **Name & network** starts with one post, then asking someone for coffee and booking an event.
- Once a line runs out, it switches to steps that keep it going.
- Mandarin is also now a skill on the character sheet, and fifteen minutes of it goes on the other
  weekdays.

**Life admin** takes the first unfinished item from his "to sort" list, such as booking the Cannes days
off.

**Vegetate.** One tap in *Your day* turns off the focus, coffee, Mandarin, admin and kit errands. The
three still count and nothing else is asked. Sunday does this by default.

**Also fixed:** the morning routine's window opens half an hour before waking, and the road had been
showing it as "soon" for the rest of the day. It now opens when he's up.

Verified:
- **New walk (34 checks):** the order of the plan and the run; coffee outside the lunch crowd; where
  Start begins; the day list and starting from a row; the focus step paying XP and moving the line,
  with undo; the coffee passport; admin ticking the to-do; vegetate on and off; the week panel and
  editing it; Mandarin on the sheet; "Carry on" in the afternoon; a day away; fit at 375 wide.
- **Earlier walks, rebuilt:** the test scratchpad was lost when the container was recycled, so these
  were rebuilt and moved to v82. They pass.
- **New sweep:** every tab across three saves, six dates (including New York and winter hours), eight
  times of day and three phone sizes: 432 loads and 3,888 renders, with 0 problems. It checks for
  errors, sideways scroll, Start below the fold, stations off screen or piled up, the day list opening,
  and the run staying in order.

#### v81: kit first

> *"It's asking me to moisturise in the shower, but if I don't have moisturiser, I can't complete it...
> I need to buy things. I need to make sure I have things to actually complete the levels... And I
> don't know what moisturiser I should buy."*

At level zero, the first level is getting the kit, not doing the routine. New `kit.js`:
- **A step you have nothing for is held back.** If the kit a routine needs is missing, `careDue` says
  that routine isn't due, from today on. This is the same way sunscreen isn't due in a Sheffield
  January: it drops off Today, the run and the Skin ring, and nothing is owed. Past days are left
  alone, so a bottle running out never rewrites a run you already kept.
- **One step replaces the held ones: the kit.** It shows on Today and in the run:
  - It starts as "Check your kit", and "Go through it" asks one thing at a time: *I have one* or
    *Need to buy it*.
  - After that it's the errand: "Get the kit — moisturiser and breakfast protein. A big FairPrice
    has all of it."
  - The character's speech bubble says it too: "Passing a FairPrice? …"
- **One named pick for each thing.** Each comes with its size and price, why that one, the other
  pick and when to choose it, how to use it, where it's sold (from where you are), and how long it
  lasts. Prices were checked at FairPrice online in September 2026.
  - **Moisturiser:** Neutrogena Hydro Boost Water Gel. If your skin feels tight or flaky, CeraVe PM
    Facial Moisturising Lotion instead. The same one does morning and night, so the night step is
    now *Night moisturiser*: one bottle to buy, not two.
  - **Sunscreen:** Bioré UV Aqua Rich Watery Essence SPF50+. If it stings your eyes, La Roche-Posay
    Anthelios UVMune 400 instead.
  - **Face wash:** CeraVe Foaming Cleanser. For dry skin, the Hydrating one.
  - **Breakfast protein:** a week of Greek yoghurt, or whey and a shaker. Until you have it in, the
    food tab stops suggesting the shake or the yoghurt, and breakfast stays breakfast.
- **Getting it is a level.** Marking something as got brings back the step it was holding and pays
  +30 XP to that skill (Skin or Diet). XP counts only what you said you got, so it never pays twice.
- **Where it lives.** The Skin tab shows the kit under the game while anything is missing, and the
  ring shows a bag instead of 0 of 0. Once it's all there, it moves behind a *Kit* door with a
  *Ran out* button. On the food tab it's an *In the kitchen* door.
- **Nobody asks what the record already shows.** If you've ticked the moisturiser in the last 30
  days, you have one.

Verified:
- 30 checks in a new walk: held steps, the station, the Skin panel, the sheets from the run, the
  summary, the errand and the bubble, unlocking and XP, Ran out, inference from the record, runs not
  rewritten, the breakfast pick, and fit at 375 wide
- the existing suites and the 2,160-render sweep (with the kit missing), all clean

#### v80: the run goes both ways

> *"I can't go back and forward here."* (over step 6 of 6 of Start the day)

The run only went one way. Did it and Not now both moved forward, and anything behind him was gone,
including a tap he did not mean. Now every step in a run (Today, Work, Food, Skin) has:
- **Back and forward, under the thumb.** `‹ Back` and `Not now ›` sit side by side on every step.
  On a step that is already done, the forward button says `Next ›`. Back works from the end screen
  too.
- **Pips you can tap.** Tap one to go straight to that step. Green means done, gold is where you
  are, grey means walked past.
- **Swipe and keys.** A swipe left or right does the same as the buttons. So do the arrow keys, and
  Escape leaves the run.
- **A done step stays in the run.** It shows a *Done* stamp and an **Undo**. Undo uses the same
  function that the tab's own button uses to take a tap back:
  - Train, Family and Stop untick
  - a routine, a work item, or a meal (only that slot's meal, not the snack logged after it)
  - the day's card (the swap stays spent)
  - a level-up step, or a date night (only that entry, not a later step)
  - a Do from his hand, which goes back into the hand
- **The end knows what is left.** "The 3 left ›" goes back to the first one still open.

Whether a step is done is read from the record every time, never stored. A step whose window has
moved on (a routine after the switch to night) is stepped over, not shown blank.

Verified:
- 29 checks in a new walk, covering forward and back, pips, arrow keys, swipe (and a short drag
  that is not a swipe), the end screen, Escape, and 44-point targets at 375×667
- an Undo for each kind of step
- the existing suites and the 2,160-render sweep, all clean

#### v79: his road, built in

> *"Why do you need it private? I don't. It can be public."*

So there is no code to paste. His plan as he described it on 28 September 2026 is built into
`plan.js` (`MY_PLAN`):
- **Trips:** Cannes with Tim, the Sheffield weekend, New York for NEXT Predict, and Doha on the way
  home.
- **To give dates to:** November leave, Croatia, Christmas in Sheffield, and the April and May
  events.
- **To sort:** the Cannes days off, planning Cannes, asking for Singapore hours on Mondays and
  Fridays, and booking the November leave.
- **Focus:** Tim & me, friends & community, and the business, with his own line for each.
- **Date nights:** Monday and Friday from 2 November.

It loads into the phone once, the first time this version opens on an onboarded save
(`S.planSeeded`). After that it is his to change: a trip he removes stays removed. The paste code
stays for the next plan.

Verified:
- first open loads the whole road, the focus and the date nights
- Today already carries the first focus step, and the road ahead counts down to Cannes
- a removed trip stays removed after reopening
- a fresh, un-onboarded install gets nothing
- the v68 to v78 walks and 2,160 renders pass

#### v78: the road ahead

> *"Gosh, chaos, uncertainty. And this is where things need to start getting a little bit more
> certain, a little bit more predictable, a little bit more consistent ... That's exactly why this
> app exists."*

The app now knows what is coming (`app/js/plan.js`, new), not only where the phone is today.

- **Trips** have dates, a place and a kind: holiday, family, work or travel.
  - A planned holiday is time off even before the phone lands. Stopped is carried, not owed, so
    two things make the day.
  - Away on a trip, the plan names the place and the kind, which a time zone cannot. Days ahead
    are described from the plan.
  - Travel days still carry the run.
- **Plans with no dates yet** (a month, a season) wait under *To give dates to*. Once dated, they
  become trips. Dates use the phone's own date picker.
- **To sort**: things to do before the road gets busy, each with an optional "by" date, ticked
  when done.
- **Date nights** fall on the weekdays he picks, from the day he picks:
  - an evening station on Today's road, with the heart, done through the run
  - each one done is a *Tim & me* step (v77)
  - a date night still to come that week stands in for that skill's weekly step
- **The road ahead** is on You, under the levels:
  - the next trip as a countdown
  - the trips in order, with a colour for each kind
  - plans to date and things to sort
  - date nights
  - *Add a trip* and *Paste a plan*
- **He mentions it.** The character says so on the first day of a trip, on the last day, when a
  trip is ten days out or less (with the first thing still to sort), and on a date night.
- **Crowded days**: with six stations on the road, the spacing tightens and the labels shorten, so
  nothing overlaps on the smallest phone.

**None of his actual plans are in the code.** They arrive on the phone by a paste code
(`DAYLIGHT1:` plus base64url JSON), which is checked, trimmed and merged. Nothing in a code can run,
nothing already there is removed, and pasting the same code twice adds nothing. They can also be
added in the app, and they never leave the phone.

Verified with a Playwright walk (17 checks):
- a pasted plan merges trips, plans, things to sort, date nights, focus and goals; a second paste
  adds nothing; a broken code is refused
- the panel counts down to the first trip
- a planned holiday carries Stopped, and the days ahead know the place
- date nights appear from their start day, on the road, and the run logs them as a Tim & me step
- the bubble names the trip and the first thing to sort
- on holiday abroad the place and kind come from the plan
- a plan gets dates through the date picker and becomes a trip
- a thing to sort is ticked

Also checked: six stations on a 375pt road with no overlaps, and the date night standing in for
the weekly step. The v68 to v77 walks and 2,160 renders pass.

#### v77: a level for every part of life

> *"I like the idea of levelling up. The thing is that I feel like I'm at level zero with a lot of
> these things ... things that aren't going to happen at once ... but I do want them to be gradually
> moving in the right direction."*

Every part of his life now has its own level, the way a game gives a character skills. There are
nine (`app/js/life.js`, new), each starting where his record says it is, and each climbing from
small things done.

- **Five read from what the app already records**, so they did not start at zero:
  - *Gym routine* (sessions, weeks of three)
  - *Gym know-how* (machines tried, moves logged, stages unlocked)
  - *Diet* (days logged, protein met)
  - *Skin* (routine days)
  - *Family* (calls home)
- **Four are new and are levelled by small steps**, logged in one tap. The small ones sit at the
  bottom, where a message counts, and the rare big ones are worth a lot:
  - *Tim & me* (date nights, evenings off together)
  - *Friends & community* (meeting people, groups, volunteering)
  - *Name & network* (posts, coffees, events, introductions)
  - *The business* (conversations, proposals, wins)
- **Levels** need 25·n·(n+1) XP: 50 for the first, then 150, 300, 500 and so on. The first comes
  from one or two things done, and each one after asks a little more. Levels never go down. Steps
  also count for half towards the main level.
- **Focus: up to three at a time.** Each focus skill gets one small step a week on Today, as a
  **Level up** station on the road that takes the card's slot. It is done through the run. The
  rest keep their levels and wait their turn.
- **The character sheet** is on You: every skill with its level badge, a bar to the next level and
  a star to focus. Tapping a skill logs a step, or takes the last one off.
- A skill levelling up gets the full-screen celebration.

Nothing specific (who, which client, which goal) is in the code. His own goal lines per skill live
only on his phone (`S.goals`).

Verified with a Playwright walk (15 checks):
- record skills start from the record, and step skills start at zero
- the sheet shows nine skills, focus is set, and a fourth is refused kindly
- a date night reaches level 1, the main level gets half, and taking it off undoes it
- Today shows the week's step, and the run logs it and moves on to the next focus

The v68 to v76 walks and 2,160 renders pass.

#### v76: every room in the same world

> *"Yeah, do the same treatment for all of them."*

The rooms (Gym, Food, Water, Skin, Work, Cards, You and the pot) opened on a small window of sky beside
the clock, which was a picture of the world rather than a place in it. Each room is now a small
scene of the same world as Today:
- the same sky at the same hour, with stars at night and the sun on its arc
- the same ground and road
- him standing at the one object the room is about: a dumbbell rack, a hawker stall, a rain tree
  with a water bottle, a mirror, a desk and laptop, a card chest, a trophy or a stack of coins

The props are drawn in the same sticker style as he is. The clock and the room's name sit over the
scene, and the counters use the same level ring as Today.

Fixed on the way: the rest day's word on Gym sat in a box with no height, so the plate above it and
the line below it ran over it. The rest ring is square now, like the ring it replaces.

Verified at 375x667, 390x844 and 430x932, at dawn, midday, golden hour and night: nothing overlaps
and there is no sideways scroll. The v68 to v75 walks and 2,160 renders pass.

#### v75: Today, designed as a game

> *"Rain tree... not sure what that is. Also please enhance the design into a genuinely good
> designed game"*, with a screenshot of Today at 12:21.

The screenshot showed the problem.
- **Empty sky, cramped game.** Over half the screen was sky. The game was crammed into a strip at
  the bottom: pins at two heights on the skyline, a black band for ground, and a stick figure.
- **Glitches.** A mustard square sat behind the selected pin. A grey bar in the sky read like an
  error. The active Today tab was light blue text on a light blue key, so it couldn't be read.
- **No goal, no meaning.** Nothing said what the day wanted. The card panel said "Rain tree." and
  "Done today." with nothing about what a rain tree is.

A game's home screen does three things, and Today now does all three. The new styles are in
`css/game.css`, loaded last and scoped to Today.

1. **A place with somewhere to go.**
   - Real ground that follows the hour: grass by day, warm at golden hour, blue-dark at night.
   - A winding road across it, with gold steps behind him where he has already been.
   - The stations stand on the road as chunky medallions: coloured when open, gold with a tick
     when done, pale with their hour when still to come, grey when shut.
   - The one he's standing at bounces under a **NOW** flag.
   - He is a character now, walking along the curve of the road when the app opens, with a small
     bob while he waits. If his minute would put him on top of a station, he stands a step
     before it.
2. **The goal and the progress in view.**
   - Under the clock, today's three pillars show as coins, lit when done, with "1 of 3 today" or
     "Day complete".
   - The level is a ring that fills towards the next one.
3. **One quest, with its picture.**
   - The panel has a medallion with the station's icon, or the card's own picture.
   - A card says its set ("Card · Everyday"), what the thing is ("The wide flat canopies. Folds
     its leaves at night.") and what it asks, or "You did it" once done.

Also:
- The news is now **said by him**: a white speech bubble above the ground, its tail towards where
  he stands, kept on screen.
- The first-session line was rewritten in plain words.
- The active Today tab is readable again: dark ink, as on every other tab.
- On shorter phones the ground and road shrink together.

Verified with Playwright:
- Today at 08:50, 12:21, 16:40 and 22:30, at 375x667, 390x844 and 430x932. Nothing overlaps
  and there is no sideways scroll.
- The card panel, open and done, explains the Rain tree.
- He walks the road to now and stops.
- The room headers on other tabs are unchanged.
- The v68 to v74 walks, the v70 tick checks (now checking he's drawn where the minute puts him)
  and 2,160 renders pass.

#### v74: what a machine looks like

> *"Help me with indicators of what a machine looks like and how to set it up"*

Words were not enough. On a gym floor you can't match "seated leg curl" to the shapes in front of
you, and "line your knee up with the pivot" means nothing until you've seen where the pivot is.

- **A drawing for every machine** (`app/js/machines.js`, new, 38 machines in 16 drawings with
  variants). Each one shows the machine side-on, a person in it at the start of the move, and a
  numbered dot on each thing you adjust:
  - the back pad
  - the pivot
  - the ankle pad
  - the thigh pad
  - the pin

  The sheet's *Set it up* list uses the same numbers. Everything is hand-drawn SVG in one visual
  language that follows the theme: frame lines, padded parts, the orange things you touch, and a
  person in blue.
- **How to spot it**: one line per machine for finding it across the room. For example, "on the
  curl the roller goes behind your legs, on the extension in front of them". The four machines
  without a drawing (torso rotation, T-bar, belt squat, sled) have this line too.
- **Cable stations** are one machine set up many ways. Each cable move says where the pulley
  goes, what clips on, and which way to stand, and its drawing shows the pulley at that height.
- **Watch someone set one up** opens a YouTube search for that machine, because brands differ.
- **In the app:**
  - *How to do it* on any machine now opens this sheet, followed by the move itself.
  - The first time on a machine it is *First time? Set it up*, with v73's one-light-set rule and
    count.
  - The swap list shows each machine's shape beside its name, to match against the room.
- **Contrast**:
  - By day, deeper orange dots with white numbers: 4.6:1 for the numbers, 3.9:1 for the dots
    against the panel, 3.3:1 for the frame.
  - At night, bright orange with dark numbers.

Verified with Playwright at 390x844 (10 checks):
- For all 38 machines, the dots are numbered in order and match the set-up list line for line,
  every drawing stays inside its frame, and every machine has a spot line.
- The swap sheet shows drawings beside machines and none beside dumbbells, with 44pt options.
- Choosing the seated leg curl from the sheet gives 5 dots, 5 lines, the video link and the
  first-time title.
- The cable set-up names the height, the attachment and the stance.
- The light theme contrast passes.

The v68 to v73 walks, the v70 tick checks and 2,160 renders pass.

#### v73: a machine you have never touched

> *"There's lots of other weight machines but I just feel way too unconfident to touch them"*,
> sent from the gym floor, on the leg press.

What makes a machine frightening isn't the weight. It's not knowing how it works in front of
people who seem to. The app made that worse: *How to do it* on a machine showed the **dumbbell
move's** instructions, because 37 alternatives had none of their own. So a nervous person sitting
at a chest press read how to lie on a bench.

- **Every alternative has its own instructions** (`HOW_MORE` in `data.js`). A machine's first line
  is always how to set it up, because that's the part nobody shows you.
- **First time? Set it up.** If you've never logged a set on a machine, the session button reads
  *First time? Set it up* instead of *How to do it*. The sheet it opens has three parts:
  - the three things every machine has: a seat, a pin and a picture
  - this machine's own set-up
  - "one set at a light plate is the whole job", and what to say to the staff
- **The first set on a new machine gets said out loud**: a gold "First time on the seated leg
  curl. That is 2 machines." It appears once per machine and is derived from the record.
- **The words sheet has a new section**, *A machine you have never touched*. It ends with the
  machines you've used so far and the rule: one new one a visit, never more.
- **A swapped move now says what it stands in for.** The orange line reads "Instead of the
  Romanian deadlift" instead of the slot's own "Dumbbells, hinge at the hip" over a seated leg
  curl. Proper names keep their capitals in sentences (Smith, Romanian, Pallof, T-bar).

Verified with a Playwright walk at 390x844 (17 checks):
- It starts from his morning: the leg press logged, the count reading one machine.
- The Romanian deadlift keeps *How to do it*.
- The seated leg curl says *First time? Set it up* on one line, with "Instead of the Romanian
  deadlift" above.
- The sheet has the title, the three things, its own set-up and the count.
- The first set gives exactly one gold cheer ("2 machines"), then *How to do it* returns and
  shows the machine's own instructions.
- The words sheet has the section and the count.
- No tap target is under 44pt.

The v68 to v72 walks, the v70 tick checks and 2,160 renders pass.

#### v72: everything is taken

> *"Every bench is taken. Every weight machine is also taken. Got nervous so just grabbed the
> most familiar weight machine which is the leg press"*, sent from the gym floor.

v69's plan B offers the next machine, which is no help when every machine has someone on it.
So now every move that needs a bench, a cable or a machine has a version that needs only a pair
of dumbbells and a bit of floor (`FLOOR` in `data.js`). One tap turns the whole day into those
versions. It keeps the same sets and reps and doesn't need anything from anyone.

- **"Everything taken? Dumbbells and floor instead"** appears on the warm-up, which is when he
  first sees the room, and under the move on every step. Once switched, it reads "Dumbbells and
  floor today · Back to the machines". Plan B and *Swap the machine* are hidden, because there is
  no machine to swap. The orange line above the move says what it stands in for, for example
  "Instead of the leg press".
- **It lasts for today's session only.** The next Pull Day opens on the machines again. A floor
  version already logged today keeps its name for that slot all day, so the Gym tab counts it
  after the session is closed. Each floor version keeps its own weight history.
- **The floor versions for each day:**
  - Push: floor press, standing press, push-up, overhead extension, dead bug, carry
  - Pull: floor pullover, split-stance row, bent-over row, curl, rear delt fly, dead bug
  - Legs: goblet squat, Romanian deadlift, split squat, glute bridge, lunge, leg raise
- **What to say**: the sheet has a new section, *If everything is taken*. The answer is
  "Nothing to say" and to tap the switch.

Fixed on the way. v67 added the triceps pushdown, the dumbbell curl and the face pull, plus
ten room-session moves, without instructions, so *How to do it* showed generic text. The three
gym moves also had no starting weight, so they opened blank. All of them now have their own
instructions. Every move and alternative now opens on a starting weight, or is marked as your
own weight (the hanging knee raise is).

Verified with a Playwright walk at 390x844 (20 checks):
- every day's floor version has unique names, its own instructions, a starting weight, and no
  machine
- the switch shows on the warm-up and on moves
- moves 1 to 3 of Pull Day become the floor versions
- sets are logged under the floor name
- *How to do it* shows the floor move's own instructions
- "Back to the machines" works, and the logged floor move keeps its name
- the tab counts the floor move after closing
- the words sheet covers it
- the switch is a 44pt target
- the next Pull Day opens on the machines, and the floor move remembers its weight

The v68, v69 and v71 walks, the v70 tick checks and 2,160 renders pass.

#### v71: every tap can be taken back

> *"Can't see a way to go back or reverse things"* - sent with a screenshot of Pull Day, move 2
> of 3, on the live v67 build.

v68 added a back arrow, but it has not reached his phone yet (see v68-v70: GitHub will not run
the publish job). Even with it, a set could not be reversed once it was logged. The dots under the
move were plain labels. A thumb that hit *Set 1 done* too early, or a 10 that was really an 8,
stayed on the record. The only fix was on the Gym tab, inside a closed drawer, and it could
change a move but never remove one.

- **A labelled Back.** It reads "‹ Back" beside the close button, on every step after the
  warm-up. It is a word, not a chevron in a circle.
- **Tap a done set to fix it.** Its own weight and reps go back in the dials. The buttons then
  read *Save set 1*, *Take set 1 off* and *Leave it*. A line under the sets says so the moment
  one is logged: "Tap a done set to change it or take it off."
- **Take a set off and it is gone from the record.** A move with no sets left is removed, and so
  is a day with no moves and no finisher, so a mistaken tap never counts as a session.
- **An added set can be removed.** A − appears next to + while the added set is not yet done.
- **On the tab**, a logged move's sheet reads *Save* / *Leave it* and adds *Take today's … off*.

Also: the rest clock's blue measured 2.97:1 against its dark wash. It is 10:1 at night now, and
5.3:1 by day, up from 4.44.

Verified with a Playwright walk at 390x844 (20 checks):
- no Back on the warm-up; the labelled Back is 44 points tall and fits the top bar
- logging a set makes it a button and shows the hint
- the change mode shows the logged numbers; Save changes only that set; Leave it keeps the record
- taking the only set off removes the move and the empty day
- + then − puts the set count back
- Back reaches the move before
- fixing an earlier set keeps the later one
- no tap target is under 44 points
- the tab sheet clears a move

The v68 and v69 walks and the v70 tick checks pass. 2,160 renders show no problems.

#### v70: fixes

> *"Fix fix fix"*

No new features. Three things that were wrong, fixed.

- **Today's clock stopped when you opened the app.** The minute tick in `app.js` was still
  aiming at parts of the dashboard Today used to be (`.b-hr`, `.w-tl`, `.w-wins`), found none of
  them, and did nothing. So the clock, the "6h 40m left" on the card and the figure on the path
  all read whatever they read when the app was opened, however long it stayed open. The tick now
  moves every room's clock. On Today it also moves the card's minutes and the figure. It
  redraws the board when a station opens or shuts, or the day turns over. Coming back after less
  than an hour runs the tick at once rather than waiting for the next minute.
- **The walk replayed on every tap.** The figure walks from where he last closed the app to
  now, which is the point. But every redraw of Today replayed it, so marking something done
  restarted nine hours of walking. It now plays once per arrival.
- **The paper plan described a programme that no longer exists.** `docs/train.html` still had
  three full-body Sessions A, B and C on Monday, Wednesday and Friday. It had a travel session
  "outside the rotation" and a session zero of squat, bench and row. Since v67 the app has run
  Push, Pull and Legs, plus Arms & Abs as the bonus, and room sessions that follow the split.
  The tables were rebuilt from `SESSIONS` and `TRAVEL_BY`, and the stage table matches.
  The page points at what v68 and v69 added:
  - plan B on every move
  - the words for the awkward moments
  - *Not up to it today?*
  - *When do you go?*
  - the quiet-hours question
- **The stage unlocks said the wrong thing.** Reaching Three moves announced "Legs, a push and
  a pull" and Four moves "A hinge goes in". Both are true of the old full-body sessions and
  false of a split. They now name what actually joins each day.

Removed as dead: `planLine`, `tipFor` and the `TIPS` table they read. Nothing had called them
since the dashboard went.

Verified with Playwright at 390x844:
- The clock, card minutes and figure move on the tick.
- The board redraws when a station opens. At +250 minutes, family opened.
- A redraw does not replay the walk.
- Every other tab's clock keeps time.
- A short return from the background brings the clock current.
- The same 61-second wait on the v69 build still showed 09:20 at 09:27.
- The v68 and v69 walks pass.
- 2,160 renders across zones, hours and dates show no problems.
- The paper plan has no horizontal overflow at 390 points, light or dark.

#### v69: for someone who gets nervous at the gym

> *"Just make it a really useful app for someone that struggles to keep up with a good routine,
> someone that gets nervous and socially awkward at the gym, etc."*

The app had a great deal for keeping score and almost nothing for the moment a nervous
person turns round and goes home. `docs/train.html` has always had a section on exactly this
— the unfamiliar room, the unwritten rules, the feeling of being watched, the ten-minute rule —
but none of it was in the app, and on an ordinary session day the Gym tab offered one button
and no way to do less.

**Plan B on every move.** The moment that makes a nervous person leave is small and specific:
the machine is taken and everyone can see you standing there. So each move in the guided
session now carries its answer before it is needed — *"Taken? Chest press machine does the
same job."* — and one tap switches to it. Each machine keeps its own weights.

**The words.** *"Nervous about the gym?"* on the Gym tab, and *"What to say"* on every step of
the session, open one sheet: what to say when someone is on the machine you want, what to say
when someone asks you, how to ask the staff, the six rules nobody writes down, and what goes in
the bag the night before. It matches the paper plan, including the line that the feeling of
being watched only runs one way and fades at about the fourth visit.

**A way out that keeps the day.** On a day with a session still to do, the small print above
the start button reads *"Not up to it today?"*. It offers three things, all of which count
as Trained:

- **The short version**: the first two moves, which are always the big ones, at full sets, and
  then go. The summary says *"Turned up. That counts."*
- **At home**: the same day of the split with your own weight, wherever you are. The room
  sessions were only ever offered abroad; now they are there on a day the gym is too much.
- **A walk.**

The same three are the third answer on the Today runner's Train step — *Did it*, *Not now*,
*Something smaller* — because "Not now" on training used to be the whole day's training gone.

**The moment you go.** *"When do you go?"* — after the first coffee, before the laptop opens,
or in his own words. Deciding the moment in advance is the best-studied trick there is for
actually going, because when it comes there is nothing left to decide. Once named, it leads
the Gym tab's line, Today's card and the morning brief: *"After your first coffee, before Malta
wakes at 16:00."*

**His gym's quiet hours, learned.** One optional tap on the summary — *Quiet*, *Fine*,
*Packed* — and after a handful of visits the start screen says when his gym is emptiest, from
his own visits rather than borrowed statistics about gyms in general.

**A bug on the way.** The room session worked out which day of the split it stood for from
the record — and its own first set is in the record, so logging one push-up moved it on to the
next day and the list changed mid-workout. It now reads the days *before* today. This was
already hitting travel days; the at-home option would have hit it every time.

Also: explanations under sheet options are no longer set in capitals (a sentence in capitals is
hard to read, and hardest when anxious), and the session's quiet buttons are 44 points tall.

#### v68: the way back

He skipped every move in a guided session and sent a screenshot: three rows
reading **skipped**, a headline reading **"Turned up. Lifted. Logged."**, and
one green button offering to mark him Trained. *"There's no way to reset."*

He was right, and it was worse than it looked. The session only ever went
forwards — `Set done` or `Skip this one`, no way back — so once the index ran
past the last move you landed on the summary. Closing it left `S.sess` behind
with the index still at the end, so the next tap on the tab resumed it and put
you straight back on that summary. For the rest of the day the guided session
was bricked, and the only exit that cleared it was the button that claimed he
had trained.

Four small things:

- **A back arrow** beside the close button on every step. From a move it goes
  to the one before, from the first move to the warm-up, and from the summary
  or the finisher onto the last move.
- **The summary tells the truth.** With nothing on the record it reads
  "Nothing logged yet." over "Every move was skipped", the status says
  *nothing logged* rather than *done*, and the green button becomes **Back to
  the first move**. Marking Trained is not offered for a session he did not
  do; the fine print points at the tab, because a walk still counts.
- **Every row is a way in.** The summary's move rows are buttons now — tap a
  skipped one and the session opens on it. With some logged and some skipped
  the primary stays *Finish — mark Trained*, with *Go back to the skipped
  ones* underneath.
- **Closing never leaves a dead session.** If nothing was logged and no
  finisher was done, the stored session is forgotten on the way out, so the
  next start begins at the warm-up. A session with even one set in it still
  resumes exactly where he left it.

The round session buttons went from 42px to 44 while I was in there.

#### v62: five rooms, not five headers

*"You've just added a moon. That's a shit design change."* Correct. v61 pasted
a band of sky across the top of five unchanged lists. A banner is not a
redesign.

So two things changed properly.

**The sky comes indoors through a window.** Not a full-bleed header — a small
framed rectangle in the wall with a mullion across it, the same hour and the
same skyline inside it. Everything under it is then *indoors*, which is the
whole point: five rooms in one place rather than five pages with a picture on
top.

**Each tab became the room it is about, with the thing itself drawn big enough
to touch.** The rule: one object, one action, and the lists that used to sit
above the object go below it.

- **Water** — the bottle *is* the tab. It was a thumbnail beside a paragraph
  with the eight marks and the week folded into two drawers, which is a
  settings page about drinking. It now stands at the height of the screen, it
  is the tap target, the count is inside the water, and the eight marks and
  the week's seven bottles are on the page where he can see them.
- **Food** — one ring at the size of a plate with the number in the middle,
  and the day's three meals as three places laid at it. They were a strip of
  chips; a strip of chips is a toolbar.
- **Gym** — the session is a *ring of moves*, one segment each, filling as
  they land. It was a big numeral over a paragraph, which is a poster about
  training rather than a session.
- **Work** — everything on that tab waits for one date, so the date is the
  object: the count at the size of the thing it stands for, with the run-up
  underneath it.
- **Cards** — three card backs on the table with the season count across them.
  It was a stat panel with a progress bar, and a progress bar about a
  collection is a receipt for one.

The stat bar stays gone; the clock, the place and the currency live in the
wall beside the window.

#### v61: the other five rooms

*"These pages should also match the new design."* They did not: v60 made Today
a scene and left Gym, Food, Water, Work and Cards as the old flat dashboard
underneath a stat bar. A scene plus five dashboards is five dashboards.

So every tab now opens on **the same sky at the same hour** — the same moon or
sun on the same arc, the same skyline of the city he actually woke up in, and
the same currency in the corner — and then gets on with its own business
underneath. Crossing between tabs is walking into another room in one place,
not opening another app.

- **The stat bar is gone everywhere**, not just on Today. The sky carries the
  clock, the place and the currency; a bar doing the same job under it is the
  dashboard growing back. Every route the bar had survives: the level goes to
  You, the pot opens the vault, the streak and the spares go to the deck.
- **The night palette is the scene's palette.** It was grey ink on near-black,
  which read as a different app from the one on Today; it is now warm cream on
  the same deep navy the sky fades into.
- The horizon band is straight-edged and blends into the page, because content
  follows it immediately. The rounded bottom belongs to Today, where the scene
  ends and the card begins.

#### v60: it is a place now

His verdict on v59, which had been a very tidy dashboard: *"Complete redesign.
Like a real game not a dashboard."*

He was right again, and the thing I had been missing for nine rounds is that
**fewer panels is still panels.** A game screen is not a tidier readout. It is
a SCENE — somewhere you are, something drawn, one thing your eye goes to, and
you touch the thing itself rather than a button with a verb printed on it.

So Today is his day, drawn side-on.

- **The sky is the real hour** — the same seven phases Daylight has had since
  v37 — with clouds drifting by day and stars at night.
- **The sun rides the same arc** it has ridden since v4. It is just no longer
  a 34px strip.
- **The ground is the city he actually woke up in.** Singapore towers,
  Sheffield hills and chimneys, a generic skyline elsewhere.
- **A path runs across the day**, left to right, wake to wake.
- **The things the day asks for are stations on that path**, standing at the
  hour they are actually open. Lit when open, fallen over when shut, green
  when done. Every other one on a post, so a crowded morning reads as
  signposts rather than a smudge.
- **And he is on it.** A small figure at this minute, walking right, all day,
  whether the app is open or not.

That last part is the whole thing. He opens it after nine hours asleep and
does not *read* that time passed: he watches himself walk from where he was to
where he is, past the stations he missed and the ones still lit. "The world
moved while you were away" stops being a paragraph and becomes the reason to
look.

Underneath the scene is one card: what the station he is standing at asks, and
the button that does it, in the thumb's reach.

**What moved rather than went.** The stat bar is gone — a scene with a
dashboard bolted to the top of it is a scene with a dashboard bolted to the
top of it — but the pot is real money he pays himself and he has asked where
it was once already, so the level, the streak and the pot sit in the corner
the way a game keeps its currency. The five basics, the week's seven days and
the day's arithmetic are one tap behind the clock. And the city under the
clock is still the button that corrects the city: he is somewhere different
most weeks, the app guesses from the phone's own clock, and that guess has to
be correctable by touching it. It nearly went out with the dashboard.

#### v59: ten boxes down to one

He opened v58 on his phone at 22:43 and said it was overwhelming. He was
right, and the failure is easy to name: **v58 added the news, the day strip
and a "Next" panel and removed nothing.** The screen ended up as ten bordered
containers stacked on a phone — HUD, hour, news, timeline, basics, next,
panel, seven window tiles, footer, nav. Ten containers *is* the overwhelm; it
was never the information inside them.

So the rule for this screen from here: **one panel, and it is the thing he is
being asked to do.** Everything else sits bare on the felt, separated by space
and one hairline.

What went:

- **"Next" deleted outright.** It duplicated countdowns the windows already
  carried.
- **The news shows one thing**, not three, with no box. The rest is a `2 more`
  tap. When the world did nothing, the line the app wrote about the day stands
  in, so it is never silent.
- **The day strip lost its panel** — two bars and four numbers floating on the
  felt, and the home lane is not drawn at all when nobody is on the roster.
- **Seven window tiles became one row of chips.** A dot says the state; the
  panel above says the rest. They were carrying three lines of type each,
  which is a second screen's worth of reading underneath the thing he is
  actually being asked to do.
- **Five bordered basics tiles became five words and five numbers** on one
  quiet line. Same facts, no furniture.
- **The footer is seven dots and two small numbers** on a hairline.

Nothing was hidden behind a drawer — he has told me before that hiding things
is not a fix. The information is all still on the screen; it is drawn at the
weight it deserves instead of every item shouting in its own box. The slack
that opens up sits between the context at the top and the action at the
bottom, which puts the one button in the thumb zone.

#### v58: a world that moves without you

He looked at the table and said the sharpest thing anyone has said about this
app: *"I didn't ask for a copy of Balatro. I asked for a game that can be as
sticky as Balatro."*

He was right and the distinction is exact. I had taken the reference literally
— jokers, an ante, chips × mult, a fan of cream playing cards — which is that
game's **nouns** wearing his life as a skin. Asked what the spine should
actually be, he picked the one thing seven rounds had never tried: **the app
moves while he is away, and opening it is finding out what happened.**

That is available to this app honestly, which is the whole reason it is worth
building. His life genuinely moves while he is not looking:

- Sheffield wakes and goes to bed on a clock eight hours behind him.
- Malta's shift starts and ends on a third clock.
- The gap since he last rang his dad goes up by one every midnight.
- Windows open and shut — the gym before the shift, the call while somebody is
  awake, sunscreen while the sun is up, the wind-down.
- He gets on a plane and the whole board shifts by a few hours.

None of that needs inventing. `world.js` is the clock the app keeps for itself,
and every event in it is a function of the record and the time — the same rule
`run.js` has always run on. **The world can report that time passed; it can
never report that he did something.**

Today reads top to bottom as past, present, future:

```
the hour, one line
WHILE YOU WERE AWAY   what the world did, with times on it
THE DAY               his shift and home's waking hours on one axis,
                      with now crossing it
the five basics
NEXT                  what is about to happen, and when
what is in play, and the button that does it
THE WINDOWS           open · shuts in · shut · done
the week and what today is worth, quietly, at the bottom
```

**The day strip is the picture this app has owed him since v1.** He works
Malta's hours from Singapore and his family is eight hours behind: the honest
reason he does not ring home is not that he forgets, it is that the only window
is inside his own shift. A list of three things can never say that. One axis
says it at a glance, and says it differently every day, because he is on a
plane most weeks. Its axis is *his* day, wake to wake — a midnight axis would
cut his shift in half and put Sheffield's evening in two pieces — and a window
that runs past the end of it is drawn as the two pieces it actually is.

**The score moved to the bottom.** For seven rounds the biggest thing on the
screen was a number about him, which is what made this a scoreboard attached to
a chore list. It is now one line in the footer with the week's seven marks, and
it opens its own working.

**The casino vocabulary is gone.** Jokers are **conditions** — standing facts
about how he lives, like weather, which is what they always were; the ante is
just the week; the playing cards are instruments with a bar that fills as the
window runs out. Not one number changed: `runchk` still hammers every read path
a hundred times and asserts not one day moved.

The pushes learned it too. A ping can now say *"Family shuts at 06:30 — 2h 10m
left"* instead of counting what is open, and it only says it when the window is
close enough for that to be true rather than manufactured.

#### v57: Today is a table

Six rounds of "make it feel like a game" and he answered the sixth with a
photograph of his own phone: *"Why haven't you changed the layout, design or
structure? It still looks entirely the same."*

He was right, and it is worth being exact about how. v53 to v56 each changed
what sat **inside** one frame that never moved: a pale ground, a stat bar on
top, a vertically scrolling column of white rounded cards, a six-tab light bar
underneath. v56 added a real engine — chips x mult, jokers, a weekly ante — and
then rendered it as two more white rounded cards in that same column. A list of
numbers about a game is not a game.

Balatro and AdVenture Capitalist are not scrolling columns. They are **boards**:
one screen, nothing below the fold, everything in a fixed place, read in a
second because nothing has moved since yesterday. So Today is now a board.

     the hour, one line, because Daylight is still a day
    +-----------------------------------------------------+
    |  JOKERS (slots, always drawn)  |  THE FIVE BASICS    |
    +--------------+--------------------------------------+
    |  THE WEEK    |        chips  x  mult  =  SCORE       |
    +--------------+--------------------------------------+
    |  what the card in play asks, and the button          |
    +-----------------------------------------------------+
    |        [ THE HAND - cards, tappable ]                |
    +-----------------------------------------------------+

**The hand is the change that matters.** The three pillars, the day's card, the
routines the hour has actually asked for and any waiting pack are no longer rows
in a list — they are cards he holds, each with its chip value printed in the
corner. Picking one up puts what it asks in the panel above; the button plays
it. A second tap on a card already in his hand plays it directly, so the
commonest action on the screen — tick the thing it just asked for — still costs
one tap.

Everything else follows from the board being a board. The whole app goes dark on
this tab, bar and stat row included, because a board framed by a white app is a
picture of a board. The joker shelf is **always** drawn, empty slots and all —
the old row returned an empty string until he owned one, which is why the single
new mechanic of v56 was invisible on the only account that matters. A score of
`0 x 1.0` now says what finishing would be worth underneath it. The month recap
stopped being a slab across the top and became a card like everything else. And
the working — every chip that scored, every multiplier that applied — moved into
a sheet the score panel opens, because a number you cannot account for is a
number you stop believing, but it does not need eighty pixels every day.

Two files were deleted rather than left lying around: `scene.css`, which was
entirely the old Today screen, and `game.css`, which was six rounds of trying to
paint a game onto it. `scene.js` kept only what the board is built out of — the
sun's arc, the day's short labels, and the ceremonies that take the screen.

The rule the engine was built on did not move: the board **reads** the record
and can never write to it. `runchk` still hammers every read path a hundred
times and asserts not one day changed.

#### v52: who is at the other end of it

Three rounds of design work had made the screens calm. None of them had made
the app worth *opening* — every screen answered "what do I owe?", and opening
it showed the state he closed it in. Nothing had happened.

**The people.** The third pillar is "a conversation with someone at home", and
the app's entire answer to it was a checkbox. His own deck already said this
better than a spec could: the Sheffield set is subtitled *"Home, and the people
you said you rarely speak to"*, and two of its cards are *"A call, not a text —
you said you rarely speak to them. This is the card that fixes it"* and
*"Germany — the friend since primary school, kept alive on almost nothing."* He
told the app that. The app wrote it down and kept offering him a tickbox.

So `people.js`: a roster, where each person has a place and therefore a clock
and a rhythm — how often he actually wants to speak to them. Tapping Family
opens *who did you speak to*, and a name is one tap that logs the call and
ticks the day. The Family row on Today wears the live line whether or not the
hour is pointing at it — "3 weeks since Mum · 09:42 there, mid-morning" — since
burying it until Family happens to be up next would bury it on most days. The
window arithmetic is the actual help: he is eight hours ahead of Sheffield on a
shift fixed to Malta, so the honest reason he does not ring is that the window
is narrow and moves twice a year. `Intl` does that, DST included, for anywhere
on earth.

Three rules it keeps. **It never invents a person** — the only name seeded is
Mum, because `briefFor` has marked Wednesday as her day since long before this
file; everyone else he adds. **Drifting is not failing** — nothing here touches
the run, the week or the streak, and a person with no rhythm set is never
"overdue". **He can decline it outright**, and the pillar goes back to being a
box: an app that insists on knowing about your family is worse than one with a
checkbox.

**The front page.** Once a day, on the first open, `opening.js` has something
ready: the day that just closed and what it did to the week, then today's
fixture, then two or three facts. It is allowed to exist only because it is a
*moment* and not a block — it takes the screen for four seconds and then it is
not anywhere, and nothing was added to Today to build it. Come back after a
fortnight away and it leads with "Nothing was lost", because the app that
scolds you for returning is the app you stop returning to.

**Tomorrow.** A finished day used to go silent: three ticks, a pack, nothing
until morning. Now it faces forward — one line, only once all three have
landed, carrying what the week still needs, tomorrow's session, and who is due.

**So far.** The app had kept a year of his life and never once shown it to him,
which is the wrong shape for a ledger belonging to someone whose stated
difficulty is short-term memory. A portrait, in prose, computed: where the
record starts, what is in it, the places it has followed him to, the weeks kept
from somewhere that was not home, the longest silence he has closed, and the
weekday it goes wrong on — said without turning it into a reprimand.

**One thing came out.** The coach file is the single thing in this app meant to
leave the phone, and it dumped all of `S`. Names are now the most personal
thing in there and they add nothing to a tuning question, so the roster, the
call log and the written notes all go out as "Person 1", "Person 2". The
backup file is untouched — that one goes from his phone to his own storage and
back.

446 checks across six suites.

#### Seasons, and why nothing here ends

He put it plainly: *"there is no completing this game, because a healthy life and routine is
something that always needs to keep going."* The app disagreed with him in four places — the deck
finished, the stages capped, the ranks stopped at the last name on the list, and completing the
collection left packs producing nothing but duplicates.

Ranks continue in numbered tiers now, each costing half again as much as the last. And the deck rolls
over: finish it and you deal a new season. Everything collected folds into a **vault**, and that
vault — not the current deck — is what rank, XP and the pot are computed from. A card is worth full
value the first time and a quarter of it every season after, so the ladder climbs forever without
season two being worth as much as season one.

The point of the rollover is that **nothing goes backwards**: trophies stay on the table, and rank,
pot and the spare balance are preserved to the number. The test asserts that rather than trusting the
code to have been careful.

One hazard came out of his own request. He asked me to keep writing new cards as his life happens —
and a single card appended to an already-complete set drops that set's minimum to zero. Measured, it
cost 100 XP and fifteen dollars the instant a card was added. So the set count is a **high-water
mark**: monotonic against play, and monotonic against me. The conventions for adding cards later are
written at the top of the deck in `data.js`.

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

#### v39: it knows where he is standing

> *"Optimise and enhance the design and the usability. Make the app feel intelligent and easy to use.
> When I go to the gym app, I want to know exactly what to train. When I go to the food app I want to
> know exactly what to eat and when. When I go to the today page, I want to know what my top
> priorities are without being overwhelmed by information. And I want to feel like I'm levelling up
> just by being consistent because being consistent is the most important thing. I want the app to
> know my location and suggest things around me. If I'm not in Singapore or Sheffield then I'm
> clearly on a work trip or on holiday. The app needs to react to my situation."*

Six sentences, one release. The spine of it is that the app stops assuming he is in Singapore.

**The phone's clock says where he is.** `Intl.DateTimeFormat().resolvedOptions().timeZone` names the
city and `getTimezoneOffset()` lands Malta's 10:00–17:00 on the local clock, daylight saving
included, with no permission asked and no prompt on arrival. A table of about seventy zones turns
`Europe/Sofia` into "Sofia · work trip" and `Asia/Makassar` into "Bali · holiday"; a zone it does not
know still gets its own name out of the string. One record a day — `S.where[iso] = {c, z, k}`,
written on the first open and never rewritten, so a flight keeps the city it started in and the past
cannot change under him. The old camp picker stays as the manual override for a phone left on
Singapore time.

**A holiday is a weekend that lasts longer.** Stopped is carried rather than owed, exactly as it is
on a Saturday — there is no Malta shift to finish. The guess is his to correct: one button on Today
flips the whole stay between work trip and holiday, and a corrected stay stays corrected. Because
the rule only ever turns an owed day into a met one, no streak, chip, pack or pot line can go down.
**A day in the air carries the run** the way a freeze does, and costs no freeze: the zone changed
between two recorded days, so he was travelling, and the week strip shows a plane rather than a
hollow miss. *A routine that survives travel is the whole point* — that sentence is from
`docs/plan.html` and it took until v39 to be true in the code.

**Today stops counting and starts instructing.** One function, `priority()`, decides the sky card's
line, and the Gym hero, the pillar row, the brief and both pushes all read it, so the app can never
say two things about one day. The card now reads *"Train. Session C, 30 min."* with *"3 moves ·
before Malta wakes at 16:00 · 5h 40m of yours"* under it and a pill that opens the session — or
*"Call home."* over a computed Sheffield clock, or *"Stop. Malta closed at 23:00."* On the last thing
left, the stake replaces the plan. The five basics and the week's three challenges became one-line
folds carrying their own score, and the paragraph that repeated the tip a second time is gone: **nine
blocks at open became seven** (eight away, where one fold explains the day here).

**Gym answers the question.** `gymPlan()` gives one of five answers — the session, a rest day the
morning after he lifted, a walk day once three are in since Monday, the travel session when he is
away, or the moves already logged — and the hero says which, with the number of moves and roughly
how many minutes. None of them is a refusal: the session is always one quiet tap underneath. **A
walk is Trained**, which has always been true and was never sayable; the button asks 20, 40 or 60
minutes and marks the pillar. **Session T** is the hotel-room programme that `docs/train.html`
promised from the start: six bodyweight moves, the dial reading *body* instead of a number, reps and
then a harder variation as the progression, and it sits outside the A–B–C rotation so a fortnight
away leaves the programme where he left it.

**Food answers the other one.** The three meal times were typed into a table — `~09:00`, `~14:00`,
"Grab" — which was wrong for half the year in Singapore and wrong every day of a trip. They are
computed now, from his wake time and where Malta's hours land: 09:15 / 15:00 / 20:00 in Singapore in
summer, 09:15 / 16:00 / 20:00 after the clocks change, 09:15 / 13:30 / 18:00 in Sheffield, 09:15 /
14:00 / 18:30 in Sofia. The third one lands **inside** the shift, because a delivery at 23:30 is the
diagnosis that tab was written about. The suggestion aims at one meal rather than the whole day's
gap, so it stops proposing a chicken rice to close 129g. And the menu follows him: twelve hawker
dishes at home, twelve British ones in Sheffield, twelve any-menu ones on the road.

**Levelling by turning up.** A full day paid 15 XP and the three cards it dropped paid about sixty,
so his sentence was false in the code: the crest was a card counter. It now pays **75 a day**, double
on the first day back, 100 for a week with five full days, 50 more for all seven, 250 for twenty in a
month, and 100 to 1,500 for a chip the day it is minted. Every term is a count derived from the
record, so the same save can only ever be worth more than it was — a record of thirty full days goes
from 450 XP to 3,250. The jump on first open is **silent** (`S.levelSeen` is stamped without applause,
the rule `backfillChips` already follows), and from then on a level takes the screen in the chip's own
grammar and names the reason: *"25 full days and 3 good weeks did that. Level 6 in 5 full days."*
Ceremonies queue rather than collide — a chip first, then the level, then the daily confetti.

**Around him, without a tracker.** No background location, ever. A tap in the "Where you are" sheet
reads the phone's position once, keeps two decimals (about a kilometre) and a city label **outside the
save**, so no backup and no coach file can carry a coordinate, and it is forgotten tomorrow. The
Around-you buttons hand a search to Apple Maps on an iPhone and Google Maps elsewhere: a gym in
Sofia, protein near you, a supermarket in Sheffield. Nothing is fetched and nothing leaves the phone.

Also in this round: the family tip stopped claiming it was 07:00 in Sheffield at any hour from any
city (it is computed, and the "Now" pointer no longer tells him to ring at two in the morning on a
Wednesday); the shadowed copies of the food helpers were deleted from `gym.js`, which `food.js` had
been silently overriding by load order; `.fine` finally has a rule, so twenty-five pieces of small
print stopped rendering as body text; the modal sheet can scroll, so a ten-item order list is not
clipped off the top of the screen; the toast is visible again under reduced motion; and a stray
comment tail in `you.css` that was eating the settings-list frame is closed.

#### v38: the belly, answered where he asked

He sent a photo of his middle and asked how to deal with the belly fat and
which exercises to put in the Gym tab. The plan on paper already had the
honest answer — you cannot spot-reduce; add muscle, protein three times a
day, tape not scale, the belly goes last — so the wrong move was crunches.
The design was put through a panel (three proposers with different lenses,
a judge, three adversarial refuters) before a line was written; the
refuters passed it with fixes that are all in.

**The finisher.** `STAGES` gains a sixth column and a stage of its own:
at two sessions logged, "The bike" — eight easy minutes on a bike, incline
treadmill or rower after the lifts, ten from Five moves, capped at ten
forever. Talking pace is the only intensity ("a sentence, not a song"); no
heart-rate zones, no dial. It is logged as `S.lifts[day].fin`, a sibling of
the exercises, so nothing that counts lifts ever sees it — and a
finisher-only visit can no longer advance the A/B/C rotation
(`nextSessionKey` skips days with no exercises). In the guided session it
is one step between the last movement and the summary, with a clock that
says "Finisher" rather than "Resting"; on the tab it is a dashed row with
no number that opens one four-option modal. Never counted as a move, never
required for Trained, the first thing to skip — and the skip says so
without judgement.

**The waist on the face of the tab.** The gym hero's second foot line now
carries the waist read; the fold stays closed at the bottom six days a week
and stands open under the lifts on a Sunday with no reading. The weekly
delta is gone: the trend compares the mean of the two latest Sundays with
the mean of the two nearest eight weeks earlier and calls anything under a
centimetre steady — a tape carries about that much noise. It has an "up"
branch with non-dieting words, because weight is allowed to rise on this
plan and waist is not. The 08:07 Sunday brief says "tape at the navel
first, before you eat".

**The explainer.** Six lines, one tap from where he goes looking for the ab
work ("Why no crunches — and where the belly comes in"), and from the
finisher row's `?`. Never auto-opens.

**No crunches, anywhere.** The two swap lists that offered cable crunches
and the ab machine now offer rep-counted core work (bird dog, lying leg
raise, banded dead bug) with their own how-to steps; the orphan opening
weights went with them. The walk to the gym became the warm-up in the
copy, not a counter. `docs/train.html` mirrors all of it.

#### v37: it knows what time it is

Nine days after the push went live on his phone, the brief was open: do
more with the notifications, more on design and usability, more on the
stickiness. One theme answers all three — the app knows the hour.

**Two nudges, not one.** `nudge.yml` runs two crons and passes which one it
is: 08:07 Singapore is the **morning brief**, 22:15 the **evening check**.
The payload is still one word. The device writes the words from a richer
mirror the app leaves on every save — open pillars, the run and the record,
the next chip, the week so far, and a *brief for today and tomorrow*
(`briefFor` in `state.js`) — so the morning push can describe a day the
app has not been opened on yet: "Wednesday · Mum's day — Train before Malta
wakes at 16:00. Session B, 3 moves. Order the kopi in the words on the
card." The evening push escalates when the app has not been opened at all
("Not opened today. Yesterday's run of 8 is on the line."), names the chip
within a week, calls a record when tonight would set one, and on Sundays
gives the week's score. `composeNudge` in `sw.js` is pure and tested off
the phone. The **app-icon badge** carries the open-pillar count while the
app is closed (set on the way out, cleared on the way in; a switch in You).

**The night look.** From dusk to dawn the whole app follows the sky, not
just the header: dark ground, dark paper, light ink — because the 22:15
push opens this app in bed, and a white screen there is a small
punishment. One token block in `tokens.css` under `:root[data-night]`;
the iron gym hero, the sealed card backs and the card faces are objects
and keep their own light. Pinnable light or dark in You. The active tab
also lost its 2.4:1 brand-blue label for one that reads at 10.5px.

**Racing yourself.** With a record of seven or more and the run within a
week of it, Today says so ("2 days from your record of 10"; "Tonight beats
your record"), and at record pace the flame in the HUD wears gold. When
the day is in, the line under the tiles now points at **tomorrow** — which
pillar first, which session — instead of "back tomorrow".

**The comeback.** Real games never punish the return; the return is the
win. A full day that follows three or more straight misses is a comeback:
it pays double into the pot (a new row on the pot screen, derived from the
record like everything else), counts double for XP, and Today greets it
with "Back. That was the hard part." Frozen days are not misses.

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
