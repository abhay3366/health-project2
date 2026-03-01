import { useState } from "react";
import Sidebar from "../component/Sidebar";


const dashStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Satoshi:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --green: #22c55e; --green-light: #4ade80; --green-dark: #16a34a;
    --bg: #f0f4f0; --surface: #ffffff; --border: #e2ebe2;
    --text1: #0f1f0f; --text2: #5a7a5a; --text3: #9ab49a;
    --red: #ef4444; --amber: #f59e0b; --blue: #3b82f6; --purple: #8b5cf6;
  }

  .hd-body {
    background: var(--bg);
    font-family: 'Satoshi', sans-serif;
    color: var(--text1);
    display: flex;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .hd-main {
    margin-left: 240px;
    flex: 1;
    padding: 32px;
    max-width: calc(100vw - 240px);
  }

  /* Topbar */
  .hd-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
  .hd-topbar-left h2 { font-family: 'Clash Display', sans-serif; font-size: 26px; color: var(--text1); }
  .hd-topbar-left p { color: var(--text2); font-size: 13px; margin-top: 2px; }
  .hd-topbar-right { display: flex; align-items: center; gap: 12px; }

  .hd-search-bar {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: 10px; padding: 9px 14px;
    font-size: 13px; color: var(--text2);
    width: 220px; cursor: text;
  }

  .hd-notif-btn {
    width: 38px; height: 38px; border-radius: 10px;
    background: var(--surface); border: 1.5px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px; position: relative;
  }
  .hd-notif-dot {
    position: absolute; top: 7px; right: 7px;
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--red); border: 2px solid var(--bg);
  }

  /* Score Banner */
  .hd-score-banner {
    background: #0f1f0f;
    border-radius: 20px;
    padding: 28px 32px;
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px;
    overflow: hidden; position: relative;
  }
  .hd-score-banner::before {
    content: ''; position: absolute;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%);
    top: -100px; right: 200px; pointer-events: none;
  }
  .hd-score-left h3 { font-family: 'Clash Display', sans-serif; font-size: 32px; color: #fff; margin-bottom: 4px; }
  .hd-score-left p { color: rgba(255,255,255,0.4); font-size: 13px; margin-bottom: 20px; }
  .hd-score-chips { display: flex; gap: 8px; flex-wrap: wrap; }
  .hd-chip {
    display: flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 50px; padding: 5px 12px;
    font-size: 11px; color: rgba(255,255,255,0.6);
  }
  .hd-chip-dot { width: 6px; height: 6px; border-radius: 50%; }

  .hd-score-ring { position: relative; width: 120px; height: 120px; flex-shrink: 0; }
  .hd-score-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .hd-ring-bg { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 8; }
  .hd-ring-fill {
    fill: none; stroke: #22c55e; stroke-width: 8; stroke-linecap: round;
    stroke-dasharray: 326; stroke-dashoffset: 82;
  }
  .hd-score-num {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: 'Clash Display', sans-serif;
    font-size: 28px; color: #fff; line-height: 1;
  }
  .hd-score-num span { font-size: 10px; color: rgba(255,255,255,0.4); font-family: 'Satoshi', sans-serif; margin-top: 2px; }

  /* Stats Grid */
  .hd-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .hd-stat-card {
    background: var(--surface); border: 1.5px solid var(--border);
    border-radius: 16px; padding: 20px;
    transition: transform 0.2s, box-shadow 0.2s; cursor: default;
  }
  .hd-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
  .hd-stat-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .hd-stat-label { font-size: 11px; color: var(--text2); font-weight: 500; letter-spacing: 0.05em; }
  .hd-stat-icon-wrap { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .hd-stat-num { font-family: 'Clash Display', sans-serif; font-size: 28px; color: var(--text1); line-height: 1; }
  .hd-stat-unit { font-size: 12px; color: var(--text2); margin-left: 3px; font-family: 'Satoshi', sans-serif; }
  .hd-stat-change { display: flex; align-items: center; gap: 4px; font-size: 11px; margin-top: 8px; }
  .hd-up { color: #22c55e; } .hd-down { color: var(--red); }
  .hd-micro-bar { height: 3px; background: var(--border); border-radius: 2px; margin-top: 10px; overflow: hidden; }
  .hd-micro-fill { height: 100%; border-radius: 2px; }

  /* Content Row */
  .hd-content-row { display: grid; grid-template-columns: 1.6fr 1fr; gap: 20px; margin-bottom: 24px; }

  .hd-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px; padding: 22px; }
  .hd-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .hd-card-title { font-family: 'Clash Display', sans-serif; font-size: 16px; color: var(--text1); }
  .hd-card-action { font-size: 12px; color: var(--green-dark); cursor: pointer; font-weight: 500; }

  /* Bar Chart */
  .hd-bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 100px; }
  .hd-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .hd-bar {
    width: 100%; border-radius: 6px 6px 0 0;
    background: linear-gradient(180deg, #4ade80, #22c55e);
    min-height: 4px;
  }
  .hd-bar-inactive { background: var(--border); }
  .hd-bar-today {
    background: transparent !important;
    border: 2px dashed #22c55e;
    opacity: 0.5;
  }
  .hd-bar-lbl { font-size: 9px; color: var(--text3); }

  /* Meals */
  .hd-meal-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid var(--border);
  }
  .hd-meal-item:last-child { border-bottom: none; padding-bottom: 0; }
  .hd-meal-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .hd-meal-info { flex: 1; }
  .hd-meal-name { font-size: 13px; font-weight: 500; color: var(--text1); }
  .hd-meal-meta { font-size: 11px; color: var(--text2); margin-top: 1px; }
  .hd-meal-cal { font-family: 'Clash Display', sans-serif; font-size: 15px; color: var(--text1); }
  .hd-meal-cal span { font-size: 10px; color: var(--text2); font-family: 'Satoshi', sans-serif; }

  /* Bottom Row */
  .hd-bottom-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }

  /* Vitals */
  .hd-vital-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 0; border-bottom: 1px solid var(--border);
  }
  .hd-vital-item:last-child { border-bottom: none; }
  .hd-vital-left { display: flex; align-items: center; gap: 10px; }
  .hd-vital-dot { width: 8px; height: 8px; border-radius: 50%; }
  .hd-vital-name { font-size: 12px; color: var(--text2); }
  .hd-vital-val { font-family: 'Clash Display', sans-serif; font-size: 16px; color: var(--text1); }
  .hd-vital-unit { font-size: 10px; color: var(--text3); }
  .hd-vital-tag { font-size: 10px; padding: 2px 7px; border-radius: 4px; font-weight: 500; }
  .hd-tag-normal { background: rgba(34,197,94,0.1); color: var(--green-dark); }
  .hd-tag-warn { background: rgba(245,158,11,0.1); color: var(--amber); }

  /* Water */
  .hd-water-track { display: flex; gap: 4px; margin: 12px 0; }
  .hd-water-cup {
    flex: 1; height: 36px; border-radius: 6px;
    background: var(--border); cursor: pointer;
    transition: background 0.15s;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
  }
  .hd-water-cup-filled { background: rgba(59,130,246,0.2); }

  /* Sleep */
  .hd-sleep-arc { text-align: center; padding: 8px 0; }
  .hd-sleep-arc svg { width: 120px; height: 70px; }
  .hd-sleep-score { font-family: 'Clash Display', sans-serif; font-size: 24px; color: var(--text1); margin-top: 4px; }
  .hd-sleep-sub { font-size: 11px; color: var(--text2); }
  .hd-sleep-row { display: flex; justify-content: space-between; margin-top: 12px; }
  .hd-sleep-item .hd-lbl { font-size: 10px; color: var(--text3); }
  .hd-sleep-item .hd-val { font-size: 13px; font-weight: 600; color: var(--text1); }
