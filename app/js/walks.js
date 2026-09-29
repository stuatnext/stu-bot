/* =============================================================== walks
   v100: "I do really like to go for walks. I do really enjoy clearing my
   head with a good walk, but I generally stick to the Tanjong Pagar area.
   And I want to expand my horizons and stop being so lazy and locked in...
   If it requires me to wear mosquito patches... I'd like you to tell me
   that... whilst I venture out and have these walks, I can also go to a
   nearby coffee place suggested by you or a nearby place for lunch."

   A walk somewhere new, the way the coffee works: one pick a day, near
   home on a weekday (there and back before Malta), further out at the
   weekend, never one he has already done until they have all been done.
   Each says how to get there from Tanjong Pagar, whether it wants
   repellent, how it does on a hazy day, and where to have the coffee and
   the lunch at the end. The walks are researched, with their sources, in
   WALKS below. */

/* { id, n name, g "near"|"trip", area, r the NEA air region, start (for
     Maps), get (from Tanjong Pagar), end, km, min, t type, bug (repellent)
     0/1, bugWhy, haze (still fine on a moderate-haze day: shelter, indoor
     stops) 0/1, when, cafe [name, address, why] or null, lunch [name,
     address, why], hc the hawker centre's name in NEA's closure list (for
     the live "closed today"), note, src [urls] }
   Researched on 29 Sep 2026 from NParks, NHB, NEA/data.gov.sg and dated
   café reviews; the dengue lines carry that date. Distances not stated by
   NParks are estimates. */
