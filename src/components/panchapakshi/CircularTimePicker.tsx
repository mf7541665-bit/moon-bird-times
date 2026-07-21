import { useEffect, useMemo, useRef, useState } from "react";
import { Clock } from "lucide-react";

/**
 * Rotating knob time picker.
 * - Big dial: minutes (0-59). Drag the knob or tap the ring.
 * - Small dial below: hours (1-12). Drag / tap similarly.
 * - AM/PM toggle on the side.
 * Values are strings to match the parent form's state.
 */
export function CircularTimePicker({
  hour,
  minute,
  ampm,
  setHour,
  setMinute,
  setAmpm,
}: {
  hour: string;
  minute: string;
  ampm: "AM" | "PM";
  setHour: (v: string) => void;
  setMinute: (v: string) => void;
  setAmpm: (v: "AM" | "PM") => void;
}) {
  const h = clampInt(hour, 1, 12, 6);
  const m = clampInt(minute, 0, 59, 0);

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {/* Digital readout */}
      <div className="inline-flex items-center gap-2 rounded-full border border-input bg-background px-4 py-2 shadow-sm">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-lg font-bold tabular-nums" style={{ color: "var(--brand-deep)" }}>
          {pad(h)}:{pad(m)}
        </span>
        <div className="ml-2 flex rounded-full border border-input overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setAmpm("AM")}
            className={`px-3 py-1 font-semibold ${ampm === "AM" ? "" : "opacity-60"}`}
            style={ampm === "AM" ? { background: "var(--brand)", color: "var(--brand-foreground)" } : undefined}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => setAmpm("PM")}
            className={`px-3 py-1 font-semibold ${ampm === "PM" ? "" : "opacity-60"}`}
            style={ampm === "PM" ? { background: "var(--brand)", color: "var(--brand-foreground)" } : undefined}
          >
            PM
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Minutes</span>
        <Dial
          size={220}
          max={60}
          value={m}
          onChange={(v) => setMinute(String(v))}
          ticks={12}
          labelEvery={5}
          accent="var(--brand-deep)"
        />
      </div>

      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hour</span>
        <Dial
          size={160}
          max={12}
          value={h === 12 ? 0 : h}
          onChange={(v) => setHour(String(v === 0 ? 12 : v))}
          ticks={12}
          labelEvery={1}
          labelOffset={1}
          accent="var(--brand)"
        />
      </div>
    </div>
  );
}

function Dial({
  size,
  max,
  value,
  onChange,
  ticks,
  labelEvery,
  labelOffset = 0,
  accent,
}: {
  size: number;
  max: number;
  value: number; // 0..max-1
  onChange: (v: number) => void;
  ticks: number;
  labelEvery: number;
  labelOffset?: number;
  accent: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const r = size / 2;
  const knobR = r - 22;

  const angle = useMemo(() => (value / max) * 2 * Math.PI - Math.PI / 2, [value, max]);
  const knobX = r + Math.cos(angle) * knobR;
  const knobY = r + Math.sin(angle) * knobR;

  function pointToValue(clientX: number, clientY: number) {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return null;
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    let a = Math.atan2(clientY - cy, clientX - cx) + Math.PI / 2;
    if (a < 0) a += 2 * Math.PI;
    const raw = (a / (2 * Math.PI)) * max;
    return Math.round(raw) % max;
  }

  function handleMove(e: PointerEvent | React.PointerEvent) {
    const v = pointToValue((e as PointerEvent).clientX, (e as PointerEvent).clientY);
    if (v != null) onChange(v);
  }

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => handleMove(e);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  return (
    <div
      ref={ref}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={max - 1}
      aria-valuenow={value}
      tabIndex={0}
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        setDragging(true);
        handleMove(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onChange((value + 1) % max); }
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onChange((value - 1 + max) % max); }
      }}
      className="relative select-none touch-none rounded-full bg-card border border-border/70 shadow-inner"
      style={{ width: size, height: size, cursor: dragging ? "grabbing" : "pointer" }}
    >
      {/* Tick marks & labels */}
      {Array.from({ length: ticks }, (_, i) => {
        const a = (i / ticks) * 2 * Math.PI - Math.PI / 2;
        const tx = r + Math.cos(a) * (r - 10);
        const ty = r + Math.sin(a) * (r - 10);
        const lx = r + Math.cos(a) * (r - 30);
        const ly = r + Math.sin(a) * (r - 30);
        const isMajor = i % labelEvery === 0;
        const label = labelOffset ? (i === 0 ? 12 : i) : i * Math.round(max / ticks);
        return (
          <div key={i}>
            <span
              className="absolute rounded-full"
              style={{
                left: tx - 1.5,
                top: ty - 1.5,
                width: isMajor ? 4 : 2,
                height: isMajor ? 4 : 2,
                background: isMajor ? accent : "hsl(var(--muted-foreground) / 0.5)",
              }}
            />
            {isMajor && (
              <span
                className="absolute text-[10px] font-semibold tabular-nums"
                style={{ left: lx - 8, top: ly - 7, width: 16, textAlign: "center", color: "var(--brand-deep)" }}
              >
                {pad(label as number)}
              </span>
            )}
          </div>
        );
      })}
      {/* Arc line from 12 to knob */}
      <svg className="absolute inset-0" width={size} height={size} pointerEvents="none">
        <circle cx={r} cy={r} r={knobR} fill="none" stroke="hsl(var(--muted-foreground) / 0.15)" strokeWidth={2} />
        <path
          d={arcPath(r, r, knobR, -Math.PI / 2, angle)}
          fill="none"
          stroke={accent}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </svg>
      {/* Center display */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <span className="font-mono text-2xl font-bold tabular-nums" style={{ color: "var(--brand-deep)" }}>
          {pad(labelOffset ? (value === 0 ? 12 : value) : value)}
        </span>
      </div>
      {/* Knob */}
      <div
        className="absolute rounded-full shadow-md"
        style={{
          left: knobX - 12,
          top: knobY - 12,
          width: 24,
          height: 24,
          background: accent,
          border: "3px solid white",
        }}
      />
    </div>
  );
}

function arcPath(cx: number, cy: number, radius: number, a0: number, a1: number) {
  const x0 = cx + radius * Math.cos(a0);
  const y0 = cy + radius * Math.sin(a0);
  const x1 = cx + radius * Math.cos(a1);
  const y1 = cy + radius * Math.sin(a1);
  let delta = a1 - a0;
  if (delta < 0) delta += 2 * Math.PI;
  const large = delta > Math.PI ? 1 : 0;
  return `M ${x0} ${y0} A ${radius} ${radius} 0 ${large} 1 ${x1} ${y1}`;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}
function clampInt(s: string, min: number, max: number, fallback: number) {
  const n = parseInt(s, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
