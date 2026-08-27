#!/usr/bin/env python3
"""
Build the three calendar feeds.

The point of this file: an app you have to open is a promise to yourself, and
those fade. Apple Calendar is already open on his phone and his partner's, so
the anchors belong in there rather than behind a tab he has to remember to
visit. Three separate feeds so each can be subscribed to, or not, independently
- and so the shared one can go to his partner without the admin coming too.

    python3 cal/build.py

Writes anchors.ics, year.ics and admin.ics next to this file. Times are
floating (no timezone) on purpose: 07:30 means 07:30 wherever he is standing,
which is what you want for a routine that has to survive travel.
"""

import os
from datetime import date, datetime, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
STAMP = "20260826T000000Z"


def fold(line):
    """RFC 5545 wants lines folded at 75 octets, continuations start with a space."""
    out, raw = [], line.encode("utf-8")
    if len(raw) <= 75:
        return line
    out.append(raw[:75])
    raw = raw[75:]
    while raw:
        out.append(b" " + raw[:74])
        raw = raw[74:]
    return "\r\n".join(chunk.decode("utf-8") for chunk in out)


def esc(text):
    return (text.replace("\\", "\\\\").replace(";", "\\;")
                .replace(",", "\\,").replace("\n", "\\n"))


def event(uid, summary, start, end=None, rrule=None, desc=None, all_day=False,
          location=None, alarm=None):
    lines = ["BEGIN:VEVENT", "UID:%s@stu-bot" % uid, "DTSTAMP:" + STAMP]
    if all_day:
        lines.append("DTSTART;VALUE=DATE:" + start.strftime("%Y%m%d"))
        # DTEND is exclusive for all-day events.
        lines.append("DTEND;VALUE=DATE:" + ((end or start) + timedelta(days=1)).strftime("%Y%m%d"))
    else:
        lines.append("DTSTART:" + start.strftime("%Y%m%dT%H%M%S"))
        lines.append("DTEND:" + (end or start + timedelta(hours=1)).strftime("%Y%m%dT%H%M%S"))
    lines.append("SUMMARY:" + esc(summary))
    if location:
        lines.append("LOCATION:" + esc(location))
    if rrule:
        lines.append("RRULE:" + rrule)
    if desc:
        lines.append("DESCRIPTION:" + esc(desc))
    if alarm is not None:
        lines += ["BEGIN:VALARM", "ACTION:DISPLAY",
                  "DESCRIPTION:" + esc(summary),
                  "TRIGGER:-PT%dM" % alarm, "END:VALARM"]
    lines.append("END:VEVENT")
    return lines


def calendar(name, desc, events):
    lines = ["BEGIN:VCALENDAR", "VERSION:2.0",
             "PRODID:-//stu-bot//Daylight//EN",
             "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
             "X-WR-CALNAME:" + esc(name),
             "X-WR-CALDESC:" + esc(desc),
             "X-PUBLISHED-TTL:PT12H",
             "REFRESH-INTERVAL;VALUE=DURATION:PT12H"]
    lines += events
    lines.append("END:VCALENDAR")
    return "\r\n".join(fold(l) for l in lines) + "\r\n"


def next_weekday(weekday, after=None):
    """weekday: Monday=0. Returns the next such day on or after `after`."""
    d = after or date.today()
    return d + timedelta(days=(weekday - d.weekday()) % 7)


