// v94: opening hours, read off each place's note. A late opener moves the
// coffee to after two; nothing is planned before a place opens.
import { launch, open, close, saveWith, text, ERRS } from './harness.mjs';
await launch();
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const HAVE = { s: 'have', d: '2026-09-20' };
const GEN = ['Generation Coffee Roasters (Tanjong Pagar)', 'Tanjong Pagar, 280m', 'The roaster’s own stall, opens 11:30 · 4.5 from 99 reviews'];
const KOPI = ['Kopi MORE', 'About 4km away', 'Kopi stall. Opens at 11: go at opening, before the hawker lunch · 4.4'];
const VPRO = ['Vpro Coffee', '280m away', 'Kaya toast, soft eggs and kopi, shuts 15:00 · 4.6'];
const PLAIN = ['Fluid', 'Bendemeer', 'Coffee · 4.7'];
// the same Tuesday as day82: a rest day, so the walk goes to the coffee
const mk = (cafes) => saveWith({ y:2026, m:9, d:29, fullBack: 3, lifts: [[1, 'B']], extra: { planSeeded: 0, cafes, coffee: [], kit: { moist: HAVE, spf: HAVE, wash: HAVE, am: HAVE } } });
const at = async (p, hour, min) => p.evaluate(() => { const b = dayPlan(today()).find(b => b.id === 'coffee'); return b ? [b.at, hhmm(b.at), b.say] : null; });

// the hours, off the notes
let { p, ctx } = await open({ y:2026, m:9, d:29, hour:8, min:30, tz:'Asia/Singapore', save: mk([PLAIN]) });
const hrs = await p.evaluate(([g, k, v, f]) => [cafeHours(g), cafeHours(k), cafeHours(v), cafeHours(f), coffeeLate(cafeHours(g)), coffeeLate(cafeHours(k))], [GEN, KOPI, VPRO, PLAIN]);
ok(hrs[0].open === 690 && hrs[1].open === 660 && hrs[2].shut === 900 && hrs[3].open === 0 && hrs[3].shut === 0, 'read off the notes: opens 11:30, opens at 11, shuts 15:00, and nothing where nothing is said');
ok(hrs[4] === true && hrs[5] === false, 'opening at 11:30 is too late for the morning; at 11 there is still time before the crowd');
// a place with no hours: the morning, as before
const plain = await at(p);
ok(plain && plain[0] < 705, 'no hours known: coffee in the morning as before (' + plain[1] + ')');
await ctx.close();

// the late opener: after two, and every word says so
({ p, ctx } = await open({ y:2026, m:9, d:29, hour:8, min:30, tz:'Asia/Singapore', save: mk([GEN]) }));
const gen = await at(p);
console.log('   late opener:', gen[1], '·', gen[2]);
ok(gen[0] >= 840, 'Generation opens at 11:30: the coffee goes after two (' + gen[1] + ')');
ok(/Opens 11:30, so after two/.test(gen[2]), 'the plan step says why');
const cw = await p.evaluate(() => coffeeWindow(today()));
ok(cw[0] >= 840, 'the window starts after two, not at wake (' + cw.map(m => Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0')).join('-') + ')');
const why = await p.evaluate(() => (winList(today()).find(w => w.id === 'coffee') || {}).why || '');
ok(/Opens 11:30/.test(why), 'the road says it too: ' + why);
await p.evaluate(() => { askCoffee(); }); await p.waitForTimeout(350);
const sheet = await text(p, '#modal .kit-c');
ok(/Opens 11:30, and the lunch crowd follows at twelve\. Go after two\./.test(sheet) && !/Before 11:45/.test(sheet), 'the sheet: go after two, not "before 11:45"');
await ctx.close();

// opens at 11: planned at opening, never before it
({ p, ctx } = await open({ y:2026, m:9, d:29, hour:8, min:30, tz:'Asia/Singapore', save: mk([KOPI]) }));
const kopi = await at(p);
console.log('   opens at 11:', kopi[1], '·', kopi[2]);
ok(kopi[0] === 660, 'Kopi MORE opens at 11: the coffee is at 11:00 on the dot, not before (' + kopi[1] + ')');
ok(/Opens 11:00: go at opening/.test(kopi[2]), 'at opening, and it says so');
const walk = await p.evaluate(() => { const d = dayPlan(today()); const w = d.find(b => b.id === 'p:train'); return w ? w.at : null; });
ok(walk === 645, 'the rest-day walk sets off at 10:45, so it is the walk there');
const all = await p.evaluate(() => dayPlan(today()).map(b => b.at));
ok(all.every((m, i) => i === 0 || m >= all[i - 1]), 'the day is still in order');
await ctx.close();

// a long morning pushes an ordinary place past lunch: the step says after two
({ p, ctx } = await open({ y:2026, m:9, d:29, hour:8, min:30, tz:'Asia/Singapore', save: mk([VPRO]) }));
const late = await p.evaluate(() => { const c = coffeePick(today()); return [coffeeWhen(c, 14 * 60 + 15), coffeeWhen(c, 10 * 60)]; });
ok(late[0] === 'After two, once the lunch crowd has gone. It shuts at 15:00.' && late[1] === 'Before the lunch crowd at twelve.', 'the words follow the planned minute: ' + late[0]);
await ctx.close();

// the afternoon sheet: no more "before 11:45" after two, and the closing time
({ p, ctx } = await open({ y:2026, m:9, d:29, hour:14, min:20, tz:'Asia/Singapore', save: mk([VPRO]) }));
await p.evaluate(() => { askCoffee(); }); await p.waitForTimeout(350);
const aft = await text(p, '#modal .kit-c');
ok(/The lunch crowd has gone, so now is good\. It shuts at 15:00\./.test(aft) && !/Before 11:45/.test(aft), 'after two: now is good, and it shuts at 15:00');
await p.screenshot({ path: 'v94-afternoon.png' });
await ctx.close();
// the evening: a place that shut at three is not "now is good"
({ p, ctx } = await open({ y:2026, m:9, d:29, hour:19, min:0, tz:'Asia/Singapore', save: mk([VPRO]) }));
await p.evaluate(() => { askCoffee(); }); await p.waitForTimeout(350);
const eve = await text(p, '#modal .kit-c');
ok(/It shuts at 15:00, so not today\./.test(eve) && !/now is good/.test(eve), 'the evening, after it shut: not today');
await ctx.close();
// in the lunch crowd, with a closing time
({ p, ctx } = await open({ y:2026, m:9, d:29, hour:12, min:30, tz:'Asia/Singapore', save: mk([VPRO]) }));
await p.evaluate(() => { askCoffee(); }); await p.waitForTimeout(350);
ok(/It is the lunch crowd now\. After two is quieter\. It shuts at 15:00\./.test(await text(p, '#modal .kit-c')), 'in the lunch crowd: after two, and it shuts at 15:00');
await ctx.close();

await close();
console.log('ERRS:', ERRS.length ? ERRS : 'none');
