// v85: the protein shake step, and heads-up notifications written from the day's plan.
import { launch, open, close, saveWith, text, ERRS } from './harness.mjs';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
await launch();
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const HAVE = { s: 'have', d: '2026-09-20' };
const mk = (x, extra) => saveWith({ y:2026, m:9, d:28, fullBack:3, lifts:[[x, 'B']], extra: { planSeeded: 0, kit: { moist: HAVE, spf: HAVE, wash: HAVE, am: HAVE }, ...(extra || {}) } });
// the service worker's composer, run as the phone would run it
const swSrc = readFileSync(new URL('../app/sw.js', import.meta.url), 'utf8');
const ctxSW = { self: { addEventListener(){}, registration: {}, clients: {}, skipWaiting(){} }, caches: {}, fetch(){}, console, Response: function(){}, URL, Promise, setTimeout };
vm.createContext(ctxSW); vm.runInContext(swSrc, ctxSW);
const compose = (kind, st, iso, dow, h, m) => vm.runInContext('composeNudge', ctxSW)(kind, st, iso, dow, h, m);

// Monday, a session day (last session two days ago): the shake straight after the gym
let { p, ctx } = await open({ y:2026, m:9, d:28, hour:8, min:40, tz:'Asia/Singapore', save: mk(2) });
let plan = await p.evaluate(() => dayPlan(today()).map(b => b.id));
console.log('   plan:', plan.join(' '));
ok(plan.indexOf('shake') === plan.indexOf('c:sun') + 1 && plan.indexOf('shake') > plan.indexOf('p:train'), 'gym day: the shake right after the gym and the shower');
const sb = await p.evaluate(() => dayPlan(today()).find(b => b.id === 'shake'));
ok(/Straight after the gym/.test(sb.say) && /34g/.test(sb.say), 'it says when, and how much: ' + sb.say);
// log it through the run
await p.evaluate(() => startRun('day', 'shake')); await p.waitForTimeout(400);
await p.click('#task .tk-go'); await p.waitForTimeout(400);
const opts = await p.$$eval('#modal [data-mk]', es => es.map(e => e.dataset.mk + ':' + e.textContent.replace(/\s+/g, ' ').trim()));
console.log('   milks:', opts.join(' | '));
ok(/cow:.*34g/.test(opts[0]) && /soy:.*33g/.test(opts[1]) && /oat:.*27g.*little protein/.test(opts[2]), 'the milk sheet: cow 34g, soy 33g, oat 27g, and why');
await p.screenshot({ path: 'v85-shake.png' });
await p.click('#modal [data-mk="cow"]'); await p.waitForTimeout(500);
const fd = await p.evaluate(() => ({ on: shakeOn(today()), milk: S.shakeMilk, row: foodOn(today()).find(f => f[2] === 'snack') }));
ok(fd.on && fd.milk === 'cow' && fd.row[1] === 34 && /^Protein shake, cow/.test(fd.row[0]), 'logged: ' + JSON.stringify(fd.row));
await p.click('#task [data-runback]'); await p.waitForTimeout(300);
await p.click('#task [data-runundo]'); await p.waitForTimeout(400);
ok(await p.evaluate(() => !shakeOn(today())), 'and taken back');
await p.evaluate(() => closeRun());
ok(await p.evaluate(() => BREAKFASTS.some(b => /Ninja/.test(b[0]) && b[1] === 34)), 'the Ninja shake is a breakfast idea too');
// the mirror carries today's plan
const mirror = await p.evaluate(() => new Promise(res => {
  Object.defineProperty(window, 'caches', { configurable: true, value: { open: () => Promise.resolve({ put: (k, r) => r.text().then(t => res(JSON.parse(t))) }) } });
  mirrorState();
}));
ok(Array.isArray(mirror.plan) && mirror.plan.some(b => b.id === 'shake') && mirror.plan.some(b => b.id === 'work') && mirror.plan.every(b => typeof b.at === 'number' && b.t), 'the mirror carries the plan (' + mirror.plan.length + ' blocks)');
await ctx.close();

