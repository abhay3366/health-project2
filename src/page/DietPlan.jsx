import { useState, useCallback, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";

// ─────────────────────────────────────────────────────────────────────────────
// THEME TOKENS  (matches the dark sidebar: #1c2b1c deep-green/charcoal)
// ─────────────────────────────────────────────────────────────────────────────
// Sidebar bg   → #1a2e1e  (very dark green-black)
// Accent green → #22c55e  (green-500)
// Card bg      → #ffffff  light cards on light page bg
// Page bg      → #f3f4f6  gray-100

// ─────────────────────────────────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
const DarkCard = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border border-[#1a2e1e]/10 bg-[#1a2e1e] text-white shadow-lg ${className}`}
  >
    {children}
  </div>
);

const LightCard = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const GreenPill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center gap-1 bg-green-500/15 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full ${className}`}>
    {children}
  </span>
);

const RedPill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center gap-1 bg-red-500/10 text-red-500 text-xs font-bold px-2.5 py-1 rounded-full ${className}`}>
    {children}
  </span>
);

const GrayPill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center gap-1 bg-gray-100 text-gray-400 text-xs font-semibold px-2.5 py-1 rounded-full ${className}`}>
    {children}
  </span>
);

const PrimaryBtn = ({ children, onClick, type = "button", disabled, className = "" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-40 ${className}`}
  >
    {children}
  </button>
);

const DarkBtn = ({ children, onClick, type = "button", disabled, className = "" }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`bg-[#1a2e1e] hover:bg-[#243824] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-40 ${className}`}
  >
    {children}
  </button>
);

const ProgressBar = ({ value, max, color = "bg-green-500", trackColor = "bg-gray-100", height = "h-2" }) => (
  <div className={`w-full ${trackColor} rounded-full ${height} overflow-hidden`}>
    <div
      className={`${color} ${height} rounded-full transition-all duration-700`}
      style={{ width: `${Math.min((value / (max || 1)) * 100, 100)}%` }}
    />
  </div>
);

const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{children}</p>
);

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_MEALS = {
  Breakfast: {
    icon: "🌅", scheduledTime: "08:00",
    items: [
      { name: "Oats with Milk", qty: "1 bowl",   cal: 280, protein: 8,  carbs: 45, fat: 5  },
      { name: "Banana",         qty: "1 medium",  cal: 89,  protein: 1,  carbs: 23, fat: 0  },
      { name: "Boiled Egg",     qty: "2 eggs",    cal: 155, protein: 13, carbs: 1,  fat: 11 },
    ],
  },
  Lunch: {
    icon: "☀️", scheduledTime: "13:00",
    items: [
      { name: "Dal (Toor)",  qty: "1 cup",  cal: 180, protein: 11, carbs: 30, fat: 2 },
      { name: "Brown Rice",  qty: "1 cup",  cal: 216, protein: 5,  carbs: 45, fat: 2 },
      { name: "Mixed Salad", qty: "1 bowl", cal: 45,  protein: 2,  carbs: 8,  fat: 0 },
    ],
  },
  "Evening Snack": {
    icon: "🍎", scheduledTime: "17:00",
    items: [
      { name: "Apple",   qty: "1 medium", cal: 95, protein: 0, carbs: 25, fat: 0 },
      { name: "Almonds", qty: "10 pcs",   cal: 70, protein: 3, carbs: 2,  fat: 6 },
    ],
  },
  Dinner: {
    icon: "🌙", scheduledTime: "20:00",
    items: [
      { name: "Paneer Sabzi", qty: "1 cup",   cal: 180, protein: 10, carbs: 8,  fat: 12 },
      { name: "Roti (Wheat)", qty: "2 rotis", cal: 160, protein: 5,  carbs: 32, fat: 2  },
      { name: "Dahi",         qty: "1 cup",   cal: 100, protein: 8,  carbs: 11, fat: 3  },
    ],
  },
};

const MEAL_META = {
  Breakfast:       { bg: "bg-amber-50",  ring: "ring-amber-200",  text: "text-amber-600",  dot: "bg-amber-400"  },
  Lunch:           { bg: "bg-emerald-50",ring: "ring-emerald-200",text: "text-emerald-600",dot: "bg-emerald-400"},
  "Evening Snack": { bg: "bg-orange-50", ring: "ring-orange-200", text: "text-orange-500", dot: "bg-orange-400" },
  Dinner:          { bg: "bg-violet-50", ring: "ring-violet-200", text: "text-violet-600",  dot: "bg-violet-400" },
};
const DMETA = { bg: "bg-gray-100", ring: "ring-gray-200", text: "text-gray-500", dot: "bg-gray-400" };

