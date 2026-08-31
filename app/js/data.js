"use strict";

/* ========================================================================
   data.js - everything the game is made of.

   Daylight is a game for one player: an expat on European hours, running a
   Singapore company, wanting a routine he can keep. This file only says
   what exists - the shift that shapes every day, the three things that make
   one, the eighteen sets his year here is collected as, and the ranks the
   XP climbs. Nothing in here does anything.
   ======================================================================== */

/* ------------------------------------------------------------------ the shift
   Defined in Malta local time, not UTC and not Singapore time. Malta observes
   European daylight saving and Singapore does not, so the same contracted
   hours land an hour later in Singapore every winter - a thing that happens TO
   him rather than something anyone decided. */
var HQ_START_LOCAL = 10 * 60, HQ_END_LOCAL = 17 * 60;   /* Malta local */

function lastSunday(y, m){            /* m is 1-12 */
  var d = new Date(Date.UTC(y, m, 0));
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d;
}
/* EU summer time: last Sunday in March to last Sunday in October, 01:00 UTC. */
function euSummer(when){
  var y = when.getFullYear();
  return when >= lastSunday(y, 3) && when < lastSunday(y, 10);
}
function hqOffset(when){ return euSummer(when || new Date()) ? 120 : 60; }
function workUTC(when){
  var o = hqOffset(when);
  return [HQ_START_LOCAL - o, HQ_END_LOCAL - o];
}

/* [ name, minutes offset from UTC ] */
var CAMPS = [
  ["Singapore", 480], ["Sheffield / UK", 60], ["Bangkok", 420], ["Jakarta", 420],
  ["Hanoi", 420], ["Bali", 480], ["Hong Kong", 480], ["Tokyo", 540],
  ["Sydney", 600], ["Colombo", 330], ["Delhi", 330], ["Dubai", 240], ["Lisbon", 60],
  ["Valletta", 120], ["Sofia", 180], ["Paris", 120], ["New York", -240]
];

/* key, label, resting icon, what it means in full, the colour it wears, and
   the gloss that sits on the button itself. He looked at "Trained" and asked
   what it constitutes - a label without its definition is a quiz, and a game
   never quizzes you on its own controls. */
var PILLARS = [
  ["train",  "Trained", "run",   "Moving on purpose. Gym, a run, or a long walk.", "#5AC8F5",
    "Gym, a run, or a long walk"],
  ["family", "Family",  "phone", "A conversation with someone at home. A message does not count.", "#FF8FA3",
    "A real talk with home"],
  ["stop",   "Stopped", "clock", "Finished when the shift finished. Not burning out is a thing you do.", "#F2B735",
    "Ended when the shift did"]
];

var BED_DEFAULT = "23:45";
var FREEZES_PER_MONTH = 5;
var PACK_SIZE = 3, STREAK_PACK_SIZE = 5;
var RATE_DEFAULT = 5;

/* [ set key, name, what it is, full days that open it ] */
var SETS = [
["hawk","Hawker","The stalls. Ordered, not read about.",0],
["kopi","Kopitiam","Breakfast and the code you say it in.",0],
["slang","Singlish","You will start doing this without noticing.",0],
["every","Everyday","The things you stop seeing after a month.",0],
["herit","Heritage","Temples, shophouses, and what was here before the towers.",0],
["green","Green","Parks, reservoirs, and actual jungle.",0],
["isles","Islands and Edges","The bits that need a boat or a long walk.",0],
["region","Two Hours Out","Weekend range. You can work from any of them.",0],
["road","The Road","Where this year actually takes you.",0],
["home","Home","The things you notice you miss. Material for the newsletter.",0],
["zh","Mandarin","The thirty words already in your bank. Rarity is the HSK level.",7],
["bean","Coffee","The one thing you actually drink. Worth knowing properly.",14],
["deep","Deep Cuts","Singapore at two years rather than two months.",30],
["sheff","Sheffield and Before","Home, and the people you said you rarely speak to.",50],
["post","The Newsletter","The thing that outlives the event. Your name on it, not theirs.",75],
["sug","Straight Up Growth","The business becoming a business.",105],
["mkt","The Industry","Prediction markets, and the name you are building in them.",140],
["gold","Trophies","Not in packs. These only happen by happening.",0]
];

