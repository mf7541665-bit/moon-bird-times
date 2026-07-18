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
  tzOffsetMin: z.number().int().min(-720).max(840).optional(),
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
    const geo = await geocode(data.place);
    // Default IST if not provided (most users). Better: derive from timezone db,
    // but longitude approximation works for a birth-chart precision.
    const tzOffsetMin = data.tzOffsetMin ?? 330;

    let hour24 = data.hour % 12;
    if (data.ampm === "PM") hour24 += 12;
    const iso = `${data.year.toString().padStart(4, "0")}-${data.month
      .toString()
      .padStart(2, "0")}-${data.day.toString().padStart(2, "0")}T${hour24
      .toString()
      .padStart(2, "0")}:${data.minute.toString().padStart(2, "0")}:00`;

    const result = computePanchapakshi({
      isoLocal: iso,
      tzOffsetMin,
      latitude: geo.lat,
      longitude: geo.lon,
    });

    // Serialize dates to ISO for transport
    const serializeBlock = (b: typeof result.day) => ({
      ruling: b.ruling,
      slots: b.slots.map((s) => ({
        activity: s.activity,
        start: s.start.toISOString(),
        end: s.end.toISOString(),
        birdActivities: s.birdActivities,
      })),
    });

    return {
      input: { ...data, geocoded: geo.display, tzOffsetMin },
      birthBird: result.birthBird,
      nakshatraIndex: result.nakshatra.index,
      paksha: result.paksha,
      tithi: result.tithi,
      sunrise: result.sunrise.toISOString(),
      sunset: result.sunset.toISOString(),
      nextSunrise: result.nextSunrise.toISOString(),
      day: serializeBlock(result.day),
      night: serializeBlock(result.night),
    };
  });

export type PanchapakshiApiResult = Awaited<ReturnType<typeof runPanchapakshi>>;
