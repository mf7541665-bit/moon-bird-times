// Sidereal (Lahiri / Chitrapaksha) horoscope helpers.
import * as Astronomy from "astronomy-engine";


// ─────────────────────────────────────────────────────────────
// Names
// ─────────────────────────────────────────────────────────────
export const NAKSHATRAS: { ta: string; en: string }[] = [
  { ta: "அசுவினி",         en: "Ashwini" },
  { ta: "பரணி",            en: "Bharani" },
  { ta: "கார்த்திகை",       en: "Krittika" },
  { ta: "ரோகிணி",          en: "Rohini" },
  { ta: "மிருகசீரிடம்",     en: "Mrigashira" },
  { ta: "திருவாதிரை",       en: "Ardra" },
  { ta: "புனர்பூசம்",        en: "Punarvasu" },
  { ta: "பூசம்",             en: "Pushya" },
  { ta: "ஆயில்யம்",         en: "Ashlesha" },
  { ta: "மகம்",              en: "Magha" },
  { ta: "பூரம்",             en: "Purva Phalguni" },
  { ta: "உத்திரம்",          en: "Uttara Phalguni" },
  { ta: "அஸ்தம்",            en: "Hasta" },
  { ta: "சித்திரை",           en: "Chitra" },
  { ta: "சுவாதி",            en: "Swati" },
  { ta: "விசாகம்",           en: "Vishakha" },
  { ta: "அனுஷம்",            en: "Anuradha" },
  { ta: "கேட்டை",            en: "Jyeshtha" },
  { ta: "மூலம்",             en: "Mula" },
  { ta: "பூராடம்",           en: "Purva Ashadha" },
  { ta: "உத்திராடம்",         en: "Uttara Ashadha" },
  { ta: "திருவோணம்",         en: "Shravana" },
  { ta: "அவிட்டம்",          en: "Dhanishtha" },
  { ta: "சதயம்",             en: "Shatabhisha" },
  { ta: "பூரட்டாதி",         en: "Purva Bhadrapada" },
  { ta: "உத்திரட்டாதி",      en: "Uttara Bhadrapada" },
  { ta: "ரேவதி",             en: "Revati" },
];

export const RASIS: { ta: string; en: string }[] = [
  { ta: "மேஷம்",    en: "Aries" },
  { ta: "ரிஷபம்",   en: "Taurus" },
  { ta: "மிதுனம்",  en: "Gemini" },
  { ta: "கடகம்",   en: "Cancer" },
  { ta: "சிம்மம்",  en: "Leo" },
  { ta: "கன்னி",   en: "Virgo" },
  { ta: "துலாம்",  en: "Libra" },
  { ta: "விருச்சிகம்", en: "Scorpio" },
  { ta: "தனுசு",  en: "Sagittarius" },
  { ta: "மகரம்",  en: "Capricorn" },
  { ta: "கும்பம்", en: "Aquarius" },
  { ta: "மீனம்",   en: "Pisces" },
];

export const YOGAS: { ta: string; en: string }[] = [
  { ta: "விஷ்கம்பம்", en: "Vishkambha" }, { ta: "பிரீதி", en: "Priti" },
  { ta: "ஆயுஷ்மான்", en: "Ayushman" }, { ta: "சௌபாக்யம்", en: "Saubhagya" },
  { ta: "சோபனம்", en: "Shobhana" }, { ta: "அதிகண்டம்", en: "Atiganda" },
  { ta: "சுகர்மம்", en: "Sukarma" }, { ta: "த்ருதி", en: "Dhriti" },
  { ta: "சூலம்", en: "Shula" }, { ta: "கண்டம்", en: "Ganda" },
  { ta: "விருத்தி", en: "Vriddhi" }, { ta: "த்ருவம்", en: "Dhruva" },
  { ta: "வியாகாதம்", en: "Vyaghata" }, { ta: "ஹர்ஷணம்", en: "Harshana" },
  { ta: "வஜ்ரம்", en: "Vajra" }, { ta: "சித்தி", en: "Siddhi" },
  { ta: "வ்யதீபாதம்", en: "Vyatipata" }, { ta: "வரியான்", en: "Variyan" },
  { ta: "பரிகம்", en: "Parigha" }, { ta: "சிவம்", en: "Shiva" },
  { ta: "சித்தம்", en: "Siddha" }, { ta: "சாத்யம்", en: "Sadhya" },
  { ta: "சுபம்", en: "Shubha" }, { ta: "சுக்லம்", en: "Shukla" },
  { ta: "பிராஹ்மம்", en: "Brahma" }, { ta: "ஐந்திரம்", en: "Indra" },
  { ta: "வைத்ருதி", en: "Vaidhriti" },
];

