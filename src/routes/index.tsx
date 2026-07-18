import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { User, Users, Calendar, Clock, MapPin, Loader2, Sparkles } from "lucide-react";
import { runPanchapakshi, type PanchapakshiApiResult } from "@/lib/panchapakshi/api.functions";
import { BIRDS, ACTIVITIES, NAKSHATRAS_TA, type ActivityKey, type BirdKey } from "@/lib/panchapakshi/tables";
import heroImg from "@/assets/panchapakshi-hero.jpg";

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

const QUALITY_STYLES: Record<string, string> = {
  excellent: "bg-emerald-100 text-emerald-800 border-emerald-300",
  good: "bg-lime-100 text-lime-800 border-lime-300",
  neutral: "bg-slate-100 text-slate-700 border-slate-300",
  bad: "bg-orange-100 text-orange-800 border-orange-300",
  worst: "bg-rose-100 text-rose-800 border-rose-300",
};

function PanchapakshiPage() {
  const runFn = useServerFn(runPanchapakshi);
  const mut = useMutation({ mutationFn: (data: Parameters<typeof runFn>[0]["data"]) => runFn({ data }) });

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [place, setPlace] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    mut.mutate({
      name,
      gender,
      day: parseInt(day, 10),
      month: parseInt(month, 10),
      year: parseInt(year, 10),
      hour: parseInt(hour, 10),
      minute: parseInt(minute, 10),
      ampm,
      place,
    });
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-brand py-8 px-4 text-center shadow-sm" style={{ background: "var(--brand)" }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-foreground" style={{ color: "var(--brand-foreground)" }}>
          பஞ்சபட்சி சாஸ்திரம்
        </h1>
        <p className="mt-1 text-sm opacity-80">Pancha Pakshi Form</p>
      </header>

      <div className="mx-auto max-w-2xl px-4 -mt-6 pb-16">
        <div className="rounded-3xl bg-card shadow-xl p-6 sm:p-8 border border-border/60">
          <form onSubmit={onSubmit} className="space-y-6">
            <Field label="பெயர்">
              <IconInput icon={<User className="h-5 w-5" />}>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="பெயரை உள்ளிடவும்"
                  className="w-full bg-transparent outline-none text-sm"
                  maxLength={100}
                />
              </IconInput>
            </Field>

            <Field label="பாலினம்">
              <div className="flex items-center gap-6">
                <Users className="h-5 w-5 text-muted-foreground" />
                <Radio checked={gender === "male"} onChange={() => setGender("male")} label="ஆண்" />
                <Radio checked={gender === "female"} onChange={() => setGender("female")} label="பெண்" />
              </div>
            </Field>

            <Field label="பிறந்த தேதி">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                <NumBox value={day} onChange={setDay} placeholder="நாள்" min={1} max={31} />
                <NumBox value={month} onChange={setMonth} placeholder="மாதம்" min={1} max={12} />
                <NumBox value={year} onChange={setYear} placeholder="ஆண்டு" min={1900} max={2100} wide />
              </div>
            </Field>

            <Field label="பிறந்த நேரம்">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                <NumBox value={hour} onChange={setHour} placeholder="மணி" min={1} max={12} />
                <NumBox value={minute} onChange={setMinute} placeholder="நிமிடம்" min={0} max={59} />
                <div className="flex rounded-xl border border-input overflow-hidden">
                  <button type="button" onClick={() => setAmpm("AM")} className={`px-3 py-2 text-sm ${ampm === "AM" ? "bg-brand text-brand-foreground" : "bg-transparent"}`} style={ampm === "AM" ? { background: "var(--brand)", color: "var(--brand-foreground)" } : undefined}>AM</button>
                  <button type="button" onClick={() => setAmpm("PM")} className={`px-3 py-2 text-sm ${ampm === "PM" ? "bg-brand text-brand-foreground" : "bg-transparent"}`} style={ampm === "PM" ? { background: "var(--brand)", color: "var(--brand-foreground)" } : undefined}>PM</button>
                </div>
              </div>
            </Field>

            <Field label="பிறந்த இடம்">
              <IconInput icon={<MapPin className="h-5 w-5" />}>
                <input
                  required
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="பிறந்த இடத்தை உள்ளிடவும் (e.g. Chennai)"
                  className="w-full bg-transparent outline-none text-sm"
                  maxLength={200}
                />
              </IconInput>
            </Field>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={mut.isPending}
                className="btn-brand rounded-full px-10 py-3 font-bold disabled:opacity-60 inline-flex items-center gap-2"
              >
                {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Submit
              </button>
            </div>
          </form>
        </div>

        {mut.isError && (
          <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {(mut.error as Error).message}
          </div>
        )}

        {mut.data && <Result data={mut.data} name={name} />}

        {!mut.data && !mut.isPending && (
          <img src={heroImg} alt="Five sacred birds of Panchapakshi Shastra" className="mt-10 mx-auto max-w-sm w-full opacity-90" width={1024} height={1024} loading="lazy" />
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-bold mb-2 text-foreground">{label}</label>
      {children}
    </div>
  );
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
    <input
      required
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`rounded-full border border-input bg-background px-3 py-2.5 text-center text-sm outline-none focus:border-brand-deep ${wide ? "w-24" : "w-20"}`}
    />
  );
}

