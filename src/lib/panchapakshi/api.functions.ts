import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { computePanchapakshi } from "./calculate";

const InputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  gender: z.enum(["male", "female"]),
  day: z.number().int().min(1).max(31),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(1900).max(2100),
  hour: z.number().int().min(1).max(12),
  minute: z.number().int().min(0).max(59),
  ampm: z.enum(["AM", "PM"]),
  place: z.string().trim().min(1).max(200),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  tzOffsetMin: z.number().int().min(-720).max(840).optional(),
  viewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type PanchapakshiInput = z.infer<typeof InputSchema>;

async function geocode(place: string): Promise<{ lat: number; lon: number; display: string }> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "PanchapakshiApp/1.0 (lovable)" },
  });
  if (!res.ok) throw new Error("Geocoding failed");
  const rows = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  if (!rows.length) throw new Error(`Place not found: ${place}`);
  return { lat: parseFloat(rows[0].lat), lon: parseFloat(rows[0].lon), display: rows[0].display_name };
}

export const runPanchapakshi = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const geo =
      data.latitude != null && data.longitude != null
        ? { lat: data.latitude, lon: data.longitude, display: data.place }
        : await geocode(data.place);
    // Timezone: use provided; else India-band gets IST; else approximate from longitude.
    const inIndia = geo.lat >= 6 && geo.lat <= 37 && geo.lon >= 68 && geo.lon <= 98;
    const tzOffsetMin =
      data.tzOffsetMin ?? (inIndia ? 330 : Math.round((geo.lon / 15) * 2) * 30);

    let hour24 = data.hour % 12;
    if (data.ampm === "PM") hour24 += 12;
    const iso = `${data.year.toString().padStart(4, "0")}-${data.month
      .toString()
      .padStart(2, "0")}-${data.day.toString().padStart(2, "0")}T${hour24
      .toString()
      .padStart(2, "0")}:${data.minute.toString().padStart(2, "0")}:00`;

    const result = computePanchapakshi({
      name: data.name,
      isoLocal: iso,
      tzOffsetMin,
      latitude: geo.lat,
      longitude: geo.lon,
      viewDateLocal: data.viewDate,
    });

    const serializeBlock = (b: typeof result.day) => ({
      ruling: b.ruling,
      slots: b.slots.map((s) => ({
        slotIdx: s.slotIdx,
        start: s.start.toISOString(),
        end: s.end.toISOString(),
        birdActivities: s.birdActivities,
      })),
    });

    return {
      input: { ...data, geocoded: geo.display, tzOffsetMin },
      birthBird: result.birthBird,
      paksha: result.paksha,
      tithi: result.tithi,
      weekday: result.weekday,
      sunrise: result.sunrise.toISOString(),
      sunset: result.sunset.toISOString(),
      nextSunrise: result.nextSunrise.toISOString(),
      day: serializeBlock(result.day),
      night: serializeBlock(result.night),
      horoscope: result.horoscope,
    };
  });


export type PanchapakshiApiResult = Awaited<ReturnType<typeof runPanchapakshi>>;