/* [ name, rarity, set, note, hanzi? ]   rarity: 0 common 1 uncommon 2 rare 3 gold */
var CARDS = [
["Chicken rice",0,"hawk","Thigh, not breast. This is not negotiable."],
["Char kway teow",0,"hawk","Flat noodles, dark soy, lard. No cockles if you prefer."],
["Bak chor mee",0,"hawk","Minced pork noodles. Dry is the safer answer."],
["Roti prata",0,"hawk","Two plain with curry. The lowest-risk order in Singapore."],
["Laksa",0,"hawk","Coconut, chilli, thick noodles. Katong does the famous one."],
["Nasi lemak",0,"hawk","Coconut rice, fried chicken, egg, sambal."],
["Satay",0,"hawk","Ten sticks minimum. They will bring more."],
["Bak kut teh",0,"hawk","Pork rib soup. Peppery here, herbal across the causeway."],
["Yong tau foo",1,"hawk","Point at things in a tray. Pointing is the entire mechanic."],
["Fried carrot cake",1,"hawk","No carrot. Black is sweet dark soy and nicer."],
["Chilli crab",2,"hawk","Messy, expensive, and worth doing once with someone."],

["Kopi-o siew dai",0,"kopi","Black, a bit sweet. The most ordinary thing you can say."],
["Kaya toast set",0,"kopi","Toast, soft eggs, kopi. Four dollars and a whole breakfast."],
["Chwee kueh",0,"kopi","Steamed rice cakes with preserved radish. Two dollars."],
["Teh tarik",0,"kopi","Pulled tea. Watch them do it from a height."],
["Kopi peng",1,"kopi","Iced. For the days that deserve it."],
["Milo dinosaur",1,"kopi","Milo with more Milo tipped on top. Absurd and correct."],
["Ice kacang",1,"kopi","Shaved ice, syrup, beans. Do not overthink it."],

["Shiok",0,"slang","Deeply satisfying. Use it about food."],
["Lah",0,"slang","The particle. Resistance is temporary."],
["Alamak",0,"slang","Oh no. Malay origin, universally deployed."],
["Can sit?",0,"slang","The whole phrase for joining a table."],
["Chope",0,"slang","To reserve, with a packet of tissues."],
["Kiasu",1,"slang","Afraid of missing out. A national self-diagnosis."],
["Makan",1,"slang","To eat. Also the reason for most plans."],

["Void deck",0,"every","The open ground floor of an HDB block. Weddings and funerals both."],
["Wet market",0,"every","Underneath most hawker centres. Go early."],
["Tray return",0,"every","Mandatory since 2021. Near the exit."],
["Monsoon drain",0,"every","Concrete channels everywhere. They fill in minutes."],
["Rain tree",0,"every","The wide flat canopies. Folds its leaves at night."],
["Mynah",0,"every","Loud, everywhere, walks like it pays rent."],
["Durian sign",0,"every","Banned on the MRT, with a picture, and no stated fine."],
["MRT at 06:00",1,"every","Empty, cold, the best time to cross the island."],
["Calamansi",1,"every","Tiny lime. In everything, including your drink."],

["Tiong Bahru estate",1,"herit","1930s art deco. Curved balconies and an air raid shelter."],
["Thian Hock Keng",1,"herit","Oldest Hokkien temple here. Built by sailors giving thanks."],
["Sri Mariamman",1,"herit","Oldest Hindu temple. Shoes off at the door."],
["Kampong Glam",1,"herit","Textile shops, Haji Lane, a golden dome."],
["Koon Seng Road",1,"herit","Peranakan terraces. The colours are not exaggerated."],
["Emerald Hill",1,"herit","One street hiding directly behind Orchard Road."],
["Dragon Playground",1,"herit","Toa Payoh, 1979, and one of the last of its kind."],
["Haw Par Villa",2,"herit","Ten Courts of Hell, built by the Tiger Balm millionaire."],
["Baba House",2,"herit","A Peranakan home preserved exactly. Booking only."],
["Peranakan tiles",2,"herit","Look down at the five-foot ways. All different."],

["Botanic Gardens",0,"green","UNESCO listed, free, and there is real jungle in it."],
["Fort Canning",0,"green","The tree tunnel. Spice gardens and history underfoot."],
["MacRitchie",1,"green","Boardwalk, monkeys, reservoir at seven in the morning."],
["Southern Ridges",1,"green","Ten kilometres of parks and the Henderson Waves."],
["Rail Corridor",1,"green","The old KTM line, now a green spine down the island."],
["Labrador tunnels",2,"green","Wartime gun emplacements on the southern coast."],
["TreeTop Walk",2,"green","Suspension bridge over the canopy. You walk far to earn it."],
["Sungei Buloh",2,"green","Mangroves, mudskippers, monitors, migratory birds."],

["Coney Island",1,"isles","Scrubby, rustic, almost empty on a weekday."],
["Pulau Ubin",2,"isles","Boat over, hire a bike. Singapore forty years ago."],
["Chek Jawa",2,"isles","Intertidal flats. Low tide only, and worth planning."],
["Bukit Brown",2,"isles","Overgrown cemetery. The most atmospheric place here."],
["Kranji Marshes",2,"isles","Far northwest. Birds, and almost nobody."],
["Pulau Hantu",2,"isles","Ghost island. Reef diving, and you need a boat."],

["Batam",0,"region","Forty-five minutes by ferry. Cheaper than a taxi to Changi."],
["Kuala Lumpur",0,"region","An hour up. Or five by coach if you want the road."],
["Bangkok",0,"region","Two and a half hours. Evening flight, breakfast there."],
["Ho Chi Minh City",0,"region","Two hours. The cheapest good weekend from here."],
["Penang",1,"region","The food argument Singaporeans will not concede."],
["Bali",1,"region","Two and a half. Everyone goes; go anyway, go north."],
["Yogyakarta",1,"region","Two ten. Borobudur at sunrise justifies the alarm."],
["Hanoi",1,"region","Old quarter, coffee with egg in it, and actual seasons."],
["Lombok",2,"region","Two fifteen. What Bali was before."],
["Luang Prabang",2,"region","Slow, quiet, and the one people come back changed from."],
["Raja Ampat",2,"region","Far, expensive, and the best diving on the planet."],

["Valletta",0,"road","Head office. Sixteen hours away and it sets your day."],
["Sofia",1,"road","The company retreat. September, and you have never been."],
["Hudson Yards",2,"road","NEXTPredict. Your name on the programme."],
["Sheffield",0,"road","Where your closest friends are. Four parkruns to choose from."],
["London",0,"road","Where 2018 was, and where the flights land."],
["Paris",1,"road","October, with him. Not a working trip."],
["Changi Jewel",0,"road","You will pass through it more than most people pass through anywhere."],
["The red-eye",1,"road","Singapore to London overnight. Thirteen hours to think."],

["A proper roast",0,"home","The one thing that does not translate. Nobody here does it."],
["Cold tap water",0,"home","You did not know you would miss this."],
["Real autumn",1,"home","Leaves, a coat, the smell of it. Twelve degrees of seasons here."],
["A Wednesday call",0,"home","Seven in the morning her time. Kettle on, nobody dressed."],
["The Sheffield hills",1,"home","Flat island, so this is the one your legs miss."],
["A pub with no aircon",1,"home","And the one your body absolutely does not."],

["Kopi without looking",3,"gold","Your first hawker order with no phrasebook."],
["Chiah pa boe",3,"gold","Your first Hokkien exchange with his family."],
["Changi arrivals",3,"gold","Your mum, through the gate."],
["Two days",3,"gold","The hours agreed."],
["Client number two",3,"gold","Someone other than NEXT pays Strait Up Growth."],
["Issue one",3,"gold","The first thing you publish that is yours."],
["Thirty",3,"gold","A thirty-day streak on anything."],

/* --- Mandarin. Not invented for the game: these are the thirty words actually
   in his vocabulary bank, and the rarity is the HSK level. The character goes
   in the art window, which makes it the best-looking set in the deck and also
   the only one that teaches you something while you look at it. */
["shì",0,"zh","To be. The first word in the bank, added 11 June.","是"],
["wǒ",0,"zh","I, me. The one you already say without thinking.","我"],
["nǐ",0,"zh","You, informal. Half of every sentence you need.","你"],
["rén",0,"zh","Person. Two strokes, and it looks like one walking.","人"],
["gōngsī",0,"zh","Company. Yours has one client and one director.","公司"],
["míngzi",0,"zh","Name. Ask for one, then use it.","名字"],
["gōngzuò",0,"zh","Work. The noun and the verb, same two characters.","工作"],
["zuò",0,"zh","To do, to make. More verb-forward than 工作.","做"],
["chī",0,"zh","To eat. The root of everything at a hawker centre.","吃"],
["hē",0,"zh","To drink. Pairs with 吃 in every question you get asked.","喝"],
["cài",0,"zh","Dish, cuisine. Fourth tone, falls hard - one of your three weak pairs.","菜"],
["qián",0,"zh","Money. 多少钱 is the universal hawker question.","钱"],
["méiyǒu",0,"zh","Don't have. 没有鸡 - no chicken today. The safety word.","没有"],
["xǐhuān",0,"zh","To like, to prefer. 你喜欢什么菜?","喜欢"],
["jī",0,"zh","Chicken. 鸡饭 is an order you already know in English.","鸡"],
["mǐfàn",0,"zh","Cooked rice, as opposed to 米, the raw grain.","米饭"],
["shāng",1,"zh","Merchant, commerce. The character inside your own job.","商"],
["jià",1,"zh","Price. The word you negotiate in, in any language.","价"],
["xīwàng",1,"zh","To hope. Also the noun, unchanged.","希望"],
["jīhuì",1,"zh","Opportunity. Literally machine plus meeting.","机会"],
["jīnglǐ",1,"zh","Manager, director. What it says on your email.","经理"],
["lǎobǎn",1,"zh","Boss, owner. Also what you call the stallholder.","老板"],
["dìfang",1,"zh","Place. 你在哪个地方工作 - where do you actually work?","地方"],
["fùzé",1,"zh","Responsible for. Stronger than 做. Boss language.","负责"],
["cānjiā",1,"zh","To attend, to take part. 我参加了会议.","参加"],
["wèidào",1,"zh","Taste, flavour. Praise it and the table warms up.","味道"],
["là",1,"zh","Spicy. 这个很辣吗? Ask before, not after.","辣"],
["kāilù",2,"zh","To open a road. Used for paving the way.","开路"],
["yíngxiāo",2,"zh","Marketing. Three tones and none of them yours yet.","营销"],
["jīngyàn",2,"zh","Experience. Credibility in one word.","经验"],

/* --- Season two. */
["Flat white",0,"bean","The Antipodean default. Half the roasters here trained there."],
["Long black",0,"bean","Espresso through hot water. The other way round is an americano."],
["Cortado",0,"bean","Half espresso, half warm milk. Order it when you want to taste the bean."],
["Filter, black",0,"bean","No milk, no sugar. The order that tells you if the beans are any good."],
["Cold brew",0,"bean","Eighteen hours, no heat. Less acid and more caffeine than you expect."],
["Espresso standing up",0,"bean","Thirty seconds at the counter. No table, no laptop, no decision."],
["Single origin",1,"bean","One farm, one lot. Where you find out you have preferences."],
["Washed or natural",1,"bean","Washed is clean and bright, natural is fruity and divisive."],
["One without sugar",1,"bean","You take it sweet. Order one plain, once, and find out what it was doing."],
["A bag at home",1,"bean","Beans you chose, in your kitchen. Coffee stopped being fuel."],
["Roast date",2,"bean","Two weeks off roast is the window. Asking for it is a small real expertise."],
["A roaster you follow",2,"bean","Not a cafe you like. A roaster whose choices you trust."],

["The reservoir at six",0,"deep","Before the heat. The version of this city almost nobody sees."],
["Fruit by the kilo",0,"deep","Wet market, not supermarket. Cheaper, better, and you have to speak."],
["The night bus",0,"deep","There is one. Learning it is a small and real freedom."],
["A hawker you go back to",1,"deep","Not the famous one. Yours."],
["Getai season",1,"deep","Seventh month. Loud, bright, and not staged for anyone visiting."],
["Thaipusam",1,"deep","January. Walk part of the route rather than watching it go past."],
["Second day of the new year",1,"deep","When the city is shut and quiet and completely unlike itself."],
["A void deck funeral",1,"deep","You will pass one. Knowing what it is stops it being strange."],
["Your estate's old name",1,"deep","Ask someone over sixty why it is called that. They will know."],
["Invited into a flat",2,"deep","Not a viewing. An invitation."],
["Ordering for two",2,"deep","Two people's food, at a stall, no phone out. That is fluency."],
["An uncle who knows your order",2,"deep","The actual test of whether you live somewhere."],

["The Peak District",0,"sheff","Twenty minutes from the centre. Singapore cannot sell you that at any price."],
["Scraps",0,"sheff","The bits of batter. Free, and the test of whether a chippy is yours."],
["A beer garden in June",0,"sheff","Nine at night and still light. You have not had that in years."],
["The walk from the station",0,"sheff","The first ten minutes, when it stops being a trip and starts being back."],
["The group chat",0,"sheff","Still there, still mostly dormant. One message restarts it."],
["The accent coming back",1,"sheff","Two days in and it returns. Everyone notices except you."],
["A call, not a text",1,"sheff","You said you rarely speak to them. This is the card that fixes it."],
["Germany",1,"sheff","The friend since primary school, kept alive on almost nothing. Give it an hour."],
["Christmas at home",1,"sheff","The trip that is not negotiable, and the one that costs UK days."],
["Someone's wedding",1,"sheff","The invitations start around now. Being the one who came counts."],
["2018",2,"sheff","Newly in London, and the last time life felt right. Work out which part transfers."],

["The five-minute version",0,"mkt","Explaining prediction markets to your mum. Harder than any panel."],
["A market resolving",0,"mkt","You watched a question become a fact. Still the best advert for the whole thing."],
["The order book",0,"mkt","Where the price actually comes from. Worth one clean sentence."],
["Sports, not politics",1,"mkt","Where the volume really is. Not the part anyone writes about."],
["The liquidity problem",1,"mkt","Every thin market's real story. Say it and people know you have looked."],
["One regulator, properly",1,"mkt","Pick a jurisdiction and learn it. It decides whether any of this scales."],
["Kalshi",1,"mkt","Regulated, US, and a name you want on the stage."],
["Polymarket",1,"mkt","The other one. Bigger crowd, different rules, same argument."],
["A speaker who said yes",1,"mkt","The ask you were nervous about. They said yes."],
["The take you held back",2,"mkt","Diary it for the week after the event, when it costs you nothing."],
["Quoted without prompting",2,"mkt","Your framing, in someone else's post. That is a moat forming."],

["The financial year end",0,"sug","You do not know it yet. One email to Ottavia and you do."],
["A written scope",0,"sug","What you do and what you do not. It stops a client becoming a job."],
["Books actually current",0,"sug","Caught up, not nearly caught up. A completely different feeling."],
["Paid yourself on time",0,"sug","A payroll of one, run properly. Practice for a payroll of more."],
["The annual return",1,"sug","ACRA. Boring, dated, and expensive to miss."],
["The first tax filing",1,"sug","New company, so this one sets the pattern for every year after."],
["Cover that follows you",1,"sug","Your UK policy does not, and NEXT's does not extend. A gap with your name on it."],
["The day rate, out loud",1,"sug","The number, to a stranger's face, without softening it."],
["A second signature",1,"sug","Someone other than you able to sign something. The start of not being the whole company."],
["The first hire",2,"sug","Even part-time. Capacity is the constraint on all of it."],
["An intern from here",2,"sug","A young Singaporean, taught something real. The best idea in any of these conversations."],

["Before the shift",0,"post","The morning block. The only hours nobody else has a claim on."],
["Not about work",0,"post","Nostalgia. The pillar you keep naming and keep not writing."],
["A draft you sat on",0,"post","Written anyway. The habit is the writing, not the posting."],
["An idea off a card",0,"post","This deck is also a notebook. One of these becomes a post."],
["A name you committed to",1,"post","When Shift Happens, or something better. Naming it is most of starting."],
["Your byline, not theirs",1,"post","Off the company page. The entire point of building a moat."],
["A reply from someone you rate",1,"post","Not a like. A reply."],
["The first hundred",1,"post","Small, real, and yours rather than the company's."],
["Somewhere that is not rented",1,"post","An archive you own. LinkedIn is someone else's ground."],
["Ten in a row",2,"post","Ten posts, ten days, no gaps. Where a presence starts being real."],
["Published anyway",2,"post","The provocative one, out, after the event. The fear had a shelf life."]
];

