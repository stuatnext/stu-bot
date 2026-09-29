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
const tripOf = c => /trip/i.test(c[1]) || (/(\d+(?:\.\d+)?)\s*km/i.test(c[1]) ? +c[1].match(/(\d+(?:\.\d+)?)\s*km/i)[1] >= 7 : false) || ['Kaki Bukit','Joo Chiat','Kembangan','Katong','Tanjong Katong','Upper East Coast','Bedok North','MacPherson','Marine Parade','Ubi','Mountbatten','Haig Road','Marymount','Buangkok','Kovan','Hougang','Seletar Hills','Serangoon Gardens','Serangoon'].includes(c[1]);
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
// v89: the fourth batch - round home, a distance rule, and no stock doubles
const s4 = saveWith({ y:2026, m:10, d:6, fullBack:3, extra: { planSeeded: 0, seed86: 0, seed87: 0, seed88: 0, seed89: 0, cafes: [], coffee: [] } });
({ p, ctx } = await open({ y:2026, m:10, d:6, hour:9, min:0, tz:'Asia/Singapore', save: s4 }));
const b4 = await p.evaluate(() => ({ n: S.cafes.length, seed: S.seed89, names: S.cafes.map(c => c[0]),
  trip: Object.fromEntries(S.cafes.map(c => [c[0], cafeTrip(c)])),
  list: coffeeList().map(c => c[0]), stock: coffeeStock().map(c => c[0]) }));
ok(b4.seed === 1 && b4.n === 63 && ['Honest Cup Specialty Coffee', 'Kopi MORE', 'Homeground Coffee Roasters', 'Italian Coffee Lab Pasir Panjang', 'P\u00d6ONSTI / Old Hen Coffee (NUS)', 'Heritage Cafe'].every(n => b4.names.includes(n)), 'the fourth batch: eight in, 63 in all (' + b4.n + ')');
ok(!b4.names.some(n => /Coffee Bean|Kenangan|Detian|Beanstro|Coffee Near Me/i.test(n)), 'chains, low ratings and a far-off takeaway stand left out');
ok(!b4.trip['Honest Cup Specialty Coffee'] && !b4.trip['Kopi MORE'] && !b4.trip['Italian Coffee Lab Pasir Panjang'] && b4.trip['Homeground Coffee Roasters'] && b4.trip['P\u00d6ONSTI / Old Hen Coffee (NUS)'] && b4.trip['Yahava KoffeeWorks'], '550m and 4km are near; 8km, 9km and 12km are trips');
ok(b4.list.filter(n => n === 'Chye Seng Huat Hardware').length === 1 && !b4.stock.includes('Tiong Hoe Specialty Coffee') && b4.stock.length === 7, 'the two he picked from the stock list (and Common Man) show up once, as his (' + b4.stock.length + ' stock left)');
const wk4 = await p.evaluate(() => { const o = []; for (let i = 0; i < 42; i++){ const k = iso(new Date(2026, 9, 5 + i)); o.push([dowOf(k), cafeTrip(coffeePick(k)), coffeePick(k)[0]]); } return o; });
ok(wk4.every(x => (x[0] === 0 || x[0] === 6) === x[1]), 'six weeks: every weekday near, every weekend a trip');
await ctx.close();
// v90: the fifth batch, the streets round home
const s5 = saveWith({ y:2026, m:10, d:7, fullBack:3, extra: { planSeeded: 0, seed86: 0, seed87: 0, seed88: 0, seed89: 0, seed90: 0, cafes: [], coffee: [] } });
({ p, ctx } = await open({ y:2026, m:10, d:7, hour:9, min:0, tz:'Asia/Singapore', save: s5 }));
const b5 = await p.evaluate(() => ({ n: S.cafes.length, seed: S.seed90, names: S.cafes.map(c => c[0]),
  near: S.cafes.filter(c => !cafeTrip(c)).length, trip: S.cafes.filter(c => cafeTrip(c)).length,
  new5: MY_CAFES_5.map(c => cafeTrip(c)) }));
