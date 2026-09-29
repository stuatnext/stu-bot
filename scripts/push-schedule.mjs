// v85: heads-ups, not fixed slots. "I would rather get a notification alerting
// me half an hour or an hour before I need to do something." Each cron line
// is one heads-up, set 30-60 minutes before a real block of his day in
// Singapore time; this decides whether today is a day for it. The shift and
// the stop come in summer/winter pairs because Malta keeps European daylight
// saving and Singapore does not - so the Singapore times move on the last
// Sundays of March and October, and only the right one of each pair sends.
export const SCHEDULE = {
  "35 0 * * *":  "morning",  // 08:35 - the day's shape, once he is up
  "50 1 * * *":  "focus",    // 09:50 - the coffee or the focus block, coming up
  "35 4 * * *":  "midday",   // 12:35 - the clean, Mandarin, the call home
  "15 7 * * *":  "shift",    // 15:15 - Malta at 16:00 (European summer)
  "15 8 * * *":  "shiftw",   // 16:15 - Malta at 17:00 (European winter)
  "2 11 * * *":  "date",     // 19:02 - date night at 19:30, on date nights
  "30 14 * * *": "stop",     // 22:30 - wrap up by 23:00 (summer)
  "30 15 * * *": "stopw",    // 23:30 - wrap up by 00:00 (winter)
  "5 15 * * *":  "bed"       // 23:05 - wind down, on nights with no shift
};
function lastSundayUTC(y, m){ const d = new Date(Date.UTC(y, m, 0, 1)); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return d; }
export function euSummer(now){
  const y = now.getUTCFullYear();
  return now >= lastSundayUTC(y, 3) && now < lastSundayUTC(y, 10);
}
// Whether this heads-up goes today, and the word the phone gets.
export function decide(kind, now, cfg){
  const sg = new Date(now.getTime() + 8 * 3600 * 1000);
  const day = sg.toISOString().slice(0, 10), dow = sg.getUTCDay();
  const weekday = dow >= 1 && dow <= 5;
  const away = (cfg.trips || []).find(t => t[0] <= day && day <= t[1]);
  if (away) return { send: false, why: "away: " + away[2] };
  const summer = euSummer(now);
  switch (kind){
    case "morning": case "midday": return { send: true, word: kind };
    case "focus":  return dow === 0 ? { send: false, why: "Sunday" } : { send: true, word: "focus" };
    case "shift":  return weekday && summer ? { send: true, word: "shift" } : { send: false, why: "not a summer workday" };
    case "shiftw": return weekday && !summer ? { send: true, word: "shift" } : { send: false, why: "not a winter workday" };
    case "stop":   return weekday && summer ? { send: true, word: "stop" } : { send: false, why: "not a summer workday" };
    case "stopw":  return weekday && !summer ? { send: true, word: "stop" } : { send: false, why: "not a winter workday" };
    case "bed":    return weekday ? { send: false, why: "a workday - the stop heads-up covers it" } : { send: true, word: "bed" };
    case "date": {
      const n = cfg.nights || {};
      return (n.w || []).includes(dow) && (!n.from || day >= n.from) ? { send: true, word: "date" } : { send: false, why: "not a date night" };
    }
    default: return { send: true, word: "midday" };
  }
}
