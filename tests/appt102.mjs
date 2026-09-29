// v102: something at a time - the dog to the groomer, 10:00 on Wednesday,
// a 15-minute walk. The plan leaves for it, the rest keeps out of the way,
// and the morning ping names it.
import { launch, open, close, saveWith, text, ERRS } from './harness.mjs';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
await launch();
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const HAVE = { s: 'have', d: '2026-09-20' };
const mk = (m, d, extra) => saveWith({ y:2026, m, d, fullBack: 3, lifts: [[1, 'B']],
  extra: Object.assign({ planSeeded: 0, seed102: 0, carryFrom: '2026-09-29', kit: { moist: HAVE, spf: HAVE, wash: HAVE, am: HAVE } }, extra || {}) });
const at = (m, d, hour, min, extra) => open({ y:2026, m, d, hour, min, tz:'Asia/Singapore', save: mk(m, d, extra) });
const swSrc = readFileSync(new URL('../app/sw.js', import.meta.url), 'utf8');
const ctxSW = { self: { addEventListener(){}, registration: {}, clients: {}, skipWaiting(){} }, caches: {}, fetch(){}, console, Response: function(){}, URL, Promise, setTimeout };
vm.createContext(ctxSW); vm.runInContext(swSrc, ctxSW);
const compose = (kind, st, iso, dow, h, m) => vm.runInContext('composeNudge', ctxSW)(kind, st, iso, dow, h, m);
const grabMirror = p => p.evaluate(() => new Promise(res => {
  Object.defineProperty(window, 'caches', { configurable: true, value: { open: () => Promise.resolve({ put: (k, r) => r.text().then(t => res(JSON.parse(t))) }) } });
  mirrorState();
}));
const LEAVE = 'Leave at 09:45 for Dog to the groomer (a 15-minute walk, there by 10:00).';

// Tuesday evening: what he told us is on Wednesday
let { p, ctx } = await at(9, 29, 20, 0);
const tue = await p.evaluate(() => ({ appts: S.appts, seed: S.seed102,
  wed: dayPlan('2026-09-30').map(b => ({ id: b.id, at: b.at, dur: b.dur, t: b.t, say: b.say, pin: planPinned(b) })) }));
const g = tue.appts.find(a => a.id === 'groomer930');
ok(g && g.d === '2026-09-30' && g.at === 600 && g.go === 15 && g.how === 'walk' && tue.seed === 1, 'the groomer is in: Wednesday 30 September, there by 10:00, a 15-minute walk');
const gb = tue.wed.find(b => b.id === 'ap:groomer930');
console.log('   Wednesday:', tue.wed.filter(b => b.at < 14 * 60).map(b => Math.floor(b.at / 60) + ':' + String(b.at % 60).padStart(2, '0') + ' ' + b.id).join(' · '));
ok(gb && gb.at === 585 && gb.dur === 35 && gb.pin, 'Wednesday’s plan leaves at 09:45 and is back about 10:20, on its own clock');
ok(gb && gb.t === 'Dog to the groomer' && gb.say === 'Leave at 09:45, a 15-minute walk. There by 10:00; back about 10:20.', 'it says so: ' + (gb && gb.say));
const clash = tue.wed.filter(b => !b.pin && b.dur > 0 && b.at < 620 && b.at + b.dur > 585);
ok(clash.length === 0, 'nothing else is planned for 09:45 to 10:20' + (clash.length ? ': ' + clash.map(b => b.id).join(', ') : ''));
const walk = tue.wed.find(b => b.id === 'p:train'), cof = tue.wed.find(b => b.id === 'coffee');
ok(walk && cof && walk.at >= 620 && cof.at === walk.at + walk.dur, 'the walk to the coffee and the coffee stay together, after it');
await p.click('.tk-day'); await p.waitForTimeout(400);
ok(/Coming up/.test(await text(p, '#modal .dp-appt')) && /Tomorrow 09:45 Dog to the groomer/.test(await text(p, '#modal .dp-appt')), 'the Day list says what is coming: ' + await text(p, '#modal .dp-appt'));
const m0 = await grabMirror(p);
ok(Array.isArray(m0.appts) && m0.appts.some(a => a.d === '2026-09-30' && a.at === 600 && a.go === 15 && a.how === 'walk' && !a.done), 'the phone gets it too, before the app is opened on the day');
// the morning ping on Wednesday, with only Tuesday's mirror (the app not yet opened)
const nb = compose('morning', m0, '2026-09-30', 3, 8, 35);
ok(nb.body.startsWith(LEAVE), 'Wednesday 08:35, app not opened: ' + nb.body.slice(0, 90));
ok(!compose('morning', m0, '2026-09-30', 3, 9, 50).body.includes('groomer'), 'once it is time to have left, the ping stops saying it');
ok(!compose('morning', m0, '2026-09-29', 2, 8, 35).body.includes('groomer'), 'not on the wrong day');

