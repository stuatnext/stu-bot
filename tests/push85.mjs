// v85: when each heads-up is sent. Pure rules, no browser.
import { SCHEDULE, decide, euSummer } from '../scripts/push-schedule.mjs';
import { readFileSync } from 'node:fs';
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
const cfg = JSON.parse(readFileSync(new URL('../bot/push.json', import.meta.url), 'utf8'));
// a UTC instant from a Singapore wall clock
const sg = (d, hm) => new Date(new Date(d + 'T' + hm + ':00+08:00').getTime());
const send = (k, d, hm) => decide(k, sg(d, hm), cfg);
ok(Object.keys(SCHEDULE).length === 9 && Object.values(SCHEDULE).includes('shiftw'), 'nine cron lines, with the winter pair');
ok(euSummer(sg('2026-10-24', '12:00')) && !euSummer(sg('2026-10-26', '12:00')), 'European summer ends 25 October 2026');
// a summer workday (Tuesday 29 Sep)
ok(send('morning', '2026-09-29', '08:35').send && send('focus', '2026-09-29', '09:50').send && send('midday', '2026-09-29', '12:35').send, 'workday: morning, focus, midday');
ok(send('shift', '2026-09-29', '15:15').send && !send('shiftw', '2026-09-29', '16:15').send, 'summer: the 15:15 heads-up for Malta at 16:00, not the winter one');
ok(send('stop', '2026-09-29', '22:30').send && !send('stopw', '2026-09-29', '23:30').send && !send('bed', '2026-09-29', '23:05').send, 'summer: wrap up at 22:30; no separate bed ping on a workday');
ok(send('shift', '2026-09-29', '15:15').word === 'shift' && send('shiftw', '2026-10-27', '16:15').word === 'shift', 'both halves of the pair reach the phone as "shift"');
// winter
ok(!send('shift', '2026-10-27', '15:15').send && send('shiftw', '2026-10-27', '16:15').send && send('stopw', '2026-10-27', '23:30').send, 'winter: Malta at 17:00, wrap up by midnight');
// weekend
ok(!send('shift', '2026-10-03', '15:15').send && !send('stop', '2026-10-03', '22:30').send && send('bed', '2026-10-03', '23:05').send, 'Saturday: no shift pings, a wind-down instead');
ok(!send('focus', '2026-10-04', '09:50').send && send('morning', '2026-10-04', '08:35').send, 'Sunday: no focus heads-up');
// trips mute everything
ok(['morning', 'focus', 'midday', 'shift', 'stop'].every(k => !send(k, '2026-10-21', '12:00').send), 'New York: nothing sent on Singapore time');
ok(/away: Cannes/.test(send('morning', '2026-10-12', '08:35').why), 'Cannes: away, and says so');
ok(send('morning', '2026-10-25', '08:35').send, 'home on the 25th: back on');
// date nights
ok(!send('date', '2026-10-30', '19:02').send && send('date', '2026-11-02', '19:02').send && !send('date', '2026-11-03', '19:02').send && send('date', '2026-11-06', '19:02').send, 'date nights: Mondays and Fridays from 2 November');
