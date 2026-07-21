import { useEffect, useState } from "react";
import { Moon, Bird } from "lucide-react";
import { BIRDS, ACTIVITIES, type BirdKey } from "@/lib/panchapakshi/tables";
import type { PanchapakshiApiResult } from "@/lib/panchapakshi/api.functions";

const BIRD_EMOJI: Record<BirdKey, string> = {
  vulture: "🦅", owl: "🦉", crow: "🐦‍⬛", cock: "🐓", peacock: "🦚",
};

/**
 * "Paduthirukkum Patchi" = bird currently doing SLEEP.
 * Shows current sleeping bird for the active slot with a countdown to the next
 * slot boundary (when the sleeping bird changes).
 */
export function PadupatchiCard({ data }: { data: PanchapakshiApiResult }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const info = findActiveSlot(data, now);
  if (!info) {
    return (
      <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-6 text-center">
        <h2 className="text-lg font-bold mb-2" style={{ color: "var(--brand-deep)" }}>பாடு பட்சி</h2>
        <p className="text-sm text-muted-foreground">
          தேர்ந்தெடுத்த தேதி வரம்பிற்கு வெளியே. நேரடி காட்சிக்கு இன்றைய தேதியைத் தேர்ந்தெடுக்கவும்.
        </p>
      </div>
    );
  }

  const { block, slotIdx, sleepingBird, end } = info;
  const remainingMs = end.getTime() - now.getTime();
  const bird = BIRDS[sleepingBird];

  return (
    <div className="rounded-3xl border border-border/60 shadow-sm p-6"
         style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.95))" }}>
      <div className="flex items-center justify-center gap-2 mb-1">
        <Moon className="h-4 w-4" style={{ color: "var(--brand-deep)" }} />
        <h2 className="text-lg font-bold" style={{ color: "var(--brand-deep)" }}>பாடு பட்சி</h2>
      </div>
      <p className="text-center text-[11px] text-muted-foreground mb-5">
        இப்போது துயில் நிலையில் உள்ள பட்சி
      </p>

      <div className="flex items-center justify-center gap-4">
        <div className="text-5xl">{BIRD_EMOJI[sleepingBird]}</div>
        <div>
          <div className="text-xl font-bold" style={{ color: "var(--brand-deep)" }}>
            {bird.ta}
          </div>
          <div className="text-xs text-muted-foreground">{bird.en} · {ACTIVITIES.sleep.ta}</div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Bird className="h-3.5 w-3.5" />
          <span>{block === "day" ? "பகல்" : "இரவு"} · நிலை {slotIdx + 1}/5</span>
        </div>
        <div className="font-mono font-bold" style={{ color: "var(--brand-deep)" }}>
          {formatCountdown(remainingMs)}
        </div>
      </div>
      <p className="mt-2 text-[10px] text-center text-muted-foreground">
        அடுத்த மாற்றத்திற்குரிய நேரம்
      </p>
    </div>
  );
}

function findActiveSlot(data: PanchapakshiApiResult, now: Date) {
  const blocks = [
    { key: "day" as const, b: data.day },
    { key: "night" as const, b: data.night },
  ];
  for (const { key, b } of blocks) {
    for (let i = 0; i < b.slots.length; i++) {
      const s = b.slots[i];
      const start = new Date(s.start);
      const end = new Date(s.end);
      if (now >= start && now < end) {
        // Find bird whose activity is "sleep" in this slot
        const acts = s.birdActivities as Record<BirdKey, string>;
        const sleepingBird = (Object.keys(acts) as BirdKey[]).find((k) => acts[k] === "sleep");
        if (sleepingBird) return { block: key, slotIdx: i, sleepingBird, start, end };
      }
    }
  }
  return null;
}

function formatCountdown(ms: number) {
  if (ms <= 0) return "00:00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