// the words, from that plan, at the heads-up times
const at = id => mirror.plan.find(b => b.id === id).at;
const hm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const f1 = compose('focus', mirror, '2026-09-28', 1, 9, 50);
console.log('   09:50:', f1.title, '|', f1.body);
const MINOR = ['wake','m:morning','c:skin','c:sun','c:cleanse','c:night','c:bed','shake','bed','setup','work','m:dinner','p:stop'];
const expectNext = mirror.plan.filter(b => !b.d && b.at >= 9 * 60 + 50 + 20 && !MINOR.includes(b.id))[0];
ok(f1.title === 'At ' + hm(expectNext.at) + ': ' + expectNext.t && /^In \d+ minutes\./.test(f1.body) && !/Moisturiser/.test(f1.title), 'focus heads-up: the next real thing, 20+ minutes out');
const s1 = compose('shift', mirror, '2026-09-28', 1, 15, 15);
console.log('   15:15:', s1.title, '|', s1.body);
ok(s1.title === 'Malta at ' + hm(at('work')) && /In 45 minutes\./.test(s1.body) && /Eat first/.test(s1.body), 'shift heads-up: Malta in 45, eat first');
const t1 = compose('stop', mirror, '2026-09-28', 1, 22, 30);
console.log('   22:30:', t1.title, '|', t1.body);
ok(t1.title === 'Wrap up at ' + hm(at('p:stop')) && /Half an hour left/.test(t1.body) && /Bed at/.test(t1.body), 'stop heads-up: wrap up, the night routine, bed');
const i1 = compose('focus', { ...mirror, ill: 1 }, '2026-09-28', 1, 9, 50);
ok(i1.title === 'Rest today' && i1.silent, 'ill: rest, quietly');
const old = compose('focus', { ...mirror, day: '2026-09-27' }, '2026-09-28', 1, 9, 50);
ok(old.title && !/^At /.test(old.title), 'not opened today: the old words, not a stale plan');
const m1 = compose('morning', mirror, '2026-09-28', 1, 8, 35);
console.log('   08:35:', m1.title, '|', m1.body);
ok(/Monday · Strait Up Growth/.test(m1.title) && /^Water, a coffee, breakfast\. Then: .+ \d\d:\d\d · .+/.test(m1.body) && (m1.body.match(/Leg Day/g) || []).length === 1, 'morning: the day\u2019s shape in times, said once');
// a rest day: the shake in the gap after the focus block
({ p, ctx } = await open({ y:2026, m:9, d:28, hour:8, min:40, tz:'Asia/Singapore', save: mk(1) }));
plan = await p.evaluate(() => dayPlan(today()).map(b => b.id));
ok(plan.indexOf('shake') === plan.indexOf('focus') + 1, 'rest day: the shake after the focus block');
await ctx.close();
// a date night heads-up
({ p, ctx } = await open({ y:2026, m:11, d:2, hour:18, min:0, tz:'Asia/Singapore', save: saveWith({ y:2026, m:11, d:2, fullBack:3, extra: { planSeeded: 0 } }) }));
const m2 = await p.evaluate(() => new Promise(res => { Object.defineProperty(window, 'caches', { configurable: true, value: { open: () => Promise.resolve({ put: (k, r) => r.text().then(t => res(JSON.parse(t))) }) } }); mirrorState(); }));
await ctx.close();
const d1 = compose('date', m2, '2026-11-02', 1, 19, 2);
console.log('   19:02:', d1.title, '|', d1.body);
ok(/^Date night at 19:30/.test(d1.title) && /Laptop shut in 28 minutes/.test(d1.body), 'date night: laptop shut in 28 minutes');
await close();
console.log('ERRS:', ERRS.length ? ERRS : 'none');