// add one through the sheets: the vet, Friday at 14:30, 20 minutes away, half an hour there
await p.click('#modal .dp-appt'); await p.waitForTimeout(400);
ok(/Dog to the groomer/.test(await text(p, '#modal')), 'Coming up lists them');
await p.click('#modal [data-mk="__add"]'); await p.waitForTimeout(400);
await p.fill('#mkField', 'Vet'); await p.click('#modal [data-mk="__ok"]'); await p.waitForTimeout(400);
ok(/Tomorrow/.test(await text(p, '#modal [data-mk="2026-09-30"]')), 'which day: tomorrow first');
await p.click('#modal [data-mk="__other"]'); await p.waitForTimeout(400);
ok((await p.getAttribute('#mkField', 'type')) === 'date', 'another day: a date to pick');
await p.fill('#mkField', '2026-10-02'); await p.click('#modal [data-mk="__ok"]'); await p.waitForTimeout(400);
ok((await p.getAttribute('#mkField', 'type')) === 'time', 'be there by: a time to pick');
await p.fill('#mkField', '14:30'); await p.click('#modal [data-mk="__ok"]'); await p.waitForTimeout(400);
await p.click('#modal [data-mk="20"]'); await p.waitForTimeout(400);
await p.click('#modal [data-mk="30"]'); await p.waitForTimeout(600);
const vet = await p.evaluate(() => { const a = S.appts.find(x => x.t === 'Vet'); const b = a && dayPlan('2026-10-02').find(x => x.id === 'ap:' + a.id); return { a, b: b && { at: b.at, dur: b.dur, say: b.say } }; });
ok(vet.a && vet.a.d === '2026-10-02' && vet.a.at === 870 && vet.a.go === 20 && vet.a.len === 30 && vet.a.how === '', 'saved: Friday, there by 14:30, 20 minutes each way, half an hour there');
ok(vet.b && vet.b.at === 850 && vet.b.dur === 70 && vet.b.say === 'Leave at 14:10, 20 minutes to get there. There by 14:30; back about 15:20.', 'Friday’s plan: ' + (vet.b && vet.b.say));
ok(/^Fri .*: leave at 14:10 for Vet\.$/.test(await text(p, '#toast')), 'and says so: ' + await text(p, '#toast'));
// and take it off again
await p.evaluate(() => { askAppts(); }); await p.waitForTimeout(400);
await p.click('#modal [data-mk="' + vet.a.id + '"]'); await p.waitForTimeout(400);
await p.click('#modal [data-mk="rm"]'); await p.waitForTimeout(400);
ok(await p.evaluate(() => !S.appts.some(x => x.t === 'Vet') && S.appts.some(x => x.id === 'groomer930')), 'taken off: the vet goes, the groomer stays');
await ctx.close();

// Wednesday morning: done from the Day list, and taken back
({ p, ctx } = await at(9, 30, 9, 40));
await p.click('.tk-day'); await p.waitForTimeout(400);
ok(/Dog to the groomer/.test(await text(p, '#modal [data-mk="ap:groomer930"]')), 'Wednesday: it is on the Day list');
await p.click('#modal [data-mk="ap:groomer930"]'); await p.waitForTimeout(400);
ok(/Leave at 09:45/.test(await text(p, '#task')), 'the run shows it: ' + (await text(p, '#task')).slice(0, 80));
await p.click('#task .tk-go'); await p.waitForTimeout(500);
const done = await p.evaluate(() => ({ rec: apptDone(today(), 'groomer930'), block: dayPlan(today()).find(b => b.id === 'ap:groomer930').done,
  canUndo: runCanUndo({ op: 'ap:groomer930' }) }));