def build_anchors():
    """The two fixed points, plus the one thing that keeps not happening."""
    sat = next_weekday(5)
    wed = next_weekday(2)
    evs = []
    evs += event(
        "anchor-parkrun", "parkrun",
        datetime(sat.year, sat.month, sat.day, 7, 30),
        datetime(sat.year, sat.month, sat.day, 8, 45),
        rrule="FREQ=WEEKLY;BYDAY=SA",
        location="Bishan-Ang Mo Kio Park",
        desc=("Same event every week. Pick the one furthest from Tanjong Pagar rather than the "
              "nearest, so turning up puts you somewhere else in Singapore with the whole day "
              "ahead of you.\n\n"
              "Walking is allowed. There is no time limit and nobody finishes last.\n\n"
              "Bishan-Ang Mo Kio / East Coast / West Coast / Bay East / Bedok Reservoir. "
              "Register once at parkrun.sg - the barcode then works at 2,000+ events worldwide, "
              "Sheffield included."),
        alarm=45)
    evs += event(
        "anchor-mum", "Call Mum - walk while you talk",
        datetime(wed.year, wed.month, wed.day, 14, 30),
        datetime(wed.year, wed.month, wed.day, 15, 15),
        rrule="FREQ=WEEKLY;BYDAY=WE",
        desc=("About 07:00 for her. Kettle on, nobody dressed.\n\n"
              "What moves this off 30% is her expecting it, not you remembering it. So tell her "
              "it is every Wednesday, and then it is hers to hold rather than yours.\n\n"
              "If you are late, call anyway. Ten minutes at 15:20 beats a clean miss."),
        alarm=15)
    kelvin = date.today() + timedelta(days=1)
    evs += event(
        "anchor-kelvin", "Text Kelvin about the games night",
        datetime(kelvin.year, kelvin.month, kelvin.day, 10, 0),
        datetime(kelvin.year, kelvin.month, kelvin.day, 10, 15),
        desc=("Propose a date rather than asking whether he is free. A date is much easier to "
              "answer, and it does not depend on either of you remembering to follow up.\n\n"
              "Delete this event once it is sent."),
        alarm=0)
    return calendar("Daylight - Anchors",
                    "The fixed points. Nothing here can be failed.", evs)


def build_year():
    """Dated things, and the shape of the year he said he wanted to be able to see."""
    evs = []
    evs += event("year-nextpredict", "NEXTPredict, New York", date(2026, 10, 22), date(2026, 10, 23),
                 all_day=True, location="New York",
                 desc=("Negotiate nothing before this.\n\n"
                       "Also: 24 October is when the constraint on what you can post expires. The "
                       "reason to hold back is needing Kalshi and Polymarket on a stage. Once they "
                       "have been on it, that is spent."))
    evs += event("year-ask", "The conversation - scope and rate, one document",
                 date(2026, 10, 27), date(2026, 10, 30), all_day=True,
                 desc=("The week after the event, while your contribution to it is fresh and "
                       "measurable. Ask beforehand and it looks like leverage.\n\n"
                       "You are a supplier, not an employee. Write it as a statement of work: "
                       "scope, coverage hours, response times, rate. 12:00-19:00 SGT on two days "
                       "gives London two hours of morning overlap and frees your evening at seven.\n\n"
                       "Bring the number your channel drove for NEXTPredict."))
    evs += event("year-linkedin", "Find what LinkedIn drove for NEXTPredict",
                 date(2026, 10, 5), all_day=True,
                 desc="Reach, inbound, named connections, pipeline. Best-evidenced line in the rate conversation.")
    evs += event("year-visit-window", "Window for Mum and your brother",
                 date(2027, 2, 1), date(2027, 4, 30), all_day=True,
                 desc=("February is the driest month of the year and there is no haze. It is also "
                       "the first window after the hours change.\n\n"
                       "Pick a month and say it out loud to her. A visit without a month is a wish.\n\n"
                       "Two return fares run roughly GBP 1,400-1,900. Waive a few months of her "
                       "rent and that is the flight."))
    # The next four months as actually planned, so the shape of it is visible
    # somewhere other than his head.
    for label, place, a, b, note in [
        ("UK stopover", "UK", (2026,9,8), (2026,9,8), "One night, and it counts as a UK day."),
        ("Company retreat", "Bulgaria", (2026,9,9), (2026,9,11), "End date assumed - correct it."),
        ("UK - family, September", "UK", (2026,9,12), (2026,9,23), "The twelve days. Protect these from work."),
        ("Singapore, before France", "Singapore", (2026,9,24), (2026,10,9), "TOKEN2049 in here. Longest settled run before January."),
        ("France with partner", "France", (2026,10,10), (2026,10,16), "Not a working trip."),
        ("UK - family, October", "UK", (2026,10,17), (2026,10,21), "A few days before New York."),
        ("UNDECIDED - UK week or home", "?", (2026,10,24), (2026,11,1), "Decide now, not at an airport. Home means seven unbroken weeks in Singapore. UK means the October conversation happens in a room at head office, four days after you launched their event."),
        ("Singapore - the seven weeks", "Singapore", (2026,11,2), (2026,12,19), "Seven weeks. Where the routine actually starts."),
        ("UK - Christmas", "UK", (2026,12,20), (2027,1,2), "Fourteen days."),
    ]:
        evs += event("trip-%d%02d%02d" % a, label, date(*a), date(*b), all_day=True,
                     location=place, desc=note)

    evs += event("year-pr", "PR application window opens up",
                 date(2028, 1, 1), all_day=True,
                 desc=("PTS scheme. Most successful applicants have one to two years of track "
                       "record; processing then takes six to twelve months.\n\n"
                       "What builds the case between now and then: consistent salary, clean "
                       "filings, a company with real commercial substance, and a second client."))
    return calendar("Daylight - The Year",
                    "The shape of the year, coarse on purpose.", evs)


