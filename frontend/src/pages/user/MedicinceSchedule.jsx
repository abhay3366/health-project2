import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const BASE = "http://localhost:3001";

// ── Constants ──
const MED_TYPES = {
  tablet:  { icon: "💊", label: "Tablet",  color: "#f97316", bg: "#fff7ed" },
  capsule: { icon: "💉", label: "Capsule", color: "#8b5cf6", bg: "#f5f3ff" },
  syrup:   { icon: "🧴", label: "Syrup",   color: "#0ea5e9", bg: "#f0f9ff" },
  drops:   { icon: "💧", label: "Drops",   color: "#ec4899", bg: "#fdf4ff" },
  cream:   { icon: "🧪", label: "Cream",   color: "#22c55e", bg: "#f0fdf4" },
  inhaler: { icon: "💨", label: "Inhaler", color: "#ef4444", bg: "#fff1f2" },
  other:   { icon: "🩺", label: "Other",   color: "#6b7280", bg: "#f9fafb" },
};

const FREQ_LABELS = {
  once:   "Once daily",
  twice:  "Twice daily",
  thrice: "3× daily",
  weekly: "Weekly",
  custom: "Custom",
};

const MEAL_LABELS = {
  before: "Before meal",
  after:  "After meal",
  with:   "With meal",
  empty:  "Empty stomach",
};

// ── Helpers ──
function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function getDaysLeft(endDate) {
  if (!endDate) return null;
  return Math.ceil((new Date(endDate) - new Date()) / 86400000);
}

function getStockBadge(stock) {
  if (stock == null || stock === "") return null;
  if (stock <= 5)  return { label: `${stock} left · Low!`,        color: "#dc2626", bg: "#fee2e2" };
  if (stock <= 15) return { label: `${stock} left · Running low`, color: "#d97706", bg: "#fef3c7" };
  return               { label: `${stock} in stock`,              color: "#16a34a", bg: "#dcfce7" };
}

