/* ================================================================ machines
   "Help me with indicators of what a machine looks like and how to set it
   up."

   Words were not enough. Standing on a gym floor he could not match "seated
   leg curl" to any of the shapes in front of him, and "line your knee up
   with the pivot" means nothing until you have seen where the pivot is. So
   every machine in the programme gets a drawing: the machine side-on, a
   person in it at the start of the move, and a numbered dot on each thing
   he has to adjust. The numbers match the "Set it up" list under it, and a
   line says how to spot it across the room.

   Drawn by hand as SVG in one visual language - frame lines, padded parts,
   the orange things you touch, and a person - so they read at a glance and
   follow the theme. Machines differ by brand; the pads, the pin and the
   pivot are always there.
   ======================================================================== */

/* which drawing each machine uses; ":x" is a variant of the drawing */
var MACHINE_KIND = {
  "Seated leg curl": "legcurl", "Lying leg curl": "lyingcurl",
  "Leg press": "legpress", "Single-leg press": "legpress", "Hack squat": "hack",
  "Chest press machine": "press", "Incline chest press machine": "press",
  "Shoulder press machine": "press:shoulder", "Dip machine": "press:dip",
  "Lat pulldown": "pulldown", "Neutral-grip pulldown": "pulldown",
  "Assisted pull-up machine": "assist",
  "Seated cable row": "cablerow", "Wide-grip cable row": "cablerow",
  "Chest-supported row machine": "chestrow",
  "Cable triceps pushdown": "cable", "Overhead cable extension": "cable", "Face pull": "cable",
  "Cable curl": "cable", "Straight-arm pulldown": "cable", "Pallof press": "cable",
  "Cable half-kneeling chop": "cable", "Cable woodchop": "cable", "Low-to-high cable fly": "cable",
  "Cable kickback": "cable", "Cable pull-through": "cable", "Cable side bend, light": "cable",
  "Smith bench press": "smith", "Smith incline press": "smith", "Smith overhead press": "smith",
  "Smith hip thrust": "smith", "Smith machine squat": "smith:stand", "Smith split squat": "smith:stand",
  "Reverse pec deck": "pecdeck", "Preacher curl machine": "preacher",
  "Glute drive machine": "glute", "Back extension": "backext",
  "Captain's chair knee raise": "captain"
};

/* A cable station is one machine set up a dozen ways: where the pulley
   goes, what clips on, and which way you face. [ height, attachment, stance ] */
var CABLE_SET = {
  "Cable triceps pushdown":   ["high",  "a rope or a short bar", "facing it"],
  "Overhead cable extension": ["low",   "a rope",                "facing away from it"],
  "Face pull":                ["head",  "a rope",                "facing it"],
  "Cable curl":               ["low",   "a short bar",           "facing it"],
  "Straight-arm pulldown":    ["high",  "a straight bar or a rope", "facing it"],
  "Pallof press":             ["chest", "a single handle",       "side-on to it"],
  "Cable half-kneeling chop": ["high",  "a rope",                "side-on, kneeling"],
  "Cable woodchop":           ["high",  "a single handle",       "side-on to it"],
  "Low-to-high cable fly":    ["low",   "a handle on each side", "between two towers"],
  "Cable kickback":           ["low",   "an ankle strap",        "facing it"],
  "Cable pull-through":       ["low",   "a rope",                "facing away from it"],
  "Cable side bend, light":   ["low",   "a single handle",       "side-on to it"]
};
var CABLE_WORDS = { high: "the top", head: "head height", chest: "chest height", low: "the bottom" };

