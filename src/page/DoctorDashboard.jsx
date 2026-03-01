// src/pages/DoctorDashboard.jsx
import { useState } from "react";
import Layout from "../components/Layout";
import { Card, CardHeader, PageHeader, GreenBtn, BadgeChip, ProgressBar } from "../components/UI";

// ── Data ─────────────────────────────────────────────────────────
const PATIENTS = [
  {
    id: 1, name: "Priya Mehta",   age: 34, condition: "Diabetes Type 2",  status: "Active",
    bmi: 28.4, bp: "118/76", sugar: "126 mg", lastVisit: "28 Feb",
    avatar: "P", gradient: "from-pink-400 to-rose-500",
    diet: ["Low Carb", "High Protein", "No Sugar", "1800 kcal/day"],
    notes: [
      { date: "28 Feb", text: "Patient showing good progress. Weight reduced by 2kg. Continue current diet plan." },
      { date: "20 Feb", text: "Blood sugar slightly elevated. Reduce carb intake, increase fiber." },
      { date: "10 Feb", text: "Initial consultation. Started on low-carb diet and walking 30 min/day." },
    ],
    progress: 68,
  },
  {
    id: 2, name: "Arjun Kapoor",  age: 45, condition: "Hypertension",     status: "Active",
    bmi: 26.1, bp: "135/88", sugar: "98 mg",  lastVisit: "25 Feb",
    avatar: "A", gradient: "from-blue-400 to-indigo-500",
    diet: ["Low Sodium", "DASH Diet", "2000 kcal/day"],
    notes: [
      { date: "25 Feb", text: "BP slightly high. Advised salt restriction and daily 45 min walk." },
      { date: "12 Feb", text: "Started BP medication. Diet plan updated." },
    ],
    progress: 52,
  },
  {
    id: 3, name: "Sunita Rao",    age: 52, condition: "Obesity",          status: "Review",
    bmi: 32.5, bp: "128/84", sugar: "112 mg", lastVisit: "20 Feb",
    avatar: "S", gradient: "from-amber-400 to-orange-500",
    diet: ["Calorie Deficit", "High Fiber", "1500 kcal/day", "No Fried Food"],
    notes: [
      { date: "20 Feb", text: "BMI above 30. Initiated weight management program." },
      { date: "5 Feb",  text: "First visit. Comprehensive health assessment done." },
    ],
    progress: 30,
  },
  {
    id: 4, name: "Rohan Verma",   age: 28, condition: "General Wellness",  status: "Active",
    bmi: 22.8, bp: "112/72", sugar: "88 mg",  lastVisit: "27 Feb",
    avatar: "R", gradient: "from-green-400 to-teal-500",
    diet: ["Balanced Diet", "High Protein", "2200 kcal/day"],
    notes: [
      { date: "27 Feb", text: "All vitals normal. Advised to maintain current lifestyle." },
    ],
    progress: 90,
  },
  {
    id: 5, name: "Kavita Singh",  age: 39, condition: "Thyroid",          status: "Critical",
    bmi: 30.1, bp: "122/80", sugar: "104 mg", lastVisit: "15 Feb",
    avatar: "K", gradient: "from-purple-400 to-violet-500",
    diet: ["Iodine-rich Diet", "Low Goitrogen", "1700 kcal/day"],
    notes: [
      { date: "15 Feb", text: "TSH levels elevated. Medication adjusted. Needs follow-up in 2 weeks." },
      { date: "1 Feb",  text: "Thyroid function test done. Waiting for results." },
    ],
    progress: 40,
  },
];

const statusColor = {
  Active:   "green",
  Review:   "amber",
  Critical: "red",
};

// ── Component ─────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const [selected, setSelected] = useState(PATIENTS[0]);

  const bmiStatus = (bmi) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500" };
    if (bmi < 25)   return { label: "Normal",       color: "text-green-600" };
    if (bmi < 30)   return { label: "Overweight",   color: "text-amber-600" };
    return               { label: "Obese",          color: "text-red-500" };
  };

  return (
  <>
    
      <PageHeader title="👨‍⚕️ Doctor Dashboard" subtitle="Manage patients and monitor their health">
        <GreenBtn>+ Add Patient</GreenBtn>
      </PageHeader>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Patients",  value: PATIENTS.length,                                          icon: "👥" },
          { label: "Active",          value: PATIENTS.filter(p => p.status === "Active").length,        icon: "✅" },
          { label: "Pending Review",  value: PATIENTS.filter(p => p.status === "Review").length,        icon: "⏳" },
          { label: "Critical",        value: PATIENTS.filter(p => p.status === "Critical").length,      icon: "🚨" },
        ].map(({ label, value, icon }) => (
          <Card key={label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">{label}</span>
              <span className="text-lg">{icon}</span>
            </div>
            <div className="text-3xl font-black text-gray-900">{value}</div>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-[280px_1fr] gap-5">

        {/* Patient List */}
        <Card className="!p-3">
          <div className="px-2 mb-3">
            <span className="font-bold text-gray-900 text-base">Patient List</span>
          </div>
          <div className="space-y-1">
            {PATIENTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  selected.id === p.id
                    ? "bg-green-50 border border-green-200"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {p.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{p.name}</div>
                  <div className="text-xs text-gray-400 truncate">{p.condition}</div>
                </div>
                <BadgeChip color={statusColor[p.status]}>{p.status}</BadgeChip>
              </button>
            ))}
          </div>
        </Card>

        {/* Patient Detail */}
        <div className="space-y-4">

          {/* Patient Header Card */}
          <Card>
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selected.gradient} flex items-center justify-center text-white text-2xl font-black`}>
                  {selected.avatar}
                </div>
                <div>
                  <div className="text-xl font-black text-gray-900">{selected.name}</div>
                  <div className="text-sm text-gray-400">{selected.age} yrs · {selected.condition}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Last visit: {selected.lastVisit}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BadgeChip color={statusColor[selected.status]}>{selected.status}</BadgeChip>
                <GreenBtn small>📋 Add Note</GreenBtn>
                <GreenBtn small outline>✏️ Edit</GreenBtn>
              </div>
            </div>

            {/* Vitals */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: "BMI", value: selected.bmi, ...bmiStatus(selected.bmi) },
                { label: "Blood Pressure", value: selected.bp, label2: selected.bp.includes("13") ? "High" : "Normal", color: selected.bp.includes("13") ? "text-amber-600" : "text-green-600" },
                { label: "Blood Sugar",    value: selected.sugar, label2: parseInt(selected.sugar) > 100 ? "Borderline" : "Normal", color: parseInt(selected.sugar) > 100 ? "text-amber-500" : "text-green-600" },
                { label: "Progress",       value: `${selected.progress}%`, label2: "Goal completion", color: "text-blue-600" },
              ].map((v, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">{v.label}</div>
                  <div className="text-lg font-black text-gray-900">{v.value}</div>
                  <div className={`text-xs mt-0.5 font-semibold ${v.color}`}>{v.label2 || v.label}</div>
                  {i === 3 && <ProgressBar value={selected.progress} max={100} color="bg-blue-400" height="h-1" />}
                </div>
              ))}
            </div>

            {/* Diet Tags */}
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Assigned Diet Plan
              </div>
              <div className="flex flex-wrap gap-2">
                {selected.diet.map((tag) => (
                  <span key={tag} className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader title="Doctor's Notes" action="+ Add Note" />
            <div className="space-y-3">
              {selected.notes.map(({ date, text }) => (
                <div key={date} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-400 font-semibold w-14 flex-shrink-0 pt-0.5">
                    {date}
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">{text}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
  </>
    
  );
}