// ══════════════════════════════════════
//  MAIN EXPORT
// ══════════════════════════════════════
export default function MedicineSchedule() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [viewMode, setViewMode]   = useState("cards"); // "cards" | "table"

  // ── Fetch from JSON Server ──
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${BASE}/medicines?userId=${user.id}`);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setMedicines(data);
    } catch {
      setError("Could not load medicines. Make sure JSON Server is running on :3001");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicines(); }, [user.id]);

  // ── Mark Taken ──
  const handleMarkTaken = async (id) => {
    const today = new Date().toISOString().split("T")[0];
    const med   = medicines.find((m) => m.id === id);
    const taken = med.takenDates?.includes(today);
    const updatedDates = taken
      ? med.takenDates.filter((d) => d !== today)
      : [...(med.takenDates || []), today];

    try {
      await fetch(`${BASE}/medicines/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ takenDates: updatedDates }),
      });
      setMedicines((prev) =>
        prev.map((m) => m.id === id ? { ...m, takenDates: updatedDates } : m)
      );
    } catch {
      alert("Update failed. Check JSON Server.");
    }
  };

  // ── Derived ──
  const today        = new Date().toISOString().split("T")[0];
  const totalActive  = medicines.filter((m) => new Date(m.endDate) >= new Date()).length;
  const takenToday   = medicines.filter((m) => m.takenDates?.includes(today)).length;
  const lowStock     = medicines.filter((m) => m.stock != null && m.stock <= 15).length;
  const expiredCount = medicines.filter((m) => m.endDate && new Date(m.endDate) < new Date()).length;

  const FILTERS = [
    { id: "all",     label: `All (${medicines.length})` },
    { id: "active",  label: `Active (${totalActive})` },
    { id: "taken",   label: `Taken Today (${takenToday})` },
    { id: "pending", label: "Pending" },
    { id: "expired", label: `Expired (${expiredCount})` },
  ];

  const filtered = medicines.filter((m) => {
    const q = search.toLowerCase();
    const matchSearch =
      m.name.toLowerCase().includes(q) ||
      (m.purpose || "").toLowerCase().includes(q) ||
      (m.prescribedBy || "").toLowerCase().includes(q);
    if (!matchSearch) return false;
    if (filter === "active")  return m.endDate && new Date(m.endDate) >= new Date();
    if (filter === "expired") return m.endDate && new Date(m.endDate) <  new Date();
    if (filter === "taken")   return m.takenDates?.includes(today);
    if (filter === "pending") return !m.takenDates?.includes(today) && (!m.endDate || new Date(m.endDate) >= new Date());
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-6 md:p-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">
            HEALTH TRACKER
          </p>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">
            Medicine Schedule
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {medicines.length} medicine{medicines.length !== 1 ? "s" : ""} tracked
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === "cards" ? "bg-gray-900 text-white shadow" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              ⊞ Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === "table" ? "bg-gray-900 text-white shadow" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              ☰ Table
            </button>
          </div>

          <button
            onClick={fetchMedicines}
            className="px-4 py-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm text-xs font-semibold text-gray-500 hover:text-gray-700 transition-all"
          >
            ↺ Refresh
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {!loading && medicines.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: "💊", label: "TOTAL",       sub: "medicines",     value: medicines.length, color: "#6b7280" },
            { icon: "✅", label: "ACTIVE",       sub: "ongoing",       value: totalActive,      color: "#16a34a" },
            { icon: "☑️", label: "TAKEN TODAY",  sub: "marked done",   value: takenToday,       color: "#0ea5e9" },
            { icon: "⚠️", label: "LOW STOCK",    sub: "need refill",   value: lowStock,         color: "#d97706" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl mb-4">
                {s.icon}
              </div>
              <div className="text-3xl font-black text-gray-900 leading-none mb-1"
                   style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-[11px] font-bold tracking-widest uppercase text-gray-400">{s.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Search + Filters ── */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 flex items-center gap-2 min-w-[180px]">
          <span className="text-gray-400 ml-1">🔍</span>
          <input
            type="text"
            placeholder="Search by name, purpose, doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-700 placeholder:text-gray-300 bg-transparent font-medium"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filter === f.id
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center">
          <div className="text-4xl mb-4 animate-pulse">💊</div>
          <p className="text-gray-400 font-medium">Loading medicines...</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center text-red-600 text-sm font-semibold">
          ⚠ {error}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center">
          <div className="text-5xl mb-4">💊</div>
          <p className="text-xl font-bold text-gray-800 mb-1">No medicines found</p>
          <p className="text-gray-400 text-sm">
            {filter !== "all" ? "Try changing the filter above" : "Medicines will appear here once added"}
          </p>
        </div>
      )}

      {/* ══ CARDS VIEW ══ */}
      {!loading && !error && filtered.length > 0 && viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((med) => {
            const type  = MED_TYPES[med.medType] || MED_TYPES.other;
            const days  = getDaysLeft(med.endDate);
            const stock = getStockBadge(med.stock);
            const taken = med.takenDates?.includes(today);

            return (
              <div key={med.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                {/* color top strip */}
                <div className="h-1" style={{ background: type.color }} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                           style={{ background: type.bg }}>
                        {type.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base leading-tight">{med.name}</h3>
                        <p className="text-gray-400 text-xs mt-0.5">{med.purpose || "No purpose noted"}</p>
                      </div>
                    </div>

                    {/* Mark Taken button */}
                    <button
                      onClick={() => handleMarkTaken(med.id)}
                      className={`flex-shrink-0 text-xs font-bold px-3 py-2 rounded-xl border-2 transition-all ${
                        taken
                          ? "bg-green-50 border-green-200 text-green-600"
                          : "bg-gray-50 border-gray-200 text-gray-400 hover:border-orange-300 hover:text-orange-500"
                      }`}
                    >
                      {taken ? "✓ Taken" : "Mark Taken"}
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: type.bg, color: type.color }}>
                      {type.icon} {type.label}
                    </span>
                    {med.frequency && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                        🔁 {FREQ_LABELS[med.frequency] || med.customFrequency || med.frequency}
                      </span>
                    )}
                    {med.mealTiming && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                        🍽 {MEAL_LABELS[med.mealTiming] || med.mealTiming}
                      </span>
                    )}
                    {med.reminderTime && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-500">
                        ⏰ {med.reminderTime}
                      </span>
                    )}
                    {med.dosage && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-500">
                        ⚖ {med.dosage} {med.dosageUnit}
                      </span>
                    )}
                    {stock && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: stock.bg, color: stock.color }}>
                        {stock.label}
                      </span>
                    )}
                  </div>

                  {/* Dates row */}
                  <div className="flex flex-wrap gap-5 text-xs border-t border-gray-50 pt-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Start</span>
                      <span className="text-gray-600 font-medium">{formatDate(med.startDate)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">End</span>
                      <span className="font-medium"
                            style={{ color: days !== null && days < 0 ? "#dc2626" : days !== null && days <= 7 ? "#d97706" : "#374151" }}>
                        {formatDate(med.endDate)}
                      </span>
                    </div>
                    {days !== null && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Status</span>
                        <span className="font-bold"
                              style={{ color: days < 0 ? "#dc2626" : days <= 7 ? "#d97706" : "#16a34a" }}>
                          {days < 0 ? "Expired" : days === 0 ? "Last day!" : `${days}d left`}
                        </span>
                      </div>
                    )}
                    {med.prescribedBy && (
                      <div className="ml-auto text-right">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5">Doctor</span>
                        <span className="text-gray-600 font-medium">{med.prescribedBy}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {med.notes && (
                    <p className="text-xs text-gray-400 italic border-t border-gray-50 pt-2.5 mt-2.5">
                      📝 {med.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ TABLE VIEW ══ */}
      {!loading && !error && filtered.length > 0 && viewMode === "table" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Medicine", "Type", "Dosage", "Frequency", "Timing", "Reminder", "Stock", "End Date", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((med) => {
                  const type  = MED_TYPES[med.medType] || MED_TYPES.other;
                  const days  = getDaysLeft(med.endDate);
                  const stock = getStockBadge(med.stock);
                  const taken = med.takenDates?.includes(today);

                  return (
                    <tr key={med.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900 whitespace-nowrap">{med.name}</p>
                        <p className="text-xs text-gray-400">{med.purpose || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                              style={{ background: type.bg, color: type.color }}>
                          {type.icon} {type.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">
                        {med.dosage ? `${med.dosage} ${med.dosageUnit}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {FREQ_LABELS[med.frequency] || med.customFrequency || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {MEAL_LABELS[med.mealTiming] || "—"}
                      </td>
                      <td className="px-4 py-3 text-blue-500 font-medium whitespace-nowrap">
                        {med.reminderTime || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {stock ? (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                                style={{ background: stock.bg, color: stock.color }}>
                            {stock.label}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(med.endDate)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {days !== null ? (
                          <span className="text-[11px] font-bold"
                                style={{ color: days < 0 ? "#dc2626" : days <= 7 ? "#d97706" : "#16a34a" }}>
                            {days < 0 ? "Expired" : days === 0 ? "Last day!" : `${days}d left`}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleMarkTaken(med.id)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border-2 transition-all whitespace-nowrap ${
                            taken
                              ? "bg-green-50 border-green-200 text-green-600"
                              : "bg-gray-50 border-gray-200 text-gray-400 hover:border-orange-300 hover:text-orange-500"
                          }`}
                        >
                          {taken ? "✓ Taken" : "Mark Taken"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}