ok(b5.seed === 1 && b5.n === 67 && ['Jewel Coffee (Tanjong Pagar Centre)', 'Dimbulah Coffee @ 137 Market Street', 'Oasis Bistro & Cafe', 'The Community Coffee - Hamilton'].every(n => b5.names.includes(n)), 'the fifth batch: four in, 67 in all (' + b5.n + ')');
ok(!b5.names.some(n => /luckin|Coffee Bean|Dimbulah Coffee @ RP|VivoCity|Three Hands|89 Coffee|Five Oars|Ho Zheng/i.test(n)) && b5.names.filter(n => n === 'Coffee Donkee').length === 1, 'chains, a head office, repeats and low ratings left out');
ok(b5.new5.every(t => !t), 'all four count as near');
console.log('   near ' + b5.near + ' (weekdays) · trips ' + b5.trip + ' (weekends)');
await ctx.close();
// v91: the sixth batch, his doorstep
const s6 = saveWith({ y:2026, m:10, d:8, fullBack:3, extra: { planSeeded: 0, seed86: 0, seed87: 0, seed88: 0, seed89: 0, seed90: 0, seed91: 0, cafes: [], coffee: [] } });
({ p, ctx } = await open({ y:2026, m:10, d:8, hour:9, min:0, tz:'Asia/Singapore', save: s6 }));
const b6 = await p.evaluate(() => ({ n: S.cafes.length, seed: S.seed91, names: S.cafes.map(c => c[0]),
  near: S.cafes.filter(c => !cafeTrip(c)).length, trip: S.cafes.filter(c => cafeTrip(c)).length,
  new6: MY_CAFES_6.map(c => cafeTrip(c)) }));
ok(b6.seed === 1 && b6.n === 77 && ['Sojourner Coffee', 'Foreground Coffee', 'Bill’s 8 Cafe', '22 Grams Coffee (KSC)', 'brewth coffee', 'Kyuukei Coffee | Maxwell'].every(n => b6.names.includes(n)), 'the doorstep batch: ten in, 77 in all (' + b6.n + ')');
ok(!b6.names.some(n => /luckin|Hill Street|Old Chang Kee|Chagee/i.test(n)) && b6.names.includes('Nami by Kyuukei Coffee'), 'chains and low ratings left out; the Katong Kyuukei kept separate');
ok(b6.new6.every(t => !t), 'all ten count as near');
console.log('   near ' + b6.near + ' (weekdays) · trips ' + b6.trip + ' (weekends)');
await ctx.close();
// v92: the seventh batch, by distance from his door
const s7 = saveWith({ y:2026, m:10, d:9, fullBack:3, extra: { planSeeded: 0, seed86: 0, seed87: 0, seed88: 0, seed89: 0, seed90: 0, seed91: 0, seed92: 0, cafes: [], coffee: [] } });
({ p, ctx } = await open({ y:2026, m:10, d:9, hour:9, min:0, tz:'Asia/Singapore', save: s7 }));
const b7 = await p.evaluate(() => ({ n: S.cafes.length, seed: S.seed92, names: S.cafes.map(c => c[0]),
  near: S.cafes.filter(c => !cafeTrip(c)).length, trip: S.cafes.filter(c => cafeTrip(c)).length,
  new7: MY_CAFES_7.map(c => cafeTrip(c)) }));
ok(b7.seed === 1 && b7.n === 83 && ['Kafey Haus (Tanjong Pagar MRT)', 'Alchemist International Plaza', 'Flamingo Coffee & Wine', 'The Wired Monkey SG (The Hole)'].every(n => b7.names.includes(n)) && b7.names.some(n => /^Han N Han/.test(n)), 'the seventh batch: six in, 83 in all (' + b7.n + ')');
ok(!b7.names.some(n => /Tiong Hoe Specialty Coffee \(|luckin|^Awake$|Hill Street/i.test(n)) && b7.names.filter(n => /^22 Grams|^Vietgo/.test(n)).length === 2, 'a second Tiong Hoe, a chain, a drip-bag shop and a 2.0 left out; nothing doubled');
ok(b7.new7.every(t => !t), 'all six count as near');
console.log('   near ' + b7.near + ' (weekdays) · trips ' + b7.trip + ' (weekends)');
await ctx.close();
// v93: the eighth batch, and the Hive's full name put right
const s8 = saveWith({ y:2026, m:10, d:10, fullBack:3, extra: { planSeeded: 0, seed86: 0, seed87: 0, seed88: 0, seed89: 0, seed90: 0, seed91: 0, seed92: 0, seed93: 0, cafes: [], coffee: [] } });
({ p, ctx } = await open({ y:2026, m:10, d:10, hour:9, min:0, tz:'Asia/Singapore', save: s8 }));
const b8 = await p.evaluate(() => ({ n: S.cafes.length, seed: S.seed93, names: S.cafes.map(c => c[0]),
  near: S.cafes.filter(c => !cafeTrip(c)).length, trip: S.cafes.filter(c => cafeTrip(c)).length,
  new8: MY_CAFES_8.map(c => cafeTrip(c)) }));
ok(b8.seed === 1 && b8.n === 86 && ['Takagi Coffee 100 AM', 'Coffee and Chill', 'Koffee Kollective (Tanjong Pagar)', 'Coffee Hive (Altez)'].every(n => b8.names.includes(n)) && !b8.names.includes('Hive (Altez)'), 'the eighth batch: three in, 86 in all, the Hive by its full name (' + b8.n + ')');
ok(!b8.names.some(n => /luckin|JiuMao|no\. 7|Old Chang Kee/i.test(n)) && b8.names.filter(n => /^Foreground|^brewth|^Daily Milestone/.test(n)).length === 3, 'a chain, a 3.1 and two with no reviews left out; nothing doubled');
ok(b8.new8.every(t => !t), 'all three count as near');
console.log('   near ' + b8.near + ' (weekdays) · trips ' + b8.trip + ' (weekends)');
await ctx.close();
// his phone already has "Hive (Altez)", maybe with a visit logged: renamed, visit kept
const s9 = saveWith({ y:2026, m:10, d:10, fullBack:3, extra: { planSeeded: 0,
  cafes: [['Hive (Altez)', 'Enggor Street', 'Coffee and food, a wide range'], ['Sojourner Coffee', 'Round the corner, 300m', '']],
  coffee: [['2026-10-08', 'Hive (Altez)']] } });
({ p, ctx } = await open({ y:2026, m:10, d:10, hour:9, min:0, tz:'Asia/Singapore', save: s9 }));
const r9 = await p.evaluate(() => ({ names: S.cafes.map(c => c[0]), row: S.cafes.find(c => c[0] === 'Coffee Hive (Altez)'),
  log: S.coffee.map(c => c[1]), tried: coffeeTried('Coffee Hive (Altez)'), pass: coffeePassport(),
  saved: JSON.parse(localStorage.getItem('daylight.v4')).cafes.map(c => c[0]) }));
ok(r9.names.join('|') === 'Coffee Hive (Altez)|Sojourner Coffee' && /208 reviews/.test(r9.row[2]) && r9.saved.includes('Coffee Hive (Altez)'), 'the Hive already on his phone takes its full name, in place, and it is saved');
ok(r9.log.join('|') === 'Coffee Hive (Altez)' && r9.tried && r9.pass === 1, 'a visit already logged still counts: passport ' + r9.pass);
await ctx.close();
// both names there somehow: one Hive left
const s10 = saveWith({ y:2026, m:10, d:10, fullBack:3, extra: { planSeeded: 0,
  cafes: [['Hive (Altez)', 'Enggor Street', ''], ['Coffee Hive (Altez)', 'his own', 'typed in']], coffee: [] } });
({ p, ctx } = await open({ y:2026, m:10, d:10, hour:9, min:0, tz:'Asia/Singapore', save: s10 }));
const r10 = await p.evaluate(() => S.cafes.map(c => c[0] + '/' + c[1]));
ok(r10.join('|') === 'Coffee Hive (Altez)/his own', 'both names there: one Hive left, his own kept (' + r10.join('|') + ')');
await ctx.close();
await close();
console.log('ERRS:', ERRS.length ? ERRS : 'none');
