import * as Astronomy from "astronomy-engine";
import {
  activityFor,
  BIRD_ORDER,
  birthBirdFromName,
  rulingBird,
  type ActivityKey,
  type BirdKey,
  type DayNight,
  type Paksha,
} from "./tables";

export interface BirthInput {
  name: string;
  /** ISO date-time in local time of birth-place */
  isoLocal: string;
  /** Timezone offset in minutes east of UTC at birth (e.g. +330 for IST) */
  tzOffsetMin: number;
  latitude: number;
  longitude: number;
}

export interface DayBlock {
  ruling: BirdKey;
  slots: {
    slotIdx: number;
    start: Date;
    end: Date;
    /** For each of the 5 birds, what activity they are performing during this slot */
    birdActivities: Record<BirdKey, ActivityKey>;
  }[];
}

export interface PanchapakshiResult {
  birthBird: BirdKey;
  paksha: Paksha;
  tithi: number;
  weekday: number; // 0=Sun..6=Sat in local timezone at sunrise
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
  day: DayBlock;
  night: DayBlock;
}

function computeTithi(date: Date): number {
  const sunLon = Astronomy.SunPosition(date).elon;
  const moonLon = Astronomy.EclipticLongitude(Astronomy.Body.Moon, date);
  const diff = ((moonLon - sunLon) % 360 + 360) % 360;
  return Math.floor(diff / 12) + 1; // 1..30
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

function buildBlock(
  weekday: number,
  paksha: Paksha,
  dn: DayNight,
  start: Date,
  end: Date,
): DayBlock {
  const totalMs = end.getTime() - start.getTime();
  const slotMs = totalMs / 5; // EQUAL time slots per reference chart
  const slots = Array.from({ length: 5 }, (_, j) => {
    const s = new Date(start.getTime() + slotMs * j);
    const e = new Date(start.getTime() + slotMs * (j + 1));
    const birdActivities = {} as Record<BirdKey, ActivityKey>;
    for (const b of BIRD_ORDER[paksha]) {
      birdActivities[b] = activityFor(weekday, paksha, dn, b, j);
    }
    return { slotIdx: j, start: s, end: e, birdActivities };
  });
  return { ruling: rulingBird(weekday, paksha, dn), slots };
}

export function computePanchapakshi(input: BirthInput): PanchapakshiResult {
  const local = new Date(input.isoLocal);
  const utc = new Date(local.getTime() - input.tzOffsetMin * 60_000);

  const tithi = computeTithi(utc);
  const paksha: Paksha = tithi <= 15 ? "valarpirai" : "theipirai";
  const birthBird = birthBirdFromName(input.name, paksha);

  const observer = new Astronomy.Observer(input.latitude, input.longitude, 0);

  // Find sunrise on the day of birth (most recent sunrise ≤ birth instant).
  let sunrise = findSunEvent(new Date(utc.getTime() - 26 * 3600_000), observer, +1);
  while (true) {
    const next = findSunEvent(new Date(sunrise.getTime() + 3600_000), observer, +1);
    if (next.getTime() <= utc.getTime()) sunrise = next;
    else break;
  }
  const sunset = findSunEvent(sunrise, observer, -1);
  const nextSunrise = findSunEvent(sunset, observer, +1);

  // Weekday in local timezone at sunrise (Panchapakshi day starts at sunrise).
  const localSunrise = new Date(sunrise.getTime() + input.tzOffsetMin * 60_000);
  const weekday = localSunrise.getUTCDay();

  const day = buildBlock(weekday, paksha, "day", sunrise, sunset);
  const night = buildBlock(weekday, paksha, "night", sunset, nextSunrise);

  return { birthBird, paksha, tithi, weekday, sunrise, sunset, nextSunrise, day, night };
}
