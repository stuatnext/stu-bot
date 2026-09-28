// v77: a level for every part of life - derived from the record, levelled by steps, focus and the weekly step.
import { launch, open, close, saveWith, text, ERRS } from './harness.mjs';
await launch();
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const save = saveWith({ y:2026, m:9, d:28, fullBack:6, lifts:[[1,'B'],[3,'A'],[5,'C']] });
save.week = { 1: { f: 'veg' } }; save.veg = { '2026-09-28': 0 };   // v82: a day with no set focus, so the weekly step shows
save.care = { '2026-09-27': { moist:1, spf:1 }, '2026-09-26': { moist:1 } };
save.food = { '2026-09-27': [['Chicken rice', 35, 'midday'], ['Protein shake', 25, 'morning'], ['Salmon don', 32, 'dinner'], ['Yogurt', 40, 'dinner']] };
const { p, ctx } = await open({ y:2026, m:9, d:28, hour:12, min:10, tz:'Asia/Singapore', save });
const lv = await p.evaluate(() => SKILLS.map(s => s[0] + ':' + skillLv(s[0]).level + '/' + skillXP(s[0])).join(' '));
console.log('   start:', lv);
ok(/gym:[1-9]/.test(lv) && /family:[1-9]/.test(lv) && /us:0\/0/.test(lv), 'record skills start from the record; step skills at zero');
const xp0 = await p.evaluate(() => { XPC = null; return xp(); });
// the You tab: the sheet
await p.click('#nav [data-tab="cards"]').catch(()=>{}); await p.evaluate(() => go('you')); await p.waitForTimeout(500);
ok(await p.$('.lf') && (await p.$$('.lf-row')).length === 10, 'character sheet with ten skills (v82: Mandarin)');
ok(/Star up to three/.test(await text(p, '.lf-lead')), 'invites a focus');
await p.screenshot({ path: 'v77-sheet-empty.png' });
// focus three: us, friends, biz
for (const k of ['us', 'friends', 'biz']){ await p.click('[data-focus="' + k + '"]'); await p.waitForTimeout(250); }
ok(await p.evaluate(() => focusList().join()) === 'us,friends,biz', 'focus set: ' + await p.evaluate(() => focusList().join()));
await p.click('[data-focus="name"]'); await p.waitForTimeout(300);
ok(await p.evaluate(() => focusList().length) === 3 && /Three at a time/.test(await text(p, '#toast')), 'a fourth is refused kindly');
const firstRow = await p.evaluate(() => document.querySelector('.lf-row .lf-nm').textContent);
ok(/Tim & me/.test(firstRow), 'focused first: ' + firstRow);
await p.screenshot({ path: 'v77-sheet-focus.png' });
// log a date night from the sheet
await p.click('[data-life="us"]'); await p.waitForTimeout(400);
ok(/Tim & me/.test(await text(p, '#modal h3')), 'skill sheet opens');
await p.click('#modal [data-mk="date"]'); await p.waitForTimeout(900);
const us1 = await p.evaluate(() => skillLv('us'));
ok(us1.level === 1 && us1.xp === 60, 'a date night: Tim & me level 1 (' + JSON.stringify(us1) + ')');
ok(await p.evaluate(() => { XPC = null; return xp(); }) === xp0 + 30, 'the main level gets half the step');
await p.evaluate(() => { const f = document.getElementById('fx'); if (f) f.innerHTML = ''; });
// undo it
await p.click('[data-life="us"]'); await p.waitForTimeout(400);
await p.click('#modal [data-mk="__undo"]'); await p.waitForTimeout(500);
ok(await p.evaluate(() => skillLv('us').xp) === 0, 'take the last one off');
// Today: the week's step replaces the card, and Did it logs it
await p.evaluate(() => go('today')); await p.waitForTimeout(700);
const st = await p.evaluate(() => { const w = winList(today()).find(w => w.kind === 'life'); return w ? w.label + ' | ' + w.life.act[1] : null; });
ok(st && /Tim & me/.test(st), 'Today has the week\'s step: ' + st);
await p.click('[data-pick="life"]'); await p.waitForTimeout(500);
ok(/Level up/.test(await text(p, '.b-pl-n')), 'card kicker: ' + await text(p, '.b-pl-n'));
await p.screenshot({ path: 'v77-today-step.png' });
await p.click('.tk-start'); await p.waitForTimeout(500);
ok(/Level up/.test(await text(p, '#task')), 'Start here opens the step in the run');
await p.click('#task [data-runop="life"]'); await p.waitForTimeout(900);
await p.evaluate(() => { if (typeof closeRun === 'function') closeRun(); });
const next = await p.evaluate(() => { const w = winList(today()).find(w => w.kind === 'life'); return w ? w.label : 'none'; });
ok(next === 'Friends & community', 'after the step, the next focus steps up: ' + next);
// runner handles the life step
const run = await p.evaluate(() => runStepsFor('day').filter(s => s.op === 'life').map(s => s.kicker + ' / ' + s.title));
ok(run.length === 1 && /Level up/.test(run[0]), 'the run includes it: ' + run[0]);
await ctx.close();
// reload keeps it
await close();
console.log('ERRS:', ERRS.length ? ERRS : 'none');