var WALKS = [
  /* --------------------------------------------------- near home: weekdays */
  { id: "duxton", n: "Duxton Hill, Ann Siang Hill and Telok Ayer", g: "near", area: "Tanjong Pagar to Telok Ayer", r: "south",
    start: "Tanjong Pagar MRT", get: "From your door: it starts at Tanjong Pagar MRT.",
    end: "Club Street, then Amoy Street Food Centre (Telok Ayer MRT)", km: 2.5, min: 50, t: "heritage",
    bug: 0, bugWhy: "Shophouse streets, no dengue cluster nearby (NEA, 29 Sep 2026).", haze: 1,
    when: "Weekday 8:00 to 10:30. Maxi is shut on Mondays.",
    cafe: ["Maxi Coffee Bar", "64 Club Street", "specialty coffee bar, known for its cereal-milk latte"],
    lunch: ["Amoy Street Food Centre", "Telok Ayer Street", "134 stalls; eat by 11:15, before the office rush"],
    hc: "Amoy Street Food Centre (Telok Ayer Food Centre)",
    note: "Takes in NParks' Pioneers Trail through Ann Siang Hill Park and Telok Ayer Green.",
    src: ["https://www.nparks.gov.sg/visit/parks/pioneers-trail-ann-siang-hill-park-telok-ayer-green",
          "https://hungrygowhere.com/food-news/maxi-coffee-bar-club-street/"] },
  { id: "everton", n: "Everton Park and Blair Plain", g: "near", area: "Tanjong Pagar and Outram", r: "south",
    start: "Tanjong Pagar MRT", get: "From your door.",
    end: "Maxwell Food Centre", km: 2.5, min: 45, t: "heritage",
    bug: 0, bugWhy: "A short city walk; the nearest dengue cluster is a kilometre off (NEA, 29 Sep 2026).", haze: 1,
    when: "Weekday 8:30 to 10:30. Nylon is shut on Tuesdays.",
    cafe: ["Nylon Coffee Roasters", "4 Everton Park", "single-outlet micro-roaster, there since 2012"],
    lunch: ["Maxwell Food Centre", "1 Kadayanallur Street", "103 stalls; before 11:30"],
    hc: "Maxwell Food Centre (Kim Hua Market)",
    note: "The shophouses of Everton Road, Blair Road, Spottiswoode Park and Neil Road.",
    src: ["https://eatbook.sg/nylon-coffee/"] },
  { id: "pearlshill", n: "Chinatown temples and Pearl's Hill", g: "near", area: "Chinatown and Outram", r: "south",
    start: "Chinatown MRT, Pagoda Street exit", get: "About ten minutes on foot to Chinatown MRT.",
    end: "Pearl's Hill Terrace, then People's Park Food Centre", km: 3, min: 60, t: "heritage",
    bug: 1, bugWhy: "Pearl's Hill City Park is a wooded hilltop, with a high-Aedes area about 350m away (NEA, Aug 2026).", haze: 1,
    when: "Weekday 9:00 to 11:00. On a hazy hour, skip the hill and keep to the covered five-foot ways.",
    cafe: ["Paaru", "195 Pearl's Hill Terrace", "Japanese-style shokupan café, in Time Out's 50 best (2026)"],
    lunch: ["People's Park Food Centre", "32 New Market Road", "87 stalls; by 11:30"],
    hc: "New Market Road Blk 32 (People's Park Food Centre)", note: "",
    src: ["https://www.nparks.gov.sg/visit/parks/park-detail/pearls-hill-city-park",
          "https://www.timeout.com/singapore/restaurants/50-best-cafes-singapore"] },
  { id: "tiongbahru", n: "Tiong Bahru estate", g: "near", area: "Tiong Bahru", r: "south",
    start: "Tiong Bahru MRT", get: "Two stops west on the East-West line, then five minutes on foot.",
    end: "Tiong Bahru Market, Seng Poh Road", km: 2.5, min: 50, t: "heritage",
    bug: 1, bugWhy: "A dengue cluster at Kim Tian Road, 200m from the MRT (NEA, 29 Sep 2026). Aedes bite in the day.", haze: 1,
    when: "Weekday 8:00 to 10:30; the market around 11:00.",
    cafe: ["Flock Café", "78 Moh Guan Terrace", "long-running independent café in a 1930s block"],
    lunch: ["Tiong Bahru Market", "30 Seng Poh Road", "83 stalls"],
    hc: "Tiong Bahru Market",
    note: "Follows NHB's Tiong Bahru Heritage Trail: the 1930s flats, Moh Guan Terrace, Seng Poh Road.",
    src: ["https://www.roots.gov.sg/places/places-landing/trails/tiong-bahru-heritage-trail",
          "https://ordinarypatrons.com/2026/02/24/flock-cafe-tiong-bahru/"] },
  { id: "kampongglam", n: "Kampong Gelam", g: "near", area: "Kampong Gelam", r: "south",
    start: "Bugis MRT", get: "Three stops east on the East-West line.",
    end: "Golden Mile Food Centre, Beach Road", km: 2.5, min: 50, t: "heritage",
    bug: 0, bugWhy: "Conservation streets, no dengue cluster nearby (NEA, 29 Sep 2026).", haze: 1,
    when: "Weekday 8:30 to 10:30; Golden Mile around 11:15.",
    cafe: ["All Things Delicious", "34 Arab Street", "halal café-bakery in a shophouse"],
    lunch: ["Golden Mile Food Centre", "505 Beach Road", "112 stalls"],
    hc: "Golden Mile Food Centre",
    note: "NHB's Kampong Glam trail: Masjid Sultan, Bussorah Street, Arab Street, Haji Lane.",
    src: ["https://www.roots.gov.sg/places/places-landing/trails/kampong-glam-heritage-trail", "https://allthingsdelicious.sg/"] },
  { id: "river", n: "The Singapore River, Robertson Quay to Boat Quay", g: "near", area: "Singapore River", r: "south",
    start: "Great World MRT", get: "Five minutes on foot to Maxwell, then three stops on the Thomson-East Coast line.",
    end: "Boat Quay, South Bridge Road", km: 3, min: 55, t: "waterfront",
    bug: 0, bugWhy: "A paved riverside promenade, no dengue cluster nearby (NEA, 29 Sep 2026).", haze: 0,
    when: "Weekday 8:00 to 10:30. Dawn is shut on Sundays.",
    cafe: ["Dawn", "78 South Bridge Road", "hole-in-the-wall: single origins and its own bakes, in Time Out's 50 best (2026)"],
    lunch: ["Hong Lim Food Centre", "531A Upper Cross Street", "103 stalls; by 11:15"],
    hc: "Upper Cross Street Blk 531A (Hong Lim Food Centre and Market)",
    note: "NHB's Singapore River Walk: Robertson, Clarke and Boat Quays.",
    src: ["https://www.roots.gov.sg/places/places-landing/trails/singapore-river-walk",
          "https://www.timeout.com/singapore/restaurants/50-best-cafes-singapore"] },
  { id: "marinabay", n: "Marina Bay waterfront loop", g: "near", area: "Marina Bay", r: "south",
    start: "Raffles Place MRT", get: "One stop east on the East-West line, or fifteen minutes on foot.",
    end: "Lau Pa Sat, Raffles Quay", km: 4.5, min: 65, t: "waterfront",
    bug: 0, bugWhy: "Open, paved waterfront, no dengue cluster nearby (NEA, Aug-Sep 2026).", haze: 1,
    when: "7:30 to 9:30, before the promenade heats up.",
    cafe: ["Hellu Coffee", "Far East Square, 137 Amoy Street", "fifteen seats, known for its creamy lattes"],
    lunch: ["Lau Pa Sat", "18 Raffles Quay", "the old cast-iron market; Market Street Hawker Centre is the back-up"],
    hc: "", note: "The promenade is a continuous 3.5km, with the malls along it if the air turns.",
    src: ["https://www.roots.gov.sg/places/places-landing/Places/landmarks/jubilee-walk/helix-bridge",
          "https://www.timeout.com/singapore/restaurants/50-best-cafes-singapore"] },
  { id: "fortcanning", n: "The Civic District and Fort Canning", g: "near", area: "City Hall to Bras Basah", r: "south",
    start: "City Hall MRT", get: "Two stops east on the East-West line.",
    end: "Selegie Road, then Tekka Centre (Rochor MRT)", km: 4, min: 75, t: "heritage",
    bug: 0, bugWhy: "Mostly city streets; repellent is optional for the wooded part of Fort Canning hill.", haze: 1,
    when: "Weekday 8:30 to 10:30: the hill at 9, coffee when Apartment opens at 10.",
    cafe: ["Apartment Coffee", "139 Selegie Road", "pour-over bar, No. 6 in the world's 100 best coffee shops 2026; expect a queue"],
    lunch: ["Tekka Centre", "665 Buffalo Road", "119 stalls, 400m from Apartment"],
    hc: "Buffalo Road Blk 665 (Tekka Centre/Zhu Jiao Market)",
    note: "The west half of the Jubilee Walk: the Padang, Empress Place, Fort Canning. The museums on the way are the indoor option on a hazy day.",
    src: ["https://isomer-user-content.by.gov.sg/98/10e47fd3-adb6-4544-a775-de5ee2b87e98/Media_Factsheet_Jubilee_Walk.pdf",
          "https://www.nparks.gov.sg/visit/parks/park-detail/fort-canning-park",
          "https://www.timeout.com/asia/news/worlds-100-best-coffee-shops-2026-14-asian-cafes-make-the-global-list-021926"] },
  { id: "gardens", n: "Gardens by the Bay and Marina Barrage", g: "near", area: "Marina South", r: "south",
    start: "Gardens by the Bay MRT", get: "Five minutes on foot to Maxwell, then four stops on the Thomson-East Coast line.",
    end: "Supertree Grove, then Bayfront MRT", km: 3.5, min: 60, t: "park",
    bug: 0, bugWhy: "Open gardens and lakes, no dengue cluster nearby (NEA, Aug-Sep 2026).", haze: 0,
    when: "7:00 to 9:30. The outdoor gardens open at 5am.",
    cafe: ["Snap Café", "21 McCallum Street", "Korean-inspired bakes, in Time Out's 50 best (2026); three stops back"],
    lunch: ["Market Street Hawker Centre", "88 Market Street", "53 stalls in CapitaSpring"],
    hc: "Market Street Hawker Centre",
    note: "The Barrage's green roof, the Kingfisher and Dragonfly Lakes, the Supertrees. Satay by the Bay closes from 1 Oct 2026, so lunch is back in town.",
    src: ["https://www.gardensbythebay.com.sg/en/plan-your-visit/opening-hours.html",
          "https://www.pub.gov.sg/Public/Places-of-Interest/Marina-Barrage/Visitors-Information"] },
  { id: "faber", n: "Mount Faber and Henderson Waves", g: "near", area: "Southern Ridges, the east end", r: "south",
    start: "HarbourFront MRT Exit D", get: "One stop to Outram Park, then two on the North East line (about 12 minutes).",
    end: "The Alkaff Mansion, Telok Blangah Hill", km: 3.3, min: 70, t: "nature",
    bug: 1, bugWhy: "Forest trails: Marang Trail, Faber Walk and the edge of Telok Blangah Hill.", haze: 0,
    when: "Weekday 7:30 to 10:00. Marang Trail climbs 70m, so skip it when the air is poor.",
    cafe: ["Wildseed Café", "The Alkaff Mansion, 10 Telok Blangah Green", "garden café in the 1918 mansion, right on the route"],
    lunch: ["Telok Blangah Crescent Food Centre", "Blk 11 Telok Blangah Crescent", "56 stalls, 400m from Henderson Waves"],
    hc: "Telok Blangah Crescent Blk 11 (11 Telok Blangah Crescent Market and Food Centre)",
    note: "A footpath on the Mount Faber loop has been closed since January 2025; the detour is signed.",
    src: ["https://www.nparks.gov.sg/docs/default-source/parks-docs/shared/hortpark-southern-ridges-diy-walk.pdf",
          "https://www.nparks.gov.sg/visit/parks/park-detail/mount-faber-park",
          "https://www.wildseedcafe.sg/the-alkaff-mansion/"] },
  { id: "botanic", n: "The Botanic Gardens, Tanglin to Bukit Timah Gate", g: "near", area: "Tanglin", r: "south",
    start: "Napier MRT", get: "Five minutes on foot to Maxwell, then six stops on the Thomson-East Coast line.",
    end: "Bukit Timah Gate, then Botanic Gardens MRT", km: 3.5, min: 70, t: "park",
    bug: 1, bugWhy: "It goes through the Rain Forest, and NEA lists a high-Aedes area 250m from Botanic Gardens MRT (Aug 2026).", haze: 0,
    when: "Weekday 7:00 to 10:00. Atlas opens Tuesday to Saturday.",
    cafe: ["Atlas Coffeehouse", "6 Duke's Road", "filter-coffee café, in Time Out's 50 best (2026)"],
    lunch: ["Adam Road Food Centre", "2 Adam Road", "32 stalls, 250m from the MRT"],
    hc: "Adam Road Food Centre", note: "",
    src: ["https://sbg.nparks.gov.sg/visit/general-info/", "https://www.timeout.com/singapore/restaurants/50-best-cafes-singapore"] },
  /* ------------------------------------------------ further out: weekends */
  { id: "ridges", n: "The Southern Ridges, HarbourFront to Pasir Panjang", g: "trip", area: "Southern Ridges", r: "south",
    start: "HarbourFront MRT Exit D", get: "About 12 minutes out; home from Pasir Panjang is about 25.",
    end: "Kent Ridge Park, then Pasir Panjang MRT", km: 8, min: 180, t: "nature",
    bug: 1, bugWhy: "Forest walkways most of the way: Forest Walk, the Canopy Walk.", haze: 0,
    when: "Start at 7:00 to be done by 10:30.",
    cafe: ["Coexist Coffee Co.", "122 Pasir Panjang Road", "small local roaster, opened here in October 2025"],
    lunch: ["Pasir Panjang Food Centre", "121 Pasir Panjang Road", "45 stalls, next to the MRT"],
    hc: "Pasir Panjang Food Centre",
    note: "Marang Trail, Faber Walk, Henderson Waves, Forest Walk, Alexandra Arch, HortPark, the Canopy Walk.",
    src: ["https://www.nparks.gov.sg/docs/default-source/parks-docs/shared/hortpark-southern-ridges-diy-walk.pdf",
          "https://www.nparks.gov.sg/visit/parks/park-detail/kent-ridge-park",
          "https://middleclass.sg/treats/coexist-coffee-co-pasir-panjang/"] },
  { id: "treetop", n: "The MacRitchie TreeTop Walk", g: "trip", area: "Central Catchment", r: "central",
    start: "Upper Thomson MRT", get: "Maxwell, then about ten stops on the Thomson-East Coast line (22 minutes), then 1.2km on foot to Venus Drive.",
    end: "Back to Venus Drive and Upper Thomson Road", km: 9.4, min: 225, t: "nature",
    bug: 1, bugWhy: "Rainforest trails, and a high-Aedes area by Upper Thomson MRT (NEA, Aug 2026).", haze: 0,
    when: "Weekend: Windsor opens at 7:00, the TreeTop Walk from 8:30 at weekends; shut on Mondays.",
    cafe: ["Oaks Coffee Co.", "223 Upper Thomson Road", "specialty coffee and matcha, in Time Out's 50 best (2026); shut on Wednesdays"],
    lunch: ["Shunfu Mart", "320 Shunfu Road", "31 stalls, 300m from Oaks; likely a late lunch"],
    hc: "Shunfu Road Blk 320 (Shunfu Mart)",
    note: "Moderate to hard: 7km to the 250m suspension bridge and back, three to four hours.",
    src: ["https://www.nparks.gov.sg/docs/default-source/parks-docs/central-catchment-nature-reserve/central-catchment-nature-reserve-treetop-walk-guide.pdf",
          "https://www.nparks.gov.sg/visit/parks/park-detail/windsor-nature-park"] },
  { id: "bukittimah", n: "Bukit Timah summit", g: "trip", area: "Bukit Timah", r: "central",
    start: "Beauty World MRT", get: "Five minutes to Telok Ayer, then 13 stops on the Downtown line (40 minutes in all).",
    end: "Back to Beauty World", km: 5, min: 120, t: "nature",
    bug: 1, bugWhy: "Primary rainforest. NParks asks you to go easy with it: heavy use has driven butterflies off the trails.", haze: 0,
    when: "Weekend: the reserve opens at 7:00; the summit by 8:30.",
    cafe: ["Offsite", "The LINQ @ Beauty World, 118 Upper Bukit Timah Road", "sourdough sandwiches and specialty coffee; from 9 at weekends"],
    lunch: ["Bukit Timah Interim Hawker Centre", "Jalan Jurong Kechil, by Beauty World MRT", "about 98 stalls from the old market"],
    hc: "", note: "Route 3 up (steep, 1.8km), Route 1 down, and about a kilometre each way from the MRT. Skip the climb when the air is poor.",
    src: ["https://www.nparks.gov.sg/visit/parks/park-detail/bukit-timah-nature-reserve/",
          "https://www.nparks.gov.sg/docs/default-source/parks-docs/bukit-timah-nature-reserve/btnrmap_march2025.pdf",
          "https://hungrygowhere.com/food-news/offsite-cafe-singapore/"] },
  { id: "railcorridor", n: "The Rail Corridor, Hillview to Buona Vista", g: "trip", area: "Rail Corridor", r: "west",
    start: "Hillview MRT", get: "Fifteen stops on the Downtown line from Telok Ayer (35 minutes); home from Buona Vista is 12 on the East-West line.",
    end: "Buona Vista and Ghim Moh", km: 7.5, min: 150, t: "nature",
    bug: 1, bugWhy: "A green, overgrown corridor, and a high-Aedes area near Buona Vista (NEA, Aug 2026).", haze: 0,
    when: "Weekend 7:00 to 10:00.",
    cafe: ["Frankie & Fern's", "Holland Road Shopping Centre #04-03", "rooftop-terrace café, in Time Out's 50 best (2026)"],
    lunch: ["Ghim Moh Market & Food Centre", "20 Ghim Moh Road", "72 stalls"],
    hc: "Ghim Moh Road Blk 20",
    note: "Passes the old Bukit Timah Railway Station about 3.8km in.",
    src: ["https://railcorridor.nparks.gov.sg/visit-rail-corridor/", "https://railcorridor.nparks.gov.sg/latest-news/closure-notice/"] },
  { id: "eastcoast", n: "East Coast Park, Bayshore to Marine Parade", g: "trip", area: "East Coast", r: "east",
    start: "Bayshore MRT", get: "Maxwell, then about ten stops on the Thomson-East Coast line (25 minutes).",
    end: "Marine Parade MRT, then Katong", km: 6, min: 100, t: "waterfront",
    bug: 0, bugWhy: "Breezy open coast, no dengue cluster nearby (NEA, 29 Sep 2026). Carry some if you linger by Bayshore.", haze: 0,
    when: "Weekend 7:00 to 9:30, before the sun is on it.",
    cafe: ["Micro Bakery & Kitchen", "Red House, 63 East Coast Road", "sourdough bakery-café, No. 1 in Time Out's 50 best (2026); Wednesday to Sunday"],
    lunch: ["84 Marine Parade Central", "Blk 84 Marine Parade Central", "55 stalls, 150m from the MRT"],
    hc: "Marine Parade Central Blk 84 (84 Marine Parade Central Market and Food Centre)", note: "",
    src: ["https://www.nparks.gov.sg/visit/parks/park-detail/east-coast-park",
          "https://www.timeout.com/singapore/restaurants/50-best-cafes-singapore"] },
  { id: "coney", n: "Punggol Point and Coney Island", g: "trip", area: "Punggol", r: "east",
    start: "Punggol Coast MRT", get: "One stop to Outram Park, then the North East line to the end (40 minutes).",
    end: "Punggol Coast Mall", km: 7, min: 150, t: "nature",
    bug: 1, bugWhy: "Mangrove and beach. NParks says long trousers and covered shoes, for the sandflies.", haze: 0,
    when: "Weekend. The island is open 7:00 to 19:00.",
    cafe: ["Woke by Wake The Crew", "Punggol Coast Mall #01-214", "specialty espresso and filter; shut on Mondays"],
    lunch: ["Punggol Coast Hawker Centre", "beside Punggol Coast Mall", "40 stalls, new in 2025"],
    hc: "Punggol Coast Hawker Centre",
    note: "In at the west entrance and back out. NParks warns of wild boars and stray dogs, and no plastic bags: monkeys.",
    src: ["https://www.nparks.gov.sg/visit/parks/park-detail/coney-island-park", "https://hungrygowhere.com/food-news/woke-by-wake-the-crew/"] },
  { id: "jurong", n: "Jurong Lake Gardens", g: "trip", area: "Jurong Lake", r: "west",
    start: "Lakeside MRT", get: "Eleven stops west on the East-West line (25 minutes).",
    end: "Chinese Garden MRT", km: 5, min: 105, t: "park",
    bug: 1, bugWhy: "Lakes and grassland, and NEA's biggest dengue cluster (80 cases) is 540m from Lakeside MRT (29 Sep 2026).", haze: 0,
    when: "Weekend 7:30 to 10:00.",
    cafe: ["Eden", "Pagoda Plaza, Chinese Garden", "halal café on NParks' own list for the Gardens"],
    lunch: ["Yuhua Market & Hawker Centre", "347 Jurong East Avenue 1", "56 stalls, 360m from Chinese Garden MRT"],
    hc: "Jurong East Ave 1 Blk 347 (Yuhua Market and Hawker Centre)", note: "",
    src: ["https://juronglakegardens.nparks.gov.sg/plan-your-visit/getting-here/", "https://juronglakegardens.nparks.gov.sg/dining/"] },
  { id: "bishan", n: "Bishan-Ang Mo Kio Park", g: "trip", area: "Bishan", r: "central",
    start: "Bishan MRT", get: "One stop to Raffles Place, then the North-South line (25 minutes).",
    end: "Bishan Park 2, Ang Mo Kio Avenue 1", km: 5.5, min: 100, t: "park",
    bug: 1, bugWhy: "River and greenery, and a dengue cluster at Bishan Street 12 (NEA, 29 Sep 2026).", haze: 0,
    when: "Weekend 7:00 to 10:00.",
    cafe: ["Shared Table", "Bishan Park 2, 1382 Ang Mo Kio Avenue 1", "new in the park in September 2026; check its hours"],
    lunch: ["Teck Ghee Court", "341 Ang Mo Kio Avenue 1", "32 stalls, 190m from Bishan Park 2"],
    hc: "Ang Mo Kio Ave 1 Blk 341 (Teck Ghee Court)",
    note: "The river runs 3km through the park. Some bridges are shut for works this quarter; the detours are signed.",
    src: ["https://www.nparks.gov.sg/visit/parks/park-detail/bishan-ang-mo-kio-park",
          "https://hungrygowhere.com/food-news/shared-table-bishan-ang-mo-kio-park/"] },
  { id: "lowerpeirce", n: "Lower Peirce Reservoir", g: "trip", area: "Upper Thomson", r: "central",
    start: "Bright Hill MRT", get: "Maxwell, then eleven stops on the Thomson-East Coast line (25 minutes), then about a kilometre on foot.",
    end: "Casuarina Road, off Upper Thomson", km: 4, min: 90, t: "nature",
    bug: 1, bugWhy: "Forest and the reservoir's edge, and Casuarina Road is in a high-Aedes area (NEA, Aug 2026).", haze: 0,
    when: "Weekend 7:00 to 9:30.",
    cafe: ["Oaks Coffee Co.", "223 Upper Thomson Road", "specialty coffee, in Time Out's 50 best (2026); 2.5km south, shut on Wednesdays"],
    lunch: ["Casuarina Curry", "136 Casuarina Road", "long-standing prata house"],
    hc: "", note: "Part of the boardwalk is shut for maintenance until 30 Sep 2026; use the Casuarina or Jacaranda entrances.",
    src: ["https://www.nparks.gov.sg/visit/parks/park-detail/lower-peirce-reservoir-park", "https://www.casuarinacurry.com/"] },
  { id: "chestnut", n: "Chestnut Nature Park", g: "trip", area: "Bukit Panjang", r: "central",
    start: "Bukit Panjang MRT", get: "Seventeen stops on the Downtown line from Telok Ayer (50 minutes in all).",
    end: "Bukit Panjang Hawker Centre", km: 7, min: 150, t: "nature",
    bug: 1, bugWhy: "Secondary forest, and a high-Aedes area nearby (NEA, Aug 2026).", haze: 0,
    when: "Weekend. Open 7:00 to 19:00; the hiking trails, not the bike ones.",
    cafe: null,
    lunch: ["Bukit Panjang Hawker Centre", "2 Bukit Panjang Ring Road", "28 stalls, new"],
    hc: "Bukit Panjang Hawker Centre and Market",
    note: "Part of the Blue Quail Trail is shut for slope repairs until the end of 2026.",
    src: ["https://www.nparks.gov.sg/visit/parks/park-detail/chestnut-nature-park"] },
  { id: "sungeibuloh", n: "Sungei Buloh Wetland Reserve", g: "trip", area: "Kranji", r: "north",
    start: "Kranji MRT", get: "East-West line to Raffles Place, North-South to Kranji (45 minutes), then bus 925 (925M on Sundays).",
    end: "The Visitor Centre, then the bus back", km: 4.5, min: 120, t: "nature",
    bug: 1, bugWhy: "Mangroves and wetland boardwalks.", haze: 0,
    when: "Weekend: be there for 7:00. Check NParks' high-tide closures first.",
    cafe: null,
    lunch: ["Marsiling Mall Hawker Centre", "4 Woodlands Street 12", "70 stalls, one stop on from Kranji"],
    hc: "Marsiling Mall Hawker Centre",
    note: "Platform 1 is shut until 23 Oct 2026.",
    src: ["https://www.nparks.gov.sg/visit/parks/park-detail/sungei-buloh-wetland-reserve"] },
  { id: "ubin", n: "Pulau Ubin", g: "trip", area: "Pulau Ubin", r: "east",
    start: "Changi Point Ferry Terminal", get: "25 minutes to Tanah Merah, bus 2 to Changi Village (about 30), then a ten-minute bumboat ($4; it goes when twelve are aboard).",
    end: "Back to Changi Village", km: 7.5, min: 180, t: "nature",
    bug: 1, bugWhy: "A rural island of forest and mangrove.", haze: 0,
    when: "Weekend, on the first boats around 7:30.",
    cafe: ["9Yards", "Village Hotel Changi, 1 Netheravon Road", "specialty coffee and cookies, by the ferry"],
    lunch: ["Encik Hassan", "beside Ubin Jetty", "mee rebus and nasi lemak for thirty years; weekends only"],
    hc: "", note: "Check NParks' Ubin notices before you go: parts of Chek Jawa are shut for maintenance.",
    src: ["https://pulau-ubin.nparks.gov.sg/visitubin/", "https://pulau-ubin.nparks.gov.sg/notices/",
          "https://www.timeout.com/singapore/restaurants/encik-hassan"] },
  { id: "changi", n: "The Changi Point Coastal Walk", g: "trip", area: "Changi Village", r: "east",
    start: "Changi Village", get: "East-West line to Tanah Merah, then bus 2 (about an hour in all).",
    end: "Back to Changi Village", km: 4.5, min: 90, t: "waterfront",
    bug: 0, bugWhy: "A coastal boardwalk, no dengue cluster nearby (NEA, 29 Sep 2026). Carry some at dusk.", haze: 0,
    when: "Weekend 7:30 to 10:00.",
    cafe: ["9Yards", "Village Hotel Changi, 1 Netheravon Road", "specialty coffee, and food if the hawker centre is shut"],
    lunch: ["Changi Village Hawker Centre", "2 and 3 Changi Village Road", "87 stalls"],
    hc: "Changi Village Blk 2 and 3",
    note: "The 2.2km boardwalk, out and back. One section is closed until 31 Dec 2026, with a signed detour.",
    src: ["https://www.nparks.gov.sg/visit/parks/park-detail/changi-boardwalk/",
          "https://thehoneycombers.com/singapore/9yards-cafe-review-singapore/"] }
];