/* [ label, chip class, pack weight, XP, shards a spare is worth, shards to craft ] */
var RARITY = [
  ["Common",   "",       62,  10,  4,  30],
  ["Uncommon", "violet", 27,  25, 10,  70],
  ["Rare",     "gold",   11,  60, 25, 160],
  ["Gold",     "ember",   0, 250,  0,   0]
];

/* ------------------------------------------------------------- the card art
   The faces stop being generated squiggles. Every card wears one big glyph
   from the platform's own emoji set - professionally drawn, instantly
   readable, zero bytes to ship - on a tint hashed from its name. Mandarin
   is the exception with a purpose: the character IS the face. */
var CARD_ART = {
  /* hawker */
  "Chicken rice":"\uD83C\uDF57","Char kway teow":"\uD83C\uDF5C","Bak chor mee":"\uD83C\uDF5C",
  "Roti prata":"\uD83E\uDD5E","Laksa":"\uD83C\uDF36\uFE0F","Nasi lemak":"\uD83C\uDF5B",
  "Satay":"\uD83C\uDF62","Bak kut teh":"\uD83C\uDF72","Yong tau foo":"\uD83E\uDD62",
  "Fried carrot cake":"\uD83C\uDF73","Chilli crab":"\uD83E\uDD80",
  /* kopitiam */
  "Kopi-o siew dai":"\u2615","Kaya toast set":"\uD83C\uDF5E","Chwee kueh":"\uD83E\uDD5F",
  "Teh tarik":"\uD83E\uDED6","Kopi peng":"\uD83E\uDDCA","Milo dinosaur":"\uD83E\uDD64",
  "Ice kacang":"\uD83C\uDF67",
  /* singlish */
  "Shiok":"\uD83E\uDD29","Lah":"\uD83D\uDCAC","Alamak":"\uD83E\uDD2D","Can sit?":"\uD83E\uDE91",
  "Chope":"\uD83E\uDDFB","Kiasu":"\uD83C\uDFC3","Makan":"\uD83C\uDF7D\uFE0F",
  /* everyday */
  "Void deck":"\uD83C\uDFE2","Wet market":"\uD83D\uDC1F","Tray return":"\uD83E\uDDFA",
  "Monsoon drain":"\uD83C\uDF27\uFE0F","Rain tree":"\uD83C\uDF33","Mynah":"\uD83D\uDC26",
  "Durian sign":"\uD83D\uDEAB","MRT at 06:00":"\uD83D\uDE87","Calamansi":"\uD83C\uDF4B",
  /* heritage */
  "Tiong Bahru estate":"\uD83C\uDFDA\uFE0F","Thian Hock Keng":"\uD83C\uDFEE",
  "Sri Mariamman":"\uD83D\uDED5","Kampong Glam":"\uD83D\uDD4C","Koon Seng Road":"\uD83C\uDFE0",
  "Emerald Hill":"\uD83C\uDFE1","Dragon Playground":"\uD83D\uDC09","Haw Par Villa":"\uD83C\uDFAD",
  "Baba House":"\uD83D\uDECB\uFE0F","Peranakan tiles":"\uD83E\uDDE9",
  /* green */
  "Botanic Gardens":"\uD83C\uDF3A","Fort Canning":"\uD83C\uDF3F","MacRitchie":"\uD83D\uDC12",
  "Southern Ridges":"\uD83C\uDF09","Rail Corridor":"\uD83D\uDEE4\uFE0F",
  "Labrador tunnels":"\uD83D\udd26","TreeTop Walk":"\uD83C\uDF32","Sungei Buloh":"\uD83E\uDDA9",
  /* islands */
  "Coney Island":"\uD83D\uDEB2","Pulau Ubin":"\uD83D\uDEA3","Chek Jawa":"\uD83E\uDDAA",
  "Bukit Brown":"\uD83E\uDEA6","Kranji Marshes":"\uD83E\uDEBF","Pulau Hantu":"\uD83D\uDC20",
  /* two hours out */
  "Batam":"\u26F4\uFE0F","Kuala Lumpur":"\uD83D\uDDFC","Bangkok":"\uD83D\uDEFA",
  "Ho Chi Minh City":"\uD83D\uDEF5","Penang":"\uD83E\uDD5F","Bali":"\uD83C\uDF34",
  "Yogyakarta":"\uD83D\uDED5","Hanoi":"\uD83C\uDF5C","Lombok":"\uD83C\uDFDD\uFE0F",
  "Luang Prabang":"\uD83E\uDDD8","Raja Ampat":"\uD83E\uDD3F",
  /* the road */
  "Valletta":"\uD83C\uDFF0","Sofia":"\u26EA","Hudson Yards":"\uD83D\uDDFD",
  "Sheffield":"\uD83C\uDFD4\uFE0F","London":"\uD83C\uDF02","Paris":"\uD83D\uDDFC",
  "Changi Jewel":"\uD83D\uDCA7","The red-eye":"\uD83D\uDEEB",
  /* home */
  "A proper roast":"\uD83E\uDD69","Cold tap water":"\uD83D\uDEB0","Real autumn":"\uD83C\uDF42",
  "A Wednesday call":"\uD83D\uDCDE","The Sheffield hills":"\u26F0\uFE0F",
  "A pub with no aircon":"\uD83C\uDF7A",
  /* trophies */
  "Kopi without looking":"\u2615","Chiah pa boe":"\uD83D\uDDE3\uFE0F",
  "Changi arrivals":"\uD83D\uDEEC","Two days":"\uD83E\uDD1D","Client number two":"\uD83D\uDCBC",
  "Issue one":"\uD83D\uDCF0","Thirty":"\uD83D\uDD25",
  /* coffee */
  "Flat white":"\u2615","Long black":"\u2615","Cortado":"\uD83E\uDD5B",
  "Filter, black":"\uD83E\uDED7","Cold brew":"\uD83E\uDDCA","Espresso standing up":"\uD83C\uDDEE\uD83C\uDDF9",
  "Single origin":"\uD83C\uDF31","Washed or natural":"\uD83C\uDF52","One without sugar":"\uD83D\uDEAB",
  "A bag at home":"\uD83D\uDCE6","Roast date":"\uD83D\uDCC5","A roaster you follow":"\uD83D\uDD25",
  /* deep cuts */
  "The reservoir at six":"\uD83C\uDF05","Fruit by the kilo":"\uD83C\uDF4A",
  "The night bus":"\uD83D\uDE8C","A hawker you go back to":"\uD83E\uDD62",
  "Getai season":"\uD83C\uDFA4","Thaipusam":"\uD83E\uDE94",
  "Second day of the new year":"\uD83E\uDDE7","A void deck funeral":"\uD83C\uDFF3\uFE0F",
  "Your estate's old name":"\uD83D\uDCDC","Invited into a flat":"\uD83D\uDEAA",
  "Ordering for two":"\uD83E\uDD62","An uncle who knows your order":"\uD83D\uDC74",
  /* sheffield and before */
  "The Peak District":"\uD83C\uDFDE\uFE0F","Scraps":"\uD83C\uDF5F",
  "A beer garden in June":"\uD83C\uDF7B","The walk from the station":"\uD83D\uDEB6",
  "The group chat":"\uD83D\uDCF1","The accent coming back":"\uD83D\uDDE3\uFE0F",
  "A call, not a text":"\u260E\uFE0F","Germany":"\uD83C\uDDE9\uD83C\uDDEA",
  "Christmas at home":"\uD83C\uDF84","Someone's wedding":"\uD83D\uDC8D","2018":"\uD83D\uDCF8",
  /* the industry */
  "The five-minute version":"\u23F1\uFE0F","A market resolving":"\u2705",
  "The order book":"\uD83D\uDCCA","Sports, not politics":"\u26BD",
  "The liquidity problem":"\uD83D\uDCA7","One regulator, properly":"\uD83D\uDCDC",
  "Kalshi":"\uD83D\uDCC8","Polymarket":"\uD83D\uDD2E","A speaker who said yes":"\uD83C\uDF99\uFE0F",
  "The take you held back":"\uD83E\uDD10","Quoted without prompting":"\uD83D\uDCAC",
  /* straight up growth */
  "The financial year end":"\uD83D\uDCC6","A written scope":"\uD83D\uDCDD",
  "Books actually current":"\uD83D\uDCD7","Paid yourself on time":"\uD83D\uDCB8",
  "The annual return":"\uD83D\uDCEE","The first tax filing":"\uD83E\uDDFE",
  "Cover that follows you":"\uD83D\uDEE1\uFE0F","The day rate, out loud":"\uD83D\uDCE3",
  "A second signature":"\u270D\uFE0F","The first hire":"\uD83E\uDDD1\u200D\uD83D\uDCBC",
  "An intern from here":"\uD83C\uDF93",
  /* the newsletter */
  "Before the shift":"\uD83C\uDF05","Not about work":"\uD83C\uDFA8",
  "A draft you sat on":"\uD83D\uDCC4","An idea off a card":"\uD83D\uDCA1",
  "A name you committed to":"\u2712\uFE0F","Your byline, not theirs":"\uD83D\uDCDB",
  "A reply from someone you rate":"\uD83D\uDC8C","The first hundred":"\uD83D\uDCAF",
  "Somewhere that is not rented":"\uD83C\uDF10","Ten in a row":"\uD83D\uDD1F",
  "Published anyway":"\uD83D\uDE80"
};
var SET_ART = { hawk:"\uD83C\uDF5C", kopi:"\u2615", slang:"\uD83D\uDCAC",
  every:"\uD83C\uDFD9\uFE0F", herit:"\uD83C\uDFEE", green:"\uD83C\uDF3F",
  isles:"\uD83C\uDFDD\uFE0F", region:"\u2708\uFE0F", road:"\uD83E\uDDF3",
  home:"\uD83C\uDFE1", zh:"\u6C49", bean:"\u2615", deep:"\uD83D\uDD0D",
  sheff:"\uD83C\uDFD4\uFE0F", post:"\uD83D\uDCF0", sug:"\uD83D\uDCBC",
  mkt:"\uD83D\uDCC8", gold:"\uD83C\uDFC6" };

