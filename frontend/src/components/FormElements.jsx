export function Input({ label, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1.5">
          {label}
        </label>
      )}
      <input className="input-base" {...props} />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1.5">
          {label}
        </label>
      )}
      <select className="input-base cursor-pointer" {...props}>
        {children}
      </select>
    </div>
  );
}

export function Button({ children, variant = "admin", className = "", ...props }) {
  const base = "font-bold text-sm cursor-pointer transition-transform duration-150 hover:-translate-y-0.5 rounded-xl px-5 py-2.5 border-none";
  const variants = {
    admin:  "btn-admin",
    coach:  "btn-coach",
    danger: "btn-danger",
    ghost:  "btn-ghost",
  };
  return (
    <button className={`${base} ${variants[variant] || variants.admin} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Badge({ role }) {
  const map = {
    admin: { cls: "badge-admin", icon: "👑" },
    coach: { cls: "badge-coach", icon: "🏋️" },
    user:  { cls: "badge-user",  icon: "🧑" },
  };
  const m = map[role] || map.user;
  return (
    <span className={m.cls}>
      {m.icon} {role}
    </span>
  );
}

export function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 right-6 bg-card border border-coach text-coach text-sm font-semibold px-5 py-3.5 rounded-xl shadow-2xl z-50 animate-fadeIn">
      ✓ {msg}
    </div>
  );
}
