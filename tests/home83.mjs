// v83: the home kit (a 10kg kettlebell and an ab wheel) and an ill day.
import { launch, open, close, saveWith, text, ERRS } from './harness.mjs';
await launch();
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const mk = (x, extra) => saveWith({ y:2026, m:9, d:29, fullBack:3, lifts:[[x || 2, 'B']], extra: { planSeeded: 0, ...(extra || {}) } });
let { p, ctx } = await open({ y:2026, m:9, d:29, hour:9, min:5, tz:'Asia/Singapore', save: mk(2) });
// the default kit is what he told us
ok(await p.evaluate(() => homeKitWords()) === 'a 10kg kettlebell, the ab wheel', 'home kit: ' + await p.evaluate(() => homeKitWords()));
// every home move, and every swap, has its own how-to (not the machine fallback)
const noHow = await p.evaluate(() => { const out = []; Object.keys(HOME_BY).forEach(k => HOME_BY[k].forEach(ex => [ex[0]].concat(ex[5] || []).forEach(n => { if (!HOW[n]) out.push(n); }))); return [...new Set(out)]; });
ok(!noHow.length, 'every home move has a how-to' + (noHow.length ? ': missing ' + noHow.join(', ') : ''));
// Not up to the gym: the kit is the first answer
await p.evaluate(() => go('gym')); await p.waitForTimeout(500);
await p.evaluate(() => askLowDay()); await p.waitForTimeout(400);
const opts = await p.$$eval('#modal [data-mk]', es => es.map(e => e.dataset.mk + ':' + e.textContent.trim().slice(0, 60)));
console.log('   options:', opts.join(' | '));
ok(opts[0].startsWith('home:At home, with the kit') && opts.some(o => o.startsWith('home10')) && opts.some(o => o.startsWith('ill:')), 'at home: the kit first, ten minutes, and ill');
await p.screenshot({ path: 'v83-lowday.png' });
await p.click('#modal [data-mk="home"]'); await p.waitForTimeout(500);
const ss = await p.evaluate(() => ({ key: SESSION.key, list: sessionList().map(e => e[0]), all: sessionFor('T')[1].map(e => e[0]), name: sessionFor('T')[2] }));
console.log('   session:', ss.name, '|', ss.list.join(', '), '| all:', ss.all.join(', '));
ok(ss.key === 'T' && /at home/.test(ss.name) && ss.all.some(n => /Kettlebell/.test(n)), 'a home session, built from the kit');
ok(ss.all.every(n => !/Backpack|Towel|Table-edge/.test(n)), 'no backpack rows when there is a bell');
await p.evaluate(() => { SESSION.warm = 1; paintSession(); }); await p.waitForTimeout(300);
await p.screenshot({ path: 'v83-home-move.png' });
// the bell: the load is the bell, the step is reps then tempo
const t0 = await p.evaluate(() => { const ex = HOME_BY.A[1]; return nextTarget(ex, ex[0]); });
ok(t0.w === 10 && /10kg bell/.test(t0.say), 'first time: your 10kg bell (' + t0.say + ')');
const t1 = await p.evaluate(() => { const y = shift(-1); S.lifts[y] = { s: 'T', ex: { 'Kettlebell overhead press': { w: 10, r: [10, 10, 10] } } }; const ex = HOME_BY.A[1]; return nextTarget(ex, ex[0]); });
ok(t1.w === 10 && t1.tag === 'slower' && /three seconds down/.test(t1.say), 'top of the range: slower, never a heavier bell (' + t1.say + ')');
await p.evaluate(() => { delete S.lifts[shift(-1)]; closeSession(); });
// kit variations
const vary = await p.evaluate(() => {
  const r = {};
  S.homeKit = { kb: 0, wheel: 1 }; r.wheelOnly = sessionFor('T')[1].map(e => e[0]);
  S.homeKit = { kb: 10, wheel: 0 }; r.bellOnly = sessionFor('T')[1].map(e => e[0]);
  S.homeKit = { kb: 0, wheel: 0 }; r.none = sessionFor('T')[1].map(e => e[0]);
  S.homeKit = { kb: 10, wheel: 1 }; return r; });
