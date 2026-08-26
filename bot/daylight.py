#!/usr/bin/env python3
"""
Daylight bot.

The point of this file: an app you have to open is a promise you make to
yourself, and those have not worked. This does the opposite - it reaches out,
asks a question, and writes down whether you answered. The record is kept here,
in the repository, not by you.

It runs on GitHub Actions cron. No server, no hosting, nothing to maintain.

  python bot/daylight.py morning     # names today's focus, asks for a first action
  python bot/daylight.py evening     # asks what actually happened
  python bot/daylight.py collect     # pulls replies from Telegram into the log
  python bot/daylight.py --dry-run morning

Secrets, set once in the repository under Settings -> Secrets and variables ->
Actions:
  TELEGRAM_TOKEN    from @BotFather
  TELEGRAM_CHAT_ID  from @userinfobot
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(HERE, "config.json")
STATE_PATH = os.path.join(HERE, "state.json")

API = "https://api.telegram.org/bot{token}/{method}"
YES = {"y", "yes", "yep", "yeah", "done", "did", "did it", "aye", "ok", "okay", "1"}
NO = {"n", "no", "nope", "nah", "missed", "didn't", "didnt", "0"}


# ----------------------------------------------------------------- storage
def load_json(path, fallback):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return fallback


def save_state(state):
    with open(STATE_PATH, "w", encoding="utf-8") as fh:
        json.dump(state, fh, indent=2, ensure_ascii=False, sort_keys=True)
        fh.write("\n")


def blank_state():
    return {"last_update_id": 0, "days": {}, "asked": {}}


# ----------------------------------------------------------------- time
def hhmm_to_min(s):
    h, m = (int(x) for x in s.split(":"))
    return h * 60 + m


def now_local(cfg):
    off = timedelta(minutes=cfg.get("timezone_offset_minutes", 480))
    return datetime.now(timezone.utc) + off


def fmt_dur(minutes):
    minutes = max(0, int(round(minutes)))
    h, m = divmod(minutes, 60)
    if h and m:
        return "%dh %02dm" % (h, m)
    return "%dh" % h if h else "%dm" % m


def day_shape(cfg, when=None):
    """Work is fixed to head office in UTC, so the local shape follows from the
    offset: free morning equals the offset, evening is what is left of eight
    hours. This is why the same shift feels different in every country."""
    off = cfg.get("timezone_offset_minutes", 480)
    start = hhmm_to_min(cfg.get("work_start_utc", "08:00")) + off
    end = hhmm_to_min(cfg.get("work_end_utc", "15:00")) + off
    wake = hhmm_to_min(cfg.get("wake_local", "08:00"))
    local = when or datetime.now(timezone.utc) + timedelta(minutes=off)
    minute_of_day = local.hour * 60 + local.minute
    return {
        "start": start,
        "end": end,
        "wake": wake,
        "now": minute_of_day,
        "until_work": max(0, start - minute_of_day),
        "free_total": max(0, start - wake),
        "evening": max(0, 1380 - end),
        "start_str": "%02d:%02d" % (start // 60 % 24, start % 60),
        "end_str": "%02d:%02d" % (end // 60 % 24, end % 60),
    }


# ----------------------------------------------------------------- telegram
def telegram(method, token, dry_run=False, **params):
    if dry_run:
        print("[dry-run] %s %s" % (method, json.dumps(params, ensure_ascii=False)[:400]))
        return {"ok": True, "result": []}
    url = API.format(token=token, method=method)
    data = urllib.parse.urlencode(params).encode()
    try:
        with urllib.request.urlopen(url, data=data, timeout=25) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        body = exc.read().decode(errors="replace")[:300]
        print("Telegram %s failed: %s %s" % (method, exc.code, body), file=sys.stderr)
        return {"ok": False}
    except OSError as exc:
        print("Telegram %s unreachable: %s" % (method, exc), file=sys.stderr)
        return {"ok": False}


def send(text, token, chat_id, dry_run=False):
    if dry_run:
        print("-" * 58)
        print(text)
        print("-" * 58)
        return True
    res = telegram("sendMessage", token, chat_id=chat_id, text=text,
                   parse_mode="HTML", disable_web_page_preview="true")
    return bool(res.get("ok"))


# ----------------------------------------------------------------- messages
def morning_text(cfg, state, local):
    shape = day_shape(cfg, local)
    day = local.strftime("%a")
    focus = cfg.get("rotation", {}).get(day)
    lines = ["<b>Daylight</b> - %s %s" % (day, local.strftime("%d.%m"))]

    if shape["until_work"] > 0:
        lines.append("%s until work at %s." % (fmt_dur(shape["until_work"]), shape["start_str"]))
    else:
        lines.append("The shift has started.")

    lines.append("")
    if focus:
        lines.append("Today is <b>%s</b>." % focus)
        lines.append("")
        lines.append("Reply with the first thing you will actually do. "
                     "One line. It is decided then, and you do not have to decide it again at eleven.")
    else:
        lines.append("No focus set for %s - it is yours." % day)
        lines.append("")
        lines.append("Reply with the one thing you want out of today.")

    yday = (local - timedelta(days=1)).strftime("%Y-%m-%d")
    prev = state.get("days", {}).get(yday, {})
    if prev.get("commitment") and prev.get("done") is None:
        lines.append("")
        lines.append("<i>Yesterday you said: %s - and never said how it went.</i>"
                     % prev["commitment"])
    return "\n".join(lines)


def evening_text(cfg, state, local):
    today = local.strftime("%Y-%m-%d")
    entry = state.get("days", {}).get(today, {})
    lines = ["<b>How did it go?</b>"]
    if entry.get("commitment"):
        lines.append("")
        lines.append("This morning you said: <b>%s</b>" % entry["commitment"])
        lines.append("")
        lines.append("Did it happen? Yes or no is a complete answer.")
    else:
        lines.append("")
        lines.append("You did not name anything this morning. That is worth knowing too.")
        lines.append("")
        lines.append("What did the day actually go on?")

    habits = cfg.get("habits", [])
    if habits:
        lines.append("")
        lines.append("Also, quickly:")
        for h in habits:
            lines.append("- %s <i>(bad day: %s)</i>" % (h.get("name", "?"), h.get("tiny", "-")))
    return "\n".join(lines)


# ----------------------------------------------------------------- collect
def classify(text):
    t = (text or "").strip().lower().rstrip(".!")
    if t in YES:
        return True
    if t in NO:
        return False
    return None


def collect(cfg, state, token, dry_run=False):
    """Pull anything he has said back to the bot and file it under the day.
    Silence is recorded as silence, which is the entire point."""
    res = telegram("getUpdates", token, dry_run=dry_run,
                   offset=state.get("last_update_id", 0) + 1, timeout=0, allowed_updates='["message"]')
    if not res.get("ok"):
        return 0
    off = cfg.get("timezone_offset_minutes", 480)
    added = 0
    for upd in res.get("result", []):
        state["last_update_id"] = max(state.get("last_update_id", 0), upd.get("update_id", 0))
        msg = upd.get("message") or {}
        text = (msg.get("text") or "").strip()
        if not text:
            continue
        when = datetime.fromtimestamp(msg.get("date", 0), timezone.utc) + timedelta(minutes=off)
        key = when.strftime("%Y-%m-%d")
        entry = state.setdefault("days", {}).setdefault(key, {})
        entry.setdefault("replies", []).append({"at": when.strftime("%H:%M"), "text": text})
        verdict = classify(text)
        if verdict is not None:
            entry["done"] = verdict
        elif not entry.get("commitment"):
            # The first substantive reply of the day is the commitment.
            entry["commitment"] = text
        added += 1
    return added


# ----------------------------------------------------------------- summary
def week_summary(state, local):
    asked = kept = silent = 0
    for i in range(7):
        key = (local - timedelta(days=i)).strftime("%Y-%m-%d")
        entry = state.get("days", {}).get(key)
        if not entry:
            continue
        if entry.get("commitment"):
            asked += 1
            if entry.get("done") is True:
                kept += 1
            elif entry.get("done") is None:
                silent += 1
    return asked, kept, silent


# ----------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mode", choices=["morning", "evening", "collect", "summary"])
    ap.add_argument("--dry-run", action="store_true",
                    help="print the message instead of sending it")
    args = ap.parse_args()

    cfg = load_json(CONFIG_PATH, {})
    state = load_json(STATE_PATH, blank_state())
    for k, v in blank_state().items():
        state.setdefault(k, v)

    token = os.environ.get("TELEGRAM_TOKEN", "")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "")
    if not args.dry_run and not (token and chat_id):
        print("TELEGRAM_TOKEN and TELEGRAM_CHAT_ID must be set. "
              "Run with --dry-run to preview without them.", file=sys.stderr)
        return 1

    local = now_local(cfg)
    today = local.strftime("%Y-%m-%d")

    # Always pick up replies first, so a message sent now reflects what he said.
    got = collect(cfg, state, token, dry_run=args.dry_run)
    if got:
        print("collected %d repl%s" % (got, "y" if got == 1 else "ies"))

    if args.mode == "collect":
        save_state(state)
        return 0

    if args.mode == "summary":
        asked, kept, silent = week_summary(state, local)
        print("last 7 days: asked %d, kept %d, silent %d" % (asked, kept, silent))
        return 0

    text = morning_text(cfg, state, local) if args.mode == "morning" \
        else evening_text(cfg, state, local)

    if not send(text, token, chat_id, dry_run=args.dry_run):
        print("send failed", file=sys.stderr)
        if not args.dry_run:
            save_state(state)
        return 1

    if args.dry_run:
        return 0
    state.setdefault("asked", {}).setdefault(today, []).append(args.mode)
    print("sent %s" % args.mode)
    save_state(state)
    return 0


if __name__ == "__main__":
    sys.exit(main())