export const KARANAS_MOVABLE = [
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti (Bhadra)",
];
export const KARANAS_FIXED = ["Shakuni", "Chatushpada", "Naga", "Kimstughna"];

// ─────────────────────────────────────────────────────────────
// Ayanamsa (Lahiri approximation)
//   ≈ 23°51′40.5″ at J2000.0, precession ≈ 50.29″/yr.
//   Accurate to ~1′ over the modern era — well below one pada.
// ─────────────────────────────────────────────────────────────
export function lahiriAyanamsa(date: Date): number {
  // Chitrapaksha (Lahiri): 23°51'11.4" at J2000.0, precession ≈ 50.2879"/yr.
  const J2000ms = Date.UTC(2000, 0, 1, 12, 0, 0);
  const years = (date.getTime() - J2000ms) / (365.25 * 86400_000);
  return 23.85317 + years * (50.2879 / 3600);
}

function norm360(x: number) { return ((x % 360) + 360) % 360; }

export function sunSiderealLon(date: Date): number {
  const trop = Astronomy.SunPosition(date).elon;
  return norm360(trop - lahiriAyanamsa(date));
}
export function moonSiderealLon(date: Date): number {
  const trop = Astronomy.EclipticLongitude(Astronomy.Body.Moon, date);
  return norm360(trop - lahiriAyanamsa(date));
}

/** Topocentric apparent Moon ecliptic longitude (tropical, of date, degrees).
 *  Includes observer parallax (up to ~0.95° in longitude) — enough to shift
 *  a nakshatra pada near a boundary. */
function moonTropoOfDateTopocentric(
  date: Date, latDeg: number, lonDeg: number,
): number {
  const obs = new Astronomy.Observer(latDeg, lonDeg, 0);
  // ofdate=true → equator of date; aberration=true; observer arg adds parallax.
  const eq = Astronomy.Equator(Astronomy.Body.Moon, date, obs, true, true);
  const D = Math.PI / 180;
  const ra = eq.ra * 15 * D;   // hours → radians
  const dec = eq.dec * D;
  const eps = meanObliquity(date) * D;
  const sinL = Math.sin(ra) * Math.cos(eps) + Math.tan(dec) * Math.sin(eps);
  const cosL = Math.cos(ra);
  return norm360(Math.atan2(sinL, cosL) / D);
}

export function moonSiderealLonTopo(date: Date, lat: number, lon: number): number {
  return norm360(moonTropoOfDateTopocentric(date, lat, lon) - lahiriAyanamsa(date));
}

// ─────────────────────────────────────────────────────────────
// Nakshatra / Rasi / Yoga / Tithi / Karana
// ─────────────────────────────────────────────────────────────
export interface NakshatraInfo {
  index: number;      // 1..27
  pada: number;       // 1..4
  degreeInStar: number; // 0..13.333
  siderealLon: number;  // 0..360
}
const STAR = 360 / 27; // 13°20′
const PADA = STAR / 4; //  3°20′

/** Compute nakshatra & pada. If lat/lon are given, uses topocentric Moon
 *  (recommended for birth charts — geocentric can be off by up to one pada). */
export function nakshatraOf(date: Date, lat?: number, lon?: number): NakshatraInfo {
  const s = (lat !== undefined && lon !== undefined)
    ? moonSiderealLonTopo(date, lat, lon)
    : moonSiderealLon(date);
  const idx = Math.floor(s / STAR);       // 0..26
  const rem = s - idx * STAR;
  const pada = Math.min(4, Math.floor(rem / PADA) + 1);
  return { index: idx + 1, pada, degreeInStar: rem, siderealLon: s };
}

export function moonRasi(date: Date): number {
  return Math.floor(moonSiderealLon(date) / 30); // 0..11
}
export function sunRasi(date: Date): number {
  return Math.floor(sunSiderealLon(date) / 30);
}

export function yogaOf(date: Date): { index: number } {
  const s = sunSiderealLon(date);
  const m = moonSiderealLon(date);
  return { index: Math.floor(norm360(s + m) / STAR) + 1 }; // 1..27
}

/** Tithi 1..30 (1..15 = Shukla, 16..30 = Krishna). */
export function tithiOf(date: Date): number {
  const sunLon = Astronomy.SunPosition(date).elon;
  const moonLon = Astronomy.EclipticLongitude(Astronomy.Body.Moon, date);
  const diff = norm360(moonLon - sunLon);
  return Math.floor(diff / 12) + 1;
}

