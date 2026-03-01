
import { useState } from "react";
import { Card, CardHeader, PageHeader, GreenBtn,ProgressBar } from "../component/UI";

// ── Data ─────────────────────────────────────────────────────────
const INITIAL_GOALS = [
  { id: 1, title: "Lose 5kg",         category: "Weight",   target: 5,     current: 4.5,  unit: "kg",    icon: "⚖️", color: "green",  deadline: "Mar 30" },
  { id: 2, title: "10,000 Steps/day", category: "Activity", target: 10000, current: 7842, unit: "steps", icon: "🚶", color: "blue",   deadline: "Daily"  },
  { id: 3, title: "Drink 3L Water",   category: "Hydration",target: 3,     current: 1.8,  unit: "L",     icon: "💧", color: "cyan",   deadline: "Daily"  },
  { id: 4, title: "Sleep 8 hrs",      category: "Sleep",    target: 8,     current: 7.2,  unit: "hrs",   icon: "😴", color: "purple", deadline: "Daily"  },
  { id: 5, title: "No Sugar 30 days", category: "Diet",     target: 30,    current: 18,   unit: "days",  icon: "🍬", color: "amber",  deadline: "Apr 1"  },
  { id: 6, title: "Workout 5x/week",  category: "Fitness",  target: 5,     current: 3,    unit: "days",  icon: "🏋️", color: "red",    deadline: "Weekly" },
];

const BADGES = [
  { id: 1, name: "First Step",     desc: "Logged first activity",      icon: "👟", earned: true  },
  { id: 2, name: "Week Warrior",   desc: "7-day activity streak",       icon: "🔥", earned: true  },
  { id: 3, name: "Hydration Hero", desc: "3L water for 5 days",         icon: "💧", earned: true  },
  { id: 4, name: "5kg Down",       desc: "Lost first 5kg",              icon: "⚖️", earned: false },
  { id: 5, name: "Sleep Champion", desc: "8 hrs sleep for 7 days",      icon: "😴", earned: false },
  { id: 6, name: "10k Club",       desc: "10,000 steps for 10 days",    icon: "🏆", earned: false },
  { id: 7, name: "Clean Eater",    desc: "No junk food for 30 days",    icon: "🥗", earned: false },
  { id: 8, name: "Doctor's Star",  desc: "All vitals normal 3 months",  icon: "🩺", earned: false },
];

const GOAL_COLORS = {
  green:  { bar: "bg-green-400",  bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  blue:   { bar: "bg-blue-400",   bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  cyan:   { bar: "bg-cyan-400",   bg: "bg-cyan-50",   text: "text-cyan-700",   border: "border-cyan-200"   },
  purple: { bar: "bg-purple-400", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  amber:  { bar: "bg-amber-400",  bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  red:    { bar: "bg-red-400",    bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"    },
};

const STREAK_DAYS = 18;
const TOTAL_DAYS  = 30;
const XP_CURRENT  = 1240;
const XP_NEXT     = 1500;

export default function Goals() {
  const [goals] = useState(INITIAL_GOALS);
  const earnedBadges = BADGES.filter((b) => b.earned).length;

  return (
    
    <>
              <PageHeader title="🎯 Goals & Badges" subtitle="Set targets and earn achievements">
        <GreenBtn>+ New Goal</GreenBtn>
      </PageHeader>

      {/* XP Level Banner */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-black text-gray-900">
              Level 7 — Health Enthusiast 🌟
            </div>
            <div className="text-sm text-gray-400 mt-0.5">
              {XP_CURRENT} XP · {XP_NEXT - XP_CURRENT} XP to Level 8
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-black text-green-600">{earnedBadges}</div>
              <div className="text-xs text-gray-400">Badges Earned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-amber-500">{STREAK_DAYS}</div>
              <div className="text-xs text-gray-400">Day Streak 🔥</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-blue-600">{goals.length}</div>
              <div className="text-xs text-gray-400">Active Goals</div>
            </div>
          </div>
        </div>
        <ProgressBar value={XP_CURRENT} max={XP_NEXT} color="bg-gradient-to-r from-green-400 to-green-600" />
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>Level 7</span>
          <span>{Math.round((XP_CURRENT / XP_NEXT) * 100)}% to Level 8</span>
        </div>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-[1fr_300px] gap-5 mb-5">

        {/* Active Goals */}
        <Card>
          <CardHeader title="Active Goals" action="View All" />
          <div className="space-y-5">
            {goals.map((g) => {
              const pct = Math.min(Math.round((g.current / g.target) * 100), 100);
              const c   = GOAL_COLORS[g.color];
              return (
                <div key={g.id}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center text-base flex-shrink-0`}>
                      {g.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-800">{g.title}</span>
                        <span className={`text-xs font-black ${c.text}`}>{pct}%</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {g.current} / {g.target} {g.unit} · Deadline: {g.deadline}
                      </div>
                    </div>
                  </div>
                  <div className="ml-12">
                    <ProgressBar value={g.current} max={g.target} color={c.bar} height="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Streak Calendar */}
        <Card>
          <CardHeader title="Activity Streak 🔥" />
          <div className="text-center mb-4">
            <div className="text-5xl font-black text-gray-900">{STREAK_DAYS}</div>
            <div className="text-sm text-green-600 font-bold">Day Streak</div>
          </div>
          <div className="grid grid-cols-7 gap-1.5 mb-4">
            {Array.from({ length: TOTAL_DAYS }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-md transition-all ${
                  i < STREAK_DAYS
                    ? "bg-green-400"
                    : i === STREAK_DAYS
                    ? "bg-green-200 border-2 border-green-500 animate-pulse"
                    : "bg-gray-100"
                }`}
                title={i < STREAK_DAYS ? `Day ${i + 1} ✓` : i === STREAK_DAYS ? "Today" : `Day ${i + 1}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-400 rounded" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-gray-100 rounded border border-gray-200" />
              <span>Missed</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Badges */}
      <Card>
        <CardHeader title="Badges & Achievements" action={`${earnedBadges} / ${BADGES.length} Earned`} />
        <div className="grid grid-cols-4 gap-4">
          {BADGES.map((b) => (
            <div
              key={b.id}
              className={`p-5 rounded-2xl border text-center transition-all duration-200 ${
                b.earned
                  ? "bg-green-50 border-green-200 hover:shadow-md hover:shadow-green-100"
                  : "bg-gray-50 border-gray-100 opacity-50 grayscale"
              }`}
            >
              <div className="text-4xl mb-2">{b.icon}</div>
              <div className={`text-sm font-black mb-1 ${b.earned ? "text-gray-900" : "text-gray-400"}`}>
                {b.name}
              </div>
              <div className="text-xs text-gray-400 leading-tight mb-2">{b.desc}</div>
              {b.earned ? (
                <span className="inline-block text-[9px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Earned ✓
                </span>
              ) : (
                <span className="inline-block text-[9px] bg-gray-200 text-gray-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Locked 🔒
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </>
    
  );
}