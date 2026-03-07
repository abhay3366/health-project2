import { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from "recharts";

const healthData = [
  { label: "Steps Today",  value: "6,240", target: "10,000", pct: 62, color: "#f97316", trackColor: "#fff7ed", icon: "👟" },
  { label: "Water Intake", value: "1.4L",  target: "2L",     pct: 70, color: "#0ea5e9", trackColor: "#f0f9ff", icon: "💧" },
  { label: "Sleep",        value: "6.5h",  target: "8h",     pct: 81, color: "#8b5cf6", trackColor: "#f5f3ff", icon: "😴" },
  { label: "Calories",     value: "1,420", target: "2,000",  pct: 71, color: "#22c55e", trackColor: "#f0fdf4", icon: "🔥" },
];

const weeklySteps = [
  { day: "Mon", steps: 7200 },
  { day: "Tue", steps: 5400 },
  { day: "Wed", steps: 9100 },
  { day: "Thu", steps: 6240 },
  { day: "Fri", steps: 8300 },
  { day: "Sat", steps: 4500 },
  { day: "Sun", steps: 6800 },
];

const calorieData = [
  { day: "Mon", intake: 1800, burned: 2100 },
  { day: "Tue", intake: 2100, burned: 1900 },
  { day: "Wed", intake: 1600, burned: 2300 },
  { day: "Thu", intake: 1420, burned: 1800 },
  { day: "Fri", intake: 1950, burned: 2050 },
  { day: "Sat", intake: 2200, burned: 1700 },
  { day: "Sun", intake: 1750, burned: 2000 },
];

const sleepData = [
  { day: "Mon", hours: 7.2 },
  { day: "Tue", hours: 6.0 },
  { day: "Wed", hours: 8.1 },
  { day: "Thu", hours: 6.5 },
  { day: "Fri", hours: 7.8 },
  { day: "Sat", hours: 9.0 },
  { day: "Sun", hours: 7.0 },
];

const waterData = [
  { time: "8am",  litres: 0.3 },
  { time: "10am", litres: 0.6 },
  { time: "12pm", litres: 1.0 },
  { time: "2pm",  litres: 1.2 },
  { time: "4pm",  litres: 1.4 },
  { time: "6pm",  litres: 1.6 },
  { time: "8pm",  litres: 2.0 },
];

const radialGoals = [
  { name: "Steps",   value: 62,  fill: "#f97316" },
  { name: "Water",   value: 70,  fill: "#0ea5e9" },
  { name: "Sleep",   value: 81,  fill: "#8b5cf6" },
  { name: "Calories",value: 71,  fill: "#22c55e" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function RadialProgress({ pct, color, size = 52 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  );
}

const CustomTooltip = ({ active, payload, label, unit = "" }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2 text-xs">
        <p className="font-bold text-slate-600 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-semibold" style={{ color: p.color || p.fill }}>
            {p.name}: {p.value}{unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [coach, setCoach] = useState(null);
  const avgPct = Math.round(healthData.reduce((a, h) => a + h.pct, 0) / healthData.length);

  useEffect(() => {
    if (user?.coach_id) api.getUserById(user.coach_id).then(setCoach);
  }, [user?.coach_id]);

  return (
    <>
      <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight">
              {getGreeting()}, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-slate-400 mt-1">Here's your full health overview for today</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-lg shadow-sm shrink-0">
            🧑
          </div>
        </div>

        {/* ── Coach Banner ── */}
        {coach ? (
          <div className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
            style={{ borderLeft: "3px solid #10b981" }}>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-xl shrink-0">
              {coach.avatar || "🏋️"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Your Assigned Coach</div>
              <div className="font-bold text-slate-800 truncate">{coach.name}</div>
              <div className="text-xs text-slate-400 truncate">{coach.email}</div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-600">Active</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <span className="text-xl">🏋️</span>
            <span className="text-sm font-medium text-amber-700">
              You haven't been assigned a coach yet. Admin will assign one soon.
            </span>
          </div>
        )}

        {/* ── Metric Cards ── */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">📊 Today's Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {healthData.map((h) => (
              <div key={h.label}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200"
                style={{ borderLeft: `3px solid ${h.color}` }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{h.label}</div>
                    <div className="text-2xl font-extrabold leading-none" style={{ color: h.color }}>{h.value}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">of {h.target}</div>
                  </div>
                  <div className="relative shrink-0 flex items-center justify-center">
                    <RadialProgress pct={h.pct} color={h.color} size={52} />
                    <span className="absolute text-base">{h.icon}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: h.trackColor }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${h.pct}%`, backgroundColor: h.color }} />
                </div>
                <div className="text-[10px] font-semibold mt-1.5" style={{ color: h.color }}>
                  {h.pct}% of daily goal
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 2: Steps Bar + Calorie Line ── */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* Weekly Steps Bar Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-extrabold text-slate-700">Weekly Steps</h2>
                <p className="text-[11px] text-slate-400">Last 7 days</p>
              </div>
              <span className="text-xs font-bold text-orange-500 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                👟 avg {Math.round(weeklySteps.reduce((a,b)=>a+b.steps,0)/7).toLocaleString()}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklySteps} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<CustomTooltip unit=" steps" />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="steps" name="Steps" radius={[6, 6, 0, 0]}
                  fill="#f97316"
                  // highlight today (Thu = index 3)
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Calorie Intake vs Burned Line Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-extrabold text-slate-700">Calories This Week</h2>
                <p className="text-[11px] text-slate-400">Intake vs Burned</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-semibold">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Intake</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"/>Burned</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={36} domain={[1000, 2500]} />
                <Tooltip content={<CustomTooltip unit=" kcal" />} />
                <Line type="monotone" dataKey="intake" name="Intake" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3, fill: "#22c55e" }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="burned" name="Burned" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3, fill: "#f97316" }} activeDot={{ r: 5 }} strokeDasharray="4 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Row 3: Sleep Bar + Water Area + Goal Radial ── */}
        <div className="grid md:grid-cols-3 gap-4">

          {/* Sleep Bar Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="mb-4">
              <h2 className="text-sm font-extrabold text-slate-700">Sleep Duration</h2>
              <p className="text-[11px] text-slate-400">Hours per night</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={sleepData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={24} domain={[0, 10]} />
                <Tooltip content={<CustomTooltip unit="h" />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="hours" name="Sleep" fill="#8b5cf6" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Water Intake Area Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="mb-4">
              <h2 className="text-sm font-extrabold text-slate-700">Water Intake Today</h2>
              <p className="text-[11px] text-slate-400">Cumulative litres</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={waterData}>
                <defs>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={24} domain={[0, 2.5]} />
                <Tooltip content={<CustomTooltip unit="L" />} />
                <Area type="monotone" dataKey="litres" name="Water" stroke="#0ea5e9" strokeWidth={2.5}
                  fill="url(#waterGrad)" dot={{ r: 3, fill: "#0ea5e9" }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Goal Completion Radial + Privacy */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex-1">
              <h2 className="text-sm font-extrabold text-slate-700 mb-1">Goal Completion</h2>
              <p className="text-[11px] text-slate-400 mb-3">All metrics today</p>
              <ResponsiveContainer width="100%" height={120}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%"
                  data={radialGoals} startAngle={90} endAngle={-270}>
                  <RadialBar dataKey="value" cornerRadius={4} background={{ fill: "#f8fafc" }} />
                  <Tooltip formatter={(v) => `${v}%`} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
                {radialGoals.map((g) => (
                  <div key={g.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: g.fill }} />
                    <span className="text-[10px] text-slate-500 font-medium">{g.name}</span>
                    <span className="text-[10px] font-bold ml-auto" style={{ color: g.fill }}>{g.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">🔒</span>
                <span className="text-[10px] font-bold text-violet-700 uppercase tracking-widest">Private & Secure</span>
              </div>
              <p className="text-[11px] text-violet-600 leading-relaxed">
                Only you and your assigned coach can view your health data.
              </p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}