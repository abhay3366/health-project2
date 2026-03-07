import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

// ── Data ──
const CATEGORIES = [
    { id: "cardio", label: "Cardio", icon: "🏃", color: "#f97316", light: "#fff7ed", border: "#fed7aa" },
    { id: "strength", label: "Strength", icon: "🏋️", color: "#8b5cf6", light: "#f5f3ff", border: "#ddd6fe" },
    { id: "yoga", label: "Yoga", icon: "🧘", color: "#0ea5e9", light: "#f0f9ff", border: "#bae6fd" },
    { id: "sports", label: "Sports", icon: "⚽", color: "#22c55e", light: "#f0fdf4", border: "#bbf7d0" },
    { id: "cycling", label: "Cycling", icon: "🚴", color: "#eab308", light: "#fefce8", border: "#fef08a" },
    { id: "swimming", label: "Swimming", icon: "🏊", color: "#ec4899", light: "#fdf4ff", border: "#f5d0fe" },
    { id: "hiit", label: "HIIT", icon: "⚡", color: "#ef4444", light: "#fff1f2", border: "#fecdd3" },
    { id: "walking", label: "Walking", icon: "🚶", color: "#14b8a6", light: "#f0fdfa", border: "#99f6e4" },
];

const PRESETS = {
    cardio: ["Running", "Jogging", "Jump Rope", "Treadmill", "Elliptical"],
    strength: ["Bench Press", "Deadlift", "Squats", "Pull Ups", "Push Ups", "Shoulder Press"],
    yoga: ["Hatha Yoga", "Vinyasa Flow", "Power Yoga", "Yin Yoga", "Meditation"],
    sports: ["Football", "Cricket", "Basketball", "Badminton", "Tennis"],
    cycling: ["Road Cycling", "Mountain Bike", "Spin Class", "Indoor Cycling"],
    swimming: ["Freestyle", "Breaststroke", "Butterfly", "Backstroke"],
    hiit: ["Tabata", "Circuit Training", "CrossFit", "Box Jumps", "Burpees"],
    walking: ["Morning Walk", "Evening Walk", "Hiking", "Trekking"],
};

