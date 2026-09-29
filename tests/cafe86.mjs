// v86: his own coffee places, from his Google Maps screenshots.
import { launch, open, close, saveWith, text, ERRS } from './harness.mjs';
await launch();
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const s0 = saveWith({ y:2026, m:9, d:29, fullBack:3, extra: { planSeeded: 0, seed86: 0, cafes: [['Kurasu Singapore', 'Rochor', 'mine already']], coffee: [['2026-09-20', 'Lau Ka Kopitiam']] } });
let { p, ctx } = await open({ y:2026, m:9, d:29, hour:9, min:0, tz:'Asia/Singapore', save: s0 });
const st = await p.evaluate(() => ({ n: S.cafes.length, seed: S.seed86, names: S.cafes.map(c => c[0]), kur: S.cafes.filter(c => c[0] === 'Kurasu Singapore').length, mine: S.cafes[0][2] }));
ok(st.seed === 1 && st.n === 42 && st.kur === 1 && st.mine === 'mine already', 'his 42 places are in, nothing doubled, his own entry kept (' + st.n + ')');
ok(['Compound Coffee Co.', 'Bolder Brews Coffeehouse', 'Optional Coffee', 'Lau Ka Kopitiam', 'Soon Hong Coffee Stall'].every(n => st.names.includes(n)), 'the specialty ones and the kopi stalls both');
ok(!st.names.some(n => /Kimly|Xin Lai Lai|Fresh Brew|Royal Plaza|Bee Kia|Pork Noodles|Ubi 33/.test(n)), 'food courts, low ratings and not-coffee left out');
// a new one of his each day, never one he has been to
const MINE = await p.evaluate(() => MY_CAFES.map(c => c[0] + '|' + c[1]));
const picks = await p.evaluate(() => { const o = []; for (let i = 0; i < 10; i++) o.push(coffeePick(iso(new Date(2026, 8, 29 + i)))[0]); return o; });
console.log('   ten days:', picks.join(' | '));
ok(picks.every(n => MINE.some(c => c.split('|')[0] === n) || n === 'Kurasu Singapore') && !picks.includes('Lau Ka Kopitiam'), 'the picks are his places, and not the one he has been to');
ok(new Set(picks).size >= 6, 'a different place most days (' + new Set(picks).size + ' of 10)');
const cf = await p.evaluate(() => { const w = winList(today()).find(w => w.id === 'coffee'); return w ? w.why : 'none'; });
ok(MINE.some(c => cf.startsWith(c.replace('|', ', '))) || cf.startsWith('Kurasu Singapore, Rochor'), 'today on the road: ' + cf);
// the sheet shows the place, its area and what it is
await p.evaluate(() => startRun('day', 'coffee')); await p.waitForTimeout(400);
await p.click('#task .tk-go'); await p.waitForTimeout(400);
const sheet = await text(p, '#modal .kit-c');
console.log('   sheet:', sheet.slice(0, 160));
ok(/Today’s pick/.test(sheet) && /on Google|Kopi|Coffee|Roaster|Caf/.test(sheet), 'the sheet: the pick, the area, what it is');
await p.screenshot({ path: 'v86-coffee.png' });
await ctx.close();
// the seed runs once: next open, nothing re-added
const s1 = saveWith({ y:2026, m:9, d:30, fullBack:3, extra: { planSeeded: 0, seed86: 1, cafes: [['Compound Coffee Co.', 'Kaki Bukit', '']] } });
({ p, ctx } = await open({ y:2026, m:9, d:30, hour:9, min:0, tz:'Asia/Singapore', save: s1 }));
ok(await p.evaluate(() => S.cafes.length) === 1, 'the seed runs once - a list he trims stays trimmed');
await ctx.close();
await close();
console.log('ERRS:', ERRS.length ? ERRS : 'none');