ok(done.rec && done.block && done.canUndo, 'done: ticked, and it can be taken back');
const m1 = await grabMirror(p);
ok(m1.appts.find(a => a.d === '2026-09-30').done === 1 && !compose('morning', m1, '2026-09-30', 3, 8, 35).body.includes('groomer'), 'done: the phone stops saying it');
await p.evaluate(() => { apptUntick('groomer930'); });
ok(await p.evaluate(() => !apptDone(today(), 'groomer930')), 'taken back');
// the fresh-plan morning names it once, first
const m2 = await grabMirror(p);
const fb = compose('morning', m2, '2026-09-30', 3, 8, 35).body;
ok(fb.startsWith(LEAVE) && (fb.match(/groomer/g) || []).length === 1, 'with today’s plan: named first, once: ' + fb.slice(0, 120));
// running behind at 9:00: the re-plan works around it
const rp = await p.evaluate(() => dayPlan(today(), { from: 540 }).map(b => ({ id: b.id, at: b.at, dur: b.dur, pin: planPinned(b) })));
const rg = rp.find(b => b.id === 'ap:groomer930');
const rclash = rp.filter(b => !b.pin && b.dur > 0 && b.at < 620 && b.at + b.dur > 585);
ok(rg && rg.at === 585 && rclash.length === 0, 're-planned from 09:00: the groomer stays at 09:45 and nothing lands on it' + (rclash.length ? ': ' + rclash.map(b => b.id).join(', ') : ''));
await ctx.close();

// the Today screen on the day: when to leave, then time to go, then done
({ p, ctx } = await at(9, 30, 9, 30));
ok((await text(p, '#screen .ap-b')) === 'Dog to the groomer. Leave in 15 minutes, at 09:45: a 15-minute walk. There by 10:00.', 'Today at 09:30: ' + await text(p, '#screen .ap-b'));
ok(!(await p.$('#screen .ap-b button')), 'no button before it is time to go');
await ctx.close();
({ p, ctx } = await at(9, 30, 9, 50));
ok(/^Time to go\. Dog to the groomer, there by 10:00\./.test(await text(p, '#screen .ap-b')), 'Today at 09:50: ' + await text(p, '#screen .ap-b'));
await p.click('#screen .ap-b button'); await p.waitForTimeout(500);
ok(await p.evaluate(() => apptDone(today(), 'groomer930')) && !(await p.$('#screen .ap-b')), 'Done: ticked, and the banner goes');
await ctx.close();
for (const [h, m, why] of [[6, 30, 'more than three hours before'], [10, 25, 'once he is back']]) {
  ({ p, ctx } = await at(9, 30, h, m));
  ok(!(await p.$('#screen .ap-b')), 'no banner ' + why);
  await ctx.close();
}

// after the day: not seeded on a phone that starts later, and gone from the list after a fortnight
({ p, ctx } = await at(10, 1, 9, 0));
ok(await p.evaluate(() => S.seed102 === 1 && !S.appts.length), 'a phone that starts after Wednesday is not given it');
await p.click('.tk-day'); await p.waitForTimeout(400);
ok(/Something at a time\?/.test(await text(p, '#modal .dp-appt')), 'nothing coming: the Day list offers to add one');
await ctx.close();
({ p, ctx } = await at(10, 20, 9, 0, { seed102: 1, appts: [{ id: 'old', d: '2026-09-30', at: 600, t: 'Old', go: 0 }] }));
ok(await p.evaluate(() => { addAppt({ d: '2026-10-21', at: 600, t: 'New', go: 0 }); return !S.appts.some(a => a.id === 'old'); }), 'older than a fortnight: tidied away when one is added');
await ctx.close();

await close();
console.log('ERRS:', ERRS.length ? ERRS : 'none');
