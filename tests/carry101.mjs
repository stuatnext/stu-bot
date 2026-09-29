// v101: what a day leaves undone carries over - the focus step, Mandarin,
// life admin, the room, the week's ten minutes, and the café not got to.
import { launch, open, close, saveWith, text, ERRS } from './harness.mjs';
await launch();
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const HAVE = { s: 'have', d: '2026-09-20' };
const mk = (d, extra) => saveWith({ y:2026, m: d.m, d: d.d, fullBack: 3, lifts: [[1, 'B']],
  extra: Object.assign({ planSeeded: 0, carryFrom: '2026-09-29', kit: { moist: HAVE, spf: HAVE, wash: HAVE, am: HAVE } }, extra || {}) });
const at = (m, d, hour, extra) => open({ y:2026, m, d, hour, min: 0, tz:'Asia/Singapore', save: mk({ m, d }, extra) });
const ids = pl => pl.map(b => b.id);

// Tuesday 29 Sep (Mandarin day, life admin, the kitchen, coffee) left all undone: Wednesday gets it
let { p, ctx } = await at(9, 30, 9);
const wed = await p.evaluate(() => { const pl = dayPlan(today());
  return { cin: carryIn(today()).map(carryKey), plan: pl.map(b => ({ id: b.id, at: b.at, t: b.t, say: b.say, carried: b.carried, done: !!b.done })),
           tuePick: coffeePick('2026-09-29')[0], wedPick: coffeePick(today())[0], focus: dayFocus(today()) }; });
console.log('   carried into Wednesday:', wed.cin.join(', '));
ok(wed.cin.includes('focus:zh') && wed.cin.includes('admin') && wed.cin.includes('clean:2') && wed.cin.includes('cafe'), 'Tuesday’s Mandarin focus, life admin, the kitchen and the café all carry to Wednesday');
const fz = wed.plan.find(b => b.id === 'focusc:zh'), ad = wed.plan.find(b => b.id === 'admin'), cl = wed.plan.find(b => b.id === 'cleanc:2');
ok(fz && ad && cl, 'Wednesday’s plan has them: the Mandarin step, life admin (not a Wednesday thing), the kitchen');
ok([fz, ad, cl].every(b => b.carried === '2026-09-29' && /^From Tuesday\. /.test(b.say)), 'each says where it came from: ' + fz.say.slice(0, 60));
ok(wed.plan.some(b => b.id === 'clean' && b.t === 'Clean the bedroom') && cl.t === 'Clean the kitchen', 'Wednesday’s own room (the bedroom) and the kitchen from Tuesday, both');
ok(wed.focus === 'friends' && wed.plan.some(b => b.id === 'focus'), 'Wednesday keeps its own focus as well');
ok(wed.wedPick === wed.tuePick, 'the café he did not get to on Tuesday stays the pick: ' + wed.wedPick);
await p.waitForTimeout(1200);
ok(/^Carried over: .*Mandarin.*life admin.*the kitchen/.test(await text(p, '#toast')), 'the first look of the day says so: ' + await text(p, '#toast'));
const stored = await p.evaluate(() => { save(); return (JSON.parse(localStorage.getItem('daylight.v4')).carry || {})['2026-09-30']; });
ok(Array.isArray(stored) && stored.length === wed.cin.length, 'worked out once and kept, so the day does not change under him');
await p.click('.tk-day'); await p.waitForTimeout(400);
ok(/Carried over: /.test(await text(p, '#modal .dp-lead')), 'the Day list says what came over');
// do the carried Mandarin step from the list, through the run
await p.click('#modal [data-mk="focusc:zh"]'); await p.waitForTimeout(400);
await p.click('#task .tk-go'); await p.waitForTimeout(500);
const did = await p.evaluate(() => ({ rec: (dayRec(today()).focusc || {}).zh, line: (S.lines || {}).zh, block: dayPlan(today()).find(b => b.id === 'focusc:zh').done }));
ok(did.rec && did.line === 1 && did.block, 'done from the run: the Mandarin line moves on, the block is ticked');
await p.evaluate(() => { doCleanCarry('2'); });
const thu = await p.evaluate(() => carryCompute('2026-10-01', 3).map(c => carryKey(c) + '@' + c.from));
console.log('   carried into Thursday:', thu.join(', '));
ok(!thu.some(x => x.startsWith('focus:zh')) && !thu.some(x => x.startsWith('clean:2')), 'done on Wednesday: they stop carrying');
ok(thu.includes('admin@2026-09-29') && thu.includes('focus:friends@2026-09-30'), 'still undone: life admin (waiting since Tuesday) and Wednesday’s own focus carry on');
await p.evaluate(() => { undoFocusCarry('zh'); });
ok(await p.evaluate(() => !(dayRec(today()).focusc || {}).zh && (S.lines || {}).zh === 0), 'and it can be taken back');
await ctx.close();