const MACRO_CFG = [
  { label: "Protein",       max: 80,  bar: "bg-blue-500",    text: "text-blue-600",    bg: "bg-blue-50",   key: "protein", unit: "g" },
  { label: "Carbohydrates", max: 250, bar: "bg-amber-400",   text: "text-amber-600",   bg: "bg-amber-50",  key: "carbs",   unit: "g" },
  { label: "Fat",           max: 55,  bar: "bg-rose-400",    text: "text-rose-500",    bg: "bg-rose-50",   key: "fat",     unit: "g" },
  { label: "Fiber",         max: 25,  bar: "bg-emerald-400", text: "text-emerald-600", bg: "bg-emerald-50",key: "fiber",   unit: "g" },
];

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Evening Snack", "Dinner", "Custom"];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);

const fmtTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hh = +h;
  return `${hh % 12 || 12}:${m} ${hh < 12 ? "AM" : "PM"}`;
};

const fmtDateLabel = (d) => {
  const dt  = new Date(d + "T00:00:00");
  const yes = new Date(); yes.setDate(yes.getDate() - 1);
  if (d === todayStr()) return "Today";
  if (d === yes.toISOString().slice(0, 10)) return "Yesterday";
  return `${DAYS[dt.getDay()]}, ${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
};

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : (typeof init === "function" ? init() : init);
    } catch {
      return typeof init === "function" ? init() : init;
    }
  });
  const save = useCallback((v) => {
    setVal((prev) => {
      const next = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [val, save];
}

function mealCompletion(meals, dayLog) {
  const names = Object.keys(meals);
  if (!names.length) return { eaten: 0, total: 0, pct: 0 };
  const eaten = names.filter((m) => dayLog?.[m]?.eaten).length;
  return { eaten, total: names.length, pct: Math.round((eaten / names.length) * 100) };
}

function calcMacros(meals) {
  const all = Object.values(meals).flatMap((m) => m.items);
  return {
    cal:     all.reduce((s, i) => s + i.cal, 0),
    protein: all.reduce((s, i) => s + i.protein, 0),
    carbs:   all.reduce((s, i) => s + i.carbs, 0),
    fat:     all.reduce((s, i) => s + i.fat, 0),
    fiber:   18,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD MEAL MODAL
// ─────────────────────────────────────────────────────────────────────────────
function AddMealModal({ onClose, onSave }) {
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      mealType: "Breakfast", customMealName: "", scheduledTime: "08:00",
      items: [{ name: "", qty: "", cal: "", protein: "", carbs: "", fat: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const mealType = watch("mealType");

  const onSubmit = (data) => {
    const mealName = data.mealType === "Custom" ? data.customMealName.trim() : data.mealType;
    if (!mealName) return;
    onSave(
      mealName,
      data.items.map((i) => ({
        name: i.name, qty: i.qty,
        cal: +i.cal || 0, protein: +i.protein || 0, carbs: +i.carbs || 0, fat: +i.fat || 0,
      })),
      data.scheduledTime
    );
    onClose();
  };

  const inp = (err) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all bg-gray-50 ${
      err ? "border-red-300 focus:ring-red-200 bg-red-50" : "border-gray-200 focus:ring-green-300 focus:border-green-400 hover:border-gray-300"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col">

        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-gray-900">Add New Meal</h2>
            <p className="text-xs text-gray-400 mt-0.5">Add food items to your daily meal plan</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-lg transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

            {/* Meal type */}
            <div>
              <SectionLabel>Select Meal Type</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {MEAL_TYPES.map((type) => {
                  const icon = DEFAULT_MEALS[type]?.icon;
                  return (
                    <label key={type} className="cursor-pointer">
                      <input type="radio" value={type} {...register("mealType")} className="sr-only" />
                      <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                        mealType === type
                          ? "border-[#1a2e1e] bg-[#1a2e1e] text-white"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                      }`}>
                        {icon && <span>{icon}</span>}
                        {type}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Custom name */}
            {mealType === "Custom" && (
              <div>
                <SectionLabel>Custom Meal Name</SectionLabel>
                <input
                  {...register("customMealName", { validate: (v) => mealType !== "Custom" || v.trim() !== "" || "Required" })}
                  placeholder="e.g. Pre-Workout Snack"
                  className={inp(errors.customMealName)}
                />
                {errors.customMealName && <p className="text-red-500 text-xs mt-1">Please enter a meal name</p>}
              </div>
            )}

            {/* Scheduled time */}
            <div>
              <SectionLabel>Scheduled Time</SectionLabel>
              <div className="flex items-center gap-3">
                <input type="time" {...register("scheduledTime")} className={`${inp(false)} w-40`} />
                <p className="text-xs text-gray-400">Set the planned eating time for reminders</p>
              </div>
            </div>

            {/* Food items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Food Items</SectionLabel>
                <button
                  type="button"
                  onClick={() => append({ name: "", qty: "", cal: "", protein: "", carbs: "", fat: "" })}
                  className="text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  + Add Item
                </button>
              </div>
              <div className="space-y-3">
                {fields.map((field, i) => (
                  <div key={field.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-500">Item {i + 1}</span>
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 hover:text-red-600 font-semibold">
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 mb-2.5">
                      <div className="col-span-2">
                        <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Food Name *</label>
                        <input {...register(`items.${i}.name`, { required: true })} placeholder="e.g. Oats with Milk" className={inp(errors.items?.[i]?.name)} />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Quantity *</label>
                        <input {...register(`items.${i}.qty`, { required: true })} placeholder="1 bowl" className={inp(errors.items?.[i]?.qty)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { lbl: "Calories", key: "cal",     cls: "text-gray-600" },
                        { lbl: "Protein",  key: "protein", cls: "text-blue-600" },
                        { lbl: "Carbs",    key: "carbs",   cls: "text-amber-600" },
                        { lbl: "Fat",      key: "fat",     cls: "text-rose-500" },
                      ].map(({ lbl, key, cls }) => (
                        <div key={key}>
                          <label className={`block text-[10px] font-black uppercase tracking-wide mb-1 ${cls}`}>{lbl}</label>
                          <input
                            type="number" min="0"
                            {...register(`items.${i}.${key}`, { required: true, min: 0 })}
                            className={inp(errors.items?.[i]?.[key])}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white rounded-b-2xl">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <PrimaryBtn type="submit">Save Meal</PrimaryBtn>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOG / TRACK MODAL
// ─────────────────────────────────────────────────────────────────────────────
function LogModal({ mealName, meal, date, existing, onSave, onClose }) {
  const [eaten,   setEaten]   = useState(existing?.eaten ?? null);
  const [note,    setNote]    = useState(existing?.note ?? "");
  const [eatTime, setEatTime] = useState(existing?.eatTime ?? new Date().toTimeString().slice(0, 5));
  const meta     = MEAL_META[mealName] || DMETA;
  const totalCal = meal.items.reduce((s, i) => s + i.cal, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm">

        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl ${meta.bg} flex-shrink-0`}>
            {meal.icon}
          </div>
          <div className="flex-1">
            <p className="font-black text-gray-900 text-base">{mealName}</p>
            <p className="text-xs text-gray-400">{fmtDateLabel(date)} · {totalCal} kcal</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-lg">×</button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* Eaten toggle */}
          <div>
            <SectionLabel>Did you eat this meal?</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setEaten(true)}
                className={`py-4 rounded-2xl font-bold text-sm border-2 transition-all ${
                  eaten === true
                    ? "border-green-500 bg-green-500 text-white shadow-lg shadow-green-100"
                    : "border-gray-200 text-gray-500 hover:border-green-300 hover:bg-green-50"
                }`}
              >
                <div className="text-2xl mb-1">✅</div>
                Yes, I ate it
              </button>
              <button
                onClick={() => setEaten(false)}
                className={`py-4 rounded-2xl font-bold text-sm border-2 transition-all ${
                  eaten === false
                    ? "border-rose-400 bg-rose-400 text-white shadow-lg shadow-rose-100"
                    : "border-gray-200 text-gray-500 hover:border-rose-300 hover:bg-rose-50"
                }`}
              >
                <div className="text-2xl mb-1">❌</div>
                Skipped it
              </button>
            </div>
          </div>

          {/* Time */}
          {eaten === true && (
            <div>
              <SectionLabel>What time did you eat?</SectionLabel>
              <input
                type="time" value={eatTime} onChange={(e) => setEatTime(e.target.value)}
                className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              {meal.scheduledTime && (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>Scheduled: <span className="font-semibold text-gray-600">{fmtTime(meal.scheduledTime)}</span></span>
                  {eatTime && eatTime !== meal.scheduledTime && (
                    <span className={`font-bold ${eatTime > meal.scheduledTime ? "text-orange-500" : "text-green-500"}`}>
                      · {eatTime > meal.scheduledTime ? "⏰ Late" : "⚡ Early"}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Note */}
          <div>
            <SectionLabel>Add a note (optional)</SectionLabel>
            <textarea
              value={note} onChange={(e) => setNote(e.target.value)} rows={2}
              placeholder={eaten === true ? "How did it taste? Any substitutions?" : "Why did you skip it?"}
              className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <PrimaryBtn
            disabled={eaten === null}
            className="flex-1 py-3 flex justify-center"
            onClick={() => { onSave({ eaten, note, eatTime: eaten ? eatTime : null, loggedAt: new Date().toISOString() }); onClose(); }}
          >
            Save Log
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEAL CARD (reused in Today + Meal Plan tabs)
// ─────────────────────────────────────────────────────────────────────────────
function MealCard({ mealName, meal, log, isToday, onTrack }) {
  const [open, setOpen] = useState(false);
  const meta   = MEAL_META[mealName] || DMETA;
  const cal    = meal.items.reduce((s, i) => s + i.cal, 0);

  const statusRing =
    log?.eaten === true  ? "ring-2 ring-green-300 bg-green-50/50" :
    log?.eaten === false ? "ring-2 ring-rose-300 bg-rose-50/50"   : "";

  return (
    <LightCard className={`overflow-hidden transition-all ${statusRing}`}>
      {/* Row */}
      <div className="flex items-center gap-3 p-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${meta.bg}`}>
          {meal.icon}
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setOpen((p) => !p)}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900">{mealName}</span>
            {log?.eaten === true  && <GreenPill>✓ Eaten</GreenPill>}
            {log?.eaten === false && <RedPill>✕ Skipped</RedPill>}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 flex-wrap">
            <span className="font-semibold text-gray-600">{cal} kcal</span>
            <span className="text-gray-300">·</span>
            <span>{meal.items.length} items</span>
            <span className="text-gray-300">·</span>
            <span>⏰ {fmtTime(meal.scheduledTime)}</span>
            {log?.eatTime && (
              <>
                <span className="text-gray-300">·</span>
                <span className="font-semibold text-gray-500">Ate at {fmtTime(log.eatTime)}</span>
                {meal.scheduledTime && log.eatTime !== meal.scheduledTime && (
                  <span className={`font-bold ${log.eatTime > meal.scheduledTime ? "text-orange-500" : "text-emerald-500"}`}>
                    ({log.eatTime > meal.scheduledTime ? "Late" : "Early"})
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Track button — only for today */}
        {isToday && (
          <button
            onClick={() => onTrack(mealName)}
            className={`text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0 transition-colors ${
              log?.eaten === true  ? "bg-green-100 text-green-700 hover:bg-green-200" :
              log?.eaten === false ? "bg-rose-100 text-rose-600 hover:bg-rose-200"   :
              "bg-[#1a2e1e] text-white hover:bg-[#243824]"
            }`}
          >
            {log ? "Edit" : "Track"}
          </button>
        )}

        {/* Chevron */}
        <button
          onClick={() => setOpen((p) => !p)}
          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all flex-shrink-0"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        >
          ▾
        </button>
      </div>

      {/* Note */}
      {log?.note && (
        <div className="px-4 pb-3">
          <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-500 italic flex items-start gap-1.5">
            <span className="mt-0.5">💬</span>
            <span>"{log.note}"</span>
          </div>
        </div>
      )}

      {/* Items table */}
      {open && (
        <div className="border-t border-gray-100 bg-gray-50/60">
          <table className="w-full text-xs px-4">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left px-4 py-2.5 font-semibold">Food Item</th>
                <th className="text-center py-2.5 font-semibold">Qty</th>
                <th className="text-center py-2.5 font-semibold text-gray-600">Cal</th>
                <th className="text-center py-2.5 font-semibold text-blue-500">Protein</th>
                <th className="text-center py-2.5 font-semibold text-amber-500">Carbs</th>
                <th className="text-right px-4 py-2.5 font-semibold text-rose-400">Fat</th>
              </tr>
            </thead>
            <tbody>
              {meal.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-white/80 transition-colors">
                  <td className="px-4 py-2.5 font-semibold text-gray-800">{item.name}</td>
                  <td className="py-2.5 text-center text-gray-500">{item.qty}</td>
                  <td className="py-2.5 text-center font-bold text-gray-900">{item.cal}</td>
                  <td className="py-2.5 text-center text-blue-500 font-medium">{item.protein}g</td>
                  <td className="py-2.5 text-center text-amber-500 font-medium">{item.carbs}g</td>
                  <td className="px-4 py-2.5 text-right text-rose-400 font-medium">{item.fat}g</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-black text-xs bg-white/80">
                <td className="px-4 py-2.5 text-gray-700">Total</td>
                <td />
                <td className="py-2.5 text-center text-gray-900">{cal}</td>
                <td className="py-2.5 text-center text-blue-600">{meal.items.reduce((s, i) => s + i.protein, 0)}g</td>
                <td className="py-2.5 text-center text-amber-600">{meal.items.reduce((s, i) => s + i.carbs, 0)}g</td>
                <td className="px-4 py-2.5 text-right text-rose-500">{meal.items.reduce((s, i) => s + i.fat, 0)}g</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </LightCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TODAY TAB
// ─────────────────────────────────────────────────────────────────────────────
function TodayTab({ meals, logs, onTrack, onAddMeal }) {
  const today  = todayStr();
  const dayLog = logs[today] || {};
  const { eaten, total, pct } = mealCompletion(meals, dayLog);
  const macros = calcMacros(meals);

  // Streak
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    if (Object.keys(meals).some((m) => logs[ds]?.[m]?.eaten)) streak++;
    else if (i > 0) break;
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-5">

      {/* ── Hero banner ── */}
      <DarkCard className="p-6 relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-green-500/10 rounded-full pointer-events-none" />
        <div className="absolute -right-4 -bottom-10 w-24 h-24 bg-green-500/5 rounded-full pointer-events-none" />

        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-green-400 text-sm font-semibold">{greeting()}, Rahul 👋</p>
              <h2 className="text-2xl font-black text-white mt-0.5">
                {pct === 100 ? "Perfect Day! 🎉" : eaten === 0 ? "Let's get started!" : `${eaten} of ${total} Done`}
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-orange-400">🔥 {streak}</div>
              <div className="text-xs text-gray-400 mt-0.5">Day Streak</div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 bg-white/10 rounded-full h-2.5">
              <div
                className="bg-green-400 h-2.5 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-green-400 font-black text-sm">{pct}%</span>
          </div>
          <p className="text-xs text-gray-400">
            {total - eaten > 0 ? `${total - eaten} meal${total - eaten > 1 ? "s" : ""} remaining` : "All meals logged for today!"}
          </p>
        </div>
      </DarkCard>

      {/* ── Macro summary row ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Calories", value: macros.cal,     unit: "kcal", accent: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Protein",  value: `${macros.protein}g`, unit: "/ 80g",  accent: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100"    },
          { label: "Carbs",    value: `${macros.carbs}g`,   unit: "/ 250g", accent: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100"   },
          { label: "Fat",      value: `${macros.fat}g`,     unit: "/ 55g",  accent: "text-rose-500",    bg: "bg-rose-50",    border: "border-rose-100"    },
        ].map(({ label, value, unit, accent, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-4`}>
            <p className={`text-xs font-bold uppercase tracking-wide ${accent} mb-1`}>{label}</p>
            <p className="text-xl font-black text-gray-900">
              {value}
              <span className="text-xs font-normal text-gray-400 ml-1">{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ── Meals ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-gray-900">Today's Meals</h3>
          <button
            onClick={onAddMeal}
            className="text-xs font-bold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            + Add Meal
          </button>
        </div>
        <div className="space-y-3">
          {Object.entries(meals).map(([mealName, meal]) => (
            <MealCard
              key={mealName}
              mealName={mealName}
              meal={meal}
              log={dayLog[mealName]}
              isToday
              onTrack={(name) => onTrack(name, today)}
            />
          ))}
        </div>
      </div>

      {/* ── Macro breakdown ── */}
      <LightCard className="p-5">
        <h3 className="font-black text-gray-900 text-sm mb-4">Macro Breakdown</h3>
        <div className="space-y-3.5">
          {MACRO_CFG.map(({ label, max, bar, text, key }) => {
            const v = macros[key];
            return (
              <div key={label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-xs font-bold ${text}`}>{label}</span>
                  <span className="text-xs text-gray-400">
                    {v}g / {max}g
                    <span className="ml-1.5 font-black text-gray-600">({Math.round((v / max) * 100)}%)</span>
                  </span>
                </div>
                <ProgressBar value={v} max={max} color={bar} />
              </div>
            );
          })}
        </div>
      </LightCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY TAB
// ─────────────────────────────────────────────────────────────────────────────
function HistoryTab({ meals, logs, onTrack }) {
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const dateInputRef = useRef(null);

  const allDates = Array.from(new Set([todayStr(), ...Object.keys(logs)])).sort((a, b) => b.localeCompare(a));

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    if (Object.keys(meals).some((m) => logs[ds]?.[m]?.eaten)) streak++;
    else if (i > 0) break;
  }

  const totalTracked = allDates.filter((d) => Object.keys(logs[d] || {}).length > 0).length;
  const perfectDays  = allDates.filter((d) => { const c = mealCompletion(meals, logs[d]); return c.pct === 100 && c.total > 0; }).length;

  const dayLog = logs[selectedDate] || {};
  const { eaten, total, pct } = mealCompletion(meals, dayLog);
  const isToday = selectedDate === todayStr();

  const eatenCals = Object.entries(meals)
    .filter(([m]) => dayLog[m]?.eaten)
    .flatMap(([, meal]) => meal.items)
    .reduce((s, i) => s + i.cal, 0);

  const pctColor =
    pct === 100 ? "text-green-600 bg-green-100" :
    pct > 50    ? "text-amber-600 bg-amber-100" :
    pct > 0     ? "text-rose-500 bg-rose-100"   : "text-gray-400 bg-gray-100";

  const barColor =
    pct === 100 ? "bg-green-500" :
    pct > 50    ? "bg-amber-400" : "bg-rose-400";

  return (
    <div className="space-y-5">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: "🔥", label: "Current Streak", value: streak,        unit: "days", color: "text-orange-500" },
          { icon: "📅", label: "Total Tracked",  value: totalTracked,  unit: "days", color: "text-blue-500"   },
          { icon: "🎯", label: "Perfect Days",   value: perfectDays,   unit: "days", color: "text-green-600"  },
        ].map(({ icon, label, value, unit, color }) => (
          <DarkCard key={label} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{icon}</span>
              <span className="text-xs text-gray-400 font-medium">{label}</span>
            </div>
            <p className={`text-2xl font-black ${color}`}>
              {value}
              <span className="text-xs font-normal text-gray-500 ml-1">{unit}</span>
            </p>
          </DarkCard>
        ))}
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-5 gap-4">

        {/* ── LEFT: date sidebar ── */}
        <div className="col-span-2">
          <LightCard className="overflow-hidden p-0">

            {/* Date picker header */}
            <div className="bg-[#1a2e1e] px-4 py-4">
              <p className="text-xs font-black uppercase tracking-widest text-green-400 mb-2">Jump to Date</p>
              <div className="relative">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  max={todayStr()}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm font-bold text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Or select from the list below</p>
            </div>

            {/* Date list */}
            <div className="overflow-y-auto divide-y divide-gray-50" style={{ maxHeight: 440 }}>
              {allDates.map((date) => {
                const dl  = logs[date] || {};
                const { eaten: e, total: t, pct: p } = mealCompletion(meals, dl);
                const isSel  = date === selectedDate;
                const isTod  = date === todayStr();
                const dt     = new Date(date + "T00:00:00");

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left ${
                      isSel ? "bg-[#1a2e1e]" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {/* Date block */}
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${isSel ? "bg-green-500" : "bg-gray-100"}`}>
                      <span className={`text-[9px] font-black uppercase ${isSel ? "text-white/70" : "text-gray-400"}`}>
                        {MONTHS[dt.getMonth()]}
                      </span>
                      <span className={`text-lg font-black leading-none ${isSel ? "text-white" : "text-gray-800"}`}>
                        {dt.getDate()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isSel ? "text-white" : "text-gray-800"}`}>
                        {isTod ? "Today" : DAYS[dt.getDay()]}
                        {p === 100 && t > 0 && " 🎯"}
                      </p>
                      {/* Meal status dots */}
                      <div className="flex gap-1 mt-1">
                        {Object.keys(meals).map((mn) => (
                          <div
                            key={mn}
                            title={mn}
                            className={`w-2 h-2 rounded-full ${
                              dl[mn]?.eaten === true  ? "bg-green-400" :
                              dl[mn]?.eaten === false ? "bg-rose-400"  :
                              isSel ? "bg-white/20" : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* % badge */}
                    {t > 0 ? (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg flex-shrink-0 ${
                        isSel
                          ? p === 100 ? "bg-green-400 text-white" : p > 50 ? "bg-amber-400 text-white" : "bg-rose-400 text-white"
                          : p === 100 ? "bg-green-100 text-green-600" : p > 50 ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-500"
                      }`}>
                        {p}%
                      </span>
                    ) : (
                      <span className={`text-xs ${isSel ? "text-white/30" : "text-gray-300"}`}>—</span>
                    )}
                  </button>
                );
              })}
            </div>
          </LightCard>
        </div>

        {/* ── RIGHT: day detail ── */}
        <div className="col-span-3 space-y-4">

          {/* Day summary card */}
          <DarkCard className="p-5 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-500/10 rounded-full pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-white text-lg">{fmtDateLabel(selectedDate)}</h3>
                    {isToday && (
                      <span className="text-[10px] bg-green-500 text-white font-black px-2 py-0.5 rounded-full">TODAY</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                {total > 0 && (
                  <div className={`text-right px-3 py-1.5 rounded-xl ${pctColor}`}>
                    <p className="text-xl font-black">{pct}%</p>
                    <p className="text-[10px] font-semibold">{eaten}/{total} meals</p>
                  </div>
                )}
              </div>

              {total > 0 && (
                <>
                  <ProgressBar value={eaten} max={total} color={barColor} trackColor="bg-white/10" height="h-2" />
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-xs bg-white/10 text-gray-300 font-semibold px-2.5 py-1 rounded-lg">
                      {eatenCals} kcal consumed
                    </span>
                    {pct === 100 && (
                      <span className="text-xs bg-green-500/20 text-green-400 font-bold px-2.5 py-1 rounded-lg">🎯 Perfect Day!</span>
                    )}
                    {eaten === 0 && (
                      <span className="text-xs bg-white/10 text-gray-400 font-semibold px-2.5 py-1 rounded-lg">No meals logged yet</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </DarkCard>

          {/* Meal detail cards */}
          <div className="space-y-3">
            {Object.entries(meals).map(([mealName, meal]) => {
              const log  = dayLog[mealName];
              const meta = MEAL_META[mealName] || DMETA;
              const cal  = meal.items.reduce((s, i) => s + i.cal, 0);

              return (
                <LightCard key={mealName} className={`p-4 transition-all ${
                  log?.eaten === true  ? "ring-2 ring-green-200 bg-green-50/40" :
                  log?.eaten === false ? "ring-2 ring-rose-200 bg-rose-50/40"   : ""
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${meta.bg} flex-shrink-0`}>
                      {meal.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{mealName}</span>
                        {log?.eaten === true  && <GreenPill>✓ Eaten</GreenPill>}
                        {log?.eaten === false && <RedPill>✕ Skipped</RedPill>}
                        {!log                 && <GrayPill>Pending</GrayPill>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 flex-wrap">
                        <span className="font-medium">{cal} kcal</span>
                        {meal.scheduledTime && <><span>·</span><span>⏰ {fmtTime(meal.scheduledTime)}</span></>}
                        {log?.eatTime && (
                          <>
                            <span>·</span>
                            <span className="text-gray-600 font-semibold">Ate at {fmtTime(log.eatTime)}</span>
                            {meal.scheduledTime && log.eatTime !== meal.scheduledTime && (
                              <span className={`font-bold ${log.eatTime > meal.scheduledTime ? "text-orange-500" : "text-emerald-500"}`}>
                                ({log.eatTime > meal.scheduledTime ? "Late" : "Early"})
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {/* Edit button — only today */}
                    {isToday && (
                      <button
                        onClick={() => onTrack(mealName, selectedDate)}
                        className={`text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0 transition-colors ${
                          log?.eaten === true  ? "bg-green-100 text-green-700 hover:bg-green-200" :
                          log?.eaten === false ? "bg-rose-100 text-rose-600 hover:bg-rose-200"   :
                          "bg-[#1a2e1e] text-white hover:bg-[#243824]"
                        }`}
                      >
                        {log ? "Edit" : "Track"}
                      </button>
                    )}
                  </div>
                  {log?.note && (
                    <div className="mt-2.5 ml-13">
                      <div className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-500 italic flex items-start gap-1.5">
                        <span>💬</span>
                        <span>"{log.note}"</span>
                      </div>
                    </div>
                  )}
                </LightCard>
              );
            })}

            {Object.keys(meals).length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🥗</div>
                <p className="text-sm font-bold text-gray-400">No meals in your plan yet</p>
                <p className="text-xs text-gray-300 mt-1">Go to the Meal Plan tab to add meals</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MEAL PLAN TAB
// ─────────────────────────────────────────────────────────────────────────────
function MealPlanTab({ meals, onAddMeal }) {
  const macros = calcMacros(meals);

  return (
    <div className="space-y-5">

      {/* Summary hero */}
      <DarkCard className="p-5 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-green-500/10 rounded-full pointer-events-none" />
        <div className="relative">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-1">Daily Target</p>
          <div className="flex items-end gap-4 mb-4">
            <div>
              <span className="text-4xl font-black text-white">{macros.cal}</span>
              <span className="text-gray-400 text-sm ml-1">kcal</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-1">
              {[
                { label: "Protein", val: macros.protein, color: "text-blue-400"  },
                { label: "Carbs",   val: macros.carbs,   color: "text-amber-400" },
                { label: "Fat",     val: macros.fat,     color: "text-rose-400"  },
              ].map(({ label, val, color }) => (
                <div key={label} className="text-center">
                  <p className={`text-base font-black ${color}`}>{val}g</p>
                  <p className="text-[10px] text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Macro bars */}
          <div className="space-y-2">
            {MACRO_CFG.map(({ label, max, bar, text, key }) => {
              const v = macros[key];
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold w-16 flex-shrink-0 ${text}`}>{label}</span>
                  <div className="flex-1 bg-white/10 rounded-full h-1.5">
                    <div className={`${bar} h-1.5 rounded-full`} style={{ width: `${Math.min((v / max) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 w-16 text-right flex-shrink-0">{v}g / {max}g</span>
                </div>
              );
            })}
          </div>
        </div>
      </DarkCard>

      {/* Meal schedule */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-gray-900">Meal Schedule</h3>
          <DarkBtn onClick={onAddMeal} className="text-xs px-3 py-2">+ Add Meal</DarkBtn>
        </div>
        <div className="space-y-3">
          {Object.entries(meals).map(([mealName, meal]) => (
            <MealCard key={mealName} mealName={mealName} meal={meal} log={null} isToday={false} onTrack={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function DietPlan() {
  const [meals, setMeals]           = useLocalStorage("dp_meals_v4", DEFAULT_MEALS);
  const [logs,  setLogs]            = useLocalStorage("dp_logs_v4",  {});
  const [tab,   setTab]             = useState("today");
  const [showAdd,   setShowAdd]     = useState(false);
  const [logTarget, setLogTarget]   = useState(null);

  const handleSaveMeal = (mealName, items, scheduledTime) => {
    setMeals((prev) => ({
      ...prev,
      [mealName]: {
        icon: DEFAULT_MEALS[mealName]?.icon || "🍽️",
        scheduledTime,
        items: [...(prev[mealName]?.items || []), ...items],
      },
    }));
  };

  const handleSaveLog = (mealName, date, data) => {
    setLogs((prev) => ({ ...prev, [date]: { ...(prev[date] || {}), [mealName]: data } }));
  };

  const TABS = [
    { id: "today",   label: "Today",     icon: "🌞" },
    { id: "history", label: "History",   icon: "📅" },
    { id: "plan",    label: "Meal Plan", icon: "📋" },
  ];

  return (
    <div>
      {showAdd && <AddMealModal onClose={() => setShowAdd(false)} onSave={handleSaveMeal} />}
      {logTarget && meals[logTarget.mealName] && (
        <LogModal
          mealName={logTarget.mealName}
          meal={meals[logTarget.mealName]}
          date={logTarget.date}
          existing={(logs[logTarget.date] || {})[logTarget.mealName]}
          onSave={(data) => handleSaveLog(logTarget.mealName, logTarget.date, data)}
          onClose={() => setLogTarget(null)}
        />
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🥗 Diet Plan</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your personalized daily nutrition tracker</p>
        </div>
        <PrimaryBtn onClick={() => setShowAdd(true)}>+ Add Meal</PrimaryBtn>
      </div>

      {/* Tab bar — styled like sidebar nav */}
      <div className="bg-[#1a2e1e] p-1.5 rounded-2xl mb-6 flex gap-1">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold rounded-xl transition-all ${
              tab === id
                ? "bg-green-500 text-white shadow-md"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "today"   && <TodayTab   meals={meals} logs={logs} onTrack={(mn, d) => setLogTarget({ mealName: mn, date: d })} onAddMeal={() => setShowAdd(true)} />}
      {tab === "history" && <HistoryTab meals={meals} logs={logs} onTrack={(mn, d) => setLogTarget({ mealName: mn, date: d })} />}
      {tab === "plan"    && <MealPlanTab meals={meals} onAddMeal={() => setShowAdd(true)} />}
    </div>
  );
}