/* How to spot it across the room, per drawing (and for the few with none). */
var MACHINE_SPOT = {
  legcurl: "A seat facing out, a padded roller down by your lower legs, and a second pad that comes down on top of your thighs. It often stands next to the leg extension, which looks almost the same: on the curl the roller goes behind your legs, on the extension in front of them.",
  lyingcurl: "A bench you lie on face down, with handles at the head end and a padded roller at the far end that sits on the back of your ankles.",
  legpress: "A reclined seat and a big flat platform in front of you on an angle. The one you already know.",
  hack: "Like a leg press turned round: you stand with your back on an angled pad, shoulders under two pads, feet on a platform at the bottom.",
  press: "A seat with a back pad and two handles in front of you at chest height, a weight stack behind it. The label usually says Chest Press.",
  "press:shoulder": "A seat with a back pad and two handles up beside your shoulders. The label usually says Shoulder Press.",
  "press:dip": "A seat with two handles down beside your hips that you push towards the floor. Labelled Dip or Triceps Press.",
  pulldown: "A seat under a tall frame, a pad over your knees, and a long bar hanging from a cable above you.",
  assist: "A tall frame with pull-up handles at the top and a padded platform you kneel on. Labelled Assisted Pull-up, often Dip as well on the same machine.",
  cablerow: "A long low seat, two foot plates in front of you, and a handle on a cable down at floor level.",
  chestrow: "A seat with a pad in front of your chest and handles further out in front. You lean on the pad and pull.",
  cable: "A tall tower with a pulley that slides up and down a track, and a weight stack inside it. Often two towers joined into one big station. The ropes, bars and handles hang on a rack nearby.",
  smith: "A barbell fixed inside two rails, so it can only go straight up and down, with hooks all the way along the rails. Usually out on the floor with a bench nearby.",
  "smith:stand": "A barbell fixed inside two rails, so it can only go straight up and down, with hooks all the way along the rails.",
  pecdeck: "A seat facing a tall pad, with two long arms that swing out to the sides. The same machine does chest flies facing out and rear delts facing in.",
  preacher: "A seat with a slanted pad in front of it for your upper arms, and handles at the far end.",
  glute: "A low seat with a padded bar that comes down across your hips, and a platform for your feet.",
  backext: "A frame at an angle with a pad for your hips and rollers for your heels. Also called a Roman chair.",
  captain: "A tall frame with a back pad, two arm pads sticking out with handles on the ends, and steps to climb up.",
  /* the ones without a drawing */
  "Torso rotation machine": "A seat that turns, with pads to lock your legs in and a pad or handles in front of your chest.",
  "T-bar row": "A bar with one end fixed to the floor or a post and a handle across the other end, sometimes with a chest pad.",
  "Belt squat": "A platform with a belt you clip round your hips; the weight hangs from the belt, not your back.",
  "Sled push": "A sled on a strip of turf with two tall handles and plates stacked on it."
};

