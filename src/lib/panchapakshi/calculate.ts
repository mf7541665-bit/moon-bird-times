import * as Astronomy from "astronomy-engine";
import {
  activityFor,
  BIRD_ORDER,
  rulingBird,
  type ActivityKey,
  type BirdKey,
  type DayNight,
  type Paksha,
} from "./tables";
import {
  ascendantSiderealLon,
  birthBirdFromNakshatra,
  karanaOf,
  lahiriAyanamsa,
  moonRasi,
  moonSiderealLon,
  nakshatraOf,
  sunRasi,
  sunSiderealLon,
  yogaOf,
} from "./horoscope";



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
  /** Horoscope (Lahiri sidereal, computed at the birth instant) */
  horoscope: {
    nakshatra: { index: number; pada: number };
    moonRasi: number;
    sunRasi: number;
    lagna: { longitude: number; rasi: number };
    yoga: number;
    karana: { index: number; name: string };
    birthWeekday: number; // local weekday at birth
    ayanamsa: number;
    sunSiderealLon: number;
    moonSiderealLon: number;
  };
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

  // Birth-instant panchang (sidereal / Lahiri)
  const birthTithi = computeTithi(birthUtc);
  const birthPaksha: Paksha = birthTithi <= 15 ? "valarpirai" : "theipirai";
  const nak = nakshatraOf(birthUtc, input.latitude, input.longitude);
  const birthBird = birthBirdFromNakshatra(nak.index, birthPaksha);

  const lagnaLon = ascendantSiderealLon(birthUtc, input.latitude, input.longitude);
  const horoscope = {
    nakshatra: { index: nak.index, pada: nak.pada },
    moonRasi: moonRasi(birthUtc),
    sunRasi: sunRasi(birthUtc),
    lagna: { longitude: lagnaLon, rasi: Math.floor(lagnaLon / 30) },
    yoga: yogaOf(birthUtc).index,
    karana: karanaOf(birthUtc),
    birthWeekday: birthLocal.getDay(),
    ayanamsa: lahiriAyanamsa(birthUtc),
    sunSiderealLon: sunSiderealLon(birthUtc),
    moonSiderealLon: moonSiderealLon(birthUtc),
  };


  // Schedule for view-date (defaults to birth date, local at birth place)
  let startOfLocalDayUtc: Date;
  if (input.viewDateLocal) {
    const [y, m, d] = input.viewDateLocal.split("-").map(Number);
    startOfLocalDayUtc = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - input.tzOffsetMin * 60_000);
  } else {
    const bl = birthLocal;
    startOfLocalDayUtc = new Date(
      Date.UTC(bl.getUTCFullYear(), bl.getUTCMonth(), bl.getUTCDate(), 0, 0, 0) -
        input.tzOffsetMin * 60_000,
    );
  }

  const observer = new Astronomy.Observer(input.latitude, input.longitude, 0);
  const sunrise = findSunEvent(startOfLocalDayUtc, observer, +1);
  const sunset = findSunEvent(sunrise, observer, -1);
  const nextSunrise = findSunEvent(sunset, observer, +1);

  const tithi = computeTithi(sunrise);
  const paksha: Paksha = tithi <= 15 ? "valarpirai" : "theipirai";

  const localSunrise = new Date(sunrise.getTime() + input.tzOffsetMin * 60_000);
  const weekday = localSunrise.getUTCDay();

  const day = buildBlock(weekday, paksha, "day", sunrise, sunset);
  const night = buildBlock(weekday, paksha, "night", sunset, nextSunrise);

  return { birthBird, paksha, tithi, weekday, sunrise, sunset, nextSunrise, day, night, horoscope };
}

