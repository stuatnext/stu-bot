// v80: the runner goes both ways - Back, Not now/Next, pips, swipe, keys, and Undo on a done step.
import { launch, open, close, saveWith, text, ERRS } from './harness.mjs';
await launch();
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const btns = p => p.$$eval('#task .tk-acts button', es => es.map(e => e.textContent.trim() + (e.disabled ? '[x]' : '')));
const cur = p => p.evaluate(() => ({ i: RUN && RUN.i, id: RUN && RUN.ids[RUN.i], h2: (document.querySelector('#task h2') || {}).textContent, was: !!document.querySelector('#task .tk-body.was'), end: !!document.querySelector('#task .tk-body.done'), c: (document.querySelector('#task .tk-c') || {}).textContent }));
const swipe = (p, dx) => p.evaluate(dx => {
  const el = document.getElementById('task'), y = 400, x0 = 200;
  const T = x => new Touch({ identifier: 1, target: el, clientX: x, clientY: y });
  el.dispatchEvent(new TouchEvent('touchstart', { touches: [T(x0)], changedTouches: [T(x0)], bubbles: true }));
  el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [T(x0 + dx)], bubbles: true }));
}, dx);

// v81: the kit is had here - this walk is about the run, not the shopping
const HAVE = { s: 'have', d: '2026-09-20' };
// v82: a day the week gives no focus to (Monday set to vegetate, then switched back on), so the old slot
// stations are there to test. The run opens on the first thing of the day: coming round.
const FREE = { week: { 1: { f: 'veg' } }, veg: { '2026-09-28': 0 } };
const base = saveWith({ y:2026, m:9, d:28, fullBack:3, lifts:[[1,'B']], extra: { ...FREE, kit: { moist: HAVE, spf: HAVE, wash: HAVE, am: HAVE } } });
let { p, ctx } = await open({ y:2026, m:9, d:28, hour:9, min:10, tz:'Asia/Singapore', save: base });
await p.click('[data-run="day"]').catch(async () => { await p.evaluate(() => startRun('day')); });
await p.waitForTimeout(500);
const ids = await p.evaluate(() => RUN.ids.slice());
console.log('   run:', ids.join(' '));
let c = await cur(p), b = await btns(p);
console.log('   step 1:', c.h2, '|', b.join(' / '));
ok(c.i === 0 && b.includes('Did it') && b.includes('‹Back[x]') && b.includes('Not now›'), 'step 1: Did it, Back (off), Not now');
ok((await p.$$('#task .tk-pips button')).length === ids.length, 'every pip is a button');
await p.screenshot({ path: 'v80-step1.png' });
// Not now, Not now, Back
await p.click('#task [data-runfwd]'); await p.waitForTimeout(350);
await p.click('#task [data-runfwd]'); await p.waitForTimeout(350);
c = await cur(p); ok(c.i === 2 && c.c === '3 of ' + ids.length, 'forward twice: ' + c.c);
await p.click('#task [data-runback]'); await p.waitForTimeout(350);
c = await cur(p); ok(c.i === 1 && !c.was && /tk-body/.test(await p.$eval('#task .tk-body', e => e.className)), 'back one: ' + c.c + ' ' + c.h2);
ok(await p.$eval('#task .tk', e => e.className) === 'tk go-b', 'it slides in from the left going back');
// pip jump to the first, Did it, it moves on
await p.click('#task [data-runjump="0"]'); await p.waitForTimeout(350);
c = await cur(p); ok(c.i === 0, 'tap the first pip: step 1');
const op0 = await p.evaluate(() => RUN.snap[RUN.ids[0]].op);
await p.click('#task [data-runop]'); await p.waitForTimeout(700);
c = await cur(p); ok(c.i === 1, 'did step 1, on to step 2');
ok(await p.evaluate(() => runCanUndo(RUN.snap[RUN.ids[0]])), 'step 1 is on the record (' + op0 + ')');
// back to it: stamped, with Undo
await p.click('#task [data-runback]'); await p.waitForTimeout(450);
c = await cur(p); b = await btns(p);
console.log('   done step:', c.h2, '|', b.join(' / '), '|', await text(p, '#task .tk-body.was p'));
ok(c.i === 0 && c.was && /Done/.test(await text(p, '#task .tk-stamp')) && b.includes('↺ Undo') && b.includes('Next›'), 'walking back to a done step: stamp, Undo, Next');
ok(await p.$eval('#task [data-runjump="0"] i', e => e.dataset.s) === 'did', 'its pip is green');
await p.screenshot({ path: 'v80-done-step.png' });
await p.click('#task [data-runundo]'); await p.waitForTimeout(500);
c = await cur(p); b = await btns(p);
ok(!(await p.evaluate(() => runCanUndo(RUN.snap[RUN.ids[0]]))) && !c.was && b.includes('Did it'), 'Undo: off the record, and the step is back to do');
// keys
await p.keyboard.press('ArrowRight'); await p.waitForTimeout(300);
ok((await cur(p)).i === 1, 'arrow right: forward');
await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(300);
ok((await cur(p)).i === 0, 'arrow left: back');
// swipe
await swipe(p, -140); await p.waitForTimeout(300);
ok((await cur(p)).i === 1, 'swipe left: forward');
await swipe(p, 140); await p.waitForTimeout(300);
ok((await cur(p)).i === 0, 'swipe right: back');
await swipe(p, -20); await p.waitForTimeout(200);
ok((await cur(p)).i === 0, 'a small drag is not a swipe');
// to the end with Not now, then back from the end
for (let n = 0; n < ids.length; n++){ const f = await p.$('#task [data-runfwd]'); if (f) { await f.click(); await p.waitForTimeout(250); } }
c = await cur(p); b = await btns(p);
console.log('   end:', await text(p, '#task .tk-body'), '|', b.join(' / '));
ok(c.end && b.includes('Done') && b.some(x => /^The \d+ left/.test(x)), 'the end: Done, and a way back to the ones left');
await p.screenshot({ path: 'v80-end.png' });
await p.click('#task [data-runback]'); await p.waitForTimeout(350);
ok((await cur(p)).i === ids.length - 1, 'back from the end: the last step');
await p.click('#task [data-runfwd]'); await p.waitForTimeout(300);
await p.click('#task [data-runleft]'); await p.waitForTimeout(350);
ok((await cur(p)).i === 0, 'the ones left: back to the first still open');
// sizes and fit at a small phone
await p.setViewportSize({ width: 375, height: 667 }); await p.waitForTimeout(300);
const sz = await p.evaluate(() => {
  const r = s => [...document.querySelectorAll(s)].map(e => { const b = e.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height), Math.round(b.bottom)]; });
  return { nav: r('#task .tk-nav button'), pip: r('#task .tk-pips button'), go: r('#task .tk-go'), sw: document.documentElement.scrollWidth, vh: innerHeight };
});
console.log('   375x667:', JSON.stringify(sz));
ok(sz.nav.every(x => x[1] >= 44) && sz.pip.every(x => x[1] >= 24) && sz.nav.every(x => x[2] <= sz.vh) && sz.sw <= 375, 'thumb-sized and on screen at 375x667');
await p.screenshot({ path: 'v80-small.png' });
// Escape leaves
await p.keyboard.press('Escape'); await p.waitForTimeout(300);
ok(await p.evaluate(() => RUN === null && !document.getElementById('task').className), 'Escape leaves the run');
await ctx.close();

