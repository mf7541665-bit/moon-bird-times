import * as Astronomy from "astronomy-engine";
import {
  DURATIONS,
  BIRD_CYCLE,
  activityForBird,
  birthBirdFromNakshatra,
  rulingBird,
  sequenceForRuling,
  type ActivityKey,
  type BirdKey,
  type DayNight,
  type Paksha,
} from "./tables";

export interface BirthInput {
  /** ISO date-time in local time of birth-place */
  isoLocal: string;
  /** Timezone offset in minutes east of UTC at birth (e.g. +330 for IST) */
  tzOffsetMin: number;
  latitude: number;
  longitude: number;
}

export interface ActivityBlock {
  activity: ActivityKey;
  bird: BirdKey; // the bird performing this activity
  start: Date;
  end: Date;
}

export interface DayBlock {
  ruling: BirdKey;
  slots: {
    activity: ActivityKey; // ruling bird's activity for this slot
    start: Date;
    end: Date;
    /** For each of the 5 birds, what activity they are performing during this slot */
    birdActivities: Record<BirdKey, ActivityKey>;
  }[];
}

export interface PanchapakshiResult {
  birthBird: BirdKey;
  nakshatra: { index: number };
  paksha: Paksha;
  tithi: number;
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
  day: DayBlock;
  night: DayBlock;
}

/** Compute lunar tithi (1..30) at given UTC date. */
function computeTithi(date: Date): number {
  const sunLon = Astronomy.EclipticLongitude(Astronomy.Body.Sun, date);
  const moonLon = Astronomy.EclipticLongitude(Astronomy.Body.Moon, date);
  const diff = ((moonLon - sunLon) % 360 + 360) % 360;
  return Math.floor(diff / 12) + 1; // 1..30
}

/** Compute nakshatra index (0..26) using moon's sidereal longitude (Lahiri ayanamsa). */
function computeNakshatra(date: Date): number {
  const moonTropical = Astronomy.EclipticLongitude(Astronomy.Body.Moon, date);
  // Lahiri ayanamsa approximate (degrees) at given year
  const year = date.getUTCFullYear() + (date.getUTCMonth() / 12);
  // Formula: ayanamsa ≈ 23.85 + (year - 2000) * (50.29 / 3600)
  const ayanamsa = 23.85 + (year - 2000) * (50.29 / 3600);
  const sidereal = ((moonTropical - ayanamsa) % 360 + 360) % 360;
  return Math.floor(sidereal / (360 / 27));
}

function findSunEvent(
  after: Date,
  observer: Astronomy.Observer,
  direction: 1 | -1,
): Date {
  const evt = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, direction, after, 2);
  if (!evt) throw new Error("Could not compute sun event");
  return evt.date;
}

function buildSlots(
  ruling: BirdKey,
  paksha: Paksha,
  dn: DayNight,
  start: Date,
  end: Date,
): DayBlock {
  const seq = sequenceForRuling(paksha, dn);
  const totalMs = end.getTime() - start.getTime();
  // Weighted by nazhigai of ruling bird's own activity in each slot.
  const weights = seq.map((a) => DURATIONS[ruling][a]);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let cursor = start.getTime();
  const slots = seq.map((activity, i) => {
    const dur = (weights[i] / totalWeight) * totalMs;
    const s = new Date(cursor);
    const e = new Date(cursor + dur);
    cursor += dur;
    const birdActivities = {} as Record<BirdKey, ActivityKey>;
    for (const b of BIRD_CYCLE) {
      birdActivities[b] = activityForBird(ruling, activity, b);
    }
    return { activity, start: s, end: e, birdActivities };
  });
  return { ruling, slots };
}

export function computePanchapakshi(input: BirthInput): PanchapakshiResult {
  // Convert local birth time to a UTC Date
  const local = new Date(input.isoLocal);
  // Treat isoLocal as if it were UTC then subtract tz offset to get real UTC:
  const utc = new Date(local.getTime() - input.tzOffsetMin * 60_000);

  const nakIdx = computeNakshatra(utc);
  const tithi = computeTithi(utc);
  const paksha: Paksha = tithi <= 15 ? "valarpirai" : "theipirai";
  const birthBird = birthBirdFromNakshatra(nakIdx, paksha);

  const observer = new Astronomy.Observer(input.latitude, input.longitude, 0);

  // Sunrise on birth date (in local timezone); we search sunrise before/after birth
  let sunrise = findSunEvent(new Date(utc.getTime() - 24 * 3600_000), observer, +1);
  if (sunrise.getTime() > utc.getTime()) {
    sunrise = findSunEvent(new Date(sunrise.getTime() - 48 * 3600_000), observer, +1);
  }
  // Ensure sunrise is the most recent sunrise before or equal to birth
  while (true) {
    const next = findSunEvent(new Date(sunrise.getTime() + 3600_000), observer, +1);
    if (next.getTime() <= utc.getTime()) sunrise = next;
    else break;
  }
  const sunset = findSunEvent(sunrise, observer, -1);
  const nextSunrise = findSunEvent(sunset, observer, +1);

  const wd = ((sunrise.getUTCDay() + Math.floor((sunrise.getTime() + input.tzOffsetMin * 60_000) / 86_400_000) - Math.floor(sunrise.getTime() / 86_400_000)) + 7) % 7;
  // Simpler: get weekday in local tz
  const localSunrise = new Date(sunrise.getTime() + input.tzOffsetMin * 60_000);
  const weekday = localSunrise.getUTCDay();

  const dayRuler = rulingBird(weekday, paksha, "day");
  const nightRuler = rulingBird(weekday, paksha, "night");

  const day = buildSlots(dayRuler, paksha, "day", sunrise, sunset);
  const night = buildSlots(nightRuler, paksha, "night", sunset, nextSunrise);

  return {
    birthBird,
    nakshatra: { index: nakIdx },
    paksha,
    tithi,
    sunrise,
    sunset,
    nextSunrise,
    day,
    night,
  };
}
