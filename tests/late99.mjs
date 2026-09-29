// v99: running behind. At 11:45 with the gym (09:15), the shake, the kit and
// coffee all missed, the app says so and re-plans the rest of the day from now.
import { launch, open, close, saveWith, text, ERRS } from './harness.mjs';
await launch();
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const HAVE = { s: 'have', d: '2026-09-20' };
// a gym day: last session three days ago
const mk = (extra) => saveWith({ y:2026, m:9, d:29, fullBack: 3, lifts: [[3, 'A']], extra: Object.assign({ planSeeded: 0, kit: { moist: HAVE, spf: HAVE, wash: HAVE } }, extra || {}) });
const at = (hour, min, save) => open({ y:2026, m:9, d:29, hour, min, tz:'Asia/Singapore', save: save || mk() });
const PIN = ['p:family', 'setup', 'work', 'date', 'p:stop', 'week', 'c:cleanse', 'c:night', 'c:bed', 'bed'];
const pinned = id => PIN.includes(id) || (id.startsWith('m:') && id !== 'm:morning');

// 11:45: behind, and it says so
let { p, ctx } = await at(11, 45);
const raw = await p.evaluate(() => dayPlan(today(), { raw: 1 }).map(b => ({ id: b.id, at: b.at, dur: b.dur, t: b.t })));
const gym = raw.find(b => b.id === 'p:train');
console.log('   first plan:', raw.filter(b => !pinned(b.id)).map(b => Math.floor(b.at / 60) + ':' + String(b.at % 60).padStart(2, '0') + ' ' + b.id).join(' | '));
ok(gym && gym.at === 555, 'the first plan had the gym at 09:15');
const banner = await text(p, '.late-b');
ok(/Running behind\. Breakfast, the gym and \d more were planned before now\./.test(banner), 'Today says it: ' + banner);
// the sheet: what slipped, the rest of the day from now, what waits for tomorrow
await p.click('.late-b button'); await p.waitForTimeout(400);
const sheet = await text(p, '#modal');
ok(/Running behind/.test(sheet) && /It is 11:45\. 7 things were planned before now\./.test(sheet), 'the sheet: it is 11:45, seven things slipped');
ok(/Missed so far/.test(sheet) && /From 11:45/.test(sheet) && /For tomorrow/.test(sheet), 'missed so far, from 11:45, for tomorrow');
ok(/Re-plan from 11:45/.test(sheet) && /I’m not well/.test(sheet), 'two ways on: re-plan, or not well');
await p.screenshot({ path: 'v99-sheet.png' });
const goBtn = await p.$('#modal button:has-text("Re-plan from 11:45")');
await goBtn.click(); await p.waitForTimeout(500);
const after = await p.evaluate(() => { const pl = dayPlan(today());
  return { from: dayRec(today()).from, plan: pl.map(b => ({ id: b.id, at: b.at, dur: b.dur, done: !!b.done, moved: !!b.moved })),
           dropped: (pl.dropped || []).map(b => b.id), now: (planNow(pl) || {}).id, banner: !!document.querySelector('.late-b') }; });
console.log('   re-planned:', after.plan.filter(b => !pinned(b.id)).map(b => Math.floor(b.at / 60) + ':' + String(b.at % 60).padStart(2, '0') + ' ' + b.id).join(' | '), '· tomorrow:', after.dropped.join(', '));
ok(after.from === 705 && !after.banner, 'stored from 11:45, and the banner has gone');
const flex = after.plan.filter(b => !pinned(b.id) && !b.done);
ok(flex.length && flex.every(b => b.at >= 705), 'everything still to do starts at 11:45 or later');
ok(flex.every(b => b.at + b.dur <= 945), 'and it all ends by 15:45, when Malta setup starts');
const pins = after.plan.filter(b => pinned(b.id));
ok(pins.every(b => { const r = raw.find(x => x.id === b.id); return r && r.at === b.at; }), 'the meals, the call home and Malta keep their own clock');
const clash = flex.some(a => after.plan.some(b => b !== a && b.dur > 0 && !b.done && a.at < b.at + b.dur && b.at < a.at + a.dur));
ok(!clash, 'nothing overlaps anything');
const cafe = after.plan.find(b => b.id === 'coffee');
ok(!cafe || cafe.at >= 840 || cafe.at + 45 <= 705, 'coffee, if it is still in, stays out of the lunch crowd');
const order = ['m:morning', 'p:train', 'c:skin', 'c:sun', 'shake'].map(id => (after.plan.find(b => b.id === id) || {}).at);
ok(order.every((m, i) => m != null && (i === 0 || m >= order[i - 1])), 'breakfast, the gym, the routine after the shower, the shake after the gym: still in that order');
ok(after.plan.some(b => b.id === 'p:train') && after.plan.some(b => b.id === 'focus'), 'the gym and the day’s focus survive; they are the last to give way');
ok(after.dropped.length > 0 && after.dropped.every(id => ['coffee', 'admin', 'clean', 'kit', 'life', 'todo', 'card'].includes(id)), 'what waits for tomorrow is the lighter stuff: ' + after.dropped.join(', '));
ok(after.now === 'm:morning', 'the card is on breakfast, the first thing from now');
// the Day list says so, lists tomorrow, and can undo
await p.click('.tk-day'); await p.waitForTimeout(400);
const dl = await text(p, '#modal');
ok(/Re-planned from 11:45\./.test(dl) && /For tomorrow/.test(dl) && /Back to the first plan/.test(dl), 'the Day list: re-planned from 11:45, for tomorrow, and a way back');
const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('daylight.v4')));
await p.click('#modal [data-mk="__unplan"]'); await p.waitForTimeout(500);
const undone = await p.evaluate(() => ({ from: dayRec(today()).from, gym: (dayPlan(today()).find(b => b.id === 'p:train') || {}).at, banner: !!document.querySelector('.late-b') }));
ok(undone.from == null && undone.gym === 555 && undone.banner, 'back to the first plan: the gym at 09:15 again, and the banner back');
await ctx.close();

