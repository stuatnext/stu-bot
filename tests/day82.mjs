// v82: the day in order and a week with goals.
import { launch, open, close, saveWith, text, ERRS } from './harness.mjs';
await launch();
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const HAVE = { s: 'have', d: '2026-09-20' };
const mk = (y, m, d, x) => saveWith({ y, m, d, fullBack: 3, lifts: [[x || 1, 'B']], extra: { planSeeded: 0, kit: { moist: HAVE, spf: HAVE, wash: HAVE, am: HAVE } } });
// Tuesday 08:30, a rest day (session yesterday): Mandarin, coffee, admin
let { p, ctx } = await open({ y:2026, m:9, d:29, hour:8, min:30, tz:'Asia/Singapore', save: mk(2026, 9, 29, 1) });
const plan = await p.evaluate(() => dayPlan(today()).map(b => [hhmm(b.at), b.id, b.t]));
console.log('   plan:', plan.map(x => x[0] + ' ' + x[1]).join(' | '));
const order = plan.map(x => x[1]);
const idx = id => order.indexOf(id);
ok(idx('wake') === 0, 'the day starts with coming round');
ok(idx('c:skin') > idx('wake') && idx('c:sun') > idx('c:skin') && idx('m:morning') > idx('c:sun'), 'then the routine, then breakfast');
ok(idx('p:train') < idx('coffee') && idx('coffee') - idx('p:train') <= 2, 'a rest day: the walk goes to the coffee');
const cafe = plan.find(x => x[1] === 'coffee')[0];
ok(cafe < '11:45' || cafe >= '14:00', 'coffee is out of the lunch crowd: ' + cafe);
ok(idx('focus') > idx('coffee') && idx('admin') > idx('focus') && idx('work') > idx('admin'), 'focus, then admin, all before Malta');
ok(!order.includes('zh'), 'on the Mandarin day the fifteen minutes is the focus, not a second block');
ok(idx('p:stop') > idx('work') && idx('bed') === order.length - 1, 'stop, the night routine, bed');
const run = await p.evaluate(() => runStepsFor('day').map(s => s.id + '@' + (s.at != null ? hhmm(s.at) : '-')));
console.log('   run:', run.join(' '));
const times = run.map(r => r.split('@')[1]);
ok(run[0].startsWith('wake') && times.every((t, i) => !i || t >= times[i-1] || t < '06:00'), 'the run walks it in order');
ok(/Tuesday is for Mandarin/.test(await p.evaluate(() => dispatchFor(today()))), 'the bubble says what the day is for');
// Start the day starts at coming round
const st = await p.$eval('.tk-start', e => [e.textContent, e.dataset.runat]);
ok(/Start the day/.test(st[0]) && st[1] === 'wake', 'Start the day begins at coming round: ' + st.join(' / '));
await p.screenshot({ path: 'v82-today.png' });
await p.click('.tk-start'); await p.waitForTimeout(400);
ok(/08:30 · Morning/.test(await text(p, '#task .tk-kk')) && /Come round/.test(await text(p, '#task h2')), 'the run: 08:30 come round');
await p.click('#task .tk-go'); await p.waitForTimeout(500);
ok(await p.evaluate(() => !!dayRec(today()).wake) && /Moisturiser|Sunscreen/.test(await text(p, '#task h2')), 'come round ticked, on to the routine');
await p.click('#task [data-runback]'); await p.waitForTimeout(400);
await p.click('#task [data-runundo]'); await p.waitForTimeout(400);
ok(await p.evaluate(() => !dayRec(today()).wake), 'come round can be taken back');
await p.evaluate(() => closeRun()); await p.waitForTimeout(300);
// the day list
await p.click('.tk-day'); await p.waitForTimeout(500);
const dl = await text(p, '#modal');
console.log('   list:', dl.slice(0, 200));
ok(/Tuesday · Mandarin/.test(await text(p, '#modal h3')) && (await p.$$('#modal .dp-r')).length >= 10 && /Malta · until/.test(dl), 'Your day: the whole day as a list, with Malta in it');
ok(!!(await p.$('#modal .dp-r.now')) && /Come round/.test(await text(p, '#modal .dp-r.now')), 'now is lit');
await p.screenshot({ path: 'v82-daylist.png' });
await p.click('#modal .dp-r:nth-child(8) button').catch(() => {}); await p.waitForTimeout(500);
ok(await p.evaluate(() => !!RUN), 'a row starts the run at that step: ' + await text(p, '#task .tk-kk'));
await p.evaluate(() => closeRun()); await p.waitForTimeout(300);
// the focus step, done through the run: logs the skill and moves the line
await p.evaluate(() => startRun('day', 'focus')); await p.waitForTimeout(400);
ok(/Mandarin · step 1 of 5/.test(await text(p, '#task .tk-kk')), 'the focus step names the line: ' + await text(p, '#task .tk-kk'));
await p.screenshot({ path: 'v82-focus.png' });
const xz = await p.evaluate(() => skillXP('zh'));
await p.click('#task .tk-go'); await p.waitForTimeout(700);
ok(await p.evaluate(() => S.lines.zh === 1 && focusDoneOn(today())) && await p.evaluate(() => skillXP('zh')) === xz + 10, 'done: Mandarin +10 XP and the line moves on');
await p.click('#task [data-runback]'); await p.waitForTimeout(400);
await p.click('#task [data-runundo]'); await p.waitForTimeout(500);
ok(await p.evaluate(() => S.lines.zh === 0 && !focusDoneOn(today()) && skillXP('zh') === 0), 'and back');
await p.evaluate(() => closeRun());
// coffee: log the pick
await p.evaluate(() => startRun('day', 'coffee')); await p.waitForTimeout(400);
await p.click('#task .tk-go'); await p.waitForTimeout(500);
ok(/Coffee somewhere new/.test(await text(p, '#modal h3')) && /before the lunch crowd|Before 11:45/i.test(await text(p, '#modal')), 'the coffee sheet: the pick, and the lunch rule');
await p.screenshot({ path: 'v82-coffee.png' });
await p.click('#modal [data-mk="pick"]'); await p.waitForTimeout(600);
ok(await p.evaluate(() => coffeeOn(today()) && coffeePassport() === 1) && /place 1 in your coffee passport/.test(await text(p, '#toast')), 'logged: place 1 in the coffee passport');
await p.evaluate(() => closeRun());
// admin: ticks the first thing to sort
await p.evaluate(() => startRun('day', 'admin')); await p.waitForTimeout(300);
const td = await p.evaluate(() => adminTodo().id);
await p.click('#task .tk-go'); await p.waitForTimeout(500);
ok(await p.evaluate(id => todosAll().find(t => t.id === id).done === today(), td), 'life admin ticks off the first thing to sort');
await p.evaluate(() => closeRun());
// vegetate
await p.click('.tk-day'); await p.waitForTimeout(400);
await p.click('#modal [data-mk="__veg"]'); await p.waitForTimeout(600);
const vg = await p.evaluate(() => ({ ids: winList(today()).map(w => w.id).join(' '), plan: dayPlan(today()).map(b => b.id).join(' ') }));
ok(!/focus|coffee|kit/.test(vg.ids) && !/\bzh\b|admin/.test(vg.plan) && /p:train/.test(vg.ids), 'vegetate: the extras go, the three stay (' + vg.ids + ')');
await p.click('.tk-day'); await p.waitForTimeout(400);
ok(/Back on/.test(await text(p, '#modal .dp-acts')), 'and it can be undone');
await p.click('#modal [data-mk="__veg"]'); await p.waitForTimeout(500);
ok(await p.evaluate(() => !vegOn(today()) && winList(today()).some(w => w.id === 'focus')), 'back on');
// the week, on You
await p.evaluate(() => go('you')); await p.waitForTimeout(600);
await p.evaluate(() => document.querySelector('.wkp').scrollIntoView()); await p.waitForTimeout(200);
const wk = await text(p, '.wkp');
console.log('   week:', wk.slice(0, 260));
ok((await p.$$('.wkp-r')).length === 7 && /Strait Up Growth/.test(wk) && /Vegetate/.test(wk) && !!(await p.$('.wkp-r.on[data-weekday="2"]')), 'Your week: seven days, today lit');
await p.screenshot({ path: 'v82-week.png' });
await p.click('.wkp-r[data-weekday="3"]'); await p.waitForTimeout(400);
await p.click('#modal [data-mk="biz"]'); await p.waitForTimeout(400);
ok(await p.evaluate(() => weekDay(3).f === 'biz'), 'Wednesday changed to the business');
ok((await p.$$('.lf-row')).length === 10 && /Mandarin/.test(await text(p, '.lf')), 'Mandarin is a skill on the sheet');
await ctx.close();
// Monday, session day, 14:10: carry on from where the day is
({ p, ctx } = await open({ y:2026, m:9, d:28, hour:14, min:10, tz:'Asia/Singapore', save: mk(2026, 9, 28, 2) }));
const st2 = await p.$eval('.tk-start', e => [e.textContent, e.dataset.runat]);
ok(/Carry on/.test(st2[0]) && st2[1] !== 'wake', 'mid-afternoon: Carry on, from now (' + st2.join(' / ') + ')');
const mon = await p.evaluate(() => dayPlan(today()).map(b => b.id));
ok(mon.indexOf('p:train') === 1 && mon.includes('zh') && mon.includes('focus') && !mon.includes('coffee'), 'Monday: gym first, the business, fifteen minutes of Mandarin, no coffee');
ok(/Family/.test(await text(p, '.b-pl')), 'and the card is the same step as Start: ' + (await text(p, '.b-pl')).slice(0, 60));
await p.screenshot({ path: 'v82-monday.png' });
await ctx.close();
// Monday 12:05: now is one of the plan's own steps - the card is that step, and Start starts there
({ p, ctx } = await open({ y:2026, m:9, d:28, hour:12, min:5, tz:'Asia/Singapore', save: mk(2026, 9, 28, 2) }));
const pc = await p.evaluate(() => { const pn = planNow(dayPlan(today())); return [pn.id, document.querySelector('.b-pl').textContent, document.querySelector('.tk-start').dataset.runat]; });
console.log('   12:05:', pc.join(' | '));
ok(pc[0] === 'zh' && pc[2] === pc[0] && /Your day/.test(pc[1]), 'a plan step as the card, and Start at it (' + pc[0] + ')');
await p.screenshot({ path: 'v82-plancard.png' });
await ctx.close();
// away: New York, no focus, the plan is smaller
({ p, ctx } = await open({ y:2026, m:10, d:21, hour:9, min:0, tz:'America/New_York', save: mk(2026, 10, 21, 1) }));
const ny = await p.evaluate(() => ({ f: dayFocus(today()), name: dayName(today()), ids: winList(today()).map(w => w.id).join(' ') }));
ok(!ny.f && /New York/.test(ny.name) && !/focus|coffee/.test(ny.ids), 'away: ' + ny.name + ' - no focus, no coffee quest');
await ctx.close();
// small phone: Today fits with the Day button
({ p, ctx } = await open({ y:2026, m:9, d:29, hour:10, min:0, tz:'Asia/Singapore', save: mk(2026, 9, 29, 1) }));
await p.setViewportSize({ width: 375, height: 667 }); await p.waitForTimeout(400);
const fit = await p.evaluate(() => { const r = document.querySelector('.tk-row').getBoundingClientRect(); const d = document.querySelector('.tk-day').getBoundingClientRect(); return { bottom: Math.round(r.bottom), h: innerHeight, dw: Math.round(d.width), dh: Math.round(d.height), sw: document.documentElement.scrollWidth }; });
ok(fit.bottom <= fit.h && fit.dw >= 44 && fit.dh >= 44 && fit.sw <= 375, 'fits at 375x667: ' + JSON.stringify(fit));
await p.screenshot({ path: 'v82-small.png' });
await ctx.close();
await close();
console.log('ERRS:', ERRS.length ? ERRS : 'none');