/* ------------------------------------------------------------------ the chips
   The AA idea, borrowed with respect: a medallion for the longest run you
   have ever held, never taken back once earned. Each carries a reward he
   names himself - a chip without a treat is a badge; a chip with one is a
   reason. [ days, name, face colour, edge colour, ink ] */
var CHIPS = [
  [1,   "One day",    "#FFFFFF", "#D8D4C7", "#3B3A36"],
  [7,   "One week",   "#E8A05D", "#B87333", "#4A2E10"],
  [30,  "One month",  "#D9DEE6", "#9AA5B5", "#2F3844"],
  [90,  "One quarter","#FFD35C", "#D89412", "#5A4200"],
  [180, "Half a year","#5FD9A8", "#2FA57B", "#0C3B2A"],
  [365, "The year",   "#9AD8FF", "#4FA8E8", "#0F3A5C"]
];
var CHIP_HINT = [
  "", 
  "A coffee somewhere you have never been",
  "A proper meal out, or a massage",
  "A weekend away - Penang, Bangkok",
  "The flight that gets your brother here",
  "Something you would call ridiculous"
];

/* ----------------------------------------------------------------- the tips
   What the app says when it points at the next thing. Picked by day hash so
   it does not repeat itself two mornings running. */
var TIPS = {
  train: [
    "The hours before Malta wakes are the only ones nobody can take.",
    "A long walk counts. It has always counted.",
    "Gym, run or walk - decided the night before is twice as likely.",
    "Twenty minutes is a tick. Perfect is not the standard."
  ],
  family: [
    "About 07:00 in Sheffield right now - a good window.",
    "A call, not a text. The accent comes back in minutes.",
    "Wednesday is Mum's day. Walk while you talk.",
    "Five minutes counts if it is a real five minutes."
  ],
  stop: [
    "Malta is closed. Shut the laptop and take the point.",
    "The shift ends when it ends. That is the whole skill.",
    "Nothing after 23:00 is work; it is worry with a keyboard.",
    "Stopping on time tonight is tomorrow's energy."
  ]
};

