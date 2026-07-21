import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { User, Users, Calendar, Clock, MapPin, Loader2, Sparkles, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { runPanchapakshi, type PanchapakshiApiResult, type PanchapakshiInput } from "@/lib/panchapakshi/api.functions";
import { BIRDS, ACTIVITIES, type ActivityKey, type BirdKey } from "@/lib/panchapakshi/tables";
import { NAKSHATRAS, RASIS, YOGAS } from "@/lib/panchapakshi/horoscope";
import heroImg from "@/assets/panchapakshi-hero.jpg";
import { searchOfflinePlaces, formatOfflinePlace, type OfflinePlace } from "@/lib/panchapakshi/places";
import { CircularTimePicker } from "@/components/panchapakshi/CircularTimePicker";
import { PadupatchiCard } from "@/components/panchapakshi/PadupatchiCard";


export const Route = createFileRoute("/")({
  component: PanchapakshiPage,
});

const BIRD_EMOJI: Record<BirdKey, string> = {
  vulture: "🦅",
  owl: "🦉",
  crow: "🐦‍⬛",
  cock: "🐓",
  peacock: "🦚",
};

// Activity → semantic color (green = auspicious, red = inauspicious, amber = neutral)
const ACT_COLOR: Record<ActivityKey, string> = {
  eat: "text-emerald-700",
  walk: "text-emerald-700",
  rule: "text-emerald-700",
  sleep: "text-orange-600",
  die: "text-red-600",
};
const ACT_UNDERLINE: Record<ActivityKey, string> = {
  eat: "bg-emerald-600",
  walk: "bg-emerald-600",
  rule: "bg-emerald-600",
  sleep: "bg-orange-500",
  die: "bg-red-600",
};

function todayLocalYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function shiftYmd(ymd: string, days: number) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = (dt.getMonth() + 1).toString().padStart(2, "0");
  const dd = dt.getDate().toString().padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

type Screen = "form" | "info" | "activities" | "detail";
type Selected = { block: "day" | "night"; slotIdx: number } | null;

function PanchapakshiPage() {
  const runFn = useServerFn(runPanchapakshi);
  const mut = useMutation({ mutationFn: (data: PanchapakshiInput) => runFn({ data }) });

  const [screen, setScreen] = useState<Screen>("form");
  const [dayNight, setDayNight] = useState<"day" | "night">("day");
  const [selected, setSelected] = useState<Selected>(null);

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [hour, setHour] = useState("6");
  const [minute, setMinute] = useState("0");
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [place, setPlace] = useState("");
  const [placeCoords, setPlaceCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [viewDate, setViewDate] = useState<string>(todayLocalYmd());

  function submit(vd: string, advance: boolean) {
    mut.mutate(
      {
        name, gender,
        day: parseInt(day, 10),
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        hour: parseInt(hour, 10),
        minute: parseInt(minute, 10),
        ampm, place,
        latitude: placeCoords?.lat,
        longitude: placeCoords?.lon,
        viewDate: vd,
      },
      { onSuccess: () => { if (advance) setScreen("info"); } },
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(viewDate, true);
  }

  function onViewDateChange(v: string) {
    setViewDate(v);
    if (mut.data) submit(v, false);
  }

  const data = mut.data;

  if (screen === "form" || !data) {
    return (
      <FormScreen
        onSubmit={onSubmit}
        pending={mut.isPending}
        error={mut.isError ? (mut.error as Error).message : null}
        {...{ name, setName, gender, setGender, day, setDay, month, setMonth, year, setYear, hour, setHour, minute, setMinute, ampm, setAmpm, place, setPlace, placeCoords, setPlaceCoords }}
      />
    );
  }

  if (screen === "info") {
    return (
      <InfoScreen
        data={data}
        name={name}
        place={place}
        viewDate={viewDate}
        onViewDateChange={onViewDateChange}
        pending={mut.isPending}
        onBack={() => setScreen("form")}
        onNext={() => setScreen("activities")}
      />
    );
  }

  if (screen === "activities") {
    return (
      <ActivitiesScreen
        data={data}
        viewDate={viewDate}
        onViewDateChange={onViewDateChange}
        pending={mut.isPending}
        dayNight={dayNight}
        setDayNight={setDayNight}
        onBack={() => setScreen("info")}
        onOpenSlot={(slotIdx) => { setSelected({ block: dayNight, slotIdx }); setScreen("detail"); }}
      />
    );
  }

  // detail
  return (
    <DetailScreen
      data={data}
      selected={selected!}
      onBack={() => setScreen("activities")}
    />
  );
}

/* ============================================================
 *  SCREEN 1 — Form
 * ============================================================ */
function FormScreen(props: {
  onSubmit: (e: React.FormEvent) => void;
  pending: boolean;
  error: string | null;
  name: string; setName: (v: string) => void;
  gender: "male" | "female"; setGender: (v: "male" | "female") => void;
  day: string; setDay: (v: string) => void;
  month: string; setMonth: (v: string) => void;
  year: string; setYear: (v: string) => void;
  hour: string; setHour: (v: string) => void;
  minute: string; setMinute: (v: string) => void;
  ampm: "AM" | "PM"; setAmpm: (v: "AM" | "PM") => void;
  place: string; setPlace: (v: string) => void;
  placeCoords: { lat: number; lon: number } | null;
  setPlaceCoords: (v: { lat: number; lon: number } | null) => void;
}) {
  const { onSubmit, pending, error } = props;
  return (
    <main className="min-h-screen bg-background">
      <TopBar title="Pancha Pakshi Form" />
      <div className="mx-auto max-w-2xl px-4 -mt-6 pb-16">
        <div className="rounded-3xl bg-card shadow-xl p-6 sm:p-8 border border-border/60">
          <form onSubmit={onSubmit} className="space-y-6">
            <Field label="பெயர்">
              <IconInput icon={<User className="h-5 w-5" />}>
                <input required value={props.name} onChange={(e) => props.setName(e.target.value)} placeholder="பெயரை உள்ளிடவும்" className="w-full bg-transparent outline-none text-sm" maxLength={100} />
              </IconInput>
            </Field>

            <Field label="பாலினம்">
              <div className="flex items-center gap-6">
                <Users className="h-5 w-5 text-muted-foreground" />
                <Radio checked={props.gender === "male"} onChange={() => props.setGender("male")} label="ஆண்" />
                <Radio checked={props.gender === "female"} onChange={() => props.setGender("female")} label="பெண்" />
              </div>
            </Field>

            <Field label="பிறந்த தேதி">
              <div className="flex items-center gap-3">
  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />

  {/* Day */}
  <select
    value={props.day}
    onChange={(e) => props.setDay(e.target.value)}
    className="border rounded px-2 py-1"
  >
    {[...Array(31)].map((_, i) => (
      <option key={i + 1} value={i + 1}>
        {i + 1}
      </option>
    ))}
  </select>

  {/* Month */}
  <select
    value={props.month}
    onChange={(e) => props.setMonth(e.target.value)}
    className="border rounded px-2 py-1"
  >
    {[...Array(12)].map((_, i) => (
      <option key={i + 1} value={i + 1}>
        {i + 1}
      </option>
    ))}
  </select>

  {/* Year */}
  <select
    value={props.year}
    onChange={(e) => props.setYear(e.target.value)}
    className="border rounded px-2 py-1"
  >
    {Array.from({ length: 201 }, (_, i) => 2026 - i).map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>
</div>
            </Field>
<Field label="பிறந்த நேரம்">
  <CircularTimePicker
    hour={props.hour}
    minute={props.minute}
    ampm={props.ampm}
    setHour={props.setHour}
    setMinute={props.setMinute}
    setAmpm={props.setAmpm}
  />
</Field>

            <Field label="பிறந்த இடம்">
              <PlaceAutocomplete
                value={props.place}
                onChange={(v) => { props.setPlace(v); props.setPlaceCoords(null); }}
                onSelect={(s) => { props.setPlace(s.display); props.setPlaceCoords({ lat: s.lat, lon: s.lon }); }}
                selected={props.placeCoords}
              />
            </Field>

            <div className="flex justify-center pt-2">
              <button type="submit" disabled={pending} className="btn-brand rounded-full px-10 py-3 font-bold disabled:opacity-60 inline-flex items-center gap-2">
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Submit
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!pending && !error && (
          <img src={heroImg} alt="Five sacred birds of Panchapakshi Shastra" className="mt-10 mx-auto max-w-sm w-full opacity-90" width={1024} height={1024} loading="lazy" />
        )}
      </div>
    </main>
  );
}

/* ============================================================
 *  SCREEN 2 — Bird info + date navigator
 * ============================================================ */
function InfoScreen({ data, name, place, viewDate, onViewDateChange, pending, onBack, onNext }: {
  data: PanchapakshiApiResult; name: string; place: string;
  viewDate: string; onViewDateChange: (v: string) => void; pending: boolean;
  onBack: () => void; onNext: () => void;
}) {
  const bird = BIRDS[data.birthBird];
  const todayYmd = todayLocalYmd();
  return (
    <main className="min-h-screen bg-background pb-24">
      <TopBar title="பஞ்சபக்ஷி" onBack={onBack} />
      <DateNavigator viewDate={viewDate} onViewDateChange={onViewDateChange} pending={pending} isToday={viewDate === todayYmd} />

      <div className="mx-auto max-w-2xl px-5 mt-8">
        <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-6">
          <h2 className="text-center text-lg font-bold mb-6" style={{ color: "var(--brand-deep)" }}>நடப்பு பட்சி</h2>

          <div className="flex items-center justify-center gap-3 mb-6">
            <span className={`inline-block h-3.5 w-3.5 rounded-full ${data.paksha === "valarpirai" ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className="font-bold">
              {data.paksha === "valarpirai" ? "வளர் பிறை" : "தேய் பிறை"} பகல்
            </span>
          </div>

          <dl className="divide-y divide-border/60 text-sm">
            <InfoRow label="பெயர்" value={name} />
            <InfoRow label="பிறந்த இடம்" value={place} />
            <InfoRow label="ஜென்ம நட்சத்திரம்" value={`${NAKSHATRAS[data.horoscope.nakshatra.index - 1].ta} (${NAKSHATRAS[data.horoscope.nakshatra.index - 1].en}) `} />
            <InfoRow label="ஜென்ம பட்சி" value={`${BIRD_EMOJI[data.birthBird]} ${bird.ta}`} />
            <InfoRow label="பிறப்பு பக்ஷம்" value={data.paksha === "valarpirai" ? "சுக்ல பக்ஷம் (வளர் பிறை)" : "க்ருஷ்ண பக்ஷம் (தேய் பிறை)"} />
            <InfoRow label="வாரம்" value={["ஞாயிறு","திங்கள்","செவ்வாய்","புதன்","வியாழன்","வெள்ளி","சனி"][data.weekday]} />
            <InfoRow label="சூரிய உதயம்" value={fmtTime(data.sunrise, data.input.tzOffsetMin)} />
            <InfoRow label="சூரிய அஸ்தமனம்" value={fmtTime(data.sunset, data.input.tzOffsetMin)} />
          </dl>

        </div>

        <div className="mt-6">
          <PadupatchiCard data={data} />
        </div>

        <button
          onClick={onNext}
          className="btn-brand mt-8 w-full rounded-full py-3 font-bold inline-flex items-center justify-center gap-2"
        >
          பட்சியின் நிலைகள் <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,7rem)_auto_minmax(0,1fr)] items-start gap-3 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <span className="text-muted-foreground">:</span>
      <dd className="min-w-0 font-semibold" style={{ color: "var(--brand-deep)" }}>{value}</dd>
    </div>
  );
}

/* ============================================================
 *  SCREEN 3 — Activity cards (Pakal / Iravu toggle)
 * ============================================================ */
function ActivitiesScreen({
  data,
  viewDate,
  onViewDateChange,
  pending,
  dayNight,
  setDayNight,
  onBack,
  onOpenSlot
}: {
  data: PanchapakshiApiResult;
  viewDate: string;
  onViewDateChange: (v: string) => void;
  pending: boolean;
  dayNight: "day" | "night";
  setDayNight: (v: "day" | "night") => void;
  onBack: () => void;
  onOpenSlot: (slotIdx: number) => void;
}) {
  const block = dayNight === "day" ? data.day : data.night;

  const tz = data.input.tzOffsetMin;
  const birthBird = data.birthBird;

  // ✅ 4 COMBINATION SEQUENCE
  const SEQUENCES = {
    valarpirai: {
      day:   ["eat", "walk", "rule", "sleep", "die"],
      night: ["die", "walk", "sleep", "eat", "rule"]
    },
    theipirai: {
      day:   ["walk", "eat", "die", "sleep", "rule"],
      night: ["eat", "sleep", "walk", "die", "rule"]
    }
  };

  // 👉 Pick correct sequence
  const SEQ =
    SEQUENCES[data.paksha === "valarpirai" ? "valarpirai" : "theipirai"][dayNight];

  const startIndex = 0;


  // ✅ Apply sequence rotation
  const slots = (block.slots || []).map((s, i) => {
    const activity = SEQ[(startIndex + i) % 5];

    return {
      ...s,
      activity,
      birdActivity: s?.birdActivities?.[birthBird] ?? activity
    };
  });

  return (
    <main className="min-h-screen bg-background pb-24">
      <TopBar title="பட்சியின் நிலைகள்" onBack={onBack} />

      <div className="mx-auto max-w-2xl px-5 mt-6">
        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <Toggle active={dayNight === "day"} onClick={() => setDayNight("day")} label="பகல்" />
          <Toggle active={dayNight === "night"} onClick={() => setDayNight("night")} label="இரவு" />
        </div>

        {/* Date + Paksha */}
        <div className="text-center mb-4 text-xs text-muted-foreground">
          {viewDate.split("-").reverse().join("-")} ·{" "}
          {data.paksha === "valarpirai" ? "வளர் பிறை" : "தேய் பிறை"}
        </div>

        {/* Slots */}
        <div className="rounded-3xl bg-rose-50/60 border border-rose-100 p-4">
          <div className="grid grid-cols-2 gap-4">
            {slots.map((s, i) => {
              const isCenter = i === 2;

              return (
                <button
                  key={i}
                  onClick={() => onOpenSlot(i)}
                  className={`text-center py-3 ${isCenter ? "col-span-2" : ""}`}
                >
                  <ActivityLabel activity={s.birdActivity} />

                  <p className="mt-2 text-xs font-medium text-foreground">
                    {fmtTime(s.start, tz)} - {fmtTime(s.end, tz)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loader */}
        {pending && (
          <div className="mt-4 flex justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Info */}
        <div className="mt-6 rounded-2xl border border-border/60 bg-card p-4 text-xs text-muted-foreground leading-relaxed">
          <p>
            <b style={{ color: "var(--brand-deep)" }}>
              {BIRD_EMOJI[birthBird]} {BIRDS[birthBird].ta}
            </b>{" "}
            — உங்கள் ஜென்ம பட்சி. மேலே காட்டப்பட்ட{" "}
            {dayNight === "day" ? "பகல்" : "இரவு"} ·{" "}
            {data.paksha === "valarpirai" ? "வளர் பிறை" : "தேய் பிறை"} செயல்பாடு.
          </p>

          <p className="mt-2">
            ஒரு நிலையை தட்டி உள்ளிட்டு சூட்சம பட்சி காணவும்.
          </p>
        </div>

        {/* Change date */}
        <button
          onClick={onBack}
          className="mt-6 w-full rounded-full py-2.5 text-sm border border-input font-semibold"
        >
          தேதி மாற்று
        </button>

        <div className="mt-3">
          <DateNavigatorInline
            viewDate={viewDate}
            onViewDateChange={onViewDateChange}
            pending={pending}
          />
        </div>
      </div>
    </main>
  );
}

function ActivityLabel({ activity }: { activity: ActivityKey }) {
  const a = ACTIVITIES[activity];
  return (
    <div className="inline-flex flex-col items-center">
      <div className="inline-flex items-center gap-1">
        <span className={`text-xl font-bold ${ACT_COLOR[activity]}`}>{a.ta}</span>
        <span className={`text-sm ${ACT_COLOR[activity]}`}>▼</span>
      </div>
      <span className={`mt-1 block h-0.5 w-16 rounded-full ${ACT_UNDERLINE[activity]}`} />
    </div>
  );
}

function Toggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-2 border ${active ? "bg-sky-100 border-sky-200" : "bg-secondary border-border"}`}
    >
      <span className={`h-5 w-5 rounded-full border-2 grid place-items-center ${active ? "" : "border-input"}`} style={active ? { borderColor: "var(--brand-deep)" } : undefined}>
        {active && <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--brand-deep)" }} />}
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

/* ============================================================
 *  SCREEN 4 — Sub-slot (சூட்சம பட்சி) detail
 * ============================================================ */
function DetailScreen({
  data,
  selected,
  onBack,
}: {
  data: PanchapakshiApiResult;
  selected: NonNullable<Selected>;
  onBack: () => void;
}) {
  const block = selected.block === "day" ? data.day : data.night;
  const slot = block.slots[selected.slotIdx];

  const tz = data.input.tzOffsetMin;
  const birthBird = data.birthBird;
  const mainAct = slot.birdActivities[birthBird];

  // ✅ Paksha
  const paksha = data.paksha as "valarpirai" | "theipirai";

  // ✅ Day / Night
  const dayType = selected.block as "day" | "night";

  // ✅ Correct Sub-Order
  const SUB_ORDERS = {
    valarpirai: ["eat", "walk", "rule", "sleep", "die"],
    theipirai: ["sleep", "walk", "die", "rule", "eat"],
  } as const;

  const SUB_ORDER: readonly ActivityKey[] = SUB_ORDERS[paksha];

  // ✅ Exact Minutes (Replace with your chart values if needed)
  const SUB_DURATION_MINUTES: Record<
    "valarpirai" | "theipirai",
    Record<"day" | "night", number[]>
  > = {
    valarpirai: {
      day: [30, 36, 48, 18, 12],
      night: [30, 30, 24, 24, 36],
    },
    theipirai: {
      day: [12, 36, 30, 18, 48],
      night: [18, 42, 24, 18, 42],
    },
  };

  const DURATIONS = SUB_DURATION_MINUTES[paksha][dayType];

  // ✅ Generate Sub Slots using MINUTES
  let cursor = new Date(slot.start).getTime();

  const subSlots = SUB_ORDER.map((act, i) => {
    const start = new Date(cursor);

    cursor += DURATIONS[i] * 60 * 1000; // ✅ minutes → milliseconds

    const end = new Date(cursor);

    return {
      activity: act,
      start,
      end,
    };
  });

  // ✅ Optional validation (VERY IMPORTANT)
  const totalSlotMinutes =
    (new Date(slot.end).getTime() -
      new Date(slot.start).getTime()) /
    60000;

  const sum = DURATIONS.reduce((a, b) => a + b, 0);

  if (Math.abs(sum - totalSlotMinutes) > 0.5) {
    console.warn(
      "⚠️ Sub-slot minutes mismatch. Check your Panchapakshi table values."
    );
  }

  return (
    <main className="min-h-screen bg-background pb-16">
      <TopBar title="பட்சியின் நிலைகள்" onBack={onBack} />

      <div className="mx-auto max-w-2xl px-5 mt-6">
        <div className="rounded-3xl bg-rose-50/60 border border-rose-100 p-5">
          <div className="rounded-xl bg-rose-100 py-2 text-center">
            <span className="text-lg font-bold" style={{ color: "var(--brand-deep)" }}>சூட்சம பட்சி</span>
          </div>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            முதன்மை நிலை: <b className={ACT_COLOR[mainAct]}>{ACTIVITIES[mainAct].ta}</b>{" "}
            · {fmtTime(slot.start.toString(), tz)} – {fmtTime(slot.end.toString(), tz)}
          </div>

          <div className="mt-5 space-y-4">
            {subSlots.map((s, i) => (
              <div key={i}>
                <div className="inline-flex items-center gap-1">
                  <span className={`text-lg font-bold ${ACT_COLOR[s.activity]}`}>{ACTIVITIES[s.activity].ta}</span>
                </div>
                <p className="text-sm text-foreground/80 mt-0.5">
                  {fmtTimeSec(s.start.toISOString(), tz)} - {fmtTimeSec(s.end.toISOString(), tz)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground leading-relaxed px-2">
          சூட்சம பட்சி நேரங்கள் முதன்மை நிலையின் நேரத்தை பாரம்பரிய 5:4:2:1.5:3.5 விகிதத்தில் பிரித்து கணிக்கப்பட்டவை.
        </p>
      </div>
    </main>
  );
}

/* ============================================================
 *  Shared building blocks
 * ============================================================ */
function TopBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <header className="relative py-5 px-4 text-center shadow-sm" style={{ background: "var(--brand)" }}>
      {onBack && (
        <button onClick={onBack} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full" aria-label="Back" style={{ color: "var(--brand-foreground)" }}>
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="text-lg sm:text-xl font-bold" style={{ color: "var(--brand-foreground)" }}>{title}</h1>
    </header>
  );
}

const WEEKDAY_TA = ["ஞாயிறு","திங்கள்","செவ்வாய்","புதன்","வியாழன்","வெள்ளி","சனி"];
const WEEKDAY_EN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function ymdParts(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return { y, m, d, weekday: dt.getDay(), monthName: MONTHS_EN[m - 1] };
}

function DateNavigator({ viewDate, onViewDateChange, pending, isToday }: { viewDate: string; onViewDateChange: (v: string) => void; pending: boolean; isToday: boolean }) {
  const p = ymdParts(viewDate);
  return (
    <div className="relative overflow-hidden pt-6 pb-14" style={{ background: "var(--brand)" }}>
      <div className="mx-auto max-w-2xl px-5 text-center" style={{ color: "var(--brand-foreground)" }}>
        <div className="inline-flex items-center gap-2 text-xl font-bold">
          <Calendar className="h-5 w-5" />
          <span>{`${p.d.toString().padStart(2,"0")} ${p.monthName} ${p.y}`}</span>
          {isToday && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-card" style={{ color: "var(--brand-deep)" }}>Today</span>}
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
        <div className="mt-1 text-sm opacity-90 font-semibold">
          {WEEKDAY_TA[p.weekday]} · {WEEKDAY_EN[p.weekday]}
        </div>
        <div className="mt-4 mx-auto inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-lg">
          <button
            type="button"
            onClick={() => onViewDateChange(shiftYmd(viewDate, -1))}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold disabled:opacity-60"
            style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
          >
            <ChevronLeft className="h-4 w-4" /> முந்தைய<br />தேதி
          </button>
          <label className="inline-flex items-center px-3 py-2 text-sm font-bold cursor-pointer" style={{ color: "var(--brand-deep)" }} title="Pick date">
            <input type="date" value={viewDate} onChange={(e) => onViewDateChange(e.target.value)} className="sr-only" aria-label="Pick date" />
            <Calendar className="h-4 w-4" />
          </label>
          <button
            type="button"
            onClick={() => onViewDateChange(shiftYmd(viewDate, +1))}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold disabled:opacity-60"
            style={{ color: "var(--brand-deep)" }}
          >
            அடுத்த<br />தேதி <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3">
          <input
            type="date"
            value={viewDate}
            onChange={(e) => onViewDateChange(e.target.value)}
            className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold shadow"
            style={{ color: "var(--brand-deep)" }}
            aria-label="Select date"
          />
        </div>
      </div>
      {/* Curved bottom */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 40" preserveAspectRatio="none" style={{ height: 32 }}>
        <path d="M0,40 Q200,0 400,40 L400,40 L0,40 Z" fill="hsl(var(--background))" />
      </svg>
    </div>
  );
}

function DateNavigatorInline({ viewDate, onViewDateChange, pending }: { viewDate: string; onViewDateChange: (v: string) => void; pending: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-full border border-input bg-card px-2 py-1.5">
      <button onClick={() => onViewDateChange(shiftYmd(viewDate, -1))} disabled={pending} className="p-2 rounded-full hover:bg-secondary disabled:opacity-60" aria-label="Previous day">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <input type="date" value={viewDate} onChange={(e) => onViewDateChange(e.target.value)} className="bg-transparent text-sm text-center outline-none" />
      <button onClick={() => onViewDateChange(shiftYmd(viewDate, +1))} disabled={pending} className="p-2 rounded-full hover:bg-secondary disabled:opacity-60" aria-label="Next day">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block font-bold mb-2 text-foreground">{label}</label>{children}</div>;
}

function IconInput({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div className="flex-1 rounded-full border border-input bg-background px-4 py-2.5">{children}</div>
    </div>
  );
}

function NumBox({ value, onChange, placeholder, min, max, wide }: { value: string; onChange: (v: string) => void; placeholder: string; min: number; max: number; wide?: boolean }) {
  return (
    <input required type="number" min={min} max={max} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`rounded-full border border-input bg-background px-3 py-2.5 text-center text-sm outline-none focus:border-brand-deep ${wide ? "w-24" : "w-20"}`} />
  );
}

function Radio({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" onClick={onChange} className="inline-flex items-center gap-2">
      <span className={`h-5 w-5 rounded-full border-2 grid place-items-center ${checked ? "" : "border-input"}`} style={checked ? { borderColor: "var(--brand-deep)" } : undefined}>
        {checked && <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--brand-deep)" }} />}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function fmtTime(iso: string, tzOffsetMin: number) {
  const d = new Date(new Date(iso).getTime() + tzOffsetMin * 60_000);
  const hh = d.getUTCHours();
  const mm = d.getUTCMinutes().toString().padStart(2, "0");
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12.toString().padStart(2, "0")}:${mm} ${hh < 12 ? "am" : "pm"}`;
}

function fmtTimeSec(iso: string, tzOffsetMin: number) {
  const d = new Date(new Date(iso).getTime() + tzOffsetMin * 60_000);
  const hh = d.getUTCHours();
  const mm = d.getUTCMinutes().toString().padStart(2, "0");
  const ss = d.getUTCSeconds().toString().padStart(2, "0");
  const h12 = ((hh + 11) % 12) + 1;
  return `${h12.toString().padStart(2, "0")}:${mm}:${ss} ${hh < 12 ? "am" : "pm"}`;
}

type PlaceSuggestion = { display: string; lat: number; lon: number };

function PlaceAutocomplete({
  value, onChange, onSelect, selected,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (s: PlaceSuggestion) => void;
  selected: { lat: number; lon: number } | null;
}) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selected) return; // don't re-query after user picks
    const q = value.trim();
    if (q.length < 3) { setSuggestions([]); return; }
    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&limit=6&q=${encodeURIComponent(q)}`,
          { signal: ac.signal, headers: { Accept: "application/json" } },
        );
        const rows = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
        setSuggestions(rows.map((r) => ({ display: r.display_name, lat: parseFloat(r.lat), lon: parseFloat(r.lon) })));
        setOpen(true);
      } catch {
        /* aborted or offline */
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [value, selected]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground shrink-0"><MapPin className="h-5 w-5" /></span>
        <div className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 flex items-center gap-2">
          <input
            required
            value={value}
            onChange={(e) => { onChange(e.target.value); setOpen(true); }}
            onFocus={() => { if (suggestions.length) setOpen(true); }}
            placeholder="ஊர் / நகரம் தேடவும்"
            className="w-full bg-transparent outline-none text-sm"
            maxLength={200}
            autoComplete="off"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {selected && !loading && (
            <span className="text-[10px] font-medium text-emerald-700 whitespace-nowrap">
              {selected.lat.toFixed(3)}°, {selected.lon.toFixed(3)}°
            </span>
          )}
        </div>
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 left-8 right-0 max-h-64 overflow-auto rounded-2xl border border-border bg-popover shadow-lg text-sm">
          {suggestions.map((s, i) => (
            <li key={`${s.lat},${s.lon},${i}`}>
              <button
                type="button"
                onClick={() => { onSelect(s); setOpen(false); }}
                className="w-full text-left px-4 py-2 hover:bg-accent"
              >
                {s.display}
              </button>
            </li>
          ))}
        </ul>
      )}
      {!selected && value.trim().length >= 3 && (
        <p className="mt-1 pl-8 text-[11px] text-muted-foreground">
          துல்லியமான ஜென்ம நட்சத்திரத்திற்கு பட்டியலில் ஒரு இடத்தைத் தேர்ந்தெடுக்கவும்.
        </p>
      )}
    </div>
  );
}

