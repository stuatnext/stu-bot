// v81: kit first - a step he has nothing for is held, the kit takes its place, and the picks say what to buy.
import { launch, open, close, saveWith, text, ERRS } from './harness.mjs';
await launch();
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const ids = p => p.evaluate(() => winList(today()).map(w => w.id).join(' '));
const base = saveWith({ y:2026, m:9, d:28, fullBack:3, lifts:[[1,'B']], extra: { kit: {}, notes: {} } });
let { p, ctx } = await open({ y:2026, m:9, d:28, hour:8, min:50, tz:'Asia/Singapore', save: base });
let w = await ids(p);
console.log('   stations:', w);
ok(/\bkit\b/.test(w) && !/c:skin|c:sun/.test(w), 'no kit: the moisturiser and sunscreen steps are held, the kit stands in');
ok(await p.evaluate(() => kitState('moist') === 'ask' && !careDue('skin') && !careDue('night') && careDue('bed')), 'the wind-down needs nothing and stays');
const st = await p.evaluate(() => { const k = winList(today()).find(w => w.id === 'kit'); return k.label + ' | ' + k.why; });
console.log('   station:', st);
ok(/^Check your kit \| Moisturiser, sunscreen, face wash and breakfast protein \u2014 which have you got\?/.test(st), 'the station asks first');
// the board card
await p.click('[data-pick="kit"]').catch(() => {}); await p.waitForTimeout(500);
console.log('   card:', await text(p, '.b-pl'));
ok(/Check your kit/.test(await text(p, '.b-pl')) && !!(await p.$('.tk-start')), 'the card, and Start here');
await p.screenshot({ path: 'v81-today.png' });
// the Skin tab: the picks
await p.evaluate(() => go('skin')); await p.waitForTimeout(700);
const sk = await text(p, '#screen');
ok(/Get the kit first/.test(sk) && /Your kit\s*0 of 3/.test(sk), 'Skin: nothing to run yet, the kit is the level');
ok(/Neutrogena Hydro Boost Water Gel/.test(sk) && /CeraVe PM Facial Moisturising Lotion, if your skin feels tight/.test(sk) && /Before you towel off|before you towel off/.test(sk) && /Watsons, Guardian or a big FairPrice/.test(sk), 'the moisturiser: the pick, the other one and when, how, where');
ok(/Bioré UV Aqua Rich/.test(sk) && /CeraVe Foaming Cleanser/.test(sk) && /About S\$75 for the three/.test(sk), 'sunscreen, face wash, and the cost of the trip');
ok(!(await p.$('#screen [data-run="skin"]')), 'no start button with nothing to start');
await p.screenshot({ path: 'v81-skin.png', fullPage: false });
await p.evaluate(() => document.querySelector('.kit').scrollIntoView()); await p.waitForTimeout(200);
await p.screenshot({ path: 'v81-skin-kit.png' });
const xs0 = await p.evaluate(() => skillXP('skin'));
// moisturiser: need to buy; sunscreen: have one
await p.click('[data-kit="moist"][data-kitto="need"]'); await p.waitForTimeout(500);
ok(await p.evaluate(() => kitState('moist')) === 'need' && /Moisturiser is on the list/.test(await text(p, '#toast')), 'need to buy it: on the list');
ok(/To buy/.test(await text(p, '.kit-i.need')), 'the card says to buy');
await p.click('[data-kit="spf"][data-kitto="have"]'); await p.waitForTimeout(600);
console.log('   toast:', await text(p, '#toast'));
ok(await p.evaluate(() => kitState('spf')) === 'have' && /Sunscreen is back in the morning/.test(await text(p, '#toast')), 'have one: sunscreen unlocked');
ok(await p.evaluate(() => skillXP('skin')) === xs0 + 30, 'the kit pays the Skin skill: +30');
ok(!!(await p.$('#screen [data-run="skin"]')) && /Sunscreen/.test(await text(p, '.stage-l')), 'the routine is back with the one step he can do');
// the run: go through the rest
await p.evaluate(() => go('today')); await p.waitForTimeout(500);
await p.evaluate(() => startRun('day', 'kit')); await p.waitForTimeout(400);
console.log('   run step:', await text(p, '#task .tk-body'), '|', await p.$eval('#task .tk-go', e => e.textContent));
ok(/Level zero/.test(await text(p, '#task .tk-kk')) && await p.$eval('#task .tk-go', e => e.textContent) === 'Go through it', 'the run: the kit is a step, gone through');
await p.click('#task .tk-go'); await p.waitForTimeout(500);
console.log('   sheet 1:', await text(p, '#modal h3'), '|', await p.$$eval('#modal [data-mk]', es => es.map(e => e.textContent).join(' / ')));
ok(/Moisturiser · 1 of 3/.test(await text(p, '#modal h3')) && /Neutrogena/.test(await text(p, '#modal .kit-c')), 'sheet: one thing at a time, with the pick');
await p.screenshot({ path: 'v81-sheet.png' });
await p.click('#modal [data-mk="need"]'); await p.waitForTimeout(450);
ok(/Face wash · 2 of 3/.test(await text(p, '#modal h3')), 'next: face wash');
await p.click('#modal [data-mk="have"]'); await p.waitForTimeout(450);
ok(/Breakfast protein · 3 of 3/.test(await text(p, '#modal h3')) && /Greek yoghurt/.test(await text(p, '#modal .kit-c')), 'next: breakfast protein');
await p.click('#modal [data-mk="need"]'); await p.waitForTimeout(700);
console.log('   after:', await text(p, '#toast'));
ok(/Got: face wash\. On the list: moisturiser and breakfast protein\./.test(await text(p, '#toast')), 'the summary');
const rs = await p.evaluate(() => ({ i: RUN && RUN.i, ticked: RUN && !!RUN.ticked.kit }));
ok(rs.ticked === false, 'not ticked while things are still to buy');
await p.evaluate(() => closeRun()); await p.waitForTimeout(300);
const st2 = await p.evaluate(() => { const k = winList(today()).find(w => w.id === 'kit'); return k ? k.label + ' | ' + k.why : 'none'; });
console.log('   station now:', st2);
ok(/^Get the kit \| Moisturiser and breakfast protein\. A big FairPrice has all of it\./.test(st2), 'the station turns into the errand');
// food: the morning pick is never the thing he has not got
const sug = await p.evaluate(() => (suggestOrder('morning') || [''])[0]);
ok(sug === 'Two eggs at the kopitiam', 'breakfast pick without yoghurt in: ' + sug);
const saved = await p.evaluate(() => localStorage.getItem('daylight.v4'));
await ctx.close();
// next day: the dispatch names the errand
const s2 = JSON.parse(saved); s2.lastOpen = '2026-09-29'; s2.notes = {};
({ p, ctx } = await open({ y:2026, m:9, d:29, hour:12, min:5, tz:'Asia/Singapore', save: s2 }));
const say = await p.evaluate(() => dispatchFor(today()));
console.log('   bubble:', say);
ok(/^Passing a FairPrice\? Moisturiser and breakfast protein\./.test(say), 'the bubble names the errand');
// bought it: Start here on the kit card, then the sheets
await p.evaluate(() => { B_PICK = 'kit'; render({}); }); await p.waitForTimeout(400);
await p.click('.tk-start'); await p.waitForTimeout(450);
await p.click('#task .tk-go'); await p.waitForTimeout(450);
await p.click('#modal [data-mk="have"]'); await p.waitForTimeout(450);
await p.click('#modal [data-mk="have"]'); await p.waitForTimeout(700);
await p.evaluate(() => closeRun()); await p.waitForTimeout(300);
w = await ids(p);
ok(/c:skin/.test(w) && !/\bkit\b/.test(w), 'all got: the moisturiser step is back and the kit station is gone (' + w + ')');
const sug2 = await p.evaluate(() => suggestOrder('morning')[0]);
ok(['Greek yoghurt', 'Protein shake', 'Two eggs at the kopitiam'].includes(sug2), 'breakfast from all three again: ' + sug2);
ok(await p.evaluate(() => ['moist','spf','wash','am'].every(k => kitState(k) === 'have')), 'everything got');
// Skin tab: the kit behind a door, with Ran out
await p.evaluate(() => { S.folds = { skinkit: 1 }; go('skin'); }); await p.waitForTimeout(600);
ok(/all there/.test(await text(p, '#screen')) && !!(await p.$('[data-kit="spf"][data-kitto="need"]')), 'all there: behind a door, with Ran out');
await p.click('[data-kit="moist"][data-kitto="need"]'); await p.waitForTimeout(500);
ok(await p.evaluate(() => kitState('moist') === 'need' && !careDue('skin')), 'ran out: the step waits again');
await ctx.close();
// he plainly has it: the record shows him using it
const s3 = saveWith({ y:2026, m:9, d:28, fullBack:3, extra: { kit: {}, care: { '2026-09-27': { skin: 1 }, '2026-09-26': { skin: 1 }, '2026-09-25': { skin: 1 } } } });
({ p, ctx } = await open({ y:2026, m:9, d:28, hour:8, min:50, tz:'Asia/Singapore', save: s3 }));
ok(await p.evaluate(() => kitState('moist')) === 'have' && /c:skin/.test(await ids(p)), 'used it lately: nobody asks');
await p.evaluate(() => { S.kit = { moist: { s: 'need', d: today() } }; save(); });
ok(await p.evaluate(() => careRun('skin')) === 3, 'a bottle running out does not rewrite a run already kept');
await ctx.close();
// small phone: fits
const s4 = saveWith({ y:2026, m:9, d:28, fullBack:3, extra: { kit: {} } });
({ p, ctx } = await open({ y:2026, m:9, d:28, hour:21, min:40, tz:'Asia/Singapore', save: s4, tab: 'skin' }));
await p.setViewportSize({ width: 375, height: 667 }); await p.waitForTimeout(400);
const fit = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, sc: document.getElementById('screen').scrollWidth, btn: [...document.querySelectorAll('.kit-b')].map(b => Math.round(b.getBoundingClientRect().height)) }));
console.log('   375:', JSON.stringify(fit), '| stage:', await text(p, '.stage-l'));
ok(fit.sw <= 375 && fit.sc <= 375 && fit.btn.every(h => h >= 44), 'fits at 375 with thumb-sized buttons');
await p.evaluate(() => document.querySelector('.kit').scrollIntoView()); await p.waitForTimeout(200);
await p.screenshot({ path: 'v81-skin-night-375.png' });
await ctx.close();
await close();
console.log('ERRS:', ERRS.length ? ERRS : 'none');