// it is saved: the next open keeps the re-plan
({ p, ctx } = await at(11, 50, saved));
const kept = await p.evaluate(() => ({ from: dayRec(today()).from, first: dayPlan(today()).filter(b => !b.done && !b.mark && b.at >= 705).map(b => b.id)[0] }));
ok(kept.from === 705 && kept.first === 'm:morning', 'reopened: still re-planned from 11:45');
await ctx.close();

// not well: the ill sheet, then the rest of the day, without the gym
({ p, ctx } = await at(11, 45));
await p.click('.late-b button'); await p.waitForTimeout(400);
await (await p.$('#modal button:has-text("I’m not well")')).click(); await p.waitForTimeout(400);
ok(/Ill today\?/.test(await text(p, '#modal')), 'not well: the ill choices (rest, or a gentle walk)');
await (await p.$('#modal button:has-text("Rest today")')).click(); await p.waitForTimeout(500);
const ill = await p.evaluate(() => ({ sick: sickOn(today()), from: dayRec(today()).from, gym: dayPlan(today()).some(b => b.id === 'p:train'), banner: !!document.querySelector('.late-b') }));
ok(ill.sick && ill.from === 705 && !ill.gym && !ill.banner, 'rest today: ill, re-planned from 11:45, no gym, no banner');
await ctx.close();

// not well, then "I'm fine, actually": nothing changes
({ p, ctx } = await at(11, 45));
await p.click('.late-b button'); await p.waitForTimeout(400);
await (await p.$('#modal button:has-text("I’m not well")')).click(); await p.waitForTimeout(400);
await (await p.$('#modal button:has-text("I’m fine, actually")')).click(); await p.waitForTimeout(400);
const fine = await p.evaluate(() => ({ sick: sickOn(today()), from: dayRec(today()).from, saved: (JSON.parse(localStorage.getItem('daylight.v4')).dayp || {})['2026-09-29'] }));
ok(!fine.sick && fine.from == null && !(fine.saved && fine.saved.from), 'backing out of the ill sheet changes nothing');
await ctx.close();

// in the shift, and in the evening: no nagging
({ p, ctx } = await at(17, 0));
ok(!(await p.$('.late-b')) && (await p.evaluate(() => planBehind(today()).length)) === 0, 'at 17:00, in the Malta shift: no banner');
await ctx.close();

// earlier: at 10:30 four things have slipped; from 09:40 there is room, and
// the day keeps its own order (the coffee group apart, which still waits for
// the lunch crowd to go)
({ p, ctx } = await at(10, 30));
ok((await p.evaluate(() => planBehind(today()).length)) >= 2 && !!(await p.$('.late-b')), 'at 10:30, breakfast, the gym and the routine have slipped: the banner is up');
await ctx.close();
({ p, ctx } = await at(9, 40));
const early = await p.evaluate(() => {
  const cg = b => b.id === 'coffee' || b.lead;
  const before = dayPlan(today(), { raw: 1 }).filter(b => !b.done && !planPinned(b) && b.id !== 'wake' && !cg(b)).map(b => b.id);
  const F = replanMinute(), pl = dayPlan(today(), { from: F });
  return { F, before, after: pl.filter(b => !b.done && !planPinned(b) && !cg(b)).map(b => b.id), dropped: (pl.dropped || []).map(b => b.id),
           cafe: (pl.find(b => b.id === 'coffee') || {}).at };
});
console.log('   from 09:40:', early.after.join(' > '), '| coffee', early.cafe != null ? Math.floor(early.cafe / 60) + ':' + String(early.cafe % 60).padStart(2, '0') : 'none');
ok(!early.dropped.length && early.after.join() === early.before.join(), 'with room, nothing is dropped and the order is the day\u2019s own');
ok(early.cafe == null || early.cafe + 45 <= 705 || early.cafe >= 840, 'coffee still misses the lunch crowd');
await ctx.close();

// too late for anything before Malta: it all waits for tomorrow
({ p, ctx } = await at(15, 50));
const eve = await p.evaluate(() => { const pl = dayPlan(today(), { from: replanMinute() });
  return { left: pl.filter(b => !b.done && !planPinned(b)).length, dropped: (pl.dropped || []).length }; });
ok(eve.left === 0 && eve.dropped > 0, 'at 15:50 nothing fits before Malta, so it is all tomorrow’s (' + eve.dropped + ')');
await ctx.close();

// not behind, and before getting up: no banner
({ p, ctx } = await at(8, 40));
ok(!(await p.$('.late-b')), 'on time at 08:40: no banner');
await ctx.close();
({ p, ctx } = await at(7, 0));
ok(!(await p.$('.late-b')) && (await p.evaluate(() => planBehind(today()).length)) === 0, 'at 07:00, before getting up: nothing is late');
await ctx.close();

await close();
console.log('ERRS:', ERRS.length ? ERRS : 'none');