/* "Set it up": one line per numbered dot, in the same order. */
var MACHINE_SET = {
  legcurl: [
    "Back pad. Slide it until your knee sits level with the pivot.",
    "The pivot, the dot or bolt on the side. Your knee lines up with it.",
    "Ankle pad. Just above your ankles, behind your lower legs.",
    "Thigh pad. Bring it down until it sits snug on your thighs.",
    "The pin. A light plate near the top for the first set."],
  lyingcurl: [
    "Knees just off the end of the bench, level with the pivot.",
    "Roller on the back of your ankles.",
    "Hold the handles; hips stay pressed into the bench. A light plate first."],
  legpress: [
    "Back pad angle. A knob or lever under the seat; the middle is fine.",
    "Feet in the middle of the platform, shoulder-width.",
    "Release handles at your sides. Turn them out to unlock the platform, back in before you let go.",
    "Weight. Plates on the pegs, or a pin in the stack. Start light."],
  hack: [
    "Shoulders under the pads, back flat against the back pad.",
    "Feet shoulder-width, a little forward on the platform.",
    "Release handles by the shoulder pads. Turn to unlock, turn back before you step off.",
    "Weight. Plates on the pegs at the back. The sled alone is plenty to start."],
  press: [
    "Seat height. The pop-pin under the seat: handles level with the middle of your chest.",
    "Handles. Some machines have a foot bar or lever to bring them forward to start.",
    "Back flat against the pad the whole time.",
    "The pin. A light plate first."],
  "press:shoulder": [
    "Seat height. The pop-pin under the seat: handles level with your shoulders, not above your head.",
    "Handles. Palms forward or facing in, whichever the machine has.",
    "Back flat against the pad the whole time.",
    "The pin. A light plate first."],
  "press:dip": [
    "Seat height. Handles at your sides, just below your chest.",
    "Handles. Push them down until your arms are straight.",
    "Back against the pad, shoulders down.",
    "The pin. A light plate first."],
  pulldown: [
    "Knee pad. Lower it until your thighs are snug under it, so you stay seated.",
    "The bar. Stand, take it, then sit down with it. Hands a little wider than your shoulders.",
    "The pin. A light plate first."],
  assist: [
    "Knee pad. Fold it down and kneel on it with both knees.",
    "Handles. Hands just wider than your shoulders.",
    "The pin, backwards: on this one more weight is more help. Start heavy and make it lighter as you get stronger."],
  cablerow: [
    "Feet on the plates, knees soft.",
    "The handle. A V-handle or a bar clipped on. Sit tall, arms long to start.",
    "The pin. A light plate first."],
  chestrow: [
    "Seat height. Handles at shoulder height when your chest is on the pad.",
    "Chest pad. Close enough that you just reach the handles with long arms.",
    "Handles. Palms facing in, or the wide grip, whichever the move asks.",
    "The pin. A light plate first."],
  cable: [
    "Pulley height. Pull the pin on the side of the track, slide the pulley, let the pin click in.",
    "Attachment. Clip it on the hook at the end of the cable.",
    "The pin. A light plate first."],
  smith: [
    "The hooks. The bar sits on hooks; twist it to unhook, twist back to rack it. Try it once with the empty bar.",
    "Safety stops. Set them just below the lowest point of the bar. If you get stuck, you lower it onto them.",
    "The bench. Slide it so the bar comes down on the middle of your chest."],
  "smith:stand": [
    "The hooks. The bar sits on hooks; twist it to unhook, twist back to rack it. Try it once with the empty bar.",
    "Safety stops. Set them just below the lowest point of the bar. If you get stuck, you lower it onto them.",
    "Your feet. Slightly in front of the bar, shoulder-width."],
  pecdeck: [
    "Seat height. Handles level with your shoulders.",
    "Handle position. The lever or knob on top; set them to the back for reverse flies.",
    "Chest against the pad, arms straight out to the handles.",
    "The pin. A light plate first."],
  preacher: [
    "Seat height. So your armpits sit snug on the top of the pad.",
    "Upper arms down the pad, elbows near the bottom edge.",
    "The pin. A light plate first."],
  glute: [
    "Hip pad. Across the front of your hips, snug. There is often a lever to lock it.",
    "Feet flat on the platform.",
    "The pin, or plates on the pegs. Start light."],
  backext: [
    "Hip pad. Just below your hip bones, so you can bend at the hips.",
    "Heels locked under the rollers.",
    "Height. The pop-pin on the frame moves the pad up or down."],
  captain: [
    "Forearms on the pads, hands on the grips.",
    "Back against the pad the whole time.",
    "The steps. Use them to climb up, then let your legs hang."]
};

/* ---------------------------------------------------------------- drawing */
function mPath(d, c){ return "<path class='" + (c || "mf") + "' d='" + d + "'/>"; }
function mRect(x, y, w, h, c, rx){
  return "<rect class='" + (c || "mp") + "' x='" + x + "' y='" + y + "' width='" + w
    + "' height='" + h + "' rx='" + (rx == null ? 4 : rx) + "'/>";
}
function mCirc(x, y, r, c){ return "<circle class='" + (c || "mf") + "' cx='" + x + "' cy='" + y + "' r='" + r + "'/>"; }
/* the weight stack: a tower of plates and the pin in one of them */
function mStack(x, pin){
  var h = mRect(x, 16, 26, 134, "mfr", 3);
  for (var y = 76; y <= 144; y += 8) h += mPath("M" + (x + 5) + " " + y + "H" + (x + 21), "mpl");
  h += mCirc(x + 13, 22, 4, "mf");
  return h + mCirc(x + 13, pin || 92, 3.8, "mk");
}
/* a person: a head and limbs as thick rounded strokes */
function mMan(hx, hy, d){ return mPath(d, "me") + mCirc(hx, hy, 8.5, "mh"); }
/* a numbered dot with a leader to the thing it names */
function mDot(n, x, y, tx, ty){
  return mPath("M" + x + " " + y + "L" + tx + " " + ty, "ml")
    + mCirc(tx, ty, 8.5, "mc")
    + "<text class='mct' x='" + tx + "' y='" + (ty + 3.7) + "'>" + n + "</text>";
}
function mFloor(){ return mPath("M8 150H232", "mfl"); }

