// TYPES
export type BirdKey = "vulture" | "owl" | "crow" | "cock" | "peacock";
export type ActivityKey = "eat" | "walk" | "rule" | "sleep" | "die";
export type Paksha = "valarpirai" | "theipirai";
export type DayNight = "day" | "night";

// BIRDS
export const BIRDS: Record<BirdKey, { ta: string; en: string }> = {
  vulture: { ta: "வல்லூறு", en: "Vulture" },
  owl: { ta: "ஆந்தை", en: "Owl" },
  crow: { ta: "காகம்", en: "Crow" },
  cock: { ta: "கோழி", en: "Cock" },
  peacock: { ta: "மயில்", en: "Peacock" },
};

// ACTIVITIES
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

// ✅ CORRECT SEQUENCES (your input)
const SEQUENCES = {
  valarpirai: {
    day:   ["eat", "walk", "rule", "sleep", "die"],
    night: ["die", "walk", "sleep", "eat", "rule"]
  },
  theipirai: {
    day:   ["rule", "sleep", "die", "eat", "walk"],
    night: ["rule", "die", "walk", "sleep", "eat"]
  }
} as const;

// BIRD ORDER
export const BIRD_ORDER: Record<Paksha, BirdKey[]> = {
  valarpirai: ["vulture", "owl", "crow", "cock", "peacock"],
  theipirai:  ["cock", "owl", "crow", "peacock", "vulture"],
};

// STEP
const STEP: Record<Paksha, 1 | -1> = {
  valarpirai: 1,
  theipirai: -1,
};

// BASE VALUES
type BaseTable = { day: number; night: number };

const BASES: Record<Paksha, BaseTable[]> = {
  valarpirai: [
    { day: 0, night: 3 }, // Sun
    { day: 4, night: 4 }, // Mon
    { day: 0, night: 3 }, // Tue
    { day: 4, night: 4 }, // Wed
    { day: 3, night: 0 }, // Thu
    { day: 2, night: 1 }, // Fri
    { day: 1, night: 2 }, // Sat
  ],
  theipirai: [
    { day: 1, night: 4 }, // Sun
    { day: 3, night: 1 }, // Mon
    { day: 1, night: 4 }, // Tue
    { day: 4, night: 3 }, // Wed
    { day: 2, night: 2 }, // Thu
    { day: 0, night: 0 }, // Fri
    { day: 3, night: 1 }, // Sat
  ],
};



// =======================================================
// ✅ MAIN FUNCTION (FIXED)
// =======================================================

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

  // ✅ USE CORRECT SEQUENCE HERE
  const seq = SEQUENCES[paksha][dn];

  const idx = ((base + i + step * slotIdx) % 5 + 5) % 5;

  return seq[idx];
}



// =======================================================
// RULING BIRD
// =======================================================

export function rulingBird(
  weekday: number,
  paksha: Paksha,
  dn: DayNight
): BirdKey {

  const order = BIRD_ORDER[paksha];

  for (const b of order) {
    if (activityFor(weekday, paksha, dn, b, 0) === "rule") {
      return b;
    }
  }

  return order[0];
}



// =======================================================
// BIRTH BIRD LOGIC
// =======================================================

type VowelGroup = "a" | "u" | "e" | "o" | "ai";

const BIRTH_BIRD: Record<Paksha, Record<VowelGroup, BirdKey>> = {
  valarpirai: { a: "vulture", u: "owl", e: "crow", o: "cock", ai: "peacock" },
  theipirai:  { a: "vulture", u: "owl", e: "crow", o: "cock", ai: "peacock" },
};

export function vowelGroupOf(name: string): VowelGroup {
  const trimmed = name.trim();
  if (!trimmed) return "a";

  const c0 = trimmed.codePointAt(0)!;

  const vowelMap: Record<number, VowelGroup> = {
    0x0b85: "a", 0x0b86: "a", 0x0b87: "a", 0x0b88: "a",
    0x0b89: "u", 0x0b8a: "u",
    0x0b8e: "e", 0x0b8f: "e",
    0x0b90: "ai",
    0x0b92: "o", 0x0b93: "o",
    0x0b94: "ai",
  };

  if (vowelMap[c0]) return vowelMap[c0];

  if (c0 >= 0x0b95 && c0 <= 0x0bb9) {
    const c1 = trimmed.codePointAt(1) ?? 0;

    const signMap: Record<number, VowelGroup> = {
      0x0bbe: "a", 0x0bbf: "a", 0x0bc0: "a",
      0x0bc1: "u", 0x0bc2: "u",
      0x0bc6: "e", 0x0bc7: "e",
      0x0bc8: "ai",
      0x0bca: "o", 0x0bcb: "o",
      0x0bcc: "ai",
    };

    if (signMap[c1]) return signMap[c1];

    return "a";
  }

  const s = trimmed.toLowerCase();

  if ("aeiou".includes(s[0])) {
    if (s[0] === "a") return "a";
    if (s[0] === "u") return "u";
    if (s[0] === "e") return "e";
    if (s[0] === "o") return "o";
  }

  return "a";
}

export function birthBirdFromName(name: string, paksha: Paksha): BirdKey {
  return BIRTH_BIRD[paksha][vowelGroupOf(name)];
}



// =======================================================
// RELATIONS
// =======================================================

export const RELATIONS: Record<
  Paksha,
  Record<BirdKey, { enemies: BirdKey[]; friends: BirdKey[] }>
> = {
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