function walkLog(){ return S.walked && typeof S.walked === "object" ? S.walked : {}; }
function walkDone(id){ return !!walkLog()[id]; }
function walkCount(){ return Object.keys(walkLog()).filter(function(id){ return !!walkById(id); }).length; }
function walkById(id){ return WALKS.filter(function(w){ return w.id === id; })[0] || null; }
/* the weekend has no shift after it: that is when the trips go */
function walkTripDay(k){ var d = dowOf(k || today()); return d === 0 || d === 6; }
/* The day's walk: one he has not done, near on a weekday and a trip at
   the weekend, each falling back on the other, the same all day. "Another
   one" moves it on, and that sticks for the day too. */
function walkPick(k){
  k = k || today();
  if (!WALKS.length) return null;
  var trip = walkTripDay(k), skip = dayRec(k).wskip || 0;
  var fits = function(w){ return (w.g === "trip") === trip; };
  var fresh = WALKS.filter(function(w){ return !walkDone(w.id); });
  var pools = [fresh.filter(fits), fresh, WALKS.filter(fits), WALKS];
  for (var i = 0; i < pools.length; i++)
    if (pools[i].length) return pools[i][(hashOf("wk" + k) + skip) % pools[i].length];
  return null;
}

/* ------------------------------------------------------ the air, live
   Read from NEA through data.gov.sg (both answer a browser), only when the
   app is on the web, at most every half hour, and never waited on for more
   than a moment. NEA's own guide: the 1-hour PM2.5 is the one for "should I
   go now", the 24-hour PSI for the day. Both by region; each walk knows its
   own. */
