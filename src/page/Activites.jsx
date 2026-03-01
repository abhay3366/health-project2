import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";

/*
  THEME — exactly matching Health Reports screenshot:
  ─────────────────────────────────────────────────
  Page bg      : #eef0f5  (very light blue-gray)
  Card bg      : #ffffff
  Card border  : 1px solid #e8eaed  (very subtle)
  Card radius  : 12px
  Card shadow  : 0 1px 3px rgba(0,0,0,0.06)
  Title text   : #1a1a2e  font-bold  (H1, card titles)
  Label text   : #6b7280  text-sm    (small labels above values)
  Body text    : #374151              (descriptions)
  Green accent : #22c55e             (ONLY on data: values, bars, trend text, links)
  Dark button  : #1a1a2e bg          (Export PDF style)
  Tab active   : white bg, shadow
  Tab inactive : transparent, gray text
  Segment ctrl : #f3f4f6 bg pill
*/

// ── Primitives ──────────────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-xl ${className}`}
    style={{ border: "1px solid #e8eaed", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
  >
    {children}
  </div>
);

const StatCard = ({ label, value, unit, sub, subColor = "#22c55e" }) => (
  <Card className="p-5">
    <p className="text-sm text-gray-500 mb-2">{label}</p>
    <p className="text-[2rem] font-bold text-gray-900 leading-none">
      {value}
      {unit && <span className="text-base font-normal text-gray-400 ml-1.5">{unit}</span>}
    </p>
    {sub && <p className="text-xs mt-2 font-medium" style={{ color: subColor }}>{sub}</p>}
  </Card>
);

const SectionHeader = ({ title, right }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-base font-bold text-gray-900">{title}</h2>
    {right && <span className="text-sm font-semibold" style={{ color: "#22c55e" }}>{right}</span>}
  </div>
);

const ProgressBar = ({ value, max, color = "#22c55e", height = 8 }) => (
  <div style={{ background: "#f3f4f6", borderRadius: 99, height, overflow: "hidden" }}>
    <div
      style={{
        background: color,
        height: "100%",
        width: `${Math.min((value / (max || 1)) * 100, 100)}%`,
        borderRadius: 99,
        transition: "width 0.7s ease",
      }}
    />
  </div>
);

const ExportBtn = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-colors"
    style={{ background: "#1a1a2e" }}
    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
  >
    {children}
  </button>
);

// ── Static data ──────────────────────────────────────────────────────────────
const ACTIVITY_TYPES = [
  { id: "running",   label: "Running",       icon: "🏃",  calPerMin: 10, unit: "km",   bg: "#fff7ed", iconBg: "#fed7aa" },
  { id: "cycling",   label: "Cycling",       icon: "🚴",  calPerMin: 8,  unit: "km",   bg: "#eff6ff", iconBg: "#bfdbfe" },
  { id: "swimming",  label: "Swimming",      icon: "🏊",  calPerMin: 9,  unit: "laps", bg: "#ecfeff", iconBg: "#a5f3fc" },
  { id: "walking",   label: "Walking",       icon: "🚶",  calPerMin: 5,  unit: "km",   bg: "#f0fdf4", iconBg: "#bbf7d0" },
  { id: "yoga",      label: "Yoga",          icon: "🧘",  calPerMin: 4,  unit: "min",  bg: "#faf5ff", iconBg: "#e9d5ff" },
  { id: "gym",       label: "Gym / Weights", icon: "🏋️", calPerMin: 7,  unit: "sets", bg: "#fff1f2", iconBg: "#fecdd3" },
  { id: "hiit",      label: "HIIT",          icon: "⚡",  calPerMin: 12, unit: "min",  bg: "#fefce8", iconBg: "#fef08a" },
  { id: "badminton", label: "Badminton",     icon: "🏸",  calPerMin: 7,  unit: "min",  bg: "#f0fdf4", iconBg: "#bbf7d0" },
  { id: "cricket",   label: "Cricket",       icon: "🏏",  calPerMin: 5,  unit: "min",  bg: "#fffbeb", iconBg: "#fde68a" },
  { id: "other",     label: "Other",         icon: "🎯",  calPerMin: 6,  unit: "min",  bg: "#f9fafb", iconBg: "#e5e7eb" },
];