`;

const weeklyBars = [
  { day: "Mon", h: 55 },
  { day: "Tue", h: 75 },
  { day: "Wed", h: 45 },
  { day: "Thu", h: 90 },
  { day: "Fri", h: 65 },
  { day: "Sat", h: 30, inactive: true },
  { day: "Sun", h: 78, today: true },
];

const meals = [
  { icon: "🌅", bg: "rgba(251,191,36,0.1)", name: "Breakfast", meta: "Oats + Banana + Milk", cal: "420" },
  { icon: "☀️", bg: "rgba(34,197,94,0.1)", name: "Lunch", meta: "Dal Rice + Salad", cal: "680" },
  { icon: "🍎", bg: "rgba(239,68,68,0.08)", name: "Snack", meta: "Apple + Almonds", cal: "180" },
  { icon: "🌙", bg: "rgba(139,92,246,0.08)", name: "Dinner", meta: "Not logged yet", cal: null },
];

const vitals = [
  { color: "#ef4444", name: "Blood Pressure", val: "118", unit: "/76", tag: "Normal", tagClass: "hd-tag-normal" },
  { color: "#f59e0b", name: "Blood Sugar", val: "108", unit: " mg/dL", tag: "Borderline", tagClass: "hd-tag-warn" },
  { color: "#ec4899", name: "Heart Rate", val: "72", unit: " bpm", tag: "Normal", tagClass: "hd-tag-normal" },
  { color: "#3b82f6", name: "SpO₂", val: "98", unit: "%", tag: "Normal", tagClass: "hd-tag-normal" },
];

export default function Dashboard() {
  
  const [cups, setCups] = useState([true, true, true, true, true, true, false, false, false, false]);

  const toggleCup = (i) => {
    setCups((prev) => prev.map((c, idx) => (idx === i ? !c : c)));
  };

  return (
    <>
      <style>{dashStyles}</style>
      <div className="hd-body">
      

        <main className="hd-main">
          {/* Topbar */}
          <div className="hd-topbar">
            <div className="hd-topbar-left">
              <h2>Good Morning, Rahul 👋</h2>
              <p>Sunday, March 1, 2026 · Here's your health summary</p>
            </div>
            <div className="hd-topbar-right">
              <div className="hd-search-bar">🔍 &nbsp; Search anything...</div>
              <div className="hd-notif-btn">🔔<div className="hd-notif-dot" /></div>
            </div>
          </div>

          {/* Health Score Banner */}
          <div className="hd-score-banner">
            <div className="hd-score-left">
              <h3>Health Score: <span style={{ color: "#4ade80" }}>Good</span></h3>
              <p>Based on your last 7 days activity, diet & vitals</p>
              <div className="hd-score-chips">
                {[
                  { color: "#22c55e", label: "Diet on track" },
                  { color: "#f59e0b", label: "Steps below goal" },
                  { color: "#22c55e", label: "Sleep good" },
                  { color: "#22c55e", label: "Vitals normal" },
                ].map((chip) => (
                  <div className="hd-chip" key={chip.label}>
                    <div className="hd-chip-dot" style={{ background: chip.color }} />
                    {chip.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="hd-score-ring">
              <svg viewBox="0 0 120 120">
                <circle className="hd-ring-bg" cx="60" cy="60" r="52" />
                <circle className="hd-ring-fill" cx="60" cy="60" r="52" />
              </svg>
              <div className="hd-score-num">74<span>/ 100</span></div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="hd-stats-grid">
            {[
              { label: "Steps Today", icon: "🚶", iconBg: "rgba(34,197,94,0.1)", num: "7,842", unit: "steps", change: "↑ 12% vs yesterday", changeClass: "hd-up", barW: "78%", barColor: "#22c55e" },
              { label: "Calories", icon: "🔥", iconBg: "rgba(239,68,68,0.1)", num: "1,840", unit: "kcal", change: "↓ 5% vs goal", changeClass: "hd-down", barW: "85%", barColor: "#ef4444" },
              { label: "Water Intake", icon: "💧", iconBg: "rgba(59,130,246,0.1)", num: "1.8", unit: "L / 3L", change: "→ 60% of goal", changeClass: "", barW: "60%", barColor: "#3b82f6", changeStyle: { color: "#f59e0b" } },
              { label: "Sleep Last Night", icon: "😴", iconBg: "rgba(139,92,246,0.1)", num: "7.2", unit: "hrs", change: "↑ Good quality", changeClass: "hd-up", barW: "90%", barColor: "#8b5cf6" },
            ].map((s) => (
              <div className="hd-stat-card" key={s.label}>
                <div className="hd-stat-card-top">
                  <div className="hd-stat-label">{s.label}</div>
                  <div className="hd-stat-icon-wrap" style={{ background: s.iconBg }}>{s.icon}</div>
                </div>
                <div>
                  <span className="hd-stat-num">{s.num}</span>
                  <span className="hd-stat-unit">{s.unit}</span>
                </div>
                <div className={`hd-stat-change ${s.changeClass}`} style={s.changeStyle}>{s.change}</div>
                <div className="hd-micro-bar">
                  <div className="hd-micro-fill" style={{ width: s.barW, background: s.barColor }} />
                </div>
              </div>
            ))}
          </div>

          {/* Content Row */}
          <div className="hd-content-row">
            {/* Weekly Activity */}
            <div className="hd-card">
              <div className="hd-card-header">
                <div className="hd-card-title">Weekly Activity</div>
                <div className="hd-card-action">View All</div>
              </div>
              <div className="hd-bar-chart">
                {weeklyBars.map((b) => (
                  <div className="hd-bar-col" key={b.day}>
                    <div
                      className={`hd-bar${b.inactive ? " hd-bar-inactive" : ""}${b.today ? " hd-bar-today" : ""}`}
                      style={{ height: b.h }}
                    />
                    <div className="hd-bar-lbl">{b.day}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 12, color: "var(--text2)" }}>
                <span>Avg: <strong style={{ color: "var(--text1)" }}>6,820 steps/day</strong></span>
                <span>Goal: <strong style={{ color: "var(--green-dark)" }}>10,000</strong></span>
              </div>
            </div>

            {/* Today's Meals */}
            <div className="hd-card">
              <div className="hd-card-header">
                <div className="hd-card-title">Today's Meals</div>
                <div className="hd-card-action">+ Add</div>
              </div>
              {meals.map((m) => (
                <div className="hd-meal-item" key={m.name}>
                  <div className="hd-meal-icon" style={{ background: m.bg }}>{m.icon}</div>
                  <div className="hd-meal-info">
                    <div className="hd-meal-name">{m.name}</div>
                    <div className="hd-meal-meta">{m.meta}</div>
                  </div>
                  {m.cal
                    ? <div className="hd-meal-cal">{m.cal} <span>kcal</span></div>
                    : <div style={{ fontSize: 11, color: "var(--text3)" }}>— kcal</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="hd-bottom-row">
            {/* Vitals */}
            <div className="hd-card">
              <div className="hd-card-header">
                <div className="hd-card-title">Vitals</div>
                <div className="hd-card-action">Update</div>
              </div>
              {vitals.map((v) => (
                <div className="hd-vital-item" key={v.name}>
                  <div className="hd-vital-left">
                    <div className="hd-vital-dot" style={{ background: v.color }} />
                    <div className="hd-vital-name">{v.name}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="hd-vital-val">{v.val}<span className="hd-vital-unit">{v.unit}</span></div>
                    <div className={`hd-vital-tag ${v.tagClass}`}>{v.tag}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Hydration */}
            <div className="hd-card">
              <div className="hd-card-header">
                <div className="hd-card-title">Hydration</div>
                <div className="hd-card-action">+ Add Cup</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div>
                  <div style={{ fontFamily: "'Clash Display',sans-serif", fontSize: 28, color: "#3b82f6" }}>
                    {(cups.filter(Boolean).length * 0.3).toFixed(1)}L
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text2)" }}>of 3L goal</div>
                </div>
                <div style={{ fontSize: 13, color: "var(--text2)", alignSelf: "flex-end" }}>
                  {cups.filter(Boolean).length} / 10 cups
                </div>
              </div>
              <div className="hd-water-track">
                {cups.map((filled, i) => (
                  <div
                    key={i}
                    className={`hd-water-cup${filled ? " hd-water-cup-filled" : ""}`}
                    onClick={() => toggleCup(i)}
                  >
                    {filled ? "💧" : ""}
                  </div>
                ))}
              </div>
              <div className="hd-micro-bar" style={{ marginTop: 8 }}>
                <div className="hd-micro-fill" style={{ width: `${cups.filter(Boolean).length * 10}%`, background: "#3b82f6" }} />
              </div>
              <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 8 }}>
                💡 Drink {((10 - cups.filter(Boolean).length) * 0.3).toFixed(1)}L more to reach your goal
              </div>
            </div>

            {/* Sleep */}
            <div className="hd-card">
              <div className="hd-card-header">
                <div className="hd-card-title">Sleep</div>
                <div className="hd-card-action">History</div>
              </div>
              <div className="hd-sleep-arc">
                <svg viewBox="0 0 120 70">
                  <defs>
                    <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#c084fc" />
                    </linearGradient>
                  </defs>
                  <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="#e2ebe2" strokeWidth="8" strokeLinecap="round" />
                  <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="url(#sg)" strokeWidth="8" strokeLinecap="round" strokeDasharray="157" strokeDashoffset="39" />
                </svg>
                <div className="hd-sleep-score">7.2 hrs</div>
                <div className="hd-sleep-sub" style={{ color: "var(--green-dark)", fontWeight: 600 }}>Good Quality 😊</div>
              </div>
              <div className="hd-sleep-row">
                {[
                  { lbl: "Bedtime", val: "11:00 PM" },
                  { lbl: "Wakeup", val: "6:12 AM" },
                  { lbl: "Deep Sleep", val: "2.4 hrs" },
                ].map((s) => (
                  <div className="hd-sleep-item" key={s.lbl}>
                    <div className="hd-lbl">{s.lbl}</div>
                    <div className="hd-val">{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}