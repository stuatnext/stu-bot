// v39 harness core: opens the app at 390x844 with a controlled clock, timezone, optional geolocation and a seeded save.
// Import from the walk scripts:  import { launch, open, ERRS } from './harness.mjs'
import { chromium } from 'playwright-core';

export const ERRS = [];
let browser = null;
export async function launch(){
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium', args:['--no-sandbox'] });
  return browser;
}
export async function close(){ if (browser) await browser.close(); }

// Injected before any app script: a Date whose "now" is fixed to the given local wall-clock time, and the save.
function seedScript(){
  return ({ y, m, d, hour, min, save }) => {
    const FIXED = new Date(y, m - 1, d, hour, min == null ? 20 : min, 0);
    const Real = Date;
    // @ts-ignore
    Date = class extends Real {
      constructor(...a){ a.length ? super(...a) : super(FIXED); }
      static now(){ return FIXED.getTime(); }
    };
    if (save) localStorage.setItem('daylight.v4', JSON.stringify(save));
  };
}

// Build a plausible save: `fullBack` = how many consecutive full days ending yesterday; lifts = [[daysAgo, key], ...]
export function saveWith(o){
  o = o || {};
  const base = new Date(o.y, o.m - 1, o.d, 12, 0, 0);
  const iso = dd => dd.getFullYear() + '-' + String(dd.getMonth() + 1).padStart(2, '0') + '-' + String(dd.getDate()).padStart(2, '0');
  const back = n => { const dd = new Date(base); dd.setDate(dd.getDate() - n); return iso(dd); };
  const days = {};
  for (let i = 1; i <= (o.fullBack || 0); i++) days[back(i)] = { p: { train: 1, family: 1, stop: 1 } };
  const lifts = {};
  (o.lifts || []).forEach(([n, s]) => { lifts[back(n)] = { s, ex: { 'Goblet squat': { w: 14, r: [10, 10, 10] }, 'Dumbbell bench press': { w: 12, r: [10, 9, 8] }, 'One-arm dumbbell row': { w: 12, r: [10, 10, 10] } } }; });
  const waist = (o.waist || []).map(([n, cm]) => [back(n), cm]);
  return Object.assign({ days, lifts, waist, rate: 5, mute: true, booted: 9, onboarded: 1, cardsWhy: 1,
    openedDay: o.fullBack || 0, openedStreak: Math.floor((o.fullBack || 0) / 7), cards: { 'Chilli crab': 1 },
    kg: 71.5, look: 'sky', badge: 1, lastOpen: iso(base), planSeeded: 1, seed84: 1, seed86: 1, seed87: 1, seed88: 1, seed89: 1, seed90: 1, seed91: 1, seed92: 1 }, o.extra || {});
}

// cfg: { y,m,d,hour,min, tz, geo:{latitude,longitude}, save, tab }
export async function open(cfg){
  const ctxOpts = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  if (cfg.tz) ctxOpts.timezoneId = cfg.tz;
  if (cfg.geo){ ctxOpts.geolocation = cfg.geo; ctxOpts.permissions = ['geolocation']; }
  const ctx = await browser.newContext(ctxOpts);
  const p = await ctx.newPage();
  p.on('pageerror', e => ERRS.push('ERR ' + e.message));
  p.on('console', m => { if (m.type() === 'error') ERRS.push('CONSOLE ' + m.text()); });
  await p.addInitScript(seedScript(), { y: cfg.y, m: cfg.m, d: cfg.d, hour: cfg.hour, min: cfg.min, save: cfg.save });
  await p.goto(new URL('../app/index.html', import.meta.url).href);
  await p.waitForTimeout(1500);
  if (cfg.tab && cfg.tab !== 'today'){ await p.click('#nav [data-tab="' + cfg.tab + '"]'); await p.waitForTimeout(600); }
  return { p, ctx };
}

export const text = async (p, sel) => (await p.$eval(sel, e => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => 'MISSING'));
export const count = async (p, sel) => (await p.$$eval(sel, es => es.length));
