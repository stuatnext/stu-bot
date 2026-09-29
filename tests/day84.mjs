// v84: breakfast before the gym, breakfast ideas, his own coffee places, cleaning.
import { launch, open, close, saveWith, text, ERRS } from './harness.mjs';
await launch();
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const HAVE = { s: 'have', d: '2026-09-20' };
const mk = (x, extra) => saveWith({ y:2026, m:9, d:28, fullBack:3, lifts:[[x || 2, 'B']], extra: { planSeeded: 0, kit: { moist: HAVE, spf: HAVE, wash: HAVE }, ...(extra || {}) } });
// Monday 08:30, a session day, first open of v84: the yoghurt is seeded as had
let { p, ctx } = await open({ y:2026, m:9, d:28, hour:8, min:30, tz:'Asia/Singapore', save: mk(2, { seed84: 0 }) });
ok(await p.evaluate(() => kitState('am') === 'have' && S.seed84 === 1), 'the Greek yoghurt he has is in (seeded once)');
const plan = await p.evaluate(() => dayPlan(today()).map(b => b.id));
console.log('   plan:', plan.join(' '));
const I = id => plan.indexOf(id);
ok(I('wake') === 0 && I('m:morning') === 1 && I('p:train') === 2 && I('c:skin') > I('p:train'), 'come round, breakfast, then the gym, then the shower');
const wake = await p.evaluate(() => dayPlan(today())[0].say);
ok(/Water first, then a coffee/.test(wake), 'come round: water, then a coffee');
ok(I('coffee') > 0, 'coffee somewhere new on a Monday now');
ok(I('clean') > I('focus') && I('clean') < I('p:family'), 'a clean at midday, after the focus');
const cl = await p.evaluate(() => dayPlan(today()).find(b => b.id === 'clean'));
ok(cl.t === 'Clean the bathroom' && cl.dur === 15, 'Monday: the bathroom, fifteen minutes (' + cl.t + ')');
// breakfast idea on the step, and loggable
const bf = await p.evaluate(() => dayPlan(today()).find(b => b.id === 'm:morning').say);
console.log('   breakfast:', bf);
ok(/^Today’s idea: .+g of protein/.test(bf), 'the breakfast step carries the day’s idea');
await p.evaluate(() => startRun('day', 'm:morning')); await p.waitForTimeout(400);
await p.click('#task .tk-go'); await p.waitForTimeout(500);
const first = await p.$eval('#modal [data-mk]', e => e.dataset.mk + '|' + e.textContent);
ok(first.startsWith('__idea|') && /today’s idea/.test(first), 'logging breakfast: the idea is the first tap');
await p.screenshot({ path: 'v84-bf-log.png' });
await p.click('#modal [data-mk="__idea"]'); await p.waitForTimeout(500);
const idea = await p.evaluate(() => breakfastIdea());
ok(await p.evaluate(n => foodOn(today()).some(f => f[0] === n && f[2] === 'morning'), idea[0]), 'logged: ' + idea[0]);
await p.evaluate(() => closeRun());
// ideas rotate daily, some built on what is in the fridge
const ideas = await p.evaluate(() => { const out = []; for (let i = 0; i < 14; i++){ const d = new Date(2026, 9, 1 + i); out.push(breakfastIdea(iso(d))[5]); } return out; });
ok(new Set(await p.evaluate(() => { const o = []; for (let i = 0; i < 7; i++) o.push(breakfastIdea(iso(new Date(2026, 9, 1 + i)))[0]); return o; })).size >= 4 && ideas.filter(x => x === 'yog').length >= 4, 'a different idea most days, about half from the fridge');
// the Food tab list
await p.evaluate(() => { S.folds = { bfideas: 1 }; go('food'); }); await p.waitForTimeout(500);
ok((await p.$$('.bf-r')).length === 24 && /Today’s idea/.test(await text(p, '.bf-r.on')), 'Food: all 24 ideas, today’s on top');
await p.evaluate(() => document.querySelector('.bf').scrollIntoView()); await p.waitForTimeout(200);
await p.screenshot({ path: 'v84-bf-list.png' });
// his own coffee places
await p.evaluate(() => go('you')); await p.waitForTimeout(500);
await p.click('[data-cafes]'); await p.waitForTimeout(400);
ok((await p.$('#modal textarea#mkField')) !== null, 'a box to paste the list into');
await p.fill('#modal textarea', 'Kurasu — Tanjong Pagar\nApartment Coffee\n• Tiong Hoe — Queenstown — a good one\nKurasu — Tanjong Pagar');
await p.screenshot({ path: 'v84-cafes.png' });
await p.click('#modal [data-mk="__ok"]'); await p.waitForTimeout(500);
const own = await p.evaluate(() => S.cafes);
console.log('   own:', JSON.stringify(own));
ok(own.length === 3 && own[0][0] === 'Kurasu' && own[0][1] === 'Tanjong Pagar' && own[2][0] === 'Tiong Hoe' && own[2][2] === 'a good one', 'three added, areas read, the duplicate dropped');
const picks = await p.evaluate(() => [0, 1, 2, 3].map(i => coffeePick(iso(new Date(2026, 8, 28 + i)))[0]));
ok(picks.every(n => ['Kurasu', 'Apartment Coffee', 'Tiong Hoe'].includes(n)), 'his places come first: ' + picks.join(', '));
await p.evaluate(() => logCoffee(coffeePick(today())[0]));
const after = await p.evaluate(() => [coffeePick(today())[0], cafesOwn().filter(c => !coffeeTried(c[0])).length]);
ok(after[1] === 2, 'been to one: two of his still to go');
// the week settings
await p.evaluate(() => render({})); await p.waitForTimeout(300);
const set = await text(p, '.wkp-set');
console.log('   settings:', set);
ok(/Coffee and breakfast, then the gym/.test(set) && /A room a day/.test(set) && /3 of yours/.test(set), 'the week: mornings, cleaning, coffee places');
ok(/clean: bathroom/.test(await text(p, '.wkp-r[data-weekday="1"]')) && /clean: floors/.test(await text(p, '.wkp-r[data-weekday="6"]')), 'each day shows its room');
await p.evaluate(() => document.querySelector('.wkp').scrollIntoView()); await p.waitForTimeout(200);
await p.screenshot({ path: 'v84-week.png' });
// gym first instead
await p.click('[data-mornings]'); await p.waitForTimeout(300);
await p.click('#modal [data-mk="gym"]'); await p.waitForTimeout(300);
const pg = await p.evaluate(() => dayPlan(today()).map(b => b.id));
ok(pg.indexOf('p:train') < pg.indexOf('m:morning'), 'gym first: the gym before breakfast');
await p.evaluate(() => { S.bfFirst = 1; save(); });
// one big clean on Wednesday
await p.click('[data-cleanmode]'); await p.waitForTimeout(300);
await p.click('#modal [data-mk="weekly"]'); await p.waitForTimeout(300);
const wk = await p.evaluate(() => [cleanToday(today()), cleanToday('2026-09-30')]);
ok(wk[0] === null && wk[1][0] === 'The big clean' && wk[1][2] === 90, 'weekly: nothing Monday, the big clean Wednesday');
await p.evaluate(() => { S.cleanMode = 'daily'; save(); });
// the clean ticks and untick through the run
await p.evaluate(() => { go('today'); startRun('day', 'clean'); }); await p.waitForTimeout(400);
ok(/Home/.test(await text(p, '#task .tk-kk')) && /Clean the bathroom/.test(await text(p, '#task h2')), 'the run: clean the bathroom');
await p.click('#task .tk-go'); await p.waitForTimeout(400);
ok(await p.evaluate(() => !!dayRec(today()).clean), 'cleaned');
await p.click('#task [data-runback]'); await p.waitForTimeout(300);
await p.click('#task [data-runundo]'); await p.waitForTimeout(300);
ok(await p.evaluate(() => !dayRec(today()).clean), 'and taken back');
await p.evaluate(() => closeRun());
// every setting survives a reload (load() keeps only the keys it knows)
const kept = await p.evaluate(() => { S.bfFirst = 0; S.cleanMode = 'weekly'; save(); S = load();
  const r = { bf: S.bfFirst, cm: S.cleanMode, cafes: S.cafes.length, seed: S.seed84, am: (S.kit.am || {}).s };
  S.bfFirst = 1; S.cleanMode = 'daily'; save(); return r; });
ok(kept.bf === 0 && kept.cm === 'weekly' && kept.cafes === 3 && kept.seed === 1 && kept.am === 'have', 'survives a reload: ' + JSON.stringify(kept));
// vegetate and Sunday: no clean
ok(await p.evaluate(() => cleanToday('2026-10-04') === null), 'Sunday: no cleaning');
await ctx.close();
await close();
console.log('ERRS:', ERRS.length ? ERRS : 'none');
