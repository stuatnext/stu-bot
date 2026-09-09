// The nudges' sender half. Runs in GitHub Actions on two crons (see
// .github/workflows/nudge.yml): KIND=morning at 08:00 Singapore, KIND=evening
// at 22:15. The receiving half is app/sw.js, which reads the day's mirrored
// state on the device and writes the actual words - this script sends one
// dumb, unpersonalised ping carrying only which of the two it is.
//
// Secrets (repo -> Settings -> Secrets and variables -> Actions):
//   PUSH_SUBSCRIPTION  - the JSON the app copies to the clipboard when the
//                        nudge is switched on in You (re-paste it if the
//                        phone ever re-subscribes)
//   VAPID_PRIVATE_KEY  - the private half of the pair whose public half is
//                        VAPID_PUBLIC in app/js/data.js
//
// Missing secrets are a clean no-op, so the workflow can ship before the
// keys are set without a red cross every night.

import webpush from "web-push";

// One secret, made by the phone: { subscription, vapidPublic, vapidPrivate }.
// The app generates the key pair itself now, so nothing about push lives in
// the repo. The old two-secret layout still works, for a phone that set it
// up before this.
const LEGACY_PUBLIC =
  "BPzJd3TZ6bSeFIRWBVzeKKkJA6tkUxGFHMDbal6_JXLrjULbQg9REfSSISRnoOWvUghgNaTQfo4xTMdxO_XtvLI";

export function readConfig(env){
  const raw = env.PUSH_BUNDLE;
  if (raw){
    let b;
    try { b = JSON.parse(raw); } catch (e){ throw new Error("PUSH_BUNDLE is not JSON: " + e.message); }
    if (!b.subscription || !b.subscription.endpoint) throw new Error("PUSH_BUNDLE has no subscription endpoint");
    if (!b.vapidPublic || !b.vapidPrivate) throw new Error("PUSH_BUNDLE is missing a VAPID key");
    return { subscription: b.subscription, pub: b.vapidPublic, priv: b.vapidPrivate, via: "bundle" };
  }
  const sub = env.PUSH_SUBSCRIPTION, priv = env.VAPID_PRIVATE_KEY;
  if (!sub || !priv) return null;
  let subscription;
  try { subscription = JSON.parse(sub); if (!subscription.endpoint) throw new Error("no endpoint"); }
  catch (e){ throw new Error("PUSH_SUBSCRIPTION does not parse as a push subscription: " + e.message); }
  return { subscription, pub: LEGACY_PUBLIC, priv, via: "legacy" };
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());
if (!isMain) {
  // imported for a check: export only
} else {
let cfg;
try { cfg = readConfig(process.env); }
catch (e){ console.error(e.message); process.exit(1); }
if (!cfg){
  console.log("PUSH_BUNDLE not set (nor the legacy PUSH_SUBSCRIPTION + VAPID_PRIVATE_KEY) - nothing to send.");
  process.exit(0);
}
const { subscription, pub: VAPID_PUBLIC, priv } = cfg;
webpush.setVapidDetails("https://github.com/stuatnext/stu-bot", VAPID_PUBLIC, priv);

try {
  const kind = process.env.KIND === "morning" ? "morning" : "evening";
  await webpush.sendNotification(subscription, JSON.stringify({ t: kind }), { TTL: 3600 });
  console.log("Nudge sent (" + kind + ").");
} catch (e){
  // 404/410 mean the phone unsubscribed or the subscription expired: the
  // secret needs re-pasting from the app. Anything else is a real failure.
  if (e.statusCode === 404 || e.statusCode === 410){
    console.error("Subscription is gone (HTTP " + e.statusCode + "). Toggle the nudge in the app and re-paste PUSH_SUBSCRIPTION.");
    process.exit(1);
  }
  console.error("Send failed:", e.statusCode || "", e.body || e.message);
  process.exit(1);
}
}
