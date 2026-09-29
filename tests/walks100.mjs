// v100: walks somewhere new - near home on weekdays, further out at the
// weekend, with repellent, haze, and coffee and lunch at the end.
import { launch, open, close, saveWith, text, ERRS } from './harness.mjs';
await launch();
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const mk = (extra) => saveWith({ y:2026, m:9, d:29, fullBack: 3, lifts: [[1, 'B']], extra: Object.assign({ planSeeded: 0 }, extra || {}) });
const at = (d, hour, save) => open({ y:2026, m:9, d, hour, min: 0, tz:'Asia/Singapore', save: save || mk() });

// the data: every walk complete, sourced, and split near / further out
let { p, ctx } = await at(29, 9);
const data = await p.evaluate(() => WALKS.map(w => ({ id: w.id, g: w.g, ok: !!(w.id && w.n && w.area && w.start && w.end && w.get && w.km > 0 && w.min > 0
  && (w.bug === 0 || w.bug === 1) && w.bugWhy && (w.haze === 0 || w.haze === 1) && w.cafe && w.cafe.length === 3 && w.lunch && w.lunch.length === 3
  && w.src && w.src.length), min: w.min, bug: w.bug })));
const near = data.filter(w => w.g === 'near'), trip = data.filter(w => w.g === 'trip');
console.log('   walks:', data.length, '· near', near.length, '· further out', trip.length, '· repellent on', data.filter(w => w.bug).length);
ok(data.length >= 20 && data.every(w => w.ok), 'twenty-plus walks, each with start, finish, how to get there, repellent, haze, coffee, lunch and a source');
ok(near.length >= 8 && trip.length >= 8, 'enough of each: near home and further out');
ok(new Set(data.map(w => w.id)).size === data.length, 'no walk twice');
ok(near.every(w => w.min <= 90), 'the near ones fit a weekday morning (90 minutes or less)');

// the pick: near on a weekday, further out at the weekend, a new one each day, never one done
const picks = await p.evaluate(() => { const o = []; for (let i = 0; i < 14; i++){ const k = iso(new Date(2026, 8, 28 + i)); const w = walkPick(k); o.push([dowOf(k), w.g, w.id]); } return o; });
ok(picks.every(x => (x[0] === 0 || x[0] === 6) === (x[1] === 'trip')), 'two weeks of picks: near on weekdays, further out at weekends');
ok(new Set(picks.map(x => x[2])).size >= 8, 'a different walk most days (' + new Set(picks.map(x => x[2])).size + ' of 14)');
const skip = await p.evaluate(() => { const done = {}; WALKS.filter(w => w.g === 'near').slice(0, -1).forEach(w => done[w.id] = '2026-09-01'); S.walked = done; return [walkPick(today()).id, WALKS.filter(w => w.g === 'near').slice(-1)[0].id]; });
ok(skip[0] === skip[1], 'every near walk but one done: that one is the pick');
await p.evaluate(() => { S.walked = {}; });
await ctx.close();

// the walk sheet on a Tuesday: somewhere new first, then the sheet
({ p, ctx } = await at(29, 9));
await p.evaluate(() => { askWalk(); }); await p.waitForTimeout(350);
const ws = await text(p, '#modal');
const pick = await p.evaluate(() => walkPick(today()));
ok(ws.includes('Somewhere new: ' + pick.n), 'the walk sheet offers somewhere new first: ' + pick.n);
await (await p.$('#modal button:has-text("Somewhere new")')).click(); await p.waitForTimeout(400);
const sheet = await text(p, '#modal');
console.log('   sheet:', sheet.slice(0, 260));
ok(sheet.includes(pick.n) && /Near home/.test(sheet) && /Getting there/.test(sheet) && /Coffee after/.test(sheet) && /Lunch/.test(sheet), 'the sheet: near home, getting there, coffee after, lunch');
ok(pick.bug ? /Bring repellent\./.test(sheet) : /No repellent needed\./.test(sheet), 'and says whether to bring repellent');
ok(/Haze: check the PSI first/.test(sheet), 'and the haze: check the PSI first (no live reading from a file)');
const links = await p.$$eval('#modal a.wk-map', as => as.map(a => a.href));
ok(links.length >= 3 && links.every(h => h.startsWith('https://www.google.com/maps/search/?api=1&query=')), 'the start, the coffee and the lunch open in Maps');
await p.screenshot({ path: 'v100-walk.png' });
// walked it, and had the coffee: passport, Trained, coffee passport
await (await p.$('#modal button:has-text("Walked it, and had the coffee")')).click(); await p.waitForTimeout(600);
const after = await p.evaluate((id) => ({ walked: S.walked[id], mins: S.walks[today()], trained: !!day(today()).p.train,
  coffee: coffeeOn(today()), cafe: coffeeLog().slice(-1)[0][1], count: walkCount(), next: walkPick(today()).id }), pick.id);
