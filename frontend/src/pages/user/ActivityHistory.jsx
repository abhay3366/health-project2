import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ── Constants ──
const CATEGORIES = {
    cardio:   { label: "Cardio",   icon: "🏃", color: "#f97316", light: "#fff7ed", border: "#fed7aa" },
    strength: { label: "Strength", icon: "🏋️", color: "#8b5cf6", light: "#f5f3ff", border: "#ddd6fe" },
    yoga:     { label: "Yoga",     icon: "🧘", color: "#0ea5e9", light: "#f0f9ff", border: "#bae6fd" },
    sports:   { label: "Sports",   icon: "⚽", color: "#22c55e", light: "#f0fdf4", border: "#bbf7d0" },
    cycling:  { label: "Cycling",  icon: "🚴", color: "#eab308", light: "#fefce8", border: "#fef08a" },
    swimming: { label: "Swimming", icon: "🏊", color: "#ec4899", light: "#fdf4ff", border: "#f5d0fe" },
    hiit:     { label: "HIIT",     icon: "⚡", color: "#ef4444", light: "#fff1f2", border: "#fecdd3" },
    walking:  { label: "Walking",  icon: "🚶", color: "#14b8a6", light: "#f0fdfa", border: "#99f6e4" },
};

const INTENSITY = {
    low:    { label: "Easy",     emoji: "😌", color: "#22c55e", bg: "#f0fdf4" },
    medium: { label: "Moderate", emoji: "💪", color: "#f97316", bg: "#fff7ed" },
    high:   { label: "Intense",  emoji: "🔥", color: "#ef4444", bg: "#fff1f2" },
};

const SORT_OPTIONS = [
    { id: "newest",   label: "Newest First" },
    { id: "oldest",   label: "Oldest First" },
    { id: "calories", label: "Most Calories" },
    { id: "duration", label: "Longest Duration" },
];

// ── Tiny helpers ──
const toNum = (v) => (v === "" || v == null ? null : Number(v));

function Toast({ msg, type = "success" }) {
    if (!msg) return null;
    return (
        <div className={`fixed bottom-6 right-6 text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl z-50 flex items-center gap-2 ${
            type === "success" ? "bg-gray-900" : "bg-red-500"
        }`}>
            <span className={type === "success" ? "text-green-400" : "text-white"}>
                {type === "success" ? "✓" : "✗"}
            </span>
            {msg}
        </div>
    );
}

function DeleteModal({ activity, onConfirm, onCancel }) {
    const cat = CATEGORIES[activity?.category] || {};
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
                    style={{ background: cat.light }}>
                    {cat.icon}
                </div>
                <h3 className="font-syne font-extrabold text-gray-900 text-lg text-center mb-1">Delete Activity?</h3>
                <p className="text-gray-400 text-sm text-center mb-6">
                    <span className="font-semibold text-gray-600">{activity?.workout}</span> will be permanently removed.
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 rounded-2xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all">Delete</button>
                </div>
            </div>
        </div>
    );
}

// ── Stat Card ──
function StatCard({ icon, label, value, sub, color, light }) {
    return (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl" style={{ background: light }}>
                    {icon}
                </div>
            </div>
            <div className="font-syne font-extrabold text-2xl text-gray-900 leading-none mb-1">{value}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</div>
            {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
        </div>
    );
}

// ── Custom Tooltip ──
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-3 text-xs">
            <p className="font-bold text-gray-700 mb-2">{label}</p>
            {payload.map((p) => (
                <div key={p.name} className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-gray-500 capitalize">{p.name}:</span>
                    <span className="font-bold text-gray-800">{p.value}</span>
                </div>
            ))}
        </div>
    );
}