var AIR = null, AIR_AT = 0, AIR_P = null;
function airFetch(){
  if (typeof fetch !== "function" || location.protocol !== "https:") return Promise.resolve();
  if (AIR_P && Date.now() - AIR_AT < 30 * 60000) return AIR_P;
  AIR_AT = Date.now();
  var get = function(u){ return fetch(u).then(function(r){ return r.json(); }).catch(function(){ return null; }); };
  var first = function(j){ return j && j.data && j.data.items && j.data.items[0]; };
  AIR_P = Promise.all([get("https://api-open.data.gov.sg/v2/real-time/api/psi"),
                       get("https://api-open.data.gov.sg/v2/real-time/api/pm25")]).then(function(js){
    var a = first(js[0]), b = first(js[1]);
    var psi = a && a.readings && a.readings.psi_twenty_four_hourly, pm = b && b.readings && b.readings.pm25_one_hourly;
    if (psi) AIR = { psi: psi, pm: pm || null, at: a.timestamp || "" };
  });
  return AIR_P;
}
/* How the air is for this walk: 0 fine, 1 take it easy, 2 not today. NEA:
   PSI 101-200 or PM2.5 56-150, reduce prolonged or strenuous exertion;
   PSI over 200 or PM2.5 over 150, avoid it. */
function airLevel(w){
  var r = (w && w.r) || "south";
  if (!AIR || AIR.psi[r] == null) return -1;
  var p = Number(AIR.psi[r]), m = AIR.pm && AIR.pm[r] != null ? Number(AIR.pm[r]) : null;
  return p > 200 || (m !== null && m > 150) ? 2 : p > 100 || (m !== null && m > 55) ? 1 : 0;
}
function hazeLine(w){
  var r = (w && w.r) || "south", lv = airLevel(w);
  if (lv < 0) return "Haze: check the PSI first. Up to 100 is fine for a walk; over 100, keep it short"
    + (w && w.haze ? " (this one has shelter and indoor stops)" : " or pick a sheltered one") + ".";
  var nums = "Haze now in the " + r + ": PSI " + Math.round(AIR.psi[r])
    + (AIR.pm && AIR.pm[r] != null ? ", PM2.5 " + Math.round(AIR.pm[r]) + " this hour" : "") + ". ";
  return nums + (lv === 0 ? "Fine for a walk."
    : lv === 1 ? "NEA says keep outdoor exertion down: short and easy" + (w.haze ? ", and this one has shelter and indoor stops." : ", or a sheltered one.")
    : "NEA says avoid prolonged exertion outdoors: not a day for this one. Somewhere indoors, or another day.");
}
/* a near walk with shelter and indoor stops, for a hazy day */
function walkSheltered(k, not){
  var ok = WALKS.filter(function(w){ return w.haze && w.g !== "trip" && (!not || w.id !== not); });
  var fresh = ok.filter(function(w){ return !walkDone(w.id); });
  var pool = fresh.length ? fresh : ok;
  return pool.length ? pool[hashOf("wh" + (k || today())) % pool.length] : null;
}

