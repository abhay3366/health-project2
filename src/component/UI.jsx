// src/components/UI.jsx

// ── Card ─────────────────────────────────────────────────────────
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-100 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}

// ── Card Header ──────────────────────────────────────────────────
export function CardHeader({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="font-bold text-gray-900 text-base">{title}</span>
      {action && (
        <button
          onClick={onAction}
          className="text-xs text-green-700 font-semibold hover:underline cursor-pointer"
        >
          {action}
        </button>
      )}
    </div>
  );
}

// ── Page Header ──────────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-center justify-between mb-7">
      <div>
        <h1 className="text-2xl font-black text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

// ── Green Button ─────────────────────────────────────────────────
export function GreenBtn({ children, onClick, small = false, outline = false }) {
  const base = "font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg";
  const size = small ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm";
  const style = outline
    ? "border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
    : "bg-gray-900 hover:bg-green-800 text-white";
  return (
    <button onClick={onClick} className={`${base} ${size} ${style}`}>
      {children}
    </button>
  );
}

// ── Stat Card ────────────────────────────────────────────────────
export function StatCard({ label, value, unit, icon, iconBg, change, changeType, pct, barColor }) {
  const changeColors = { up: "text-green-600", down: "text-red-500", neutral: "text-amber-500" };
  return (
    <Card>
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-medium text-gray-400 tracking-wide">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center text-base`}>
          {icon}
        </div>
      </div>
      <div className="mb-1">
        <span className="text-3xl font-black text-gray-900">{value}</span>
        {unit && <span className="text-xs text-gray-400 ml-1">{unit}</span>}
      </div>
      {change && (
        <div className={`text-xs mb-3 ${changeColors[changeType] || "text-gray-400"}`}>
          {change}
        </div>
      )}
      {pct !== undefined && (
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </Card>
  );
}

// ── Badge Chip ───────────────────────────────────────────────────
export function BadgeChip({ children, color = "green" }) {
  const colors = {
    green:  "bg-green-50 text-green-700 border-green-200",
    red:    "bg-red-50 text-red-600 border-red-200",
    amber:  "bg-amber-50 text-amber-600 border-amber-200",
    blue:   "bg-blue-50 text-blue-600 border-blue-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    gray:   "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors[color]}`}>
      {children}
    </span>
  );
}

// ── Progress Bar ─────────────────────────────────────────────────
export function ProgressBar({ value, max, color = "bg-green-400", height = "h-2" }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <div className={`${height} bg-gray-100 rounded-full overflow-hidden`}>
      <div
        className={`h-full ${color} rounded-full transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}