// done on Tuesday: nothing carries
({ p, ctx } = await at(9, 30, 9, { dayp: { '2026-09-29': { admin: 1, clean: 1, focus: { s: 'zh', a: 'study', i: 0 } } }, coffee: [['2026-09-29', 'Somewhere']] }));
ok((await p.evaluate(() => carryIn(today()).map(carryKey))).length === 0, 'everything done on Tuesday: nothing carries');
await ctx.close();

// ill on Tuesday (today, for him): Tuesday's things land on Wednesday
({ p, ctx } = await at(9, 30, 9, { sick: { '2026-09-29': 1 } }));
const ill = await p.evaluate(() => carryIn(today()).map(carryKey));
ok(['focus:zh', 'admin', 'clean:2', 'cafe'].every(k => ill.includes(k)), 'ill on Tuesday: Tuesday\u2019s Mandarin, life admin, the kitchen and the café come on Wednesday');
await ctx.close();
// away (Cannes, 10-16 Oct): the trip is the day, nothing piles up for the return
const cannes = {}; ['2026-10-10','2026-10-11','2026-10-12','2026-10-13','2026-10-14','2026-10-15','2026-10-16'].forEach(k => cannes[k] = { c: 'Cannes', z: 'Europe/Paris', k: 'work' });
({ p, ctx } = await at(10, 17, 9, { carryFrom: '2026-10-09', where: cannes }));
const back = await p.evaluate(() => carryCompute('2026-10-17', 3).filter(c => c.from >= '2026-10-14').length);
ok(back === 0, 'away on a trip: nothing piles up for the day back');
await ctx.close();

// a day off holds them: Sunday (vegetate) shows none, Monday gets them
({ p, ctx } = await at(10, 4, 10, { carry: { '2026-10-03': [{ c: 'admin', from: '2026-10-02' }, { c: 'zh', from: '2026-10-02' }] } }));
const sun = await p.evaluate(() => ({ plan: dayPlan(today()).filter(b => b.carried).length, mon: carryCompute('2026-10-05', 3).map(c => carryKey(c) + '@' + c.from) }));
ok(sun.plan === 0, 'Sunday is a day off: nothing carried is asked');
ok(sun.mon.includes('admin@2026-10-02') && sun.mon.includes('zh@2026-10-02') && sun.mon.includes('week@2026-10-04'), 'Monday gets them, and Sunday’s look at the week too: ' + sun.mon.join(', '));
await ctx.close();

// Monday: the week's ten minutes in the morning, movable like the rest
({ p, ctx } = await at(10, 5, 9, { carry: { '2026-10-05': [{ c: 'week', from: '2026-10-04' }] } }));
const mon = await p.evaluate(() => { const b = dayPlan(today()).find(b => b.id === 'week'); return b ? [b.at, planPinned(b), b.say] : null; });
ok(mon && mon[0] < 15 * 60 + 45 && !mon[1] && /^From Sunday\./.test(mon[2]), 'Monday: the week’s ten minutes before Malta, not pinned to 18:00 in the shift');
await ctx.close();

// nothing older than six days, nothing from before it started
({ p, ctx } = await at(10, 5, 9, { carry: { '2026-10-04': [{ c: 'admin', from: '2026-09-28' }] } }));
ok(!(await p.evaluate(() => carryCompute('2026-10-05', 0).some(c => c.c === 'admin'))), 'a week old: dropped, its own day has come round again');
await ctx.close();
({ p, ctx } = await at(9, 30, 9, { carryFrom: '2026-09-30' }));
ok((await p.evaluate(() => carryIn(today()).length)) === 0, 'the first day: nothing from before is dug up');
await ctx.close();
// a fresh install starts carrying from today
({ p, ctx } = await open({ y:2026, m:9, d:30, hour:9, min:0, tz:'Asia/Singapore', save: saveWith({ y:2026, m:9, d:30, fullBack: 3 }) }));
ok((await p.evaluate(() => S.carryFrom)) === '2026-09-30', 'a new phone starts carrying from its first day');
await ctx.close();

await close();
console.log('ERRS:', ERRS.length ? ERRS : 'none');
