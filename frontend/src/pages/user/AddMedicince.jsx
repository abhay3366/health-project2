import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";


// ── Constants ──
const MED_TYPES = [
    { id: "tablet",    label: "Tablet",    icon: "💊", color: "#6366f1", light: "#eef2ff", border: "#c7d2fe" },
    { id: "capsule",   label: "Capsule",   icon: "💉", color: "#ec4899", light: "#fdf2f8", border: "#fbcfe8" },
    { id: "syrup",     label: "Syrup",     icon: "🧴", color: "#0ea5e9", light: "#f0f9ff", border: "#bae6fd" },
    { id: "drops",     label: "Drops",     icon: "💧", color: "#14b8a6", light: "#f0fdfa", border: "#99f6e4" },
    { id: "inhaler",   label: "Inhaler",   icon: "🌬️", color: "#8b5cf6", light: "#f5f3ff", border: "#ddd6fe" },
    { id: "patch",     label: "Patch",     icon: "🩹", color: "#f97316", light: "#fff7ed", border: "#fed7aa" },
    { id: "injection", label: "Injection", icon: "🩺", color: "#ef4444", light: "#fff1f2", border: "#fecdd3" },
    { id: "other",     label: "Other",     icon: "🔬", color: "#64748b", light: "#f8fafc", border: "#e2e8f0" },
];

const FREQUENCIES = [
    { id: "once",     label: "Once a day",  sub: "1x daily"  },
    { id: "twice",    label: "Twice a day", sub: "2x daily"  },
    { id: "thrice",   label: "3x a day",    sub: "3x daily"  },
    { id: "weekly",   label: "Weekly",      sub: "1x week"   },
    { id: "asneeded", label: "As needed",   sub: "PRN"       },
    { id: "custom",   label: "Custom",      sub: "Set yours" },
];

const MEAL_TIMING = [
    { id: "before", label: "Before Meal",   icon: "🍽️" },
    { id: "after",  label: "After Meal",    icon: "✅"  },
    { id: "with",   label: "With Meal",     icon: "🥗"  },
    { id: "empty",  label: "Empty Stomach", icon: "⏰"  },
    { id: "any",    label: "Any Time",      icon: "🕐"  },
];

const INITIAL_FORM = {
    medType:         "tablet",
    name:            "",
    dosage:          "",
    dosageUnit:      "mg",
    frequency:       "once",
    customFrequency: "",
    mealTiming:      "after",
    startDate:       new Date().toISOString().split("T")[0],
    endDate:         "",
    reminderTime:    "",
    stock:           "",
    notes:           "",
    prescribedBy:    "",
    purpose:         "",
};

// ── Small Components ──
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

function FieldError({ msg }) {
    if (!msg) return null;
    return (
        <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">⚠ {msg}</p>
    );
}

