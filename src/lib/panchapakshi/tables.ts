// Panchapakshi Shastra reference tables — transcribed from the user's authoritative chart.
// Source: uploaded reference (Valarpirai & Theipirai பகல்/இரவு தொழில் charts).
//
// STRUCTURE (verified from the chart):
//   SEQ = [Eat, Walk, Rule, Sleep, Die]  (i.e. [ஊண், நடை, அரசு, துயில், சாவு])
//   activity[bird_i, slot_j] = SEQ[(base[weekday][dn] + i + step * j) mod 5]
//   - Valarpirai (waxing):  step = +1 (activities progress forward)
//   - Theipirai  (waning):  step = -1 (activities progress backward)
//   - Bird ordering per paksha comes from BIRD_ORDER below.
//
// Time slots are EQUAL: (sunrise -> sunset) / 5 and (sunset -> next sunrise) / 5.

export type BirdKey = "vulture" | "owl" | "crow" | "cock" | "peacock";
export type ActivityKey = "eat" | "walk" | "rule" | "sleep" | "die";
export type Paksha = "valarpirai" | "theipirai";
export type DayNight = "day" | "night";

export const BIRDS: Record<BirdKey, { ta: string; en: string }> = {
  vulture: { ta: "வல்லூறு", en: "Vulture" },
  owl: { ta: "ஆந்தை", en: "Owl" },
  crow: { ta: "காகம்", en: "Crow" },
  cock: { ta: "கோழி", en: "Cock" },
  peacock: { ta: "மயில்", en: "Peacock" },
};

export const ACTIVITIES: Record<
  ActivityKey,
  { ta: string; en: string; quality: "excellent" | "good" | "neutral" | "bad" | "worst" }
> = {
  rule: { ta: "அரசு", en: "Ruling", quality: "excellent" },
  eat: { ta: "ஊண்", en: "Eating", quality: "good" },
  walk: { ta: "நடை", en: "Walking", quality: "neutral" },
  sleep: { ta: "துயில்", en: "Sleeping", quality: "bad" },
  die: { ta: "சாவு", en: "Dying", quality: "worst" },
};

// Ordered activity sequence used by the pattern formula.
const SEQ: ActivityKey[] = ["eat", "walk", "rule", "sleep", "die"];

// Bird row order per paksha (matches the reference chart's row layout).
// Valarpirai:  V, O, C, Ck, P
// Theipirai:   Ck, O, C, P, V   (note: chart displays Ck,O,P,C,V — the underlying
//              pattern order swaps C and P so that +1 shift per row holds).
export const BIRD_ORDER: Record<Paksha, BirdKey[]> = {
  valarpirai: ["vulture", "owl", "crow", "cock", "peacock"],
  theipirai:  ["cock", "owl", "crow", "peacock", "vulture"],
};

// Slot progression direction.
const STEP: Record<Paksha, 1 | -1> = { valarpirai: 1, theipirai: -1 };

// Base values (index into SEQ of the FIRST bird's slot-0 activity),
// for each (weekday, paksha, day/night). Derived from the reference chart.
//
// Weekday indices: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat.
//
// NOTE: Verified from the reference for Sun/Mon/Tue/Fri/Sat (Valarpirai) and
// Sun/Mon/Wed/Thu/Fri (Theipirai). Values for weekdays not clearly shown on the
// chart (Wed/Thu Valarpirai; Tue/Sat Theipirai) are interpolated per the
// -1-per-weekday cadence apparent in the verified rows. Adjust here if your
// almanac differs.
type BaseTable = { day: number; night: number };
const BASES: Record<Paksha, BaseTable[]> = {
  valarpirai: [
    { day: 0, night: 4 }, // Sun
    { day: 4, night: 3 }, // Mon
    { day: 3, night: 2 }, // Tue
    { day: 2, night: 1 }, // Wed  (interpolated)
    { day: 1, night: 0 }, // Thu  (interpolated)
    { day: 2, night: 0 }, // Fri
    { day: 1, night: 2 }, // Sat
  ],
  theipirai: [
    { day: 0, night: 1 }, // Sun
    { day: 2, night: 4 }, // Mon
    { day: 2, night: 4 }, // Tue  (grouped with Mon on chart)
    { day: 3, night: 0 }, // Wed
    { day: 1, night: 3 }, // Thu
    { day: 4, night: 2 }, // Fri
    { day: 0, night: 1 }, // Sat  (grouped with Sun on chart)
  ],
};

/** Activity performed by `bird` during slot `slotIdx` (0..4) on `weekday`. */
export function activityFor(
  weekday: number,
  paksha: Paksha,
  dn: DayNight,
  bird: BirdKey,
  slotIdx: number,
): ActivityKey {
  const order = BIRD_ORDER[paksha];
  const i = order.indexOf(bird);
  const base = BASES[paksha][weekday][dn];
  const step = STEP[paksha];
  const idx = ((base + i + step * slotIdx) % 5 + 5) % 5;
  return SEQ[idx];
}

