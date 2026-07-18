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
  /** Optional: view date (yyyy-mm-dd, local at birth place) to compute schedule for.
   *  Defaults to the birth date itself. */
  viewDateLocal?: string;
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
  const birthLocal = new Date(input.isoLocal);
  const birthUtc = new Date(birthLocal.getTime() - input.tzOffsetMin * 60_000);

  // Birth bird from birth-date paksha
  const birthTithi = computeTithi(birthUtc);
  const birthPaksha: Paksha = birthTithi <= 15 ? "valarpirai" : "theipirai";
  const birthBird = birthBirdFromName(input.name, birthPaksha);

  // Schedule is computed for the view-date (defaults to birth date)
  const viewLocalIso = input.viewDateLocal
    ? `${input.viewDateLocal}T06:00:00`
    : input.isoLocal;
  const viewLocal = new Date(viewLocalIso);
  const viewUtc = new Date(viewLocal.getTime() - input.tzOffsetMin * 60_000);

  const observer = new Astronomy.Observer(input.latitude, input.longitude, 0);

  // Find sunrise on the view day (most recent sunrise ≤ view instant).
  let sunrise = findSunEvent(new Date(viewUtc.getTime() - 26 * 3600_000), observer, +1);
  while (true) {
    const next = findSunEvent(new Date(sunrise.getTime() + 3600_000), observer, +1);
    if (next.getTime() <= viewUtc.getTime()) sunrise = next;
    else break;
  }
  const sunset = findSunEvent(sunrise, observer, -1);
  const nextSunrise = findSunEvent(sunset, observer, +1);

  // Tithi/paksha for schedule: at sunrise of view day
  const tithi = computeTithi(sunrise);
  const paksha: Paksha = tithi <= 15 ? "valarpirai" : "theipirai";

  const localSunrise = new Date(sunrise.getTime() + input.tzOffsetMin * 60_000);
  const weekday = localSunrise.getUTCDay();

  const day = buildBlock(weekday, paksha, "day", sunrise, sunset);
  const night = buildBlock(weekday, paksha, "night", sunset, nextSunrise);

  return { birthBird, paksha, tithi, weekday, sunrise, sunset, nextSunrise, day, night };
}