// ── Activity Card ──
function ActivityCard({ activity, onDelete }) {
    const cat = CATEGORIES[activity.category] || { label: activity.category, icon: "💪", color: "#6b7280", light: "#f9fafb", border: "#e5e7eb" };
    const intens = INTENSITY[activity.intensity];
    const isStrength = activity.category === "strength";
    const isDistance = ["cardio", "cycling", "walking"].includes(activity.category);

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
            <div className="h-1" style={{ background: cat.color }} />
            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: cat.light }}>
                            {cat.icon}
                        </div>
                        <div>
                            <h3 className="font-syne font-extrabold text-gray-900 text-base leading-tight">{activity.workout}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs font-semibold" style={{ color: cat.color }}>{cat.label}</span>
                                {intens && <><span className="text-gray-200">·</span><span className="text-xs font-semibold" style={{ color: intens.color }}>{intens.emoji} {intens.label}</span></>}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="text-right">
                            <div className="text-xs font-bold text-gray-700">{activity.date}</div>
                            <div className="text-xs text-gray-400">{activity.time}</div>
                        </div>
                        <button
                            onClick={() => onDelete(activity)}
                            className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-all text-xs"
                        >✕</button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {activity.duration  && <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">⏱ {activity.duration} min</span>}
                    {activity.calories  && <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">🔥 {activity.calories} kcal</span>}
                    {isDistance && activity.distance && <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">📍 {activity.distance} km</span>}
                    {isStrength && activity.sets   && <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">🔁 {activity.sets} sets</span>}
                    {isStrength && activity.reps   && <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">💪 {activity.reps} reps</span>}
                    {isStrength && activity.weight && <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1">⚖️ {activity.weight} kg</span>}
                </div>
                {activity.notes && (
                    <p className="mt-3 text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 line-clamp-2">"{activity.notes}"</p>
                )}
            </div>
        </div>
    );
}

// ── Table Row ──
function TableRow({ activity, index, onDelete }) {
    const cat = CATEGORIES[activity.category] || { label: activity.category, icon: "💪", color: "#6b7280", light: "#f9fafb" };
    const intens = INTENSITY[activity.intensity];
    return (
        <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
            <td className="py-3.5 px-4 text-xs text-gray-400 font-medium">{index + 1}</td>
            <td className="py-3.5 px-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ background: cat.light }}>
                        {cat.icon}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-800 text-sm">{activity.workout}</div>
                        <div className="text-xs font-medium" style={{ color: cat.color }}>{cat.label}</div>
                    </div>
                </div>
            </td>
            <td className="py-3.5 px-4">
                <div className="text-sm text-gray-700 font-medium">{activity.date}</div>
                <div className="text-xs text-gray-400">{activity.time}</div>
            </td>
            <td className="py-3.5 px-4">
                {intens && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: intens.bg, color: intens.color }}>
                        {intens.emoji} {intens.label}
                    </span>
                )}
            </td>
            <td className="py-3.5 px-4 text-sm text-gray-700 font-medium text-center">{activity.duration ? `${activity.duration} min` : "—"}</td>
            <td className="py-3.5 px-4 text-sm text-gray-700 font-medium text-center">{activity.calories ? `${activity.calories} kcal` : "—"}</td>
            <td className="py-3.5 px-4 text-sm text-gray-500 text-center">
                {activity.category === "strength"
                    ? [activity.sets && `${activity.sets}s`, activity.reps && `${activity.reps}r`, activity.weight && `${activity.weight}kg`].filter(Boolean).join(" · ") || "—"
                    : activity.distance ? `${activity.distance} km` : "—"}
            </td>
            <td className="py-3.5 px-4 text-xs text-gray-400 max-w-[140px] truncate">{activity.notes || "—"}</td>
            <td className="py-3.5 px-4">
                <button
                    onClick={() => onDelete(activity)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-all text-xs"
                >✕</button>
            </td>
        </tr>
    );
}

// ── Charts Section ──
function ChartsSection({ activities }) {
    // Last 7 days calories + duration trend
    const last7 = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString("en-IN");
            const dayActivities = activities.filter((a) => a.date === dateStr);
            days.push({
                day: d.toLocaleDateString("en-IN", { weekday: "short" }),
                calories: dayActivities.reduce((s, a) => s + (a.calories || 0), 0),
                duration: dayActivities.reduce((s, a) => s + (a.duration || 0), 0),
                count: dayActivities.length,
            });
        }
        return days;
    }, [activities]);

    // Category breakdown
    const categoryData = useMemo(() => {
        const counts = {};
        activities.forEach((a) => {
            counts[a.category] = (counts[a.category] || 0) + 1;
        });
        return Object.entries(counts).map(([id, value]) => ({
            name: CATEGORIES[id]?.label || id,
            value,
            color: CATEGORIES[id]?.color || "#6b7280",
        })).sort((a, b) => b.value - a.value);
    }, [activities]);

    // Monthly workouts
    const monthlyData = useMemo(() => {
        const months = {};
        activities.forEach((a) => {
            const parts = a.date.split("/");
            if (parts.length < 3) return;
            const key = new Date(parts[2], parts[1] - 1, 1)
                .toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
            if (!months[key]) months[key] = { month: key, workouts: 0, calories: 0 };
            months[key].workouts++;
            months[key].calories += a.calories || 0;
        });
        return Object.values(months).slice(-6);
    }, [activities]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            {/* Calories & Duration — 7 days */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="font-syne font-extrabold text-gray-900 text-base">Weekly Overview</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Calories burned over last 7 days</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#f97316" }} />Calories</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#8b5cf6" }} />Duration</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={last7} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="durGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2.5} fill="url(#calGrad)" dot={{ fill: "#f97316", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                        <Area type="monotone" dataKey="duration" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#durGrad)" dot={{ fill: "#8b5cf6", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Category Pie */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-syne font-extrabold text-gray-900 text-base mb-1">Category Mix</h3>
                <p className="text-xs text-gray-400 mb-4">Workout type breakdown</p>
                {categoryData.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No data</div>
                ) : (
                    <>
                        <ResponsiveContainer width="100%" height={150}>
                            <PieChart>
                                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                                    paddingAngle={3} dataKey="value">
                                    {categoryData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v, n) => [v, n]} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-1.5 mt-2">
                            {categoryData.slice(0, 4).map((c) => (
                                <div key={c.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                                        <span className="text-xs text-gray-600 font-medium">{c.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-800">{c.value}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Monthly Bar */}
            <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="font-syne font-extrabold text-gray-900 text-base">Monthly Progress</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Workouts & calories per month</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#22c55e" }} />Workouts</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#f97316" }} />Calories</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="workouts" fill="#22c55e" radius={[6, 6, 0, 0]} maxBarSize={32} />
                        <Bar dataKey="calories" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ── Insights Panel ──
function InsightsPanel({ activities }) {
    const insights = useMemo(() => {
        if (!activities.length) return [];
        const result = [];

        // Best streak
        const dates = [...new Set(activities.map((a) => a.date))].sort();
        let streak = 1, maxStreak = 1, cur = 1;
        for (let i = 1; i < dates.length; i++) {
            const prev = new Date(dates[i - 1].split("/").reverse().join("-"));
            const curr = new Date(dates[i].split("/").reverse().join("-"));
            const diff = (curr - prev) / (1000 * 60 * 60 * 24);
            if (diff === 1) { cur++; maxStreak = Math.max(maxStreak, cur); }
            else cur = 1;
        }
        result.push({ icon: "🔥", label: "Best Streak", value: `${maxStreak} days`, color: "#ef4444", light: "#fff1f2" });

        // Fav category
        const catCount = {};
        activities.forEach((a) => { catCount[a.category] = (catCount[a.category] || 0) + 1; });
        const fav = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0];
        if (fav) {
            const c = CATEGORIES[fav[0]];
            result.push({ icon: c?.icon || "💪", label: "Favourite Workout", value: c?.label || fav[0], color: c?.color || "#6b7280", light: c?.light || "#f9fafb" });
        }

        // Avg calories/session
        const withCal = activities.filter((a) => a.calories > 0);
        if (withCal.length) {
            const avg = Math.round(withCal.reduce((s, a) => s + a.calories, 0) / withCal.length);
            result.push({ icon: "⚡", label: "Avg Calories/Session", value: `${avg} kcal`, color: "#f97316", light: "#fff7ed" });
        }

        // Avg duration
        const withDur = activities.filter((a) => a.duration > 0);
        if (withDur.length) {
            const avg = Math.round(withDur.reduce((s, a) => s + a.duration, 0) / withDur.length);
            result.push({ icon: "⏱", label: "Avg Duration", value: `${avg} min`, color: "#0ea5e9", light: "#f0f9ff" });
        }

        // Most intense
        const highCount = activities.filter((a) => a.intensity === "high").length;
        result.push({ icon: "💥", label: "Intense Sessions", value: `${highCount} workouts`, color: "#8b5cf6", light: "#f5f3ff" });

        // Total distance
        const totalDist = activities.reduce((s, a) => s + (a.distance || 0), 0);
        if (totalDist > 0) {
            result.push({ icon: "📍", label: "Total Distance", value: `${totalDist.toFixed(1)} km`, color: "#22c55e", light: "#f0fdf4" });
        }

        return result;
    }, [activities]);

    if (!insights.length) return null;

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
            <h3 className="font-syne font-extrabold text-gray-900 text-base mb-1">💡 Your Insights</h3>
            <p className="text-xs text-gray-400 mb-5">Patterns & highlights from your workout data</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {insights.map((ins) => (
                    <div key={ins.label} className="rounded-2xl p-3 text-center border" style={{ background: ins.light, borderColor: ins.light }}>
                        <div className="text-2xl mb-1">{ins.icon}</div>
                        <div className="font-syne font-extrabold text-sm leading-tight mb-0.5" style={{ color: ins.color }}>{ins.value}</div>
                        <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide leading-tight">{ins.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main ──
const ActivityHistory = () => {
    const { user } = useAuth();
    const [activities, setActivities]   = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState("");
    const [toast, setToast]             = useState({ message: "", type: "success" });
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [viewMode, setViewMode]       = useState("cards"); // "cards" | "table"
    const [activeTab, setActiveTab]     = useState("list"); // "list" | "charts"

    // Filters
    const [search,       setSearch]       = useState("");
    const [filterCat,    setFilterCat]    = useState("all");
    const [filterIntens, setFilterIntens] = useState("all");
    const [sortBy,       setSortBy]       = useState("newest");
    const [showFilters,  setShowFilters]  = useState(false);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast({ message: "", type: "success" }), 3000);
    };

    useEffect(() => {
        if (!user?.id) return;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:3001/activities?userId=${user.id}`);
                if (!res.ok) throw new Error();
                setActivities(await res.json());
            } catch {
                setError("Could not load activities. Is the server running?");
            } finally {
                setLoading(false);
            }
        })();
    }, [user?.id]);

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch(`http://localhost:3001/activities/${deleteTarget.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setActivities((prev) => prev.filter((a) => a.id !== deleteTarget.id));
            showToast("Activity deleted");
        } catch {
            showToast("Failed to delete", "error");
        } finally {
            setDeleteTarget(null);
        }
    };

    // Stats
    const totalCalories = activities.reduce((s, a) => s + (a.calories || 0), 0);
    const totalDuration = activities.reduce((s, a) => s + (a.duration || 0), 0);
    const totalDist     = activities.reduce((s, a) => s + (a.distance || 0), 0);
    const hours = Math.floor(totalDuration / 60);
    const mins  = totalDuration % 60;

    // Filter + sort
    const filtered = useMemo(() => {
        let r = [...activities];
        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter((a) => a.workout.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.notes?.toLowerCase().includes(q));
        }
        if (filterCat !== "all")    r = r.filter((a) => a.category  === filterCat);
        if (filterIntens !== "all") r = r.filter((a) => a.intensity === filterIntens);
        r.sort((a, b) => {
            if (sortBy === "newest")   return b.timestamp - a.timestamp;
            if (sortBy === "oldest")   return a.timestamp - b.timestamp;
            if (sortBy === "calories") return (b.calories || 0) - (a.calories || 0);
            if (sortBy === "duration") return (b.duration || 0) - (a.duration || 0);
            return 0;
        });
        return r;
    }, [activities, search, filterCat, filterIntens, sortBy]);

    const grouped = useMemo(() => {
        const g = {};
        filtered.forEach((a) => { if (!g[a.date]) g[a.date] = []; g[a.date].push(a); });
        return g;
    }, [filtered]);

    const hasFilters = search || filterCat !== "all" || filterIntens !== "all" || sortBy !== "newest";

    return (
        <>
            <Toast msg={toast.message} type={toast.type} />
            {deleteTarget && <DeleteModal activity={deleteTarget} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />}

            <div className="min-h-screen bg-gray-50 p-6 md:p-10">
                <div className="max-w-6xl mx-auto">

                    {/* ── Header ── */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Your Progress</p>
                            <h1 className="font-syne font-extrabold text-3xl text-gray-900">Activity History</h1>
                            <p className="text-gray-400 text-sm mt-1">
                                {loading ? "Loading..." : `${activities.length} workout${activities.length !== 1 ? "s" : ""} logged`}
                            </p>
                        </div>

                        {/* Tab switcher */}
                        <div className="flex bg-white border border-gray-100 rounded-2xl p-1 shadow-sm gap-1">
                            {[
                                { id: "list",   label: "📋 History" },
                                { id: "charts", label: "📊 Analytics" },
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveTab(t.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                        activeTab === t.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-24">
                            <div className="flex flex-col items-center gap-3">
                                <svg className="animate-spin h-8 w-8 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span className="text-sm text-gray-400 font-medium">Loading activities...</span>
                            </div>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 text-center">
                            <div className="text-3xl mb-2">⚠️</div>
                            <p className="text-red-500 font-semibold text-sm">{error}</p>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {/* ── Summary Stats ── */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <StatCard icon="🏅" label="Total Workouts" value={activities.length} color="#8b5cf6" light="#f5f3ff" />
                                <StatCard icon="🔥" label="Calories Burned" value={totalCalories.toLocaleString()} sub="kcal total" color="#ef4444" light="#fff1f2" />
                                <StatCard icon="⏱" label="Time Trained"
                                    value={hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
                                    sub="total duration" color="#0ea5e9" light="#f0f9ff" />
                                <StatCard icon="📍" label="Distance Covered"
                                    value={totalDist > 0 ? `${totalDist.toFixed(1)} km` : "—"}
                                    sub="cardio & walks" color="#22c55e" light="#f0fdf4" />
                            </div>

                            {/* ── Analytics Tab ── */}
                            {activeTab === "charts" && (
                                <>
                                    <InsightsPanel activities={activities} />
                                    {activities.length > 0
                                        ? <ChartsSection activities={activities} />
                                        : <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center text-gray-300">No data to chart yet</div>
                                    }
                                </>
                            )}

                            {/* ── History Tab ── */}
                            {activeTab === "list" && (
                                <>
                                    {/* Search + Filters */}
                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 mb-6">
                                        <div className="flex gap-3">
                                            <div className="relative flex-1">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm">🔍</span>
                                                <input
                                                    type="text"
                                                    placeholder="Search workouts, category, notes..."
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-gray-300 placeholder:text-gray-300 transition-all"
                                                />
                                            </div>

                                            {/* View toggle */}
                                            <div className="flex bg-gray-50 border border-gray-100 rounded-2xl p-1 gap-1">
                                                <button onClick={() => setViewMode("cards")} className={`px-3 py-2 rounded-xl text-sm transition-all ${viewMode === "cards" ? "bg-white shadow-sm text-gray-800 font-semibold" : "text-gray-400"}`}>⊞ Cards</button>
                                                <button onClick={() => setViewMode("table")} className={`px-3 py-2 rounded-xl text-sm transition-all ${viewMode === "table" ? "bg-white shadow-sm text-gray-800 font-semibold" : "text-gray-400"}`}>☰ Table</button>
                                            </div>

                                            <button
                                                onClick={() => setShowFilters((v) => !v)}
                                                className={`px-4 py-3 rounded-2xl border-2 text-sm font-semibold transition-all flex items-center gap-2 ${
                                                    showFilters || hasFilters ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                                                }`}
                                            >
                                                ⚙ Filters
                                                {hasFilters && (
                                                    <span className="w-5 h-5 rounded-full bg-white text-gray-900 text-xs font-bold flex items-center justify-center">
                                                        {[search, filterCat !== "all", filterIntens !== "all", sortBy !== "newest"].filter(Boolean).length}
                                                    </span>
                                                )}
                                            </button>
                                        </div>

                                        {showFilters && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        <button onClick={() => setFilterCat("all")} className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${filterCat === "all" ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 text-gray-400"}`}>All</button>
                                                        {Object.entries(CATEGORIES).map(([id, c]) => (
                                                            <button key={id} onClick={() => setFilterCat(id)}
                                                                className="text-xs px-3 py-1.5 rounded-full border font-semibold transition-all"
                                                                style={{ background: filterCat === id ? c.light : "white", borderColor: filterCat === id ? c.color : "#e5e7eb", color: filterCat === id ? c.color : "#9ca3af" }}>
                                                                {c.icon} {c.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Intensity</label>
                                                    <div className="flex gap-1.5">
                                                        <button onClick={() => setFilterIntens("all")} className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${filterIntens === "all" ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 text-gray-400"}`}>All</button>
                                                        {Object.entries(INTENSITY).map(([id, lvl]) => (
                                                            <button key={id} onClick={() => setFilterIntens(id)}
                                                                className="text-xs px-3 py-1.5 rounded-full border font-semibold transition-all"
                                                                style={{ background: filterIntens === id ? lvl.bg : "white", borderColor: filterIntens === id ? lvl.color : "#e5e7eb", color: filterIntens === id ? lvl.color : "#9ca3af" }}>
                                                                {lvl.emoji} {lvl.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sort By</label>
                                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 outline-none focus:border-gray-300 transition-all">
                                                        {SORT_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {hasFilters && (
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="text-xs text-gray-400">
                                                    Showing <span className="font-bold text-gray-700">{filtered.length}</span> of {activities.length} activities
                                                </span>
                                                <button onClick={() => { setSearch(""); setFilterCat("all"); setFilterIntens("all"); setSortBy("newest"); }}
                                                    className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-all">
                                                    ✕ Clear filters
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Empty state */}
                                    {filtered.length === 0 && (
                                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
                                            <div className="text-5xl mb-4">{hasFilters ? "🔍" : "🏋️"}</div>
                                            <h3 className="font-syne font-extrabold text-gray-800 text-lg mb-2">
                                                {hasFilters ? "No activities found" : "No activities yet"}
                                            </h3>
                                            <p className="text-gray-400 text-sm">
                                                {hasFilters ? "Try changing your filters or search term." : "Start logging your workouts to see them here!"}
                                            </p>
                                        </div>
                                    )}

                                    {/* ── CARDS VIEW ── */}
                                    {filtered.length > 0 && viewMode === "cards" && (
                                        <div className="space-y-6">
                                            {Object.entries(grouped).map(([date, items]) => (
                                                <div key={date}>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{date}</span>
                                                        <div className="flex-1 h-px bg-gray-100" />
                                                        <span className="text-xs font-semibold text-gray-300">{items.length} workout{items.length !== 1 ? "s" : ""}</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {items.map((a) => <ActivityCard key={a.id} activity={a} onDelete={setDeleteTarget} />)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* ── TABLE VIEW ── */}
                                    {filtered.length > 0 && viewMode === "table" && (
                                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b-2 border-gray-100">
                                                            {["#", "Workout", "Date", "Intensity", "Duration", "Calories", "Extra", "Notes", ""].map((h) => (
                                                                <th key={h} className="py-4 px-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                                                    {h}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filtered.map((a, i) => (
                                                            <TableRow key={a.id} activity={a} index={i} onDelete={setDeleteTarget} />
                                                        ))}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="border-t-2 border-gray-100 bg-gray-50/50">
                                                            <td colSpan={4} className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                                {filtered.length} entries
                                                            </td>
                                                            <td className="py-3 px-4 text-xs font-bold text-gray-700 text-center">
                                                                {filtered.reduce((s, a) => s + (a.duration || 0), 0)} min
                                                            </td>
                                                            <td className="py-3 px-4 text-xs font-bold text-gray-700 text-center">
                                                                {filtered.reduce((s, a) => s + (a.calories || 0), 0)} kcal
                                                            </td>
                                                            <td colSpan={3} />
                                                        </tr>
                                                    </tfoot>
                                                </table>
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

export default ActivityHistory;