ok(!vary.wheelOnly.some(n => /Kettlebell/.test(n)), 'no bell: the bell moves become floor moves');
ok(!vary.bellOnly.some(n => /Ab wheel/.test(n)), 'no wheel: the rollout becomes a dead bug');
ok(!vary.none.some(n => /Kettlebell|Ab wheel/.test(n)), 'no kit: the plain room session');
// the home kit editor
await p.evaluate(() => render({})); await p.waitForTimeout(300);
ok(/Home kit · a 10kg kettlebell, the ab wheel/.test(await text(p, '#screen')), 'the Gym tab lists the home kit');
await p.click('[data-homekit]'); await p.waitForTimeout(400);
await p.click('#modal [data-mk="kb16"]'); await p.waitForTimeout(400);
ok(await p.evaluate(() => homeKit().kb === 16 && nextTarget(HOME_BY.C[0], HOME_BY.C[0][0]).w === 16), 'a new bell: 16kg, and the target follows');
await p.evaluate(() => { S.homeKit = { kb: 10, wheel: 1 }; save(); });
await ctx.close();
// in a hotel it is still the room
({ p, ctx } = await open({ y:2026, m:10, d:21, hour:9, min:0, tz:'America/New_York', save: mk(2) }));
ok(await p.evaluate(() => !sessionFor('T')[1].some(e => /Kettlebell|Ab wheel/.test(e[0]))), 'in New York: the room session, no bell');
await ctx.close();

// ill ---------------------------------------------------------------------------------
({ p, ctx } = await open({ y:2026, m:9, d:29, hour:9, min:30, tz:'Asia/Singapore', save: mk(2) }));
await p.evaluate(() => go('gym')); await p.waitForTimeout(400);
await p.evaluate(() => askLowDay()); await p.waitForTimeout(400);
await p.click('#modal [data-mk="ill"]'); await p.waitForTimeout(400);
ok(/Ill today\?/.test(await text(p, '#modal h3')) && /Above the neck/.test(await text(p, '#modal')) && /Below the neck/.test(await text(p, '#modal')), 'the ill sheet: the neck rule');
await p.screenshot({ path: 'v83-ill-sheet.png' });
await p.click('#modal [data-mk="rest"]'); await p.waitForTimeout(600);
const ill = await p.evaluate(() => ({ sick: sickOn(today()), req: required('train', today()), ids: winList(today()).map(w => w.id).join(' '),
  plan: dayPlan(today()).map(b => b.id).join(' '), say: dispatchFor(today()), veg: vegOn(today()) }));
console.log('   ill:', JSON.stringify(ill));
ok(ill.sick && !ill.req && !/p:train/.test(ill.ids) && ill.veg, 'ill: Train carried, no station, the day vegetates');
ok(!/focus|coffee|\bzh\b|admin/.test(ill.plan), 'nothing else is asked');
ok(/^Ill today\. Rest is the training/.test(ill.say), 'the bubble says so: ' + ill.say);
ok(/Ill today\./.test(await text(p, '.ill-b')), 'the Gym tab says it first');
await p.screenshot({ path: 'v83-gym-ill.png' });
// the day still counts with Family and Stop
const full = await p.evaluate(() => { tapPillar('family'); tapPillar('stop'); return allThree(today()); });
ok(full, 'Family and Stop still make the day');
// the Day list: feeling better
await p.evaluate(() => go('today')); await p.waitForTimeout(400);
await p.click('.tk-day'); await p.waitForTimeout(400);
ok(/Ill today/.test(await text(p, '#modal .dp-lead')) && !!(await p.$('#modal [data-mk="__sick"]')), 'Your day: ill, with Feeling better');
await p.screenshot({ path: 'v83-day-ill.png' });
await p.click('#modal [data-mk="__sick"]'); await p.waitForTimeout(500);
ok(await p.evaluate(() => !sickOn(today()) && required('train', today()) && winList(today()).some(w => w.id === 'p:train')), 'feeling better: the day is back');
// and ill again from the Day list
await p.click('.tk-day'); await p.waitForTimeout(400);
await p.click('#modal [data-mk="__ill"]'); await p.waitForTimeout(400);
await p.click('#modal [data-mk="rest"]'); await p.waitForTimeout(400);
ok(await p.evaluate(() => sickOn(today())), 'I’m ill from the Day list too');
await ctx.close();
await close();
console.log('ERRS:', ERRS.length ? ERRS : 'none');