// each kind of undo --------------------------------------------------------
async function doBackUndo(p, label, check){
  await p.waitForTimeout(400);
  const before = await p.evaluate(check);
  await p.click('#task [data-runop]'); await p.waitForTimeout(700);
  if (await p.$('#modal .mk-o, #modal [data-mk]')){
    const first = await p.$('#modal [data-mk]:not([data-mk="__no"]):not([data-mk="__other"])');
    await first.click(); await p.waitForTimeout(700);
  }
  const mid = await p.evaluate(check);
  await p.click('#task [data-runback]'); await p.waitForTimeout(450);
  const was = !!(await p.$('#task .tk-body.was')), undo = !!(await p.$('#task [data-runundo]'));
  if (undo){ await p.click('#task [data-runundo]'); await p.waitForTimeout(500); }
  const after = await p.evaluate(check);
  ok(!before && mid && was && undo && !after && !!(await p.$('#task [data-runop]')), label + ' - ' + JSON.stringify([before, mid, was, undo, after]));
}
// work
({ p, ctx } = await open({ y:2026, m:9, d:28, hour:10, min:0, tz:'Asia/Singapore', save: base }));
await p.evaluate(() => startRun('work'));
const wk = await p.evaluate(() => RUN.ids[0].slice(2));
await doBackUndo(p, 'work item done and undone', new Function('return workDone("' + wk + '")'));
await p.evaluate(() => closeRun());
// skin
await p.evaluate(() => { if (S.care) delete S.care[today()]; save(); startRun('skin'); });
const sk = await p.evaluate(() => RUN.ids[0].slice(2));
await doBackUndo(p, 'skin step done and undone', new Function('return careOn(today(), "' + sk + '")'));
await p.evaluate(() => closeRun());
// food, with another slot logged after - only this slot comes off
await p.evaluate(() => { if (S.food) delete S.food[today()]; save(); startRun('food'); });
const slot = await p.evaluate(() => RUN.ids[0].slice(2));
await p.waitForTimeout(300);
await p.click('#task [data-runop]'); await p.waitForTimeout(600);
const fb = await p.$('#modal [data-mk]:not([data-mk="__no"]):not([data-mk="__other"])'); await fb.click(); await p.waitForTimeout(700);
await p.evaluate(() => logFood('Yogurt', 20, 'snackX'));
await p.click('#task [data-runback]'); await p.waitForTimeout(450);
await p.click('#task [data-runundo]'); await p.waitForTimeout(500);
const fl = await p.evaluate(s => ({ slot: anchorDone(today(), s), left: foodOn(today()).map(f => f[0]).join() }), slot);
ok(!fl.slot && fl.left === 'Yogurt', 'food: undo takes off that meal, not the one logged after (' + JSON.stringify(fl) + ')');
await p.evaluate(() => closeRun());
// the day's card
await p.evaluate(() => startRun('day', 'card'));
const hasCard = await p.evaluate(() => RUN.ids[RUN.i] === 'card');
if (hasCard) await doBackUndo(p, 'the card done and undone', () => !!(questFor(today()) || {}).done);
else ok(false, 'no card station to test');
await ctx.close();
// a life step
const sl = saveWith({ y:2026, m:9, d:28, fullBack:3, extra: { ...FREE, focus: ['friends'] } });
({ p, ctx } = await open({ y:2026, m:9, d:28, hour:10, min:0, tz:'Asia/Singapore', save: sl }));
await p.evaluate(() => startRun('day', 'life'));
await doBackUndo(p, 'a level-up step done and undone', () => lifeEntries().length > 0);
await ctx.close();
// a thing from his own hand
const sh = saveWith({ y:2026, m:9, d:28, fullBack:3, extra: { ...FREE } });
({ p, ctx } = await open({ y:2026, m:9, d:28, hour:10, min:0, tz:'Asia/Singapore', save: sh }));
const aid = await p.evaluate(() => ACTIONS[0][0]);
await ctx.close();
sh.hand = { do: [aid], in: [] };
({ p, ctx } = await open({ y:2026, m:9, d:28, hour:10, min:0, tz:'Asia/Singapore', save: sh }));
await p.evaluate(() => startRun('day', 'todo'));
await doBackUndo(p, 'a hand Do done and undone', new Function('return !!(S.doneDo || {})["' + aid + '"]'));
ok(await p.evaluate(a => S.hand.do.indexOf(a) === 0, aid), 'and it is back in his hand');
await ctx.close();
// a date night, with a coffee logged after it
const sd = saveWith({ y:2026, m:11, d:2, fullBack:3, extra: { nights: { w: [1, 5], from: '2026-11-02', at: '19:30' } } });
({ p, ctx } = await open({ y:2026, m:11, d:2, hour:20, min:10, tz:'Asia/Singapore', save: sd }));
await p.evaluate(() => startRun('day', 'date'));
await p.waitForTimeout(300);
await p.click('#task [data-runop="date"]'); await p.waitForTimeout(700);
await p.evaluate(() => { S.life.push([today(), 'us', 'call']); save(); });
await p.click('#task [data-runback]'); await p.waitForTimeout(450);
await p.click('#task [data-runundo]'); await p.waitForTimeout(500);
const dn = await p.evaluate(() => ({ done: dateNightDone(today()), left: lifeEntries().map(e => e[2]).join() }));
ok(!dn.done && dn.left === 'call' && !!(await p.$('#task [data-runop="date"]')), 'date night undone; the later step stays (' + JSON.stringify(dn) + ')');
await p.screenshot({ path: 'v80-date.png' });
await ctx.close();
await close();
console.log('ERRS:', ERRS.length ? ERRS : 'none');