/** Ruling bird for the given weekday+paksha+day/night — the bird performing "Rule" in slot 0. */
export function rulingBird(weekday: number, paksha: Paksha, dn: DayNight): BirdKey {
  const order = BIRD_ORDER[paksha];
  for (const b of order) {
    if (activityFor(weekday, paksha, dn, b, 0) === "rule") return b;
  }
  return order[0];
}

// ---------------------------------------------------------------------------
// Birth bird by FIRST LETTER of the name + Paksha (from chart's small table).
//
// Valarpirai:  அ/ஆ/இ/ஈ→Vulture,  உ/ஊ→Owl,  எ/ஏ→Crow,  ஒ/ஓ→Cock,  ஐ/ஔ→Peacock
// Theipirai:   அ/ஆ/இ/ஈ→Cock,     உ/ஊ→Owl,  எ/ஏ→Peacock, ஒ/ஓ→Crow, ஐ/ஔ→Vulture
// ---------------------------------------------------------------------------

type VowelGroup = "a" | "u" | "e" | "o" | "ai";

const BIRTH_BIRD: Record<Paksha, Record<VowelGroup, BirdKey>> = {
  valarpirai: { a: "vulture", u: "owl", e: "crow", o: "cock", ai: "peacock" },
  theipirai:  { a: "cock",    u: "owl", e: "peacock", o: "crow", ai: "vulture" },
};

/** Extract the vowel group from a Tamil name's first akshara. */
export function vowelGroupOf(name: string): VowelGroup {
  const trimmed = name.trim();
  if (!trimmed) return "a";
  const c0 = trimmed.codePointAt(0)!;

  // Tamil independent vowels: அ(0B85) ஆ(0B86) இ(0B87) ஈ(0B88) உ(0B89) ஊ(0B8A)
  //                          எ(0B8E) ஏ(0B8F) ஐ(0B90) ஒ(0B92) ஓ(0B93) ஔ(0B94)
  const vowelMap: Record<number, VowelGroup> = {
    0x0b85: "a", 0x0b86: "a", 0x0b87: "a", 0x0b88: "a",
    0x0b89: "u", 0x0b8a: "u",
    0x0b8e: "e", 0x0b8f: "e",
    0x0b90: "ai",
    0x0b92: "o", 0x0b93: "o",
    0x0b94: "ai",
  };
  if (vowelMap[c0]) return vowelMap[c0];

  // Consonant (0x0B95..0x0BB9): check next codepoint for vowel sign (uyir mei).
  if (c0 >= 0x0b95 && c0 <= 0x0bb9) {
    const c1 = trimmed.codePointAt(1) ?? 0;
    // Vowel signs: ா(BE) ி(BF) ீ(C0) ு(C1) ூ(C2) ெ(C6) ே(C7) ை(C8) ொ(CA) ோ(CB) ௌ(CC)
    const signMap: Record<number, VowelGroup> = {
      0x0bbe: "a", 0x0bbf: "a", 0x0bc0: "a",
      0x0bc1: "u", 0x0bc2: "u",
      0x0bc6: "e", 0x0bc7: "e",
      0x0bc8: "ai",
      0x0bca: "o", 0x0bcb: "o",
      0x0bcc: "ai",
    };
    if (signMap[c1]) return signMap[c1];
    return "a"; // bare consonant = implicit 'a'
  }

  // Fallback for Latin letters
  const s = trimmed.toLowerCase();
  if ("aeiou".includes(s[0])) {
    if ("a".includes(s[0])) return "a";
    if ("u".includes(s[0])) return "u";
    if ("e".includes(s[0])) return "e";
    if ("o".includes(s[0])) return "o";
  }
  return "a";
}

export function birthBirdFromName(name: string, paksha: Paksha): BirdKey {
  return BIRTH_BIRD[paksha][vowelGroupOf(name)];
}

// Friend/foe relations from the chart (சத்துரு / மித்ரு).
// Format: bird -> [sathru (enemies), mithru (friends)]
export const RELATIONS: Record<Paksha, Record<BirdKey, { enemies: BirdKey[]; friends: BirdKey[] }>> = {
  valarpirai: {
    vulture: { enemies: ["crow", "cock"], friends: ["peacock", "owl"] },
    owl:     { enemies: ["peacock", "cock"], friends: ["vulture", "crow"] },
    crow:    { enemies: ["vulture", "peacock"], friends: ["owl", "cock"] },
    cock:    { enemies: ["vulture", "owl"], friends: ["peacock", "crow"] },
    peacock: { enemies: ["owl", "crow"], friends: ["vulture", "cock"] },
  },
  theipirai: {
    cock:    { enemies: ["crow", "vulture"], friends: ["owl", "peacock"] },
    owl:     { enemies: ["vulture", "peacock"], friends: ["cock", "crow"] },
    peacock: { enemies: ["owl", "crow"], friends: ["cock", "vulture"] },
    crow:    { enemies: ["cock", "peacock"], friends: ["vulture", "owl"] },
    vulture: { enemies: ["cock", "owl"], friends: ["crow", "peacock"] },
  },
};