/** Karana name for the current half-tithi. */
export function karanaOf(date: Date): { index: number; name: string } {
  const sunLon = Astronomy.SunPosition(date).elon;
  const moonLon = Astronomy.EclipticLongitude(Astronomy.Body.Moon, date);
  const half = Math.floor(norm360(moonLon - sunLon) / 6); // 0..59
  if (half === 0) return { index: 0, name: "Kimstughna" };
  if (half === 57) return { index: 57, name: "Shakuni" };
  if (half === 58) return { index: 58, name: "Chatushpada" };
  if (half === 59) return { index: 59, name: "Naga" };
  return { index: half, name: KARANAS_MOVABLE[(half - 1) % 7] };
}

// ─────────────────────────────────────────────────────────────
// Lagna (Ascendant) — tropical then sidereal via Lahiri
// ─────────────────────────────────────────────────────────────
function meanObliquity(date: Date): number {
  // IAU 1980 mean obliquity of the ecliptic (arc-seconds).
  const T = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * 86400_000 * 100);
  const eps = 23 * 3600 + 26 * 60 + 21.448
    - 46.8150 * T - 0.00059 * T * T + 0.001813 * T * T * T;
  return eps / 3600; // degrees
}

export function ascendantSiderealLon(date: Date, latDeg: number, lonDeg: number): number {
  const gastHours = Astronomy.SiderealTime(date); // GAST hours
  const ramc = norm360(gastHours * 15 + lonDeg);   // Local Apparent Sidereal Time in degrees
  const eps = meanObliquity(date) * Math.PI / 180;
  const phi = latDeg * Math.PI / 180;
  const t = ramc * Math.PI / 180;

  let asc = Math.atan2(
    Math.cos(t),
    -(Math.sin(t) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps)),
  ) * 180 / Math.PI;
  asc = norm360(asc);
  // Ascendant must be within ~180° "ahead" of RAMC on the ecliptic.
  const diff = norm360(asc - ramc);
  if (diff < 90 || diff > 270) asc = norm360(asc + 180);
  return norm360(asc - lahiriAyanamsa(date));
}

// ─────────────────────────────────────────────────────────────
// Birth bird from nakshatra (Pancha Pakshi Shastra — Table 1)
//   1–5   Ashwini..Mrigashira      Vulture / Peacock
//   6–11  Ardra..Purva Phalguni    Owl     / Cock
//  12–16  Uttara Phalguni..Vishakha Crow   / Crow
//  17–21  Anuradha..Uttara Ashadha  Cock   / Owl
//  22–27  Shravana..Revati         Peacock / Vulture
// ─────────────────────────────────────────────────────────────
// types
export type BirdKey =
  | "vulture"
  | "owl"
  | "crow"
  | "cock"
  | "peacock";

export type Paksha = "valarpirai" | "theipirai";


// Nakshatra → Janma Pakshi
// 27 Nakshatras order:
// Ashwini to Revathi

const BIRD_BY_NAK: BirdKey[] = [

  // 1 - 5
  // Ashwini, Bharani, Karthigai, Rohini, Mrigashirsha
  "vulture",
  "vulture",
  "vulture",
  "vulture",
  "vulture",

  // 6 - 11
  // Thiruvathirai, Punarpoosam, Poosam, Ayilyam, Magam, Pooram
  "owl",
  "owl",
  "owl",
  "owl",
  "owl",
  "owl",

  // 12 - 16
  // Uthiram, Hastham, Chithirai, Swathi, Vishakam
  "crow",
  "crow",
  "crow",
  "crow",
  "crow",

  // 17 - 21
  // Anusham, Kettai, Moolam, Pooradam, Uthiradam
  "cock",
  "cock",
  "cock",
  "cock",
  "cock",

  // 22 - 27
  // Thiruvonam, Avittam, Sathayam, Poorattathi, Uthirattathi, Revathi
  "peacock",
  "peacock",
  "peacock",
  "peacock",
  "peacock",
  "peacock",
];


// Janma Pakshi calculation
// Paksha is NOT used here.
// Same bird for Valarpirai + Theipirai.

export function birthBirdFromNakshatra(
  nakIndex: number,
  _paksha: Paksha
): BirdKey {

  const index = Math.max(
    0,
    Math.min(26, nakIndex - 1)
  );

  return BIRD_BY_NAK[index];
}
