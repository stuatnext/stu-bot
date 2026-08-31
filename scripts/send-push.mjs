// The evening nudge's sender half. Runs in GitHub Actions on a cron (see
// .github/workflows/nudge.yml); the receiving half is app/sw.js, which reads
// the day's mirrored state on the device and writes the actual words - this
// script sends one dumb, unpersonalised ping and knows nothing about the day.
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

const VAPID_PUBLIC =
  "BPzJd3TZ6bSeFIRWBVzeKKkJA6tkUxGFHMDbal6_JXLrjULbQg9REfSSISRnoOWvUghgNaTQfo4xTMdxO_XtvLI";

const sub = process.env.PUSH_SUBSCRIPTION;
const priv = process.env.VAPID_PRIVATE_KEY;

if (!sub || !priv){
  console.log("PUSH_SUBSCRIPTION and/or VAPID_PRIVATE_KEY not set - nothing to send.");
  process.exit(0);
}

let subscription;
try {
  subscription = JSON.parse(sub);
  if (!subscription.endpoint) throw new Error("no endpoint");
} catch (e){
  console.error("PUSH_SUBSCRIPTION does not parse as a push subscription:", e.message);
  process.exit(1);
}

webpush.setVapidDetails("https://github.com/stuatnext/stu-bot", VAPID_PUBLIC, priv);

try {
  await webpush.sendNotification(subscription, JSON.stringify({ t: "evening" }), { TTL: 3600 });
  console.log("Nudge sent.");
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