function LightInput({ error, ...props }) {
    return (
        <input
            className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-gray-800 text-sm font-medium outline-none transition-all placeholder:text-gray-300 hover:border-gray-300 focus:border-gray-800 ${
                error ? "border-red-300 focus:border-red-400" : "border-gray-200"
            }`}
            {...props}
        />
    );
}

function Field({ label, required = false, error, hint, children }) {
    return (
        <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
            {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
            <FieldError msg={error} />
        </div>
    );
}

// ── Medicine Card ──


function DeleteModal({ med, onConfirm, onCancel }) {
    const type = MED_TYPES.find((t) => t.id === med?.medType) || MED_TYPES[MED_TYPES.length - 1];
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4" style={{ background: type.light }}>{type.icon}</div>
                <h3 className="font-syne font-extrabold text-gray-900 text-lg text-center mb-1">Remove Medicine?</h3>
                <p className="text-gray-400 text-sm text-center mb-6">
                    <span className="font-semibold text-gray-600">{med?.name}</span> will be permanently removed.
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 rounded-2xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all">Remove</button>
                </div>
            </div>
        </div>
    );
}

// ── Main ──
const AddMedicine = () => {
    const { user } = useAuth();

    // ── Plain React State (no react-hook-form) ──
    const [form, setForm]                 = useState(INITIAL_FORM);
    const [errors, setErrors]             = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty]           = useState(false);

    const [medicines, setMedicines]       = useState([]);
    const [loading, setLoading]           = useState(true);
    const [toast, setToast]               = useState({ message: "", type: "success" });
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [activeTab, setActiveTab]       = useState("add");

    const medType = MED_TYPES.find((t) => t.id === form.medType);
    const today   = new Date().toISOString().split("T")[0];

    // ── Helpers ──
    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: "success" }), 3000);
    };

    const set = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setIsDirty(true);
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    // ── Fetch ──
    useEffect(() => {
        if (!user?.id) return;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3001/medicines?userId=${user.id}`);
                if (!res.ok) throw new Error();
                setMedicines(await res.json());
            } catch {
                showToast("Could not load medicines", "error");
            } finally {
                setLoading(false);
            }
        })();
    }, [user?.id]);

    // ── Validate ──
    const validate = () => {
        const e = {};
        if (!form.name.trim())                        e.name            = "Medicine name is required";
        else if (form.name.trim().length < 2)         e.name            = "Name too short";
        else if (form.name.trim().length > 100)       e.name            = "Max 100 characters";
        if (form.dosage !== "" && Number(form.dosage) < 0)   e.dosage  = "Cannot be negative";
        if (form.purpose.length > 100)                e.purpose         = "Max 100 characters";
        if (form.prescribedBy.length > 80)            e.prescribedBy    = "Max 80 characters";
        if (!form.frequency)                          e.frequency       = "Please select frequency";
        if (form.frequency === "custom" && !form.customFrequency.trim())
                                                      e.customFrequency = "Please describe the frequency";
        if (!form.startDate)                          e.startDate       = "Start date is required";
        if (form.endDate && form.startDate && form.endDate < form.startDate)
                                                      e.endDate         = "End date must be after start date";
        if (form.stock !== "" && Number(form.stock) < 0)     e.stock   = "Cannot be negative";
        if (form.stock !== "" && Number(form.stock) > 9999)  e.stock   = "Max 9999";
        if (form.notes.length > 300)                  e.notes           = "Max 300 characters";
        return e;
    };

    // ── Submit ──
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.id) { showToast("Please login first", "error"); return; }

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);
        const entry = {
            id:              Date.now().toString(),
            userId:          user.id,
            medType:         form.medType,
            name:            form.name.trim(),
            dosage:          form.dosage !== "" ? Number(form.dosage) : null,
            dosageUnit:      form.dosageUnit,
            frequency:       form.frequency,
            customFrequency: form.frequency === "custom" ? form.customFrequency.trim() : "",
            mealTiming:      form.mealTiming,
            startDate:       form.startDate,
            endDate:         form.endDate || "",
            reminderTime:    form.reminderTime || "",
            stock:           form.stock !== "" ? Number(form.stock) : null,
            notes:           form.notes.trim(),
            prescribedBy:    form.prescribedBy.trim(),
            purpose:         form.purpose.trim(),
            takenDates:      [],
            createdAt:       Date.now(),
        };

        try {
            const res = await fetch("http://localhost:3001/medicines", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry),
            });
            if (!res.ok) throw new Error();
            const saved = await res.json();
            setMedicines((prev) => [saved, ...prev]);
            setForm(INITIAL_FORM);
            setErrors({});
            setIsDirty(false);
            showToast("Medicine added successfully! 💊");
            setActiveTab("list");
        } catch {
            showToast("Failed to save. Server running?", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        if (isDirty && !window.confirm("Clear all form data?")) return;
        setForm(INITIAL_FORM);
        setErrors({});
        setIsDirty(false);
    };

    // ── Delete ──
    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch(`http://localhost:3001/medicines/${deleteTarget.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setMedicines((prev) => prev.filter((m) => m.id !== deleteTarget.id));
            showToast("Medicine removed");
        } catch {
            showToast("Failed to delete", "error");
        } finally {
            setDeleteTarget(null);
        }
    };

    // ── Toggle taken today ──
    const handleToggleTaken = async (med) => {
        const takenDates = med.takenDates || [];
        const updated    = takenDates.includes(today)
            ? takenDates.filter((d) => d !== today)
            : [...takenDates, today];
        try {
            const res = await fetch(`http://localhost:3001/medicines/${med.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ takenDates: updated }),
            });
            if (!res.ok) throw new Error();
            setMedicines((prev) => prev.map((m) => m.id === med.id ? { ...m, takenDates: updated } : m));
            showToast(takenDates.includes(today) ? "Marked as not taken" : "Marked as taken ✓");
        } catch {
            showToast("Failed to update", "error");
        }
    };

    const activeCount     = medicines.filter((m) => !m.endDate || m.endDate >= today).length;
    const takenTodayCount = medicines.filter((m) => m.takenDates?.includes(today)).length;

    return (
        <>
            <Toast msg={toast.message} type={toast.type} />
            {deleteTarget && (
                <DeleteModal med={deleteTarget} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />
            )}

            <div className="min-h-screen bg-gray-50 p-6 md:p-10">
                <div className="max-w-5xl mx-auto">

                    {/* ── Header ── */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Health</p>
                            <h1 className="font-syne font-extrabold text-3xl text-gray-900">Medicine Tracker</h1>
                            <p className="text-gray-400 text-sm mt-1">Manage your medications & stay on track 💊</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm text-center min-w-[80px]">
                                <div className="font-syne font-extrabold text-xl text-gray-900">{activeCount}</div>
                                <div className="text-xs text-gray-400 font-medium">Active</div>
                            </div>
                            <div className="bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm text-center min-w-[80px]">
                                <div className="font-syne font-extrabold text-xl text-green-600">{takenTodayCount}</div>
                                <div className="text-xs text-gray-400 font-medium">Taken Today</div>
                            </div>
                            <div className="bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm text-center min-w-[80px]">
                                <div className="font-syne font-extrabold text-xl text-gray-900">{medicines.length}</div>
                                <div className="text-xs text-gray-400 font-medium">Total</div>
                            </div>
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="flex bg-white border border-gray-100 rounded-2xl p-1 shadow-sm gap-1 mb-6 w-fit">
                        {[
                            { id: "add",  label: "➕ Add Medicine" },
                            { id: "list", label: `💊 My Medicines${medicines.length > 0 ? ` (${medicines.length})` : ""}` },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                    activeTab === t.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* ════════════════════════
                        ADD FORM — pure useState
                    ════════════════════════ */}
                    {activeTab === "add" && (
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                                {/* LEFT 3 cols */}
                                <div className="lg:col-span-3 space-y-4">

                                    {/* STEP 1 — Type */}
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                        <SectionTitle step="1" title="Medicine type" required />
                                        <div className="grid grid-cols-4 gap-2.5">
                                            {MED_TYPES.map((t) => {
                                                const active = form.medType === t.id;
                                                return (
                                                    <button key={t.id} type="button"
                                                        onClick={() => set("medType", t.id)}
                                                        className="rounded-2xl p-3 text-center border-2 transition-all duration-200"
                                                        style={{
                                                            background:  active ? t.light : "#fafafa",
                                                            borderColor: active ? t.color : "#f3f4f6",
                                                            transform:   active ? "translateY(-2px)" : "none",
                                                            boxShadow:   active ? `0 6px 20px ${t.color}25` : "none",
                                                        }}>
                                                        <span className="text-2xl block mb-1.5">{t.icon}</span>
                                                        <span className="text-[11px] font-bold block" style={{ color: active ? t.color : "#9ca3af" }}>{t.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* STEP 2 — Details */}
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                        <SectionTitle step="2" title="Medicine details" required />

                                        <Field label="Medicine Name" required error={errors.name}>
                                            <LightInput
                                                placeholder="e.g. Paracetamol, Metformin..."
                                                value={form.name}
                                                error={errors.name}
                                                onChange={(e) => set("name", e.target.value)}
                                            />
                                        </Field>

                                        <Field label="Dosage" error={errors.dosage}>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <LightInput
                                                        type="number"
                                                        step="0.5"
                                                        min="0"
                                                        placeholder="e.g. 500"
                                                        value={form.dosage}
                                                        error={errors.dosage}
                                                        onChange={(e) => set("dosage", e.target.value)}
                                                    />
                                                </div>
                                                <select
                                                    className="bg-white border-2 border-gray-200 rounded-xl px-3 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-gray-800 transition-all"
                                                    value={form.dosageUnit}
                                                    onChange={(e) => set("dosageUnit", e.target.value)}
                                                >
                                                    {["mg", "mcg", "g", "ml", "IU", "drops", "puffs", "%"].map((u) => (
                                                        <option key={u} value={u}>{u}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </Field>

                                        <Field label="Purpose / Condition" error={errors.purpose} hint="e.g. Blood pressure, Diabetes, Headache">
                                            <LightInput
                                                placeholder="What is this medicine for?"
                                                value={form.purpose}
                                                error={errors.purpose}
                                                onChange={(e) => set("purpose", e.target.value)}
                                            />
                                        </Field>

                                        <Field label="Prescribed By" error={errors.prescribedBy}>
                                            <LightInput
                                                placeholder="Doctor's name (optional)"
                                                value={form.prescribedBy}
                                                error={errors.prescribedBy}
                                                onChange={(e) => set("prescribedBy", e.target.value)}
                                            />
                                        </Field>
                                    </div>

                                    {/* STEP 3 — Frequency */}
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                        <SectionTitle step="3" title="How often?" required />
                                        <div className="grid grid-cols-3 gap-2.5 mb-3">
                                            {FREQUENCIES.map((f) => {
                                                const active = form.frequency === f.id;
                                                return (
                                                    <button key={f.id} type="button"
                                                        onClick={() => set("frequency", f.id)}
                                                        className="rounded-2xl p-3 text-center border-2 transition-all duration-200"
                                                        style={{
                                                            background:  active ? "#f0f9ff" : "#fafafa",
                                                            borderColor: active ? "#0ea5e9" : "#f3f4f6",
                                                            transform:   active ? "translateY(-2px)" : "none",
                                                            boxShadow:   active ? "0 6px 20px #0ea5e920" : "none",
                                                        }}>
                                                        <span className="text-sm font-bold block" style={{ color: active ? "#0ea5e9" : "#374151" }}>{f.label}</span>
                                                        <span className="text-[11px] text-gray-400">{f.sub}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <FieldError msg={errors.frequency} />

                                        {form.frequency === "custom" && (
                                            <Field label="Custom Frequency" error={errors.customFrequency}>
                                                <LightInput
                                                    placeholder="e.g. Every 8 hours, Alternate days..."
                                                    value={form.customFrequency}
                                                    error={errors.customFrequency}
                                                    onChange={(e) => set("customFrequency", e.target.value)}
                                                />
                                            </Field>
                                        )}
                                    </div>

                                    {/* STEP 4 — Meal Timing */}
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                        <SectionTitle step="4" title="When to take?" />
                                        <div className="grid grid-cols-5 gap-2">
                                            {MEAL_TIMING.map((m) => {
                                                const active = form.mealTiming === m.id;
                                                return (
                                                    <button key={m.id} type="button"
                                                        onClick={() => set("mealTiming", m.id)}
                                                        className="rounded-2xl p-3 text-center border-2 transition-all duration-200"
                                                        style={{
                                                            background:  active ? "#fdf4ff" : "#fafafa",
                                                            borderColor: active ? "#ec4899" : "#f3f4f6",
                                                            transform:   active ? "translateY(-2px)" : "none",
                                                        }}>
                                                        <span className="text-xl block mb-1">{m.icon}</span>
                                                        <span className="text-[10px] font-bold block leading-tight" style={{ color: active ? "#ec4899" : "#9ca3af" }}>{m.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT 2 cols */}
                                <div className="lg:col-span-2 space-y-4">

                                    {/* Preview Banner */}
                                    <div className="rounded-3xl p-5 border-2" style={{ background: medType?.light, borderColor: medType?.border }}>
                                        <div className="flex items-center gap-3">
                                            <span className="text-4xl">{medType?.icon}</span>
                                            <div>
                                                <div className="font-syne font-extrabold text-xl leading-tight" style={{ color: medType?.color }}>
                                                    {form.name || medType?.label}
                                                </div>
                                                <div className="text-xs font-semibold mt-0.5" style={{ color: `${medType?.color}99` }}>
                                                    {form.dosage ? `${form.dosage} ${form.dosageUnit}` : "Dosage not set"} · {FREQUENCIES.find((f) => f.id === form.frequency)?.label}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* STEP 5 — Schedule */}
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                        <SectionTitle step="5" title="Schedule & Reminder" />

                                        <Field label="Start Date" required error={errors.startDate}>
                                            <LightInput
                                                type="date"
                                                value={form.startDate}
                                                error={errors.startDate}
                                                onChange={(e) => set("startDate", e.target.value)}
                                            />
                                        </Field>

                                        <Field label="End Date" error={errors.endDate} hint="Leave empty for ongoing medication">
                                            <LightInput
                                                type="date"
                                                value={form.endDate}
                                                error={errors.endDate}
                                                onChange={(e) => set("endDate", e.target.value)}
                                            />
                                        </Field>

                                        <Field label="Reminder Time" error={errors.reminderTime} hint="Daily reminder notification">
                                            <LightInput
                                                type="time"
                                                value={form.reminderTime}
                                                error={errors.reminderTime}
                                                onChange={(e) => set("reminderTime", e.target.value)}
                                            />
                                        </Field>

                                        <Field label="Current Stock" error={errors.stock} hint="Track pills/ml for refill alerts">
                                            <LightInput
                                                type="number"
                                                min="0"
                                                step="1"
                                                placeholder="e.g. 30"
                                                value={form.stock}
                                                error={errors.stock}
                                                onChange={(e) => set("stock", e.target.value)}
                                            />
                                        </Field>
                                    </div>

                                    {/* STEP 6 — Notes */}
                                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                        <SectionTitle step="6" title="Notes" />
                                        <textarea
                                            rows={3}
                                            placeholder="Side effects to watch, special instructions..."
                                            className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm outline-none focus:border-gray-800 placeholder:text-gray-300 resize-none transition-all"
                                            value={form.notes}
                                            onChange={(e) => set("notes", e.target.value)}
                                        />
                                        <FieldError msg={errors.notes} />
                                        {form.notes && (
                                            <p className="text-xs text-gray-400 text-right mt-1">{form.notes.length}/300</p>
                                        )}
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 rounded-2xl font-syne font-extrabold text-base text-white border-none cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${medType?.color}, ${medType?.color}cc)`,
                                            boxShadow:  `0 8px 24px ${medType?.color}40`,
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Saving...
                                            </span>
                                        ) : (
                                            `${medType?.icon} Add Medicine`
                                        )}
                                    </button>

                                    {isDirty && (
                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="w-full py-2.5 rounded-2xl text-sm font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all border-2 border-transparent hover:border-gray-200"
                                        >
                                            ↺ Reset Form
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    )}

                    {/* ════════════════════════
                        MEDICINE LIST
                    ════════════════════════ */}
                    {activeTab === "list" && (
                        <>
                            {loading && (
                                <div className="flex items-center justify-center py-24">
                                    <svg className="animate-spin h-8 w-8 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                </div>
                            )}

                            {!loading && medicines.length === 0 && (
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
                                    <div className="text-5xl mb-4">💊</div>
                                    <h3 className="font-syne font-extrabold text-gray-800 text-lg mb-2">No medicines added yet</h3>
                                    <p className="text-gray-400 text-sm mb-6">Add your first medicine to start tracking.</p>
                                    <button
                                        onClick={() => setActiveTab("add")}
                                        className="px-6 py-3 rounded-2xl bg-gray-900 text-white text-sm font-semibold hover:-translate-y-0.5 transition-all"
                                    >
                                        ➕ Add Medicine
                                    </button>
                                </div>
                            )}

                            {!loading && medicines.length > 0 && (
                                <>
                                    {activeCount > 0 && (
                                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-syne font-extrabold text-gray-900 text-base">📋 Today's Checklist</h3>
                                                <span className="text-sm font-semibold text-gray-400">{takenTodayCount}/{activeCount} taken</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${activeCount > 0 ? (takenTodayCount / activeCount) * 100 : 0}%`,
                                                        background: takenTodayCount === activeCount && activeCount > 0 ? "#22c55e" : "#0ea5e9",
                                                    }}
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {medicines
                                                    .filter((m) => !m.endDate || m.endDate >= today)
                                                    .map((m) => {
                                                        const taken = m.takenDates?.includes(today);
                                                        const t = MED_TYPES.find((x) => x.id === m.medType) || MED_TYPES[MED_TYPES.length - 1];
                                                        return (
                                                            <button key={m.id} onClick={() => handleToggleTaken(m)}
                                                                className="flex items-center gap-2 px-3 py-2 rounded-2xl border-2 text-sm font-semibold transition-all"
                                                                style={{
                                                                    background:  taken ? "#f0fdf4" : "white",
                                                                    borderColor: taken ? "#22c55e" : "#e5e7eb",
                                                                    color:       taken ? "#16a34a" : "#6b7280",
                                                                }}>
                                                                <span>{t.icon}</span>
                                                                <span>{m.name}</span>
                                                                {m.reminderTime && <span className="text-xs opacity-60">· {m.reminderTime}</span>}
                                                                {taken && <span>✓</span>}
                                                            </button>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}

                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default AddMedicine;