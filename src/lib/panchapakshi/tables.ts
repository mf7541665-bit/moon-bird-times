// Panchapakshi Shastra reference tables.
// Sources: Traditional Tamil Panchapakshi Shastra as documented in
// "Panchapakshi Shastram" (Achutha Menon) and popular Tamil almanacs.
// All tables are isolated here so they can be verified against a preferred source.

export type BirdKey = "vulture" | "owl" | "crow" | "cock" | "peacock";
export type ActivityKey = "eat" | "walk" | "rule" | "sleep" | "die";
export type Paksha = "valarpirai" | "theipirai";
export type DayNight = "day" | "night";

export const BIRDS: Record<BirdKey, { ta: string; en: string }> = {
  vulture: { ta: "கழுகு", en: "Vulture" },
  owl: { ta: "ஆந்தை", en: "Owl" },
  crow: { ta: "காகம்", en: "Crow" },
  cock: { ta: "சேவல்", en: "Cock" },
  peacock: { ta: "மயில்", en: "Peacock" },
};

export const ACTIVITIES: Record<
  ActivityKey,
  { ta: string; en: string; quality: "excellent" | "good" | "neutral" | "bad" | "worst" }
> = {
  rule: { ta: "ஆளுதல்", en: "Ruling", quality: "excellent" },
  eat: { ta: "உண்ணல்", en: "Eating", quality: "good" },
  walk: { ta: "நடத்தல்", en: "Walking", quality: "neutral" },
  sleep: { ta: "உறங்குதல்", en: "Sleeping", quality: "bad" },
  die: { ta: "இறத்தல்", en: "Dying", quality: "worst" },
};

// 27 Nakshatras (0-indexed)
export const NAKSHATRAS_TA = [
  "அசுவினி", "பரணி", "கார்த்திகை", "ரோகிணி", "மிருகசீரிடம்",
  "திருவாதிரை", "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்",
  "பூரம்", "உத்திரம்", "ஹஸ்தம்", "சித்திரை", "சுவாதி",
  "விசாகம்", "அனுஷம்", "கேட்டை", "மூலம்", "பூராடம்",
  "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்", "பூரட்டாதி",
  "உத்திரட்டாதி", "ரேவதி",
];

// Nakshatra groups (indices into the 27-list)
const G_A = [1, 2, 7, 8, 11, 12]; // Bharani, Krittika, Pushya, Ashlesha, U.Phalguni, Hasta
const G_B = [3, 4, 5, 6, 9, 10]; // Rohini, Mrigashira, Ardra, Punarvasu, Magha, P.Phalguni
const G_C = [13, 14, 17, 18, 22, 23]; // Chitra, Swati, Jyeshtha, Mula, Dhanishta, Shatabhisha
const G_D = [15, 16, 19, 20, 24, 25]; // Vishakha, Anuradha, P.Shada, U.Shada, P.Bhadra, U.Bhadra
const G_E = [0, 21, 26]; // Ashwini, Shravana, Revati

/** Birth bird by nakshatra index + paksha. */
export function birthBirdFromNakshatra(nakIdx: number, paksha: Paksha): BirdKey {
  const inGroup = (g: number[]) => g.includes(nakIdx);
  if (paksha === "valarpirai") {
    if (inGroup(G_A)) return "vulture";
    if (inGroup(G_B)) return "owl";
    if (inGroup(G_C)) return "crow";
    if (inGroup(G_D)) return "cock";
    return "peacock"; // G_E
  } else {
    // Theipirai: cyclic shift
    if (inGroup(G_A)) return "peacock";
    if (inGroup(G_B)) return "vulture";
    if (inGroup(G_C)) return "owl";
    if (inGroup(G_D)) return "crow";
    return "cock"; // G_E
  }
}

// Ruling bird per weekday (0=Sun..6=Sat) for each paksha and day/night.
// Standard tradition: on Valarpirai the day-ruling bird runs sunrise->sunset;
// the night-ruling bird runs sunset->next sunrise. Theipirai reverses.
type RulingTable = Record<number, BirdKey>;