def build_admin():
    """Deadlines. Most hang off a financial year end he does not yet know."""
    evs = []
    evs += event("admin-fye", "Find your financial year end", date(2026, 9, 1), all_day=True,
                 desc=("It is on your ACRA BizFile company profile. Every other deadline on this "
                       "calendar hangs off it, so nothing below is complete until you have it."),
                 alarm=0)
    evs += event("admin-health", "Health insurance - you have none", date(2026, 8, 28), all_day=True,
                 desc=("NEXT's cover does not extend to you, you hold an EP, and there is nothing "
                       "here. Largest practical exposure in your life and the cheapest to close."),
                 alarm=0)
    evs += event("admin-pi", "Ask your PI insurer the territorial question",
                 date(2026, 9, 2), all_day=True,
                 desc=("One email: does this UK policy respond to work performed in Singapore by a "
                       "Singapore entity, for clients outside the UK? If not, you are uninsured "
                       "the moment the second client signs."))
    evs += event("admin-nrl1", "NRL1, and tell your mortgage lender", date(2026, 9, 2), all_day=True,
                 desc=("Your mum lives there and pays rent, so you are a non-resident landlord. "
                       "Without NRL1 the tax is withheld at source, and it takes about 90 days to "
                       "process.\n\n"
                       "Separately: most residential mortgages need consent to let, and many "
                       "lenders will not permit a let to a close relative at all."))
    evs += event("admin-ni", "Check your National Insurance record", date(2026, 9, 9), all_day=True,
                 desc=("Voluntary Class 2 for periods abroad ended on 6 April 2026. Class 3 is now "
                       "the route at about GBP 18.40 a week. Gaps can normally only be filled six "
                       "years back, so every year you leave it, one falls off the end."))
    evs += event("admin-firm", "Two quotes from corporate services firms",
                 date(2026, 9, 9), all_day=True,
                 desc=("A few hundred a month removes the whole category, takes the director "
                       "liability off your friend, and keeps the PR evidence file clean.\n\n"
                       "Directors are personally liable for filing failures. That is him, not you."))
    evs += event("admin-sdl", "SDL - Skills Development Levy",
                 datetime(2026, 9, 14, 9, 0), rrule="FREQ=MONTHLY;BYMONTHDAY=14",
                 desc=("Payable on Employment Pass holders even though CPF is not. 0.25% of monthly "
                       "pay, minimum S$2, capped at S$11.25. Due by the 14th for the month before.\n\n"
                       "Roughly S$135 a year. Trivial money, real compliance item."))
    evs += event("admin-ir8a", "IR8A to yourself as employee", date(2027, 3, 1), all_day=True,
                 rrule="FREQ=YEARLY", desc="Under five employees, so the Auto-Inclusion Scheme is not mandatory.")
    evs += event("admin-b1", "Personal tax - Form B1", date(2027, 4, 15), all_day=True,
                 rrule="FREQ=YEARLY", desc="18 April if e-filing. Also part of your PR evidence.")
    evs += event("admin-cs", "Corporate tax - Form C-S", date(2026, 11, 30), all_day=True,
                 rrule="FREQ=YEARLY", desc="New companies get 75% off the first S$100,000 of chargeable income for the first three years.")
    return calendar("Daylight - Admin",
                    "Filings, insurance and the UK. Do not subscribe your partner to this one.", evs)


def main():
    for name, body in (("anchors.ics", build_anchors()),
                       ("year.ics", build_year()),
                       ("admin.ics", build_admin())):
        path = os.path.join(HERE, name)
        with open(path, "w", encoding="utf-8", newline="") as fh:
            fh.write(body)
        print("wrote %s (%d bytes)" % (name, len(body)))


if __name__ == "__main__":
    main()