const INTENSITY = [
    { id: "low", emoji: "😌", label: "Easy", sub: "Light sweat", color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" },
    { id: "medium", emoji: "💪", label: "Moderate", sub: "Breathing hard", color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
    { id: "high", emoji: "🔥", label: "Intense", sub: "Max effort", color: "#ef4444", bg: "#fff1f2", border: "#fecdd3" },
];

const METS = {
    cardio: { low: 6, medium: 8, high: 12 },
    strength: { low: 3, medium: 5, high: 7 },
    yoga: { low: 2.5, medium: 3.5, high: 4.5 },
    sports: { low: 5, medium: 7, high: 10 },
    cycling: { low: 4, medium: 8, high: 12 },
    swimming: { low: 5, medium: 8, high: 11 },
    hiit: { low: 8, medium: 11, high: 15 },
    walking: { low: 2.5, medium: 3.8, high: 5 },
};

const INITIAL_FORM = {
    category: "cardio",
    workout: "",
    customWorkout: "",
    intensity: "medium",
    duration: "",
    calories: "",
    distance: "",
    sets: "",
    reps: "",
    weight: "",
    notes: "",
};

// ── Sub components ──
function FieldError({ msg }) {
    if (!msg) return null;
    return <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">⚠ {msg}</p>;
}

function SectionTitle({ step, title, required }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {step}
            </div>
            <h3 className="font-syne font-extrabold text-gray-800 text-base">
                {title} {required && <span className="text-red-400 text-sm">*</span>}
            </h3>
        </div>
    );
}

function LightInput({ error, ...props }) {
    return (
        <input
            className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-gray-800 text-sm font-medium outline-none transition-all placeholder:text-gray-300 hover:border-gray-300 focus:border-gray-800 ${
                error ? "border-red-300" : "border-gray-200"
            }`}
            {...props}
        />
    );
}

function Toast({ msg, type = "success" }) {
    if (!msg) return null;
    return (
        <div className={`fixed bottom-6 right-6 text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-2 animate-fadeIn ${
            type === "success" ? "bg-gray-900" : "bg-red-500"
        }`}>
            <span className={type === "success" ? "text-green-400" : "text-white"}>
                {type === "success" ? "✓" : "✗"}
            </span>
            {msg}
        </div>
    );
}

function Field({ label, required = false, error, animate = false, children }) {
    return (
        <div className={`mb-4 ${animate ? "animate-fadeIn" : ""}`}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
            <FieldError msg={error} />
        </div>
    );
}

// ── Main ──
const AddActivity = () => {
    const { user } = useAuth();
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEstimating, setIsEstimating] = useState(false);
    const [toast, setToast] = useState({ message: "", type: "success" });
    const [isDirty, setIsDirty] = useState(false);

    const cat = CATEGORIES.find((c) => c.id === form.category);
    const presets = form.category ? PRESETS[form.category] : [];
    const isStrength = form.category === "strength";
    const isDistance = ["cardio", "cycling", "walking"].includes(form.category);

    // Warn about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    // Auto-estimate calories
    useEffect(() => {
        if (!form.category || !form.intensity || !form.duration || isEstimating) return;
        if (form.calories) return; // Don't override manual entry

        setIsEstimating(true);
        const timer = setTimeout(() => {
            const met = METS[form.category]?.[form.intensity] || 5;
            const estimated = Math.round(met * 70 * (Number(form.duration) / 60) * 1.05);
            if (estimated > 0 && !isNaN(estimated)) {
                setForm((prev) => ({ ...prev, calories: String(estimated) }));
            }
            setIsEstimating(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [form.category, form.intensity, form.duration]);

    const set = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setIsDirty(true);
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: "success" }), 3000);
    };

    // ── Validation ──
    const validate = () => {
        const e = {};

        if (!form.category) e.category = "Please select a category";

        if (!form.workout) {
            e.workout = "Please select a workout";
        } else if (form.workout === "__custom__" && !form.customWorkout.trim()) {
            e.customWorkout = "Please enter your workout name";
        }

        if (!form.duration) {
            e.duration = "Duration is required";
        } else if (Number(form.duration) < 1) {
            e.duration = "At least 1 minute";
        } else if (Number(form.duration) > 600) {
            e.duration = "Max 600 minutes (10 hours)";
        }

        if (form.calories) {
            if (Number(form.calories) < 0) e.calories = "Cannot be negative";
            if (Number(form.calories) > 5000) e.calories = "Max 5000 kcal";
        }

        if (isDistance && form.distance) {
            if (Number(form.distance) < 0) e.distance = "Cannot be negative";
            if (Number(form.distance) > 100) e.distance = "Max 100 km";
        }

        if (isStrength) {
            if (form.sets && Number(form.sets) < 1) e.sets = "Min 1";
            if (form.sets && Number(form.sets) > 100) e.sets = "Max 100 sets";
            if (form.weight && Number(form.weight) < 0) e.weight = "Min 0";
            if (form.weight && Number(form.weight) > 500) e.weight = "Max 500 kg";
        }

        if (form.notes && form.notes.length > 200) e.notes = "Max 200 characters";

        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user?.id) {
            showToast("Please login first", "error");
            return;
        }

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        const workoutName =
            form.workout === "__custom__"
                ? form.customWorkout.trim()
                : form.workout || cat?.label || "Unknown Workout";

        const toNum = (v) => (v === "" || v === undefined ? null : Number(v));

        const entry = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString("en-IN"),
            time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            userId: user.id,
            category: form.category,
            workout: workoutName,
            intensity: form.intensity,
            duration: toNum(form.duration),
            calories: toNum(form.calories),
            distance: toNum(form.distance),
            sets: toNum(form.sets),
            reps: toNum(form.reps),
            weight: toNum(form.weight),
            notes: form.notes.trim(),
            timestamp: Date.now(),
        };

        console.log("Final Entry Being Sent:", entry);

        try {
            const res = await fetch("http://localhost:3001/activities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to save");
            }

            const responseData = await res.json();
            console.log("Server Response:", responseData);

            setForm(INITIAL_FORM);
            setErrors({});
            setIsDirty(false);
            showToast("Activity logged successfully! 💪", "success");
        } catch (err) {
            console.error("Save error:", err);
            showToast(err.message || "Failed to save. Server running?", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        if (isDirty && !window.confirm("Clear all form data? Your unsaved changes will be lost.")) return;
        setForm(INITIAL_FORM);
        setErrors({});
        setIsDirty(false);
        showToast("Form cleared", "success");
    };

    const filledCount = [form.category, form.workout, form.intensity, form.duration].filter(Boolean).length;

    return (
        <>
            <Toast msg={toast.message} type={toast.type} />
            <div className="min-h-screen bg-gray-50 p-6 md:p-10">

                {/* ── Header ── */}
                <div className="max-w-5xl mx-auto mb-8 flex items-start justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        <h1 className="font-syne font-extrabold text-3xl text-gray-900">Log Activity</h1>
                        <p className="text-gray-400 text-sm mt-1">Track your workout, stay consistent 🎯</p>
                    </div>

                    <div className="hidden md:flex items-center gap-2 mt-3">
                        {[form.category, form.workout, form.intensity, form.duration].map((filled, i) => (
                            <div
                                key={i}
                                className="h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: filled ? "32px" : "8px",
                                    background: filled ? (cat?.color || "#111827") : "#e5e7eb",
                                }}
                            />
                        ))}
                        <span className="text-xs text-gray-400 ml-1 font-medium">{filledCount}/4</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                        {/* ══ LEFT 3 cols ══ */}
                        <div className="lg:col-span-3 space-y-4">

                            {/* STEP 1 — Category */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <SectionTitle step="1" title="What type of workout?" required />
                                <div className="grid grid-cols-4 gap-2.5">
                                    {CATEGORIES.map((c) => {
                                        const active = form.category === c.id;
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => {
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        category: c.id,
                                                        workout: "",
                                                        customWorkout: "",
                                                        sets: "",
                                                        reps: "",
                                                        weight: "",
                                                    }));
                                                    setIsDirty(true);
                                                    setErrors((prev) => ({ ...prev, category: "" }));
                                                }}
                                                className="rounded-2xl p-3 text-center border-2 transition-all duration-200"
                                                style={{
                                                    background: active ? c.light : "#fafafa",
                                                    borderColor: active ? c.color : "#f3f4f6",
                                                    transform: active ? "translateY(-2px)" : "none",
                                                    boxShadow: active ? `0 6px 20px ${c.color}25` : "none",
                                                }}
                                            >
                                                <span className="text-2xl block mb-1.5">{c.icon}</span>
                                                <span className="text-[11px] font-bold block" style={{ color: active ? c.color : "#9ca3af" }}>
                                                    {c.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <FieldError msg={errors.category} />
                            </div>

                            {/* STEP 2 — Workout */}
                            {form.category && (
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-fadeIn">
                                    <SectionTitle step="2" title="Choose your workout" required />
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {presets.map((p) => {
                                            const active = form.workout === p;
                                            return (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => {
                                                        setForm((prev) => ({ ...prev, workout: p, customWorkout: "" }));
                                                        setIsDirty(true);
                                                        setErrors((prev) => ({ ...prev, workout: "", customWorkout: "" }));
                                                    }}
                                                    className="text-xs px-4 py-2 rounded-full border-2 font-semibold transition-all"
                                                    style={{
                                                        background: active ? cat?.light : "white",
                                                        borderColor: active ? cat?.color : "#e5e7eb",
                                                        color: active ? cat?.color : "#6b7280",
                                                    }}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        })}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForm((prev) => ({ ...prev, workout: "__custom__" }));
                                                setIsDirty(true);
                                                setErrors((prev) => ({ ...prev, workout: "" }));
                                            }}
                                            className={`text-xs px-4 py-2 rounded-full border-2 font-semibold transition-all ${
                                                form.workout === "__custom__"
                                                    ? "bg-gray-900 border-gray-900 text-white"
                                                    : "bg-white border-gray-200 text-gray-400"
                                            }`}
                                        >
                                            ✏️ Custom
                                        </button>
                                    </div>

                                    {form.workout === "__custom__" && (
                                        <div className="animate-fadeIn">
                                            <LightInput
                                                placeholder="Type your workout name..."
                                                value={form.customWorkout}
                                                error={errors.customWorkout}
                                                onChange={(e) => set("customWorkout", e.target.value)}
                                            />
                                            <FieldError msg={errors.customWorkout} />
                                        </div>
                                    )}
                                    <FieldError msg={errors.workout} />
                                </div>
                            )}

                            {/* STEP 3 — Intensity */}
                            {form.category && (
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-fadeIn">
                                    <SectionTitle step="3" title="How intense was it?" />
                                    <div className="grid grid-cols-3 gap-3">
                                        {INTENSITY.map((lvl) => {
                                            const active = form.intensity === lvl.id;
                                            return (
                                                <button
                                                    key={lvl.id}
                                                    type="button"
                                                    onClick={() => set("intensity", lvl.id)}
                                                    className="rounded-2xl p-4 text-center border-2 transition-all duration-200"
                                                    style={{
                                                        background: active ? lvl.bg : "white",
                                                        borderColor: active ? lvl.color : "#f3f4f6",
                                                        transform: active ? "translateY(-2px)" : "none",
                                                        boxShadow: active ? `0 6px 16px ${lvl.color}20` : "none",
                                                    }}
                                                >
                                                    <span className="text-2xl block mb-2">{lvl.emoji}</span>
                                                    <span className="text-sm font-bold block mb-0.5" style={{ color: active ? lvl.color : "#374151" }}>
                                                        {lvl.label}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400">{lvl.sub}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ══ RIGHT 2 cols ══ */}
                        {form.category && (
                            <div className="lg:col-span-2 space-y-4 animate-fadeIn">

                                {/* Summary banner */}
                                <div className="rounded-3xl p-5 border-2" style={{ background: cat?.light, borderColor: cat?.border }}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl">{cat?.icon}</span>
                                        <div>
                                            <div className="font-syne font-extrabold text-xl leading-tight" style={{ color: cat?.color }}>
                                                {form.workout && form.workout !== "__custom__"
                                                    ? form.workout
                                                    : form.workout === "__custom__" && form.customWorkout
                                                        ? form.customWorkout
                                                        : cat?.label}
                                            </div>
                                            <div className="text-xs font-semibold mt-0.5" style={{ color: `${cat?.color}99` }}>
                                                {cat?.label} · {INTENSITY.find((i) => i.id === form.intensity)?.label} intensity
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* STEP 4 — Details */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                    <SectionTitle step="4" title="Activity details" />

                                    <Field label="Duration (min)" required error={errors.duration}>
                                        <LightInput
                                            type="number"
                                            min="1"
                                            step="1"
                                            placeholder="e.g. 45"
                                            value={form.duration}
                                            error={errors.duration}
                                            onChange={(e) => set("duration", e.target.value)}
                                        />
                                    </Field>

                                    <Field label="Calories (kcal)" error={errors.calories}>
                                        <div className="relative">
                                            <LightInput
                                                type="number"
                                                min="0"
                                                step="1"
                                                placeholder="e.g. 300"
                                                value={form.calories}
                                                error={errors.calories}
                                                onChange={(e) => set("calories", e.target.value)}
                                            />
                                            {isEstimating && (
                                                <div className="absolute right-3 top-3 text-xs text-gray-400">
                                                    Estimating...
                                                </div>
                                            )}
                                        </div>
                                        {!form.calories && form.duration && form.intensity && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                ⚡ Auto-calculation available (based on duration & intensity)
                                            </p>
                                        )}
                                    </Field>

                                    {isDistance && (
                                        <Field label="Distance (km)" error={errors.distance} animate>
                                            <LightInput
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                placeholder="e.g. 5.5"
                                                value={form.distance}
                                                error={errors.distance}
                                                onChange={(e) => set("distance", e.target.value)}
                                            />
                                        </Field>
                                    )}

                                    {isStrength && (
                                        <Field label="Sets / Reps / Weight (kg)" error={errors.sets || errors.reps || errors.weight} animate>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <LightInput
                                                        type="number"
                                                        min="1"
                                                        placeholder="Sets"
                                                        value={form.sets}
                                                        error={errors.sets}
                                                        onChange={(e) => set("sets", e.target.value)}
                                                    />
                                                    <FieldError msg={errors.sets} />
                                                </div>
                                                <div>
                                                    <LightInput
                                                        type="number"
                                                        min="1"
                                                        placeholder="Reps"
                                                        value={form.reps}
                                                        error={errors.reps}
                                                        onChange={(e) => set("reps", e.target.value)}
                                                    />
                                                    <FieldError msg={errors.reps} />
                                                </div>
                                                <div>
                                                    <LightInput
                                                        type="number"
                                                        step="0.5"
                                                        min="0"
                                                        placeholder="kg"
                                                        value={form.weight}
                                                        error={errors.weight}
                                                        onChange={(e) => set("weight", e.target.value)}
                                                    />
                                                    <FieldError msg={errors.weight} />
                                                </div>
                                            </div>
                                        </Field>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                                            Notes (optional)
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="How was the session? Any PRs? 🏆"
                                            className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm outline-none focus:border-gray-800 placeholder:text-gray-300 resize-none transition-all"
                                            value={form.notes}
                                            onChange={(e) => set("notes", e.target.value)}
                                        />
                                        <FieldError msg={errors.notes} />
                                        {form.notes && (
                                            <p className="text-xs text-gray-400 text-right mt-1">
                                                {form.notes.length}/200
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 rounded-2xl font-syne font-extrabold text-base text-white border-none cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                                    style={{
                                        background: `linear-gradient(135deg, ${cat?.color}, ${cat?.color}cc)`,
                                        boxShadow: `0 8px 24px ${cat?.color}40`,
                                    }}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        `${cat?.icon} Save ${cat?.label}`
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="w-full py-2.5 rounded-2xl text-sm font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all border-2 border-transparent hover:border-gray-200"
                                >
                                    ↺ Reset Form
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
};

export default AddActivity;