ok(after.walked === '2026-09-29' && after.mins === pick.min && after.trained, 'walked: in the passport, the minutes on the record, Trained');
ok(after.coffee && after.cafe === pick.cafe[0], 'and the coffee counts: ' + after.cafe);
ok(after.count === 1 && after.next !== pick.id, 'one walked, and the next pick is a different one');
await ctx.close();

// a Saturday: further out
({ p, ctx } = await at(3, 9));
const sat = await p.evaluate(() => { const w = walkPick(today()); return [w.g, w.n]; });
ok(sat[0] === 'trip', 'Saturday: a trip further out (' + sat[1] + ')');
await ctx.close();

// "another one" moves the pick on, and sticks for the day
({ p, ctx } = await at(29, 9));
const first = await p.evaluate(() => walkPick(today()).id);
await p.evaluate(() => { askWalkNew(); }); await p.waitForTimeout(350);
await (await p.$('#modal button:has-text("Another one")')).click(); await p.waitForTimeout(450);
const second = await p.evaluate(() => [walkPick(today()).id, walkPick(today()).g, document.querySelector('#modal') ? document.querySelector('#modal').textContent : '']);
ok(second[0] !== first && second[1] === 'near' && second[2].includes(await p.evaluate(() => walkPick(today()).n)), 'another one: a different near walk, shown straight away');
await ctx.close();

// on You: the passport and today's walk; the list of them all
({ p, ctx } = await open({ y:2026, m:9, d:29, hour:9, min:0, tz:'Asia/Singapore', save: mk(), tab: 'you' }));
const you = await text(p, '#screen .wkx');
ok(/Walks/.test(you) && /of \d+ walked/.test(you) && /Today: /.test(you), 'You: the walks panel, the passport and today’s walk');
await p.click('#screen [data-walks]'); await p.waitForTimeout(400);
const list = await text(p, '#modal');
ok(/Near home/.test(list) && /Further out/.test(list) && (await p.$$('#modal .wk-r')).length === data.length, 'all the walks, near and further out');
await (await p.$$('#modal .wk-r'))[0].click(); await p.waitForTimeout(400);
ok(/Getting there/.test(await text(p, '#modal')), 'tap one: its sheet');
const over = await p.evaluate(() => document.querySelector('#modal').scrollWidth - document.querySelector('#modal').clientWidth);
ok(over <= 0, 'no sideways scroll in the sheet');
await ctx.close();

// the rest day's walk in the plan names somewhere new (on a day without coffee)
({ p, ctx } = await at(29, 9, mk({ week: { 2: { c: 0 } } })));
const rest = await p.evaluate(() => { const b = dayPlan(today()).find(b => b.id === 'p:train'); return b ? b.say : ''; });
ok(/Somewhere new: /.test(rest), 'the rest-day walk says where: ' + rest);
await ctx.close();

// the saved passport survives a reload
({ p, ctx } = await at(30, 9, mk({ walked: { tiongbahru: '2026-09-28' } })));
ok(await p.evaluate(() => !!S.walked && S.walked.tiongbahru === '2026-09-28'), 'the walk passport is kept on load');
await ctx.close();

await close();
console.log('ERRS:', ERRS.length ? ERRS : 'none');
