// Sweep: every tab across saves, days, times and phone sizes. Errors, sideways scroll, Start above the fold,
// stations on screen and not piled up, the day list and the run open cleanly. Shard with: node sweep.mjs <i> <n>
import { launch, open, close, saveWith, ERRS } from './harness.mjs';
const [SH, NS] = [Number(process.argv[2] || 0), Number(process.argv[3] || 1)];
await launch();
const HAVE = { s: 'have', d: '2026-09-01' };
const SAVES = {
  fresh:   o => saveWith({ ...o, fullBack: 2, extra: { planSeeded: 0, kit: {} } }),
  stocked: o => saveWith({ ...o, fullBack: 6, lifts: [[1,'B'],[3,'A']], extra: { planSeeded: 0, kit: { moist: HAVE, spf: HAVE, wash: HAVE, am: HAVE } } }),
  ill:     o => { const s = saveWith({ ...o, fullBack: 3, lifts: [[1,'A']], extra: { planSeeded: 0, kit: {} } }); s.sick = {}; s.sick[`${o.y}-${String(o.m).padStart(2,'0')}-${String(o.d).padStart(2,'0')}`] = 1; return s; },
  veg:     o => { const s = saveWith({ ...o, fullBack: 4, lifts: [[2,'A']], extra: { planSeeded: 0, kit: { moist: HAVE } } }); s.veg = {}; s.veg[`${o.y}-${String(o.m).padStart(2,'0')}-${String(o.d).padStart(2,'0')}`] = 1; return s; }
};
const DATES = [[2026,9,27],[2026,9,29],[2026,10,1],[2026,10,3],[2026,10,21],[2026,11,2]];
const TIMES = [[7,30],[8,40],[10,30],[12,40],[15,10],[18,0],[21,40],[23,50]];
const VPS = [[375,667],[390,844],[430,932]];
const TABS = ['today','gym','food','basics','skin','work','cards','vault','you'];
const jobs = [];
for (const sv of Object.keys(SAVES)) for (const d of DATES) for (const t of TIMES) for (const v of VPS) jobs.push([sv, d, t, v]);
let renders = 0, loads = 0; const problems = [];
for (let j = 0; j < jobs.length; j++){
  if (j % NS !== SH) continue;
  const [sv, [y,m,d], [hh,mm], [w,h]] = jobs[j];
  if ((j >> 3) % 3 !== 0 && sv !== 'fresh' && v_skip(j)) continue;
  const tag = `${sv} ${y}-${m}-${d} ${hh}:${String(mm).padStart(2,'0')} ${w}x${h}`;
  const before = ERRS.length;
  const { p, ctx } = await open({ y, m, d, hour: hh, min: mm, tz: d === 21 && m === 10 ? 'America/New_York' : 'Asia/Singapore', save: SAVES[sv]({ y, m, d }) });
  await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(150);
  loads++;
  for (const tab of TABS){
    await p.evaluate(t => { if (typeof MODAL !== 'undefined' && MODAL) MODAL.close(null); go(t); }, tab); await p.waitForTimeout(90);
    renders++;
    const r = await p.evaluate(tab => {
      const out = [], W = innerWidth, H = innerHeight;
      if (document.documentElement.scrollWidth > W + 1) out.push('page scrolls sideways ' + document.documentElement.scrollWidth);
      const sc = document.getElementById('screen');
      if (sc && sc.scrollWidth > sc.clientWidth + 1) out.push('screen scrolls sideways ' + sc.scrollWidth + '>' + sc.clientWidth);
      if (tab === 'today'){
        const st = document.querySelector('.tk-row') || document.querySelector('.tk-start');
        if (!st) out.push('no Start'); else { const b = st.getBoundingClientRect(); if (b.bottom > H + 1) out.push('Start below the fold ' + Math.round(b.bottom) + '>' + H); }
        const pins = [...document.querySelectorAll('.sc-p')].map(e => e.getBoundingClientRect());
        pins.forEach(b => { if (b.left < -2 || b.right > W + 2) out.push('station off screen ' + Math.round(b.left) + '..' + Math.round(b.right)); });
        const xs = pins.map(b => (b.left + b.right) / 2).sort((a, b) => a - b);
        for (let i = 1; i < xs.length; i++) if (xs[i] - xs[i-1] < 30) out.push('stations piled ' + Math.round(xs[i] - xs[i-1]) + 'px (' + xs.length + ')');
      }
      return out;
    }, tab);
    r.forEach(x => problems.push(tag + ' ' + tab + ': ' + x));
  }
  // the day list and the run, once per load
  const q = await p.evaluate(async () => {
    const out = [];
    if (!S.onboarded) return out;
    go('today');
    const pr = askDay(); await new Promise(r => setTimeout(r, 120));
    const rows = document.querySelectorAll('#modal .dp-r').length;
    if (rows < 4) out.push('day list has ' + rows + ' rows');
    MODAL && MODAL.close(null); await pr;
    const steps = runStepsFor('day');
    for (let i = 1; i < steps.length; i++){ const a = steps[i-1].at, b = steps[i].at; if (a != null && b != null && sinceWake(b) < sinceWake(a)) out.push('run out of order at ' + steps[i].id); }
    if (steps.length){ startRun('day'); await new Promise(r => setTimeout(r, 80)); if (!document.querySelector('#task .tk-go, #task .tk-undo')) out.push('run has no action'); closeRun(); }
    return out;
  });
  q.forEach(x => problems.push(tag + ' plan: ' + x));
  if (ERRS.length > before) problems.push(tag + ' errors: ' + ERRS.slice(before).join(' | '));
  await ctx.close();
}
function v_skip(){ return false; }
await close();
console.log('loads:', loads, '| renders:', renders, '| problems:', problems.length);
[...new Set(problems)].slice(0, 60).forEach(x => console.log('  ' + x));