function Radio({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" onClick={onChange} className="inline-flex items-center gap-2">
      <span className={`h-5 w-5 rounded-full border-2 grid place-items-center ${checked ? "border-brand-deep" : "border-input"}`} style={checked ? { borderColor: "var(--brand-deep)" } : undefined}>
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
  return `${h12}:${mm} ${hh < 12 ? "AM" : "PM"}`;
}

function Result({ data, name }: { data: PanchapakshiApiResult; name: string }) {
  const tz = data.input.tzOffsetMin;
  const bird = BIRDS[data.birthBird];
  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-3xl bg-card shadow-xl border border-border/60 p-6 sm:p-8 text-center">
        <p className="text-sm text-muted-foreground">{name && `${name} — `}உங்கள் ஜென்ம பட்சி</p>
        <div className="mt-3 text-6xl">{BIRD_EMOJI[data.birthBird]}</div>
        <h2 className="mt-2 text-3xl font-bold" style={{ color: "var(--brand-deep)" }}>{bird.ta}</h2>
        <p className="text-sm text-muted-foreground">{bird.en}</p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Stat label="நட்சத்திரம்" value={NAKSHATRAS_TA[data.nakshatraIndex]} />
          <Stat label="பக்ஷம்" value={data.paksha === "valarpirai" ? "வளர்பிறை" : "தேய்பிறை"} />
          <Stat label="திதி" value={String(data.tithi)} />
          <Stat label="சூரிய உதயம்" value={fmtTime(data.sunrise, tz)} />
        </div>
      </div>

      <ScheduleTable title="பகல் (Day)" subtitle={`${fmtTime(data.sunrise, tz)} → ${fmtTime(data.sunset, tz)}`} block={data.day} tz={tz} birthBird={data.birthBird} />
      <ScheduleTable title="இரவு (Night)" subtitle={`${fmtTime(data.sunset, tz)} → ${fmtTime(data.nextSunrise, tz)}`} block={data.night} tz={tz} birthBird={data.birthBird} />

      <p className="text-xs text-muted-foreground px-2 leading-relaxed">
        Times computed from sunrise/sunset at the birth place. Activity durations
        follow the traditional nazhigai table; sequence varies by paksha (valarpirai/theipirai)
        and day/night. Your favourable moments are the slots where your Jenma Pakshi
        ({bird.ta}) is <b>ஆளுதல் (Ruling)</b> or <b>உண்ணல் (Eating)</b>.
      </p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}

function ScheduleTable({ title, subtitle, block, tz, birthBird }: { title: string; subtitle: string; block: PanchapakshiApiResult["day"]; tz: number; birthBird: BirdKey }) {
  const rulingBird = BIRDS[block.ruling];
  return (
    <div className="rounded-3xl bg-card shadow-xl border border-border/60 overflow-hidden">
      <div className="p-5" style={{ background: "var(--brand)" }}>
        <div className="flex items-baseline justify-between">
          <h3 className="text-lg font-bold" style={{ color: "var(--brand-foreground)" }}>{title}</h3>
          <span className="text-sm opacity-80">{subtitle}</span>
        </div>
        <p className="text-xs mt-1 opacity-80">ஆளும் பட்சி: {rulingBird.ta} ({rulingBird.en})</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2">Time</th>
              <th className="text-left px-3 py-2">Ruling activity</th>
              {(["vulture", "owl", "crow", "cock", "peacock"] as BirdKey[]).map((b) => (
                <th key={b} className={`text-left px-3 py-2 ${b === birthBird ? "text-brand-deep" : ""}`} style={b === birthBird ? { color: "var(--brand-deep)" } : undefined}>
                  {BIRD_EMOJI[b]} {BIRDS[b].ta}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.slots.map((s, i) => {
              const rulingAct = ACTIVITIES[s.activity];
              return (
                <tr key={i} className="border-t border-border/60">
                  <td className="px-3 py-2 whitespace-nowrap text-xs">{fmtTime(s.start, tz)} – {fmtTime(s.end, tz)}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded-md border px-2 py-0.5 text-xs ${QUALITY_STYLES[rulingAct.quality]}`}>{rulingAct.ta}</span>
                  </td>
                  {(["vulture", "owl", "crow", "cock", "peacock"] as BirdKey[]).map((b) => {
                    const a = s.birdActivities[b] as ActivityKey;
                    const act = ACTIVITIES[a];
                    return (
                      <td key={b} className={`px-3 py-2 ${b === birthBird ? "font-semibold" : ""}`}>
                        <span className={`inline-block rounded-md border px-2 py-0.5 text-xs ${QUALITY_STYLES[act.quality]}`}>{act.ta}</span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