/* ----------------------------------------------------- the card challenges
   His call: a card should ask something of you, or it is wallpaper. Every
   card carries a doable line - the specific ones here, the rest built from
   the set template. Completing one marks the card "lived". */
var SET_DO = {
  hawk:  function(n){ return "Eat " + n + " this week, at a stall, no phone on the table."; },
  kopi:  function(n){ return "Order " + n + " out loud, exactly like the card says."; },
  slang: function(n){ return "Use \u201C" + n + "\u201D in a real sentence today, to a real person."; },
  every: function(n){ return "Notice " + n + " today and stop for ten seconds. That is the whole task."; },
  herit: function(n){ return "Go to " + n + " this month. Twenty minutes there counts."; },
  green: function(n){ return "Walk " + n + " this month - it can be this weekend's Trained."; },
  isles: function(n){ return "Plan " + n + " for a free Saturday. Put it in the calendar now."; },
  region:function(n){ return "Price flights to " + n + " tonight. Looking costs nothing."; },
  road:  function(n){ return "Message someone about " + n + " - a memory or a plan."; },
  home:  function(n){ return "Tell someone at home you miss " + n + ". They want to hear it."; },
  zh:    function(n){ return "Say \u201C" + n + "\u201D to someone who will understand it today."; },
  bean:  function(n){ return "Order " + n + " somewhere new this week."; },
  deep:  function(n){ return "Make " + n + " happen this month. It is why you live here."; },
  sheff: function(n){ return "One message to the group chat about " + n + ". Today."; },
  post:  function(n){ return "Thirty minutes before the shift on \u201C" + n + "\u201D."; },
  sug:   function(n){ return "Book thirty minutes this week for \u201C" + n + "\u201D."; },
  mkt:   function(n){ return "Write three sentences on \u201C" + n + "\u201D you could say out loud."; },
  gold:  function(n){ return "You know what has to happen for this one. Move it one step."; }
};
var CARD_DO = {
  "Chilli crab": "Book the chilli crab dinner - it needs two people, so ask.",
  "MRT at 06:00": "Catch one train before 06:30 this week and watch the city wake.",
  "Tray return": "Return the tray, and one that is not yours.",
  "Chope": "Chope a table with a tissue packet, like a local, without smiling.",
  "Kiasu": "Let one queue-jump go unpunished today. Notice how it feels.",
  "The red-eye": "Check in online the moment it opens. Aisle, always.",
  "A Wednesday call": "It is on the calendar. Walk while you talk.",
  "Cold tap water": "Tell your mum what you miss this week. She keeps score.",
  "The reservoir at six": "One sunrise at MacRitchie this week. Set the alarm now.",
  "The night bus": "Stay out past the last train once this month, on purpose.",
  "Getai season": "Find this month's getai schedule and put one in the diary.",
  "An uncle who knows your order": "Go back to the same stall three times this week.",
  "The group chat": "Send the photo you almost sent last week.",
  "A call, not a text": "Call, do not text, the next time you reach for the keyboard.",
  "The five-minute version": "Say your five-minute version to the mirror. Time it.",
  "The take you held back": "Write the take down tonight. Publishing is a separate decision.",
  "A written scope": "Draft the one-page scope before Friday. Ugly is fine.",
  "The day rate, out loud": "Say the number out loud, alone, until it sounds normal.",
  "Before the shift": "Tomorrow: thirty minutes of yours before Malta gets any.",
  "Published anyway": "Ship the draft that is 80% done. Nobody sees the missing 20."
};

/* Ranks rather than bare numbers - a level should say something about you. */
var RANKS = [
  [0,     "Just landed"],
  [150,   "Two months in"],
  [450,   "Finding your way"],
  [950,   "Regular"],
  [1700,  "Local-ish"],
  [2800,  "Knows a guy"],
  [4200,  "Gives directions"],
  [6200,  "Been here years"],
  [9000,  "Institution"],
  [13000, "Ask him, he'll know"]
];
