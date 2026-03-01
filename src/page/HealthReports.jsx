
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, PageHeader, GreenBtn } from "../component/UI";

// ── Chart Data ───────────────────────────────────────────────────
const weightData = [
  { date: "Jan", weight: 82.0, fat: 26.0 },
  { date: "Feb", weight: 80.5, fat: 25.0 },
  { date: "Mar", weight: 79.0, fat: 24.5 },
  { date: "Apr", weight: 78.0, fat: 23.5 },
  { date: "May", weight: 77.5, fat: 23.0 },
  { date: "Jun", weight: 76.0, fat: 22.0 },
];

const stepsData = [
  { day: "Mon", steps: 6200 },
  { day: "Tue", steps: 8400 },
  { day: "Wed", steps: 5100 },
  { day: "Thu", steps: 9800 },
  { day: "Fri", steps: 7300 },
  { day: "Sat", steps: 3200 },
  { day: "Sun", steps: 7842 },
];

const bpData = [
  { week: "Week 1", systolic: 122, diastolic: 80 },
  { week: "Week 2", systolic: 118, diastolic: 78 },
  { week: "Week 3", systolic: 120, diastolic: 79 },
  { week: "Week 4", systolic: 115, diastolic: 76 },
];

const calorieData = [
  { day: "Mon", intake: 1920, burned: 2100 },
  { day: "Tue", intake: 1840, burned: 2200 },
  { day: "Wed", intake: 2100, burned: 1980 },
  { day: "Thu", intake: 1780, burned: 2300 },
  { day: "Fri", intake: 1900, burned: 2050 },
  { day: "Sat", intake: 2200, burned: 1800 },
  { day: "Sun", intake: 1840, burned: 2100 },
];

const historyRows = [
  { date: "Jun '25", weight: "77.5", fat: "23.0", muscle: "33.5", bmi: "24.1", metabolism: "1750" },
  { date: "May '25", weight: "78.0", fat: "23.5", muscle: "33.0", bmi: "24.3", metabolism: "1740" },
  { date: "Apr '25", weight: "79.0", fat: "24.0", muscle: "32.5", bmi: "24.6", metabolism: "1730" },
  { date: "Mar '25", weight: "80.5", fat: "25.0", muscle: "32.0", bmi: "25.1", metabolism: "1720" },
  { date: "Feb '25", weight: "82.0", fat: "26.0", muscle: "31.5", bmi: "25.5", metabolism: "1710" },
];

// ── Tooltip style ─────────────────────────────────────────────────
const tipStyle = {
  borderRadius: 12,
  border: "none",
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  fontSize: 12,
};

export default function HealthReports() {
  return (
   
      <>
        <PageHeader title="📊 Health Reports" subtitle="Track your health trends over time">
        <GreenBtn>📥 Export PDF</GreenBtn>
      </PageHeader>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Current Weight", value: "77.5", unit: "kg",  change: "↓ 4.5kg in 6 months", good: true  },
          { label: "BMI",            value: "24.1", unit: "",    change: "Normal range",          good: true  },
          { label: "Body Fat",       value: "23%",  unit: "",    change: "↓ 3% improvement",      good: true  },
          { label: "Organ Age",      value: "38",   unit: "yrs", change: "2 yrs below actual",    good: true  },
        ].map(({ label, value, unit, change, good }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="text-xs text-gray-400 mb-2 font-medium">{label}</div>
            <div className="text-3xl font-black text-gray-900 mb-1">
              {value}
              {unit && <span className="text-sm text-gray-400 font-normal ml-1">{unit}</span>}
            </div>
            <div className={`text-xs font-semibold ${good ? "text-green-600" : "text-red-500"}`}>
              {change}
            </div>
          </div>
        ))}
      </div>

      {/* Row 1: Weight trend + Steps */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader title="Weight & Body Fat Trend" action="6 Months" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: "#22c55e" }} name="Weight (kg)" />
              <Line type="monotone" dataKey="fat"    stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }} name="Fat (%)" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Weekly Steps" action="This Week" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stepsData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} />
              <Bar dataKey="steps" fill="#22c55e" radius={[6, 6, 0, 0]} name="Steps" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Row 2: BP + Calorie */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader title="Blood Pressure Trend" action="4 Weeks" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={bpData}>
              <defs>
                <linearGradient id="sysGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="diaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[60, 140]} />
              <Tooltip contentStyle={tipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="systolic"  stroke="#ef4444" strokeWidth={2} fill="url(#sysGrad)" name="Systolic"  />
              <Area type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} fill="url(#diaGrad)" name="Diastolic" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Calorie Intake vs Burned" action="This Week" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={calorieData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="intake"  fill="#22c55e" radius={[4, 4, 0, 0]} name="Intake (kcal)"  />
              <Bar dataKey="burned"  fill="#f97316" radius={[4, 4, 0, 0]} name="Burned (kcal)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader title="Body Composition History" action="Download CSV" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Date", "Weight (kg)", "Fat %", "Muscle %", "BMI", "Metabolism (kcal)"].map((h) => (
                  <th key={h} className="pb-3 text-left text-xs font-semibold text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historyRows.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 font-semibold text-gray-500 text-xs">{row.date}</td>
                  <td className="py-3 font-bold text-gray-900">{row.weight}</td>
                  <td className="py-3 font-bold text-blue-600">{row.fat}</td>
                  <td className="py-3 font-bold text-green-600">{row.muscle}</td>
                  <td className="py-3 font-bold text-amber-600">{row.bmi}</td>
                  <td className="py-3 font-bold text-purple-600">{row.metabolism}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </>
   
  );
}