const INTENSITY = [
  { id: "light",    label: "Light",    icon: "🟢", mult: 0.8 },
  { id: "moderate", label: "Moderate", icon: "🟡", mult: 1.0 },
  { id: "intense",  label: "Intense",  icon: "🟠", mult: 1.3 },
  { id: "extreme",  label: "Extreme",  icon: "🔴", mult: 1.6 },
];

const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKLY_GOAL_MIN  = 150;
const WEEKLY_GOAL_CALS = 2500;

// ── Helpers ──────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);

const fmtDateLabel = (d) => {
  const dt  = new Date(d + "T00:00:00");
  const yes = new Date(); yes.setDate(yes.getDate() - 1);
  if (d === todayStr()) return "Today";
  if (d === yes.toISOString().slice(0, 10)) return "Yesterday";
  return `${DAYS[dt.getDay()]}, ${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
};

const fmtDuration = (mins) => {
  if (!mins) return "0m";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const calcCals = (typeId, durationMins, intensityId) => {
  const base = ACTIVITY_TYPES.find(a => a.id === typeId)?.calPerMin ?? 6;
  const mult = INTENSITY.find(i => i.id === intensityId)?.mult ?? 1;
  return Math.round(base * (+durationMins || 0) * mult);
};

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : (typeof init === "function" ? init() : init); }
    catch { return typeof init === "function" ? init() : init; }
  });
  const save = useCallback((v) => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [val, save];
}

function getWeekDates() {
  const today  = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

// ── Log Activity Modal ────────────────────────────────────────────────────────
function LogModal({ onClose, onSave, prefillType, editing }) {
  const defaults = editing ?? {
    type: prefillType ?? "running",
    intensity: "moderate",
    duration: 30,
    distance: "",
    notes: "",
    time: new Date().toTimeString().slice(0, 5),
  };

  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: defaults });
  const selType  = watch("type");
  const selInt   = watch("intensity");
  const dur      = watch("duration");
  const actMeta  = ACTIVITY_TYPES.find(a => a.id === selType);
  const estCals  = calcCals(selType, dur, selInt);

  const onSubmit = (data) => {
    onSave({ ...data, id: editing?.id ?? Date.now().toString(), duration: +data.duration, estimatedCals: estCals, loggedAt: new Date().toISOString() });
    onClose();
  };

  const inp = (err) =>
    `w-full rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none transition-all ${
      err
        ? "border border-red-300 focus:ring-2 focus:ring-red-100"
        : "border border-gray-200 hover:border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.25)" }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col" style={{ border: "1px solid #e8eaed" }}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f3f4f6" }}>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{editing ? "Edit Activity" : "Log Activity"}</h2>
            <p className="text-xs text-gray-400 mt-0.5">Record your workout details</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 flex items-center justify-center text-xl transition-colors">×</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Activity type */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Activity Type</p>
              <div className="grid grid-cols-5 gap-2">
                {ACTIVITY_TYPES.map(act => (
                  <label key={act.id} className="cursor-pointer">
                    <input type="radio" value={act.id} {...register("type")} className="sr-only" />
                    <div
                      className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: selType === act.id ? "#1a1a2e" : "#f3f4f6",
                        background:  selType === act.id ? "#1a1a2e" : "#fafafa",
                      }}
                    >
                      <span className="text-xl leading-none">{act.icon}</span>
                      <span className="text-[9px] font-semibold text-center leading-tight"
                        style={{ color: selType === act.id ? "#ffffff" : "#6b7280" }}>
                        {act.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Duration + Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Duration (minutes) *</p>
                <input type="number" min="1" max="600" placeholder="30"
                  {...register("duration", { required: true, min: 1 })} className={inp(errors.duration)} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Start Time</p>
                <input type="time" {...register("time")} className={inp(false)} />
              </div>
            </div>

            {/* Distance / Laps / Sets */}
            {actMeta?.unit !== "min" && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  {actMeta?.unit === "km" ? "Distance (km)" : actMeta?.unit === "laps" ? "Laps Completed" : "Sets Completed"}
                </p>
                <input type="number" min="0" step="0.1"
                  placeholder={actMeta?.unit === "km" ? "5.2" : "20"}
                  {...register("distance")} className={inp(false)} />
              </div>
            )}

            {/* Intensity */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Intensity</p>
              <div className="grid grid-cols-4 gap-2">
                {INTENSITY.map(lvl => (
                  <label key={lvl.id} className="cursor-pointer">
                    <input type="radio" value={lvl.id} {...register("intensity")} className="sr-only" />
                    <div className="text-center py-3 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: selInt === lvl.id ? "#1a1a2e" : "#f3f4f6",
                        background:  selInt === lvl.id ? "#1a1a2e" : "#fafafa",
                      }}>
                      <div className="text-lg leading-none">{lvl.icon}</div>
                      <div className="text-xs font-semibold mt-1" style={{ color: selInt === lvl.id ? "#fff" : "#6b7280" }}>
                        {lvl.label}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Estimated calories preview */}
            <div className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "#f9fafb", border: "1px solid #f3f4f6" }}>
              <div>
                <p className="text-xs text-gray-400 font-medium">Estimated Calories Burned</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                  {estCals}
                  <span className="text-sm font-normal text-gray-400 ml-1">kcal</span>
                </p>
              </div>
              <span className="text-4xl">{actMeta?.icon}</span>
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notes (optional)</p>
              <textarea {...register("notes")} rows={2}
                placeholder="How did it feel? Any personal records?"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 resize-none hover:border-gray-300 transition-all" />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid #f3f4f6" }}>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm font-semibold text-gray-600 rounded-lg transition-colors hover:bg-gray-50"
              style={{ border: "1px solid #e5e7eb" }}>
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 text-sm font-bold text-white rounded-lg transition-colors"
              style={{ background: "#1a1a2e" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              {editing ? "Update Activity" : "Save Activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Activity Row Card ─────────────────────────────────────────────────────────
function ActivityCard({ activity, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const meta  = ACTIVITY_TYPES.find(a => a.id === activity.type) ?? ACTIVITY_TYPES.at(-1);
  const intv  = INTENSITY.find(i => i.id === activity.intensity);

  return (
    <div className="bg-white rounded-xl p-4 transition-all"
      style={{ border: "1px solid #e8eaed", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#d1d5db"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#e8eaed"}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: meta.bg }}>
          {meta.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{meta.label}</span>
            {intv && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "#f9fafb", color: "#6b7280", border: "1px solid #f3f4f6" }}>
                {intv.icon} {intv.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-sm font-semibold text-gray-700">⏱ {fmtDuration(activity.duration)}</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm font-semibold" style={{ color: "#22c55e" }}>🔥 {activity.estimatedCals} kcal</span>
            {activity.distance && (
              <><span className="text-gray-300">·</span>
              <span className="text-sm text-gray-500">📍 {activity.distance} {meta.unit}</span></>
            )}
            {activity.time && (
              <><span className="text-gray-300">·</span>
              <span className="text-xs text-gray-400">🕐 {activity.time}</span></>
            )}
          </div>

          {activity.notes && (
            <p className="mt-1.5 text-xs text-gray-400 italic">"{activity.notes}"</p>
          )}
        </div>

        {/* Actions */}
        <div className="relative flex-shrink-0">
          <button onClick={() => setMenuOpen(p => !p)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors text-lg font-bold">
            ···
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 bg-white rounded-xl shadow-lg z-20 overflow-hidden min-w-[110px]"
                style={{ border: "1px solid #e8eaed" }}>
                <button onClick={() => { onEdit(activity); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                  ✏️ Edit
                </button>
                <button onClick={() => { onDelete(activity.id); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors">
                  🗑️ Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── TODAY TAB ─────────────────────────────────────────────────────────────────
function TodayTab({ activities, onAdd, onEdit, onDelete }) {
  const today     = todayStr();
  const todayActs = activities.filter(a => a.date === today);
  const totalCals = todayActs.reduce((s, a) => s + a.estimatedCals, 0);
  const totalMins = todayActs.reduce((s, a) => s + a.duration, 0);

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (activities.some(a => a.date === d.toISOString().slice(0, 10))) streak++;
    else if (i > 0) break;
  }

  return (
    <div className="space-y-5">

      {/* Stat cards — identical pattern to Health Reports top row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Calories Burned"  value={totalCals}             unit="kcal" sub={totalCals > 0 ? `↑ from ${todayActs.length} activit${todayActs.length === 1 ? "y" : "ies"}` : "No activities yet"} />
        <StatCard label="Active Time"      value={fmtDuration(totalMins)} sub={totalMins >= 60 ? "↑ Daily goal reached!" : `${Math.max(0, 60 - totalMins)}m to daily goal`} />
        <StatCard label="Workouts Logged"  value={todayActs.length}      sub={todayActs.length > 0 ? "Keep going!" : "Log your first workout"} />
        <StatCard label="Active Streak"    value={streak}  unit="days"   sub={streak > 0 ? "↑ Consecutive active days" : "Start your streak today"} subColor="#f97316" />
      </div>

      {/* Daily goal bar — same style as "body fat" progress in Health Reports */}
      <Card className="p-5">
        <SectionHeader title="Daily Activity Goal" right={`${totalMins} / 60 min`} />
        <ProgressBar value={totalMins} max={60} color={totalMins >= 60 ? "#22c55e" : "#f59e0b"} height={10} />
        <p className="text-xs text-gray-400 mt-2">
          {totalMins >= 60 ? "✅ Daily goal achieved — great work!" : `${Math.max(0, 60 - totalMins)} more minutes to reach your 60-minute goal`}
        </p>
      </Card>

      {/* Two-column: workouts + sidebar */}
      <div className="grid grid-cols-3 gap-4">

        {/* Left: workouts list */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Today's Workouts</h2>
            <span className="text-sm text-gray-400">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>

          {todayActs.length === 0 ? (
            <Card className="p-10 text-center">
              <div className="text-5xl mb-3">🏃</div>
              <p className="font-bold text-gray-700">No workouts logged yet</p>
              <p className="text-sm text-gray-400 mt-1 mb-5">Start tracking to reach your daily goal</p>
              <button onClick={() => onAdd()}
                className="text-sm font-semibold text-white px-5 py-2.5 rounded-lg mx-auto block transition-opacity"
                style={{ background: "#1a1a2e" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                + Log First Activity
              </button>
            </Card>
          ) : (
            todayActs.map(act => (
              <ActivityCard key={act.id} activity={act} onEdit={onEdit} onDelete={onDelete} />
            ))
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">

          {/* Quick Add */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Add</h3>
            <div className="space-y-1">
              {ACTIVITY_TYPES.slice(0, 7).map(act => (
                <button key={act.id} onClick={() => onAdd(act.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left hover:bg-gray-50">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: act.bg }}>{act.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700">{act.label}</p>
                    <p className="text-[10px] text-gray-400">~{act.calPerMin * 30} kcal / 30 min</p>
                  </div>
                  <span className="text-gray-300 text-sm">›</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Today breakdown */}
          {todayActs.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Today's Breakdown</h3>
              <div className="space-y-3">
                {ACTIVITY_TYPES.filter(at => todayActs.some(a => a.type === at.id)).map(at => {
                  const acts = todayActs.filter(a => a.type === at.id);
                  const cals = acts.reduce((s, a) => s + a.estimatedCals, 0);
                  const mins = acts.reduce((s, a) => s + a.duration, 0);
                  return (
                    <div key={at.id} className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: at.bg }}>{at.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700">{at.label}</span>
                          <span className="text-gray-400">{fmtDuration(mins)}</span>
                        </div>
                        <ProgressBar value={cals} max={totalCals || 1} color="#22c55e" height={6} />
                      </div>
                      <span className="text-xs font-bold flex-shrink-0 w-10 text-right" style={{ color: "#22c55e" }}>{cals}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ── WEEKLY TAB ────────────────────────────────────────────────────────────────
function WeeklyTab({ activities }) {
  const weekDates  = getWeekDates();
  const today      = todayStr();
  const weekActs   = activities.filter(a => weekDates.includes(a.date));
  const weekCals   = weekActs.reduce((s, a) => s + a.estimatedCals, 0);
  const weekMins   = weekActs.reduce((s, a) => s + a.duration, 0);
  const activeDays = new Set(weekActs.map(a => a.date)).size;

  const dayStats = weekDates.map(date => {
    const acts = activities.filter(a => a.date === date);
    const dt   = new Date(date + "T00:00:00");
    return {
      date, acts,
      cals:    acts.reduce((s, a) => s + a.estimatedCals, 0),
      mins:    acts.reduce((s, a) => s + a.duration, 0),
      day:     DAYS[dt.getDay()],
      isToday: date === today,
    };
  });

  const maxCals = Math.max(...dayStats.map(d => d.cals), 1);

  const typeBreakdown = ACTIVITY_TYPES.map(at => {
    const acts = weekActs.filter(a => a.type === at.id);
    return { ...at, count: acts.length, mins: acts.reduce((s,a)=>s+a.duration,0), cals: acts.reduce((s,a)=>s+a.estimatedCals,0) };
  }).filter(t => t.count > 0).sort((a,b) => b.cals - a.cals);

  return (
    <div className="space-y-5">

      {/* Top stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Calories Burned"  value={weekCals}              unit="kcal" sub={`Goal: ${WEEKLY_GOAL_CALS} kcal`} />
        <StatCard label="Active Minutes"   value={weekMins}              unit="min"  sub={`Goal: ${WEEKLY_GOAL_MIN} min`}  />
        <StatCard label="Active Days"      value={`${activeDays} / 7`}               sub="Days with at least 1 workout"   />
        <StatCard label="Total Workouts"   value={weekActs.length}                   sub="This week"                      />
      </div>

      {/* Goal progress bars */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <SectionHeader title="Weekly Minutes Goal" right={`${weekMins} / ${WEEKLY_GOAL_MIN}`} />
          <ProgressBar value={weekMins} max={WEEKLY_GOAL_MIN} color="#22c55e" height={10} />
          <p className="text-xs text-gray-400 mt-2">
            {weekMins >= WEEKLY_GOAL_MIN ? "✅ Weekly goal reached!" : `${WEEKLY_GOAL_MIN - weekMins} min remaining this week`}
          </p>
        </Card>
        <Card className="p-5">
          <SectionHeader title="Weekly Calorie Goal" right={`${weekCals} / ${WEEKLY_GOAL_CALS}`} />
          <ProgressBar value={weekCals} max={WEEKLY_GOAL_CALS} color="#f97316" height={10} />
          <p className="text-xs text-gray-400 mt-2">
            {weekCals >= WEEKLY_GOAL_CALS ? "✅ Calorie goal reached!" : `${WEEKLY_GOAL_CALS - weekCals} kcal remaining this week`}
          </p>
        </Card>
      </div>

      {/* Bar chart + Activity mix — mimics Health Reports chart layout */}
      <div className="grid grid-cols-3 gap-4">

        {/* Calories bar chart (like "Weekly Steps" in screenshot) */}
        <Card className="col-span-2 p-5">
          <SectionHeader title="Calories Burned" right="This Week" />

          {/* Chart */}
          <div className="flex items-end gap-3 px-1" style={{ height: 160 }}>
            {dayStats.map(({ date, cals, mins, day, isToday }) => {
              const barH = maxCals > 0 ? Math.max((cals / maxCals) * 120, cals > 0 ? 6 : 0) : 0;
              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1 group">
                  {/* Calorie label */}
                  <span className="text-[10px] font-semibold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" style={{ minHeight: 16 }}>
                    {cals > 0 ? cals : ""}
                  </span>
                  {/* Bar */}
                  <div className="w-full rounded-t-md transition-all duration-500" style={{
                    height: barH,
                    background: isToday ? "#22c55e" : cals > 0 ? "#22c55e" : "#f3f4f6",
                    opacity:    isToday ? 1 : cals > 0 ? 0.7 : 1,
                    minHeight:  cals > 0 ? 4 : 0,
                  }} />
                  {/* Day label */}
                  <span className="text-[11px] font-semibold mt-1" style={{ color: isToday ? "#22c55e" : "#9ca3af" }}>{day}</span>
                  {mins > 0 && <span className="text-[9px] text-gray-300">{fmtDuration(mins)}</span>}
                </div>
              );
            })}
          </div>

          {/* Y-axis labels */}
          <div className="flex justify-between mt-3 pt-2" style={{ borderTop: "1px solid #f9fafb" }}>
            <span className="text-xs text-gray-400">0</span>
            <span className="text-xs text-gray-400">{Math.round(maxCals / 2)}</span>
            <span className="text-xs text-gray-400">{maxCals}</span>
          </div>
        </Card>

        {/* Activity mix — like pie/breakdown panel */}
        <Card className="p-5">
          <SectionHeader title="Activity Mix" />
          {typeBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-300">
              <span className="text-3xl mb-2">📊</span>
              <p className="text-xs text-gray-400">No activities this week</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {typeBreakdown.map(t => (
                <div key={t.id} className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: t.bg }}>{t.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-700 truncate">{t.label}</span>
                      <span className="text-gray-400 flex-shrink-0 ml-1">{t.count}×</span>
                    </div>
                    <ProgressBar value={t.cals} max={weekCals || 1} color="#22c55e" height={6} />
                  </div>
                  <span className="text-xs font-bold flex-shrink-0 w-10 text-right" style={{ color: "#22c55e" }}>{t.cals}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Day-by-day table — mimics "Body Composition History" table */}
      <Card className="p-5">
        <SectionHeader title="Day by Day" />
        <div style={{ borderTop: "1px solid #f3f4f6" }}>
          {/* Table head */}
          <div className="grid grid-cols-5 gap-4 py-2.5 text-xs font-semibold text-gray-400"
            style={{ borderBottom: "1px solid #f3f4f6" }}>
            <span>Day</span>
            <span>Activities</span>
            <span className="text-center">Duration</span>
            <span className="text-center">Calories</span>
            <span className="text-right">Status</span>
          </div>
          {dayStats.map(({ date, acts, cals, mins, day, isToday }) => {
            const dt = new Date(date + "T00:00:00");
            return (
              <div key={date} className="grid grid-cols-5 gap-4 py-3 items-center text-sm"
                style={{ borderBottom: "1px solid #f9fafb", background: isToday ? "#f0fdf4" : "transparent" }}>
                {/* Day */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                    style={{ background: isToday ? "#22c55e" : acts.length > 0 ? "#f3f4f6" : "#fafafa" }}>
                    <span className="text-[8px] font-bold leading-none" style={{ color: isToday ? "rgba(255,255,255,0.7)" : "#9ca3af" }}>
                      {MONTHS[dt.getMonth()]}
                    </span>
                    <span className="text-xs font-black leading-none" style={{ color: isToday ? "#fff" : acts.length > 0 ? "#374151" : "#d1d5db" }}>
                      {dt.getDate()}
                    </span>
                  </div>
                  <span className="font-semibold text-xs" style={{ color: isToday ? "#15803d" : "#374151" }}>
                    {isToday ? "Today" : day}
                  </span>
                </div>

                {/* Activity emojis */}
                <div className="flex gap-1 flex-wrap">
                  {acts.length === 0
                    ? <span className="text-gray-300 text-xs">—</span>
                    : acts.map(a => {
                        const m = ACTIVITY_TYPES.find(at => at.id === a.type);
                        return <span key={a.id} title={m?.label} className="text-base">{m?.icon}</span>;
                      })
                  }
                </div>

                {/* Duration */}
                <span className="text-center text-sm font-semibold text-gray-700">
                  {mins > 0 ? fmtDuration(mins) : <span className="text-gray-300">—</span>}
                </span>

                {/* Calories — green like in Health Reports */}
                <span className="text-center text-sm font-bold" style={{ color: cals > 0 ? "#22c55e" : undefined }}>
                  {cals > 0 ? `${cals}` : <span className="text-gray-300">—</span>}
                </span>

                {/* Status badge */}
                <div className="text-right">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={acts.length > 0
                      ? { background: "#f0fdf4", color: "#16a34a" }
                      : { background: "#f9fafb", color: "#9ca3af" }}>
                    {acts.length > 0 ? "Active" : "Rest"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ── HISTORY TAB ───────────────────────────────────────────────────────────────
function HistoryTab({ activities, onEdit, onDelete }) {
  const [selectedDate, setSelectedDate] = useState(todayStr());

  const allDates   = Array.from(new Set([todayStr(), ...activities.map(a => a.date)])).sort((a,b) => b.localeCompare(a));
  const totalCals  = activities.reduce((s, a) => s + a.estimatedCals, 0);
  const totalMins  = activities.reduce((s, a) => s + a.duration, 0);
  const activeDays = new Set(activities.map(a => a.date)).size;

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (activities.some(a => a.date === d.toISOString().slice(0, 10))) streak++;
    else if (i > 0) break;
  }

  const dayActs = activities.filter(a => a.date === selectedDate);
  const dayCals = dayActs.reduce((s, a) => s + a.estimatedCals, 0);
  const dayMins = dayActs.reduce((s, a) => s + a.duration, 0);
  const isToday = selectedDate === todayStr();

  return (
    <div className="space-y-5">

      {/* All-time stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Current Streak"  value={streak}                unit="days" sub={streak > 0 ? "↑ Consecutive active days" : "Start your streak!"} subColor="#f97316" />
        <StatCard label="Active Days"     value={activeDays}            unit="days" sub="Total days with activity"    />
        <StatCard label="Total Duration"  value={fmtDuration(totalMins)}            sub="All time active duration"    />
        <StatCard label="Total Calories"  value={totalCals}             unit="kcal" sub="↑ All time calories burned"  />
      </div>

      {/* Two-column layout — date list left, detail right */}
      <div className="grid grid-cols-5 gap-4">

        {/* LEFT: Date picker + scrollable list */}
        <div className="col-span-2">
          <Card className="overflow-hidden p-0">

            {/* Date input */}
            <div className="px-4 py-4" style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Jump to Date</p>
              <input
                type="date"
                value={selectedDate}
                max={todayStr()}
                onChange={e => e.target.value && setSelectedDate(e.target.value)}
                className="w-full bg-white rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer transition-colors"
                style={{ border: "1px solid #e5e7eb" }}
              />
            </div>

            {/* Scrollable date rows */}
            <div className="overflow-y-auto" style={{ maxHeight: 460 }}>
              {allDates.map(date => {
                const acts  = activities.filter(a => a.date === date);
                const cals  = acts.reduce((s, a) => s + a.estimatedCals, 0);
                const isSel = date === selectedDate;
                const isTod = date === todayStr();
                const dt    = new Date(date + "T00:00:00");

                return (
                  <button key={date} onClick={() => setSelectedDate(date)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                    style={{
                      borderBottom: "1px solid #f9fafb",
                      background: isSel ? "#1a1a2e" : "white",
                    }}
                    onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = "#f9fafb"; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = "white"; }}>

                    {/* Date block */}
                    <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                      style={{ background: isSel ? "#22c55e" : acts.length > 0 ? "#f3f4f6" : "#fafafa" }}>
                      <span className="text-[9px] font-bold uppercase" style={{ color: isSel ? "rgba(255,255,255,0.7)" : "#9ca3af" }}>
                        {MONTHS[dt.getMonth()]}
                      </span>
                      <span className="text-base font-black leading-none" style={{ color: isSel ? "#fff" : acts.length > 0 ? "#374151" : "#d1d5db" }}>
                        {dt.getDate()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: isSel ? "#fff" : "#374151" }}>
                        {isTod ? "Today" : DAYS[dt.getDay()]}
                      </p>
                      {acts.length > 0 ? (
                        <div className="flex gap-0.5 mt-0.5">
                          {acts.slice(0, 5).map(a => {
                            const m = ACTIVITY_TYPES.find(at => at.id === a.type);
                            return <span key={a.id} className="text-xs">{m?.icon}</span>;
                          })}
                          {acts.length > 5 && <span className="text-[10px] font-bold" style={{ color: isSel ? "#9ca3af" : "#6b7280" }}>+{acts.length - 5}</span>}
                        </div>
                      ) : (
                        <p className="text-[10px]" style={{ color: isSel ? "#6b7280" : "#d1d5db" }}>Rest day</p>
                      )}
                    </div>

                    {cals > 0
                      ? <span className="text-[11px] font-bold flex-shrink-0" style={{ color: isSel ? "#4ade80" : "#22c55e" }}>{cals} kcal</span>
                      : <span className="text-xs" style={{ color: isSel ? "rgba(255,255,255,0.2)" : "#e5e7eb" }}>—</span>
                    }
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT: Selected day detail */}
        <div className="col-span-3 space-y-4">

          {/* Day header card */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">{fmtDateLabel(selectedDate)}</h3>
                  {isToday && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#f0fdf4", color: "#16a34a" }}>Today</span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-0.5">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              {dayActs.length > 0 && (
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: "#22c55e" }}>{dayCals}</p>
                    <p className="text-xs text-gray-400">kcal burned</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{fmtDuration(dayMins)}</p>
                    <p className="text-xs text-gray-400">active time</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{dayActs.length}</p>
                    <p className="text-xs text-gray-400">workout{dayActs.length > 1 ? "s" : ""}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Activity cards */}
          {dayActs.length === 0 ? (
            <Card className="p-10 text-center">
              <div className="text-4xl mb-2">💤</div>
              <p className="font-semibold text-gray-500">
                {isToday ? "No activities logged yet today" : "Rest day — no workouts on this date"}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {dayActs.map(act => (
                <ActivityCard key={act.id} activity={act} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ROOT ─────────────────────────────────────────────────────────────────────
export default function Activities() {
  const [activities,  setActivities]  = useLocalStorage("healthos_act_v3", []);
  const [tab,         setTab]         = useState("today");
  const [showModal,   setShowModal]   = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);
  const [prefillType, setPrefillType] = useState(null);

  const openAdd  = (typeId = null) => { setEditTarget(null); setPrefillType(typeId); setShowModal(true); };
  const openEdit = (act)           => { setEditTarget(act);  setPrefillType(null);   setShowModal(true); };

  const handleSave   = (data) => {
    if (editTarget) setActivities(prev => prev.map(a => a.id === editTarget.id ? { ...a, ...data } : a));
    else            setActivities(prev => [...prev, { ...data, date: todayStr() }]);
  };
  const handleDelete = (id) => setActivities(prev => prev.filter(a => a.id !== id));

  const TABS = [
    { id: "today",   label: "Today",   icon: "🌞" },
    { id: "weekly",  label: "Weekly",  icon: "📊" },
    { id: "history", label: "History", icon: "📅" },
  ];

  return (
    // Page bg matches Health Reports exactly
    <div>
      {showModal && (
        <LogModal
          onClose={() => { setShowModal(false); setEditTarget(null); setPrefillType(null); }}
          onSave={handleSave}
          editing={editTarget}
          prefillType={prefillType}
        />
      )}

      {/* Page header — matches "Health Reports" header exactly */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏃 Activities</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your workouts and stay active</p>
        </div>
        <ExportBtn onClick={() => openAdd()}>+ Log Activity</ExportBtn>
      </div>

      {/* Tab bar — clean segmented control matching Health Reports nav style */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: "#f3f4f6" }}>
        {TABS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all"
            style={{
              background:  tab === id ? "#ffffff" : "transparent",
              color:       tab === id ? "#111827" : "#9ca3af",
              boxShadow:   tab === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}>
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "today"   && <TodayTab   activities={activities} onAdd={openAdd}  onEdit={openEdit} onDelete={handleDelete} />}
      {tab === "weekly"  && <WeeklyTab  activities={activities} />}
      {tab === "history" && <HistoryTab activities={activities} onEdit={openEdit} onDelete={handleDelete} />}
    </div>
  );
}