/* --------------------------------------------------- lunch, open or not
   NEA publishes every hawker centre's cleaning and works dates, and that
   list answers a browser too: so the lunch line can say "closed today"
   before he walks there. */
var HC = null, HC_P = null;
function hcFetch(){
  if (typeof fetch !== "function" || location.protocol !== "https:") return Promise.resolve();
  if (HC_P) return HC_P;
  HC_P = fetch("https://data.gov.sg/api/action/datastore_search?resource_id=d_bda4baa634dd1cc7a6c7cad5f19e2d68&limit=200")
    .then(function(r){ return r.json(); }).then(function(j){
      HC = {};
      ((j && j.result && j.result.records) || []).forEach(function(x){ HC[x.name] = x; });
    }).catch(function(){ HC_P = null; });
  return HC_P;
}
function hcDate(t){
  var m = String(t || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? m[3] + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[1]).slice(-2) : null;
}
/* { why, until } if the walk's hawker centre is shut on day k */
function hcClosed(w, k){
  if (!w.hc || !HC || !HC[w.hc]) return null;
  var x = HC[w.hc], out = null;
  [["q1_cleaningstartdate", "q1_cleaningenddate", "cleaning"], ["q2_cleaningstartdate", "q2_cleaningenddate", "cleaning"],
   ["q3_cleaningstartdate", "q3_cleaningenddate", "cleaning"], ["q4_cleaningstartdate", "q4_cleaningenddate", "cleaning"],
   ["other_works_startdate", "other_works_enddate", "works"]].forEach(function(f){
    var a = hcDate(x[f[0]]), b = hcDate(x[f[1]]);
    if (a && b && a <= k && k <= b){
      var why = f[2] === "works" && x.remarks_other_works && x.remarks_other_works !== "nil" ? x.remarks_other_works.toLowerCase() : "cleaning";
      out = { why: why, until: b };
    }
  });
  return out;
}
/* both, for at most a moment, then on with what there is */
function walkLive(ms){
  return Promise.race([Promise.all([airFetch(), hcFetch()]), new Promise(function(res){ setTimeout(res, ms || 1200); })]);
}