const VAL_DAY: RulingTable = {
  0: "vulture", // Sun
  1: "owl",     // Mon
  2: "crow",    // Tue
  3: "cock",    // Wed
  4: "peacock", // Thu
  5: "peacock", // Fri
  6: "crow",    // Sat
};
const VAL_NIGHT: RulingTable = {
  0: "cock",
  1: "peacock",
  2: "vulture",
  3: "owl",
  4: "crow",
  5: "crow",
  6: "peacock",
};
// Theipirai: day and night rulers swap relative to valarpirai
const THEI_DAY: RulingTable = VAL_NIGHT;
const THEI_NIGHT: RulingTable = VAL_DAY;

export function rulingBird(weekday: number, paksha: Paksha, dn: DayNight): BirdKey {
  if (paksha === "valarpirai") return dn === "day" ? VAL_DAY[weekday] : VAL_NIGHT[weekday];
  return dn === "day" ? THEI_DAY[weekday] : THEI_NIGHT[weekday];
}

// Activity duration table in "nazhigai" (traditional units).
// Total per bird = 30 nazhigai. Day (sunrise->sunset) is scaled to 30 units;
// so proportional split of the actual day-length is used. Same for night.
// Reference: standard Panchapakshi nazhigai table.
export const DURATIONS: Record<BirdKey, Record<ActivityKey, number>> = {
  vulture: { rule: 4, eat: 6, walk: 8, sleep: 6, die: 6 },
  owl:     { rule: 5, eat: 10, walk: 5, sleep: 5, die: 5 },
  crow:    { rule: 6, eat: 7, walk: 8, sleep: 5, die: 4 },
  cock:    { rule: 6, eat: 8, walk: 5, sleep: 5, die: 6 },
  peacock: { rule: 4, eat: 8, walk: 9, sleep: 5, die: 4 },
};

// Activity sequence for the ruling bird performing all 5 activities.
// The sequence differs by paksha AND day/night.
// Valarpirai Day (ruling bird): Eat -> Walk -> Rule -> Sleep -> Die
// Valarpirai Night: Sleep -> Die -> Eat -> Walk -> Rule
// Theipirai Day: Die -> Sleep -> Rule -> Walk -> Eat  (reverse of Val day)
// Theipirai Night: Rule -> Walk -> Eat -> Die -> Sleep (reverse of Val night)
export function sequenceForRuling(paksha: Paksha, dn: DayNight): ActivityKey[] {
  if (paksha === "valarpirai") {
    return dn === "day"
      ? ["eat", "walk", "rule", "sleep", "die"]
      : ["sleep", "die", "eat", "walk", "rule"];
  }
  return dn === "day"
    ? ["die", "sleep", "rule", "walk", "eat"]
    : ["rule", "walk", "eat", "die", "sleep"];
}

// Cyclic order of birds performing simultaneously.
// When the ruling bird finishes its activity, control moves to the next bird
// in the cycle who then performs their equivalent activity, etc.
// Standard cycle: Vulture -> Owl -> Crow -> Cock -> Peacock -> Vulture ...
export const BIRD_CYCLE: BirdKey[] = ["vulture", "owl", "crow", "cock", "peacock"];

/** For a non-ruling bird, what activity does it perform in slot N of the ruling bird's sequence? */
export function activityForBird(
  ruling: BirdKey,
  slotActivity: ActivityKey,
  bird: BirdKey,
): ActivityKey {
  // Each activity slot corresponds to an "action-role". Non-ruling birds
  // perform activities offset by their distance from the ruling bird in the cycle.
  // Traditional rule: within one slot, the 5 birds are performing all 5 different
  // activities. The mapping shifts by 1 activity per bird-step in the cycle.
  const seqOrder: ActivityKey[] = ["rule", "eat", "walk", "sleep", "die"];
  const baseIdx = seqOrder.indexOf(slotActivity);
  const rulingCycleIdx = BIRD_CYCLE.indexOf(ruling);
  const birdCycleIdx = BIRD_CYCLE.indexOf(bird);
  const offset = (birdCycleIdx - rulingCycleIdx + 5) % 5;
  return seqOrder[(baseIdx + offset) % 5];
}