/* Each drawing returns [ body, dots ]. 240 x 160, floor at 150, facing right. */
var MACHINE_ART = {
  legcurl: function(){
    var b = mFloor() + mStack(198, 92)
      + mPath("M44 150H176M100 150V111M70 111H134")
      + mRect(68, 99, 66, 11)
      + "<rect class='mp' x='56' y='38' width='12' height='62' rx='5' transform='rotate(-8 62 69)'/>"
      + mCirc(66, 106, 3.8, "mk")
      + mPath("M142 97L165 131") + mCirc(142, 97, 6.5, "mf") + mCirc(142, 97, 2.2, "mk")
      + mMan(66, 28, "M72 96L65 44M65 46L82 72L96 94M72 96L138 94M138 94L174 122")
      + mCirc(166, 132, 8.5, "mp")
      + mPath("M127 80V68") + mRect(98, 80, 36, 9, "mp") + mCirc(127, 66, 3.8, "mk");
    var d = mDot(1, 66, 106, 30, 122) + mDot(2, 142, 97, 158, 72) + mDot(3, 166, 132, 140, 142)
      + mDot(4, 127, 66, 108, 48) + mDot(5, 211, 92, 184, 60);
    return [b, d];
  },
  lyingcurl: function(){
    var b = mFloor()
      + mPath("M48 112V150M142 112V150M34 150H160M36 104H22V124")
      + mRect(34, 100, 120, 12)
      + mPath("M160 108H202V92") + mCirc(160, 108, 6.5, "mf") + mCirc(160, 108, 2.2, "mk")
      + mMan(30, 88, "M44 94L120 96M46 97L26 118M120 96L158 98M158 98L200 98")
      + mCirc(194, 88, 8.5, "mp");
    var d = mDot(1, 160, 108, 150, 134) + mDot(2, 194, 88, 214, 66) + mDot(3, 24, 118, 14, 138);
    return [b, d];
  },
  legpress: function(){
    var b = mFloor()
      + mPath("M70 132V150M98 132V150M104 146L208 42")
      + mPath("M36 78L48 72L74 122L62 128Z", "mp") + mPath("M62 128L74 122L106 124L104 133Z", "mp")
      + mCirc(84, 140, 3.8, "mk")
      + mPath("M180 60L188 52") + mCirc(190, 50, 9, "mp")
      + mMan(40, 62, "M48 80L72 120M52 84L68 110L84 130M72 120L100 74M100 74L158 72")
      + mPath("M146 58L178 90", "mbar")
      + mPath("M106 128L118 122", "mbar");
    var d = mDot(1, 84, 140, 30, 112) + mDot(2, 160, 72, 134, 34) + mDot(3, 118, 122, 136, 104)
      + mDot(4, 190, 50, 214, 88);
    return [b, d];
  },
  hack: function(){
    var b = mFloor()
      + mPath("M52 150L132 26M50 150H200")
      + mPath("M74 132L120 58L132 64L86 138Z", "mp")
      + mRect(124, 48, 20, 9, "mp", 4)
      + mCirc(88, 126, 8, "mp")
      + mMan(134, 36, "M106 98L128 56M130 60L142 54M106 98L136 108M136 108L114 138")
      + mPath("M92 140L140 132", "mbar");
    var d = mDot(1, 138, 52, 172, 36) + mDot(2, 118, 136, 156, 144) + mDot(3, 144, 54, 176, 72)
      + mDot(4, 88, 126, 44, 104);
    return [b, d];
  },
  press: function(v){
    var hand = v === "shoulder" ? [98, 40] : v === "dip" ? [100, 98] : [128, 72];
    var elbow = v === "shoulder" ? [88, 66] : v === "dip" ? [82, 86] : [98, 76];
    var arm = v === "shoulder" ? "M152 14L102 38" : v === "dip" ? "M152 60L104 96" : "M152 14L132 68";
    var b = mFloor() + mStack(198, 92)
      + mPath("M40 150H176M92 150V118M60 150V112M64 44L68 14H152")
      + mPath(arm)
      + mRect(66, 108, 52, 11)
      + mPath("M54 106L62 44L75 46L68 108Z", "mp")
      + mCirc(92, 130, 3.8, "mk")
      + mMan(68, 40, "M76 104L70 58M70 60L" + elbow[0] + " " + elbow[1] + "L" + hand[0] + " " + hand[1]
          + "M76 104L112 106M112 106L114 146")
      + mCirc(hand[0], hand[1], 5.5, "mp");
    var hd = v === "shoulder" ? [124, 28] : v === "dip" ? [132, 110] : [152, 88];
    var d = mDot(1, 92, 130, 128, 138) + mDot(2, hand[0], hand[1], hd[0], hd[1])
      + mDot(3, 62, 76, 30, 70) + mDot(4, 211, 92, 184, 62);
    return [b, d];
  },
  pulldown: function(){
    var b = mFloor() + mStack(198, 92)
      + mPath("M211 22V16H124M124 23V36M100 150V116M130 94V116")
      + mCirc(124, 18, 5, "mf")
      + mRect(76, 106, 48, 11)
      + mMan(82, 54, "M84 102L86 68M86 70L100 56L110 42M84 102L126 96M126 96L128 146")
      + mRect(102, 84, 30, 9, "mp") + mCirc(134, 104, 3.8, "mk")
      + mPath("M102 38H148", "mbar");
    var d = mDot(1, 134, 104, 162, 116) + mDot(2, 148, 38, 172, 50) + mDot(3, 211, 92, 184, 76);
    return [b, d];
  },
  assist: function(){
    var b = mFloor() + mStack(150, 92)
      + mPath("M150 12H108V20M150 108H138")
      + mRect(96, 102, 42, 10)
      + mMan(100, 40, "M114 100L134 104M114 100L106 74M106 74L104 52M104 54L110 36L110 22");
    var d = mDot(1, 118, 107, 70, 116) + mDot(2, 108, 18, 66, 18) + mDot(3, 163, 92, 200, 80);
    return [b, d];
  },
  cablerow: function(){
    var b = mFloor() + mStack(198, 92)
      + mPath("M50 120V150M130 120V150M156 134V150")
      + mRect(34, 110, 112, 10)
      + mPath("M152 96L160 134", "mbar")
      + mCirc(186, 124, 5, "mf") + mPath("M181 124L142 104", "mcab")
      + mMan(64, 50, "M64 106L66 66M66 68L100 86L136 102M64 106L110 94M110 94L154 110")
      + mCirc(139, 103, 4.5, "mp");
    var d = mDot(1, 156, 112, 172, 82) + mDot(2, 139, 103, 112, 138) + mDot(3, 211, 92, 184, 60);
    return [b, d];
  },
  chestrow: function(){
    var b = mFloor() + mStack(198, 92)
      + mPath("M84 150V118M114 102V150M160 20H211M160 20L152 70")
      + mRect(62, 108, 44, 11)
      + mCirc(84, 130, 3.8, "mk")
      + mMan(102, 46, "M74 104L96 62M98 64L124 70L148 74M74 104L106 108M106 108L104 146")
      + mPath("M104 52L116 50L120 100L108 102Z", "mp") + mCirc(114, 110, 3.8, "mk")
      + mCirc(150, 74, 5.5, "mp");
    var d = mDot(1, 84, 130, 50, 136) + mDot(2, 114, 110, 142, 124) + mDot(3, 150, 74, 172, 94)
      + mDot(4, 211, 92, 184, 116);
    return [b, d];
  },
  cable: function(v){
    var hy = v === "high" ? 30 : v === "head" ? 50 : v === "chest" ? 72 : 132;
    var hand = v === "high" ? [122, 94] : v === "head" ? [124, 52] : v === "chest" ? [124, 72] : [118, 106];
    var elbow = v === "high" ? [106, 86] : v === "head" ? [112, 56] : v === "chest" ? [112, 74] : [104, 90];
    var b = mFloor()
      + mRect(152, 12, 24, 138, "mfr", 3)
      + mPath("M150 18V144", "mpl");
    for (var y = 104; y <= 144; y += 8) b += mPath("M157 " + y + "H171", "mpl");
    b += mCirc(164, 114, 3.8, "mk")
      + mRect(144, hy - 8, 10, 16, "mp", 3) + mCirc(180, hy, 3.8, "mk") + mPath("M176 " + hy + "H154", "mpl")
      + mPath("M146 " + hy + "L" + hand[0] + " " + hand[1], "mcab")
      + mMan(99, 46, "M96 150L101 104M110 150L104 104M102 104L100 60M100 62L" + elbow[0] + " " + elbow[1]
          + "L" + hand[0] + " " + hand[1])
      + mPath("M" + (hand[0] - 3) + " " + (hand[1] - 5) + "l6 10", "mbar");
    var d = mDot(1, 180, hy, 208, hy) + mDot(2, hand[0], hand[1], hand[0] + 8, hand[1] + 24)
      + mDot(3, 164, 114, 208, v === "low" ? 96 : 128);
    return [b, d];
  },
  smith: function(v){
    var b = mFloor() + mPath("M105 10V150M111 10V150");
    for (var y = 22; y <= 134; y += 14) b += mPath("M111 " + y + "h5", "mpl");
    var d;
    if (v === "stand"){
      b += mRect(96, 112, 24, 5, "mk", 2)
        + mMan(108, 42, "M100 150L106 104M116 150L110 104M108 104L108 56M106 62L94 70L100 58")
        + mCirc(108, 58, 6, "mp") + mPath("M108 58l9 -7", "mk2");
      d = mDot(1, 116, 52, 146, 40) + mDot(2, 118, 114, 146, 118) + mDot(3, 116, 148, 150, 142);
    } else {
      b += mPath("M70 122V150M150 122V150") + mRect(60, 112, 104, 10)
        + mRect(100, 94, 16, 5, "mk", 2)
        + mMan(84, 102, "M96 108L150 110M150 110L170 112M170 112L176 148M100 106L106 88L108 76")
        + mCirc(108, 70, 6, "mp") + mPath("M108 70l9 -7", "mk2");
      d = mDot(1, 116, 64, 146, 48) + mDot(2, 116, 96, 146, 88) + mDot(3, 130, 112, 132, 138);
    }
    return [b, d];
  },
  pecdeck: function(){
    var b = mFloor() + mStack(198, 92)
      + mPath("M88 150V118M114 104V150M130 18V60M130 18H211")
      + mRect(66, 108, 44, 11)
      + mCirc(88, 130, 3.8, "mk") + mCirc(130, 14, 3.8, "mk")
      + mMan(102, 48, "M76 104L100 64M102 64L128 62M76 104L108 106M108 106L106 146")
      + mPath("M108 50L120 50L120 104L108 104Z", "mp")
      + mPath("M124 62H142", "mbar");
    var d = mDot(1, 88, 130, 54, 136) + mDot(2, 130, 14, 160, 10) + mDot(3, 138, 62, 162, 80)
      + mDot(4, 211, 92, 184, 104);
    return [b, d];
  },
  preacher: function(){
    var b = mFloor() + mStack(198, 92)
      + mPath("M80 150V120M128 106V150M140 100L150 72")
      + mRect(58, 110, 44, 11)
      + mCirc(80, 130, 3.8, "mk")
      + mPath("M100 70L114 64L140 100L128 106Z", "mp")
      + mMan(92, 52, "M70 106L92 68M94 68L132 96L148 72M70 106L104 108M104 108L102 146")
      + mCirc(150, 70, 5.5, "mp");
    var d = mDot(1, 80, 130, 46, 136) + mDot(2, 108, 68, 122, 40) + mDot(3, 211, 92, 184, 88);
    return [b, d];
  },
  glute: function(){
    var b = mFloor() + mStack(198, 92)
      + mPath("M60 130V150M100 130V150M118 100L152 70M152 70H198")
      + mCirc(152, 70, 5, "mf")
      + mRect(50, 120, 56, 10)
      + mPath("M42 86L55 84L60 122L47 124Z", "mp")
      + mRect(124, 142, 42, 6, "mp", 2)
      + mMan(46, 68, "M54 82L78 116M78 116L122 110M122 110L142 140")
      + mRect(78, 97, 40, 11, "mp");
    var d = mDot(1, 98, 97, 100, 70) + mDot(2, 146, 142, 180, 128) + mDot(3, 211, 92, 184, 96);
    return [b, d];
  },
  backext: function(){
    var b = mFloor()
      + mPath("M40 150H200M66 150L150 66M60 146H96")
      + mPath("M136 76L150 62L160 72L146 86Z", "mp")
      + mCirc(110, 106, 3.8, "mk")
      + mMan(176, 26, "M70 136L134 72M134 72L166 40M160 48L150 58")
      + mCirc(62, 126, 7.5, "mp");
    var d = mDot(1, 150, 76, 180, 98) + mDot(2, 62, 126, 30, 104) + mDot(3, 110, 106, 128, 134);
    return [b, d];
  },
  captain: function(){
    var b = mFloor()
      + mPath("M80 150V20M140 66V150M80 150H150")
      + mRect(82, 30, 12, 80, "mp")
      + mRect(84, 132, 26, 6, "mp", 2)
      + mRect(96, 62, 44, 8, "mp") + mCirc(143, 60, 4.5, "mp")
      + mMan(100, 30, "M100 44L100 98M100 46L102 58L138 58M100 98L132 92M132 92L130 126");
    var d = mDot(1, 120, 62, 126, 36) + mDot(2, 88, 90, 54, 90) + mDot(3, 96, 132, 58, 136);
    return [b, d];
  }
};