/* ------------------------------------------------------------ the sheet */
function mapsLink(q, label){
  return "<a class='wk-map' target='_blank' rel='noopener' href='https://www.google.com/maps/search/?api=1&query="
    + encodeURIComponent(q + ", Singapore") + "'>" + esc(label || q) + "</a>";
}
var DENGUE_URL = "https://www.nea.gov.sg/dengue-zika/dengue/dengue-clusters";
function walkHTML(w){
  var k = today(), shut = hcClosed(w, k);
  var until = shut ? new Date(shut.until + "T12:00:00") : null;
  return "<div class='kit-c wk-c' style='--kt:#5AC8F5'>"
    + "<div class='kit-pick'><em>" + (w.g === "trip" ? "Further out" : "Near home") + "</em><b>" + esc(w.n) + "</b>"
    + "<span>" + esc(w.area) + " · " + w.km + " km · about " + w.min + " min</span></div>"
    + "<p class='kit-how'><em>Start</em>" + mapsLink(w.start) + "</p>"
    + "<p class='kit-how'><em>Getting there</em>" + esc(w.get) + "</p>"
    + "<p class='kit-how'><em>Finish</em>" + esc(w.end) + "</p>"
    + "<p class='wk-bug" + (w.bug ? " on" : "") + "'>" + (w.bug
        ? "<b>Bring repellent.</b> " + esc(w.bugWhy) + " DEET, picaridin or IR3535; sunscreen first, then repellent."
        : "<b>No repellent needed.</b> " + esc(w.bugWhy) + " <a class='wk-link' target='_blank' rel='noopener' href='" + DENGUE_URL + "'>Dengue clusters</a>")
    + "</p>"
    + "<p class='wk-haze'>" + esc(hazeLine(w)) + "</p>"
    + (w.when ? "<p class='kit-how'><em>When</em>" + esc(w.when) + "</p>" : "")
    + "<p class='kit-how'><em>Coffee after</em>" + (w.cafe
        ? mapsLink(w.cafe[0] + " " + w.cafe[1], w.cafe[0]) + ", " + esc(w.cafe[2])
        : "Nothing worth the trip out here: bring water.") + "</p>"
    + "<p class='kit-how'><em>Lunch</em>" + mapsLink(w.lunch[0] + " " + w.lunch[1], w.lunch[0]) + ", " + esc(w.lunch[2])
    + (shut ? "<b class='wk-shut'>Closed today for " + esc(shut.why) + ", until " + until.getDate() + " "
        + MONTHS_SHORT[until.getMonth()] + ". Somewhere near the finish instead.</b>" : "") + "</p>"
    + (w.note ? "<p class='wk-note'>" + esc(w.note) + "</p>" : "")
    + "<p class='kit-where'>" + svg("run", 13) + "Walk passport: " + walkCount() + " of " + WALKS.length
    + " <span class='wk-src'>" + w.src.map(function(u, i){ return "<a target='_blank' rel='noopener' href='" + esc(u) + "'>" + (i + 1) + "</a>"; }).join(" ")
    + "</span></p></div>";
}
var MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function askWalkNew(id){
  return walkLive(1200).then(function(){ return walkSheet(id); });
}
function walkSheet(id){
  var k = today(), w = id ? walkById(id) : walkPick(k);
  if (!w) return;
  var alt = airLevel(w) >= 1 && !w.haze ? walkSheltered(k, w.id) : null;
  return ask({
    title: "A walk somewhere new",
    html: walkHTML(w),
    options: [
      { id: "done", label: "Walked it", note: w.min + " minutes · Trained", pri: airLevel(w) < 2 },
      w.cafe ? { id: "cafe", label: "Walked it, and had the coffee", note: w.cafe[0] + " goes in your coffee passport" } : null,
      alt ? { id: "alt", label: "A sheltered one instead", note: alt.n + ": shelter and indoor stops" } : null,
      id ? null : { id: "next", label: "Another one", note: walkTripDay(k) ? "Another trip" : "Another near home" },
      { id: "all", label: "All the walks", note: walkCount() + " of " + WALKS.length + " walked" }
    ].filter(Boolean),
    cancel: "Not today"
  }).then(function(v){
    if (v === "done" || v === "cafe") logWalk(w, v === "cafe");
    else if (v === "alt") walkSheet(alt.id);
    else if (v === "next"){ dayRec(k, 1).wskip = (dayRec(k).wskip || 0) + 1; save(); walkSheet(); }
    else if (v === "all") askWalks();
  });
}
function logWalk(w, cafe){
  var k = today(), fresh = !walkDone(w.id);
  S.walked = walkLog();
  if (fresh) S.walked[w.id] = k;
  S.walks = S.walks || {};
  S.walks[k] = Math.max(Number(S.walks[k]) || 0, w.min);
  if (cafe && w.cafe && typeof logCoffee === "function"){ save(); logCoffee(w.cafe[0]); }
  else save();
  if (!day(k).p.train && typeof tapPillar === "function") tapPillar("train");
  else render({ keepScroll: true, animate: true });
  if (!cafe) toast(fresh ? w.n + ": walk " + walkCount() + " in your passport." : w.n + ", again. Good.", fresh);
}
/* every walk, near first, the done ones ticked */
function walksListHTML(){
  var row = function(w){
    return "<button class='wk-r" + (walkDone(w.id) ? " done" : "") + "' data-mk='" + esc(w.id) + "'>"
      + "<i>" + svg(walkDone(w.id) ? "tick" : "run", 15) + "</i>"
      + "<span><b>" + esc(w.n) + "</b><small>" + esc(w.area) + " · " + w.min + " min" + (w.bug ? " · repellent" : "")
      + "</small></span></button>";
  };
  var near = WALKS.filter(function(w){ return w.g !== "trip"; }), trip = WALKS.filter(function(w){ return w.g === "trip"; });
  return "<div class='wk-list'><p class='dp-lead'>Near home for a weekday morning; further out for the weekend. "
    + "Tap one for how to get there, and where to have coffee and lunch after.</p>"
    + "<p class='wk-note'>Repellent: NEA's registered ones are DEET, picaridin or IR3535, which last longer than "
    + "citronella or other plant oils. Patches go on clothes, not skin. Sunscreen first, then repellent, and most "
    + "of all at dawn and dusk.</p>"
    + "<h4 class='cu-h'>Near home</h4>" + near.map(row).join("")
    + "<h4 class='cu-h'>Further out</h4>" + trip.map(row).join("") + "</div>";
}
function askWalks(){
  walkLive(1);
  return ask({ title: "Walks", html: walksListHTML(), cancel: "Close" }).then(function(v){
    if (v && walkById(v)) askWalkNew(v);
  });
}
/* On You: the passport, today's pick, and the door to the list. */
function walksPanelHTML(){
  if (!WALKS.length) return "";
  var w = walkPick(today());
  return "<div class='panel wkp wkx'><div class='lf-hd'><h3>Walks</h3><span>" + walkCount() + " of " + WALKS.length
    + " walked</span></div>"
    + "<p class='lf-lead'>Somewhere new to walk, with coffee and lunch at the end. Near home on weekdays, further out at the weekend.</p>"
    + (w ? "<button class='wkp-o' data-walknew='1'><b>" + (walkTripDay() ? "This weekend: " : "Today: ") + esc(w.n)
      + "</b><span>" + esc(w.area) + " · " + w.min + " min" + (w.bug ? " · bring repellent" : "") + "</span></button>" : "")
    + "<button class='wkp-o' data-walks='1'><b>All the walks</b><span>" + WALKS.length + " walks, with how to get there</span></button>"
    + "</div>";
}
