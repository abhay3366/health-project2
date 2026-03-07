import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { api } from "../../utils/api";

const metricsMeta = {
  steps:    { icon: "👟", label: "Steps",       unit: "steps", color: "#ff6b35", goal: 10000 },
  water:    { icon: "💧", label: "Water Intake", unit: "ml",    color: "#38bdf8", goal: 2000  },
  sleep:    { icon: "😴", label: "Sleep",        unit: "hrs",   color: "#a78bfa", goal: 8     },
  calories: { icon: "🔥", label: "Calories",     unit: "kcal",  color: "#4ade80", goal: 2000  },
  weight:   { icon: "⚖️", label: "Weight",       unit: "kg",    color: "#fbbf24", goal: 70    },
  mood:     { icon: "😊", label: "Mood",         unit: "/10",   color: "#f472b6", goal: 10    },
};

export default function UserHealthDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [targetUser, setTargetUser] = useState(null);
  const [coach, setCoach] = useState(null);
  const [history, setHistory] = useState([]);
  console.log("🚀 ~ UserHealthDetail ~ history:", history)

  useEffect(() => {
    const load = async () => {
      const u = await api.getUserById(id);
      setTargetUser(u);
      if (u.coach_id) {
        const c = await api.getUserById(u.coach_id);
        setCoach(c);
      }
      // Health data localStorage se fetch karo
      const data = JSON.parse(localStorage.getItem(`health_${id}`) || "[]");
      setHistory(data);
    };
    load();
  }, [id]);

  if (!targetUser) {
    return (
      <Layout>
        <div className="p-8 text-muted text-sm animate-pulse">Loading user data...</div>
      </Layout>
    );
  }

  // Latest entry se current metrics
  const latest = history[0] || {};

  return (
    <Layout>
      <div className="p-8 animate-fadeIn">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted text-sm hover:text-[#dde3f0] transition-colors mb-6"
        >
          ← Back to Dashboard
        </button>

        {/* User Info Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-7 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-user/10 border border-user/30 flex items-center justify-center font-syne font-extrabold text-xl text-user flex-shrink-0">
            {targetUser.avatar}
          </div>
          <div className="flex-1">
            <div className="font-syne font-extrabold text-xl text-[#dde3f0]">{targetUser.name}</div>
            <div className="text-muted text-sm mt-0.5">{targetUser.email}</div>
            <div className="flex items-center gap-3 mt-2">
              <span className="badge-user">🧑 {targetUser.role}</span>
              {coach && (
                <span className="text-xs text-coach font-semibold">
                  🏋️ Coach: {coach.name}
                </span>
              )}
              {!coach && (
                <span className="text-xs text-dim">No coach assigned</span>
              )}
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${targetUser.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {targetUser.isActive ? "● Active" : "○ Inactive"}
              </span>
            </div>
          </div>
          <div className="text-right text-xs text-muted">
            <div>Joined</div>
            <div className="text-[#dde3f0] font-semibold mt-0.5">
              {new Date(targetUser.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Latest Metrics */}
        <h2 className="font-syne font-extrabold text-lg text-[#dde3f0] mb-4">
          📊 Latest Health Metrics
          {latest.date && <span className="text-muted text-sm font-normal ml-2">({latest.date})</span>}
        </h2>

        {history.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted text-sm mb-7">
            😴 {targetUser.name} ne abhi tak koi health data log nahi kiya hai.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {Object.entries(metricsMeta).map(([key, m]) => {
              const val = latest[key];
              const pct = val ? Math.min(Math.round((parseFloat(val) / m.goal) * 100), 100) : 0;
              return (
                <div
                  key={key}
                  className="bg-card border border-border rounded-2xl p-5"
                  style={{ borderLeftColor: m.color, borderLeftWidth: "3px" }}
                >
                  <div className="text-xl mb-2">{m.icon}</div>
                  <div className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{m.label}</div>
                  {val ? (
                    <>
                      <div className="font-syne font-extrabold text-2xl mb-1" style={{ color: m.color }}>
                        {val} <span className="text-sm font-normal text-muted">{m.unit}</span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden mb-1">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: m.color }} />
                      </div>
                      <div className="text-xs text-muted">{pct}% of {m.goal} {m.unit} goal</div>
                    </>
                  ) : (
                    <div className="text-dim text-sm">Not logged</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* History Table */}
        {history.length > 0 && (
          <>
            <h2 className="font-syne font-extrabold text-lg text-[#dde3f0] mb-4">
              📅 Health History ({history.length} entries)
            </h2>
            <div className="bg-card border border-border rounded-2xl overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-surface border-b border-border">
                  <tr>
                    <th className="table-th">Date</th>
                    {Object.entries(metricsMeta).map(([key, m]) => (
                      <th key={key} className="table-th whitespace-nowrap">{m.icon} {m.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="table-td font-semibold text-[#dde3f0] whitespace-nowrap">{row.date}</td>
                      {Object.entries(metricsMeta).map(([key, m]) => (
                        <td key={key} className="table-td whitespace-nowrap">
                          {row[key]
                            ? <span style={{ color: m.color }}>{row[key]} {m.unit}</span>
                            : <span className="text-dim">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </Layout>
  );
}