/* The drawing for a machine, or "" when it has none. thumb drops the dots. */
function machineArt(name, thumb){
  var k = MACHINE_KIND[name];
  if (!k) return "";
  var p = k.split(":"), fn = MACHINE_ART[p[0]];
  if (!fn) return "";
  var v = p[1] || (p[0] === "cable" && CABLE_SET[name] ? CABLE_SET[name][0] : "");
  var art = fn(v);
  return "<svg class='mach-svg" + (thumb ? " thumb" : "") + "' viewBox='0 0 240 160' role='img' aria-label='"
    + esc(name) + "'>" + art[0] + (thumb ? "" : art[1]) + "</svg>";
}
function machineSpot(name){
  var k = MACHINE_KIND[name];
  return MACHINE_SPOT[name] || (k && MACHINE_SPOT[k]) || (k && MACHINE_SPOT[k.split(":")[0]]) || "";
}
function machineSetup(name){
  var k = MACHINE_KIND[name];
  if (!k) return [];
  var set = (MACHINE_SET[k] || MACHINE_SET[k.split(":")[0]] || []).slice();
  var c = CABLE_SET[name];
  if (c && set.length){
    set[0] = "Pulley height. Pull the pin on the side of the track, slide the pulley to "
      + CABLE_WORDS[c[0]] + ", let the pin click in.";
    set[1] = "Attachment. " + c[1].charAt(0).toUpperCase() + c[1].slice(1)
      + ", clipped on the hook at the end of the cable. Stand " + c[2] + ".";
  }
  return set;
}
/* a real person setting one up - brands differ, and a video settles it */
function machineVideo(name){
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent(name + " how to set up");
}
/* The whole card: the drawing, how to spot it, the numbered set-up. */
function machineCardHTML(name){
  var art = machineArt(name), spot = machineSpot(name), set = machineSetup(name);
  var h = "";
  if (art) h += "<div class='mach'>" + art + "</div>";
  if (spot) h += "<h4 class='nv-h'>How to spot it</h4><p class='mspot'>" + esc(spot) + "</p>";
  if (set.length){
    h += "<h4 class='nv-h'>Set it up" + (art ? " &middot; the numbers on the drawing" : "") + "</h4><ol class='mset'>"
      + set.map(function(x){ return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>";
  }
  h += "<a class='mvid' href='" + machineVideo(name) + "' target='_blank' rel='noopener'>"
    + "Watch someone set one up<i>&#8599;</i></a>";
  return h;
}
