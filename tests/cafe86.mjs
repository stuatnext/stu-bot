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
// v87: the second batch lands once, on top of a list he has already trimmed
const s2 = saveWith({ y:2026, m:10, d:1, fullBack:3, extra: { planSeeded: 0, seed86: 1, seed87: 0,
  cafes: [['Compound Coffee Co.', 'Kaki Bukit', ''], ['Lau Ka Kopitiam', 'Bedok North', ''], ['Coffee Deli', 'Serangoon Gardens', 'his own']] } });
({ p, ctx } = await open({ y:2026, m:10, d:1, hour:9, min:0, tz:'Asia/Singapore', save: s2 }));
const b2 = await p.evaluate(() => ({ n: S.cafes.length, seed: S.seed87, names: S.cafes.map(c => c[0]), deli: S.cafes.filter(c => c[0] === 'Coffee Deli').length }));
ok(b2.seed === 1 && b2.n === 12 && b2.deli === 1 && ['TheDuckCoffee', 'Saba\u2019 Coffee Co.', '48 Richards Place Coffee', 'Yahava KoffeeWorks'].every(n => b2.names.includes(n)), 'the north-east batch: nine new, the one he had kept once, the trimmed list not refilled (' + b2.n + ')');
ok(!b2.names.some(n => /Cotti|luckin|Komalas|Siva|218|Broadway|BK@212/i.test(n)), 'chains, groceries and low ratings left out');
await ctx.close();
// v88: the third batch, and near ones on weekdays, the trips at the weekend
const s3 = saveWith({ y:2026, m:10, d:2, fullBack:3, extra: { planSeeded: 0, seed86: 0, seed87: 0, seed88: 0, cafes: [], coffee: [] } });
({ p, ctx } = await open({ y:2026, m:10, d:2, hour:9, min:0, tz:'Asia/Singapore', save: s3 }));
const b3 = await p.evaluate(() => ({ n: S.cafes.length, seed: S.seed88, names: S.cafes.map(c => c[0]) }));
ok(b3.seed === 1 && b3.n === 55 && ['Cowpresso Coffee Roasters', 'The Coffee Roaster Cafe', 'Homebody Caf\u00e9'].every(n => b3.names.includes(n)), 'the third batch: three cafés in, 55 in all (' + b3.n + ')');
ok(!b3.names.some(n => /BrewRatio|Alliance|Gold Beverage|MEOW|Speedy|Coffee Bean|Yue Hwa|Siva|218/i.test(n)), 'suppliers, a chain, a department store and the barely-reviewed left out');
ok(await p.evaluate(() => S.cafes.filter(c => /Yahava|Compound/.test(c[0])).length) === 2, 'Yahava and Compound not doubled');
const wk = await p.evaluate(() => { const o = []; for (let i = 0; i < 28; i++){ const k = iso(new Date(2026, 9, 1 + i)); o.push([k, dowOf(k), coffeePick(k)]); } return o; });
const wd = wk.filter(x => x[1] > 0 && x[1] < 6), we = wk.filter(x => x[1] === 0 || x[1] === 6);
const tripOf = c => /\dkm|trip/i.test(c[1]) || ['Kaki Bukit','Joo Chiat','Kembangan','Katong','Tanjong Katong','Upper East Coast','Bedok North','MacPherson','Marine Parade','Ubi','Mountbatten','Haig Road','Marymount','Buangkok','Kovan','Hougang','Seletar Hills','Serangoon Gardens','Serangoon'].includes(c[1]);
console.log('   weekdays:', wd.slice(0, 5).map(x => x[2][0] + ' (' + x[2][1] + ')').join(' | '));
console.log('   weekends:', we.slice(0, 4).map(x => x[2][0] + ' (' + x[2][1] + ')').join(' | '));
ok(wd.every(x => !tripOf(x[2])), 'weekdays: somewhere near, all ' + wd.length);
ok(we.every(x => tripOf(x[2])), 'weekends: a trip out, all ' + we.length);
const why = await p.evaluate(() => { const k = iso(new Date(2026, 9, 3)); const c = coffeePick(k); return [cafeWhere(c), coffeeWhen(c)]; });
ok(/trip out/i.test(why[0]) && /Make a morning of it/.test(why[1]) && (why[0].match(/trip/gi) || []).length === 1, 'a Saturday pick says it is a trip, once: ' + why.join(' '));
// all the near ones gone: a weekday falls back on the stock near ones, then the trips
const fb = await p.evaluate(() => {
  const k = iso(new Date(2026, 9, 5));
  S.coffee = S.cafes.filter(c => !cafeTrip(c)).map(c => ['2026-09-01', c[0]]);
  const a = coffeePick(k);
  S.coffee = S.coffee.concat(COFFEE.map(c => ['2026-09-01', c[0]]));
  const b = coffeePick(k);
  return [a, b, COFFEE.some(c => c[0] === a[0])];
});
ok(fb[2] && tripOf(fb[1]), 'near ones all been to: the stock near list, then a trip (' + fb[0][0] + ', then ' + fb[1][0] + ')');
await ctx.close();
await close();
console.log('ERRS:', ERRS.length ? ERRS : 'none');
