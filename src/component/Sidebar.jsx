import { NavLink } from "react-router-dom";

const sidebarStyles = `
  .sb-wrap {
    width: 240px; flex-shrink: 0;
    background: #0f1f0f;
    display: flex; flex-direction: column;
    padding: 28px 0;
    position: fixed; height: 100vh;
    z-index: 10;
  }
  .sb-logo {
    display: flex; align-items: center; gap: 10px;
    padding: 0 24px 28px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 24px;
  }
  .sb-logo-mark {
    width: 36px; height: 36px;
    background: #22c55e; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; font-size: 18px;
  }
  .sb-logo-name { font-family: 'Clash Display', sans-serif; font-size: 18px; color: #fff; }
  .sb-logo-name span { color: #4ade80; }

  .sb-section { padding: 0 16px; margin-bottom: 6px; }
  .sb-section-label {
    font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(255,255,255,0.2); padding: 0 8px; margin-bottom: 6px;
  }
  .sb-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 8px; border-radius: 10px;
    cursor: pointer; transition: background 0.15s;
    color: rgba(255,255,255,0.45); font-size: 13px; font-weight: 500;
    margin-bottom: 2px;
    text-decoration: none;
  }
  .sb-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
  .sb-item.sb-active { background: rgba(34,197,94,0.12); color: #4ade80; }
  .sb-icon { font-size: 16px; width: 20px; text-align: center; }
  .sb-badge {
    margin-left: auto; background: #22c55e; color: #fff;
    font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 20px;
  }
  .sb-bottom {
    margin-top: auto; padding: 16px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .sb-user {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 8px; border-radius: 10px; cursor: pointer;
  }
  .sb-user:hover { background: rgba(255,255,255,0.05); }
  .sb-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; color: #fff;
  }
  .sb-uinfo .sb-name { font-size: 13px; color: #fff; font-weight: 500; }
  .sb-uinfo .sb-role { font-size: 10px; color: rgba(255,255,255,0.35); }
`;

const NAV_SECTIONS = [
 {
    label: "Main",
    items: [
      { icon: "⊞", label: "Dashboard", path: "/app" },
      { icon: "🥗", label: "Diet Plan", path: "/app/diet-plan" },
      { icon: "📊", label: "Health Reports", path: "/app/health-reports" },
      { icon: "🏃", label: "Activities", path: "/app/activities" },
      { icon: "💊", label: "Medications", path: "/app/medications", badge: 3 },
    ],
  },
  {
    label: "Monitor",
    items: [
      { icon: "🩺", label: "Vitals", path: "/app/vitals" },
      { icon: "💧", label: "Hydration", path: "/app/hydration" },
      { icon: "😴", label: "Sleep", path: "/app/sleep" },
      { icon: "🎯", label: "Goals", path: "/app/goals" },
    ],
  },
  {
    label: "Connect",
    items: [
      { icon: "👨‍⚕️", label: "Doctor Dashboard", path: "/app/doctor" },
      { icon: "🔔", label: "Reminders",       path: "/app/reminders", badge: 2 },
    ],
  },
];

export default function Sidebar() {
  return (
    <>
      <style>{sidebarStyles}</style>
      <aside className="sb-wrap">
        <div className="sb-logo">
          <div className="sb-logo-mark">🩺</div>
          <div className="sb-logo-name">Gtel<span>OS</span></div>
        </div>

        {NAV_SECTIONS.map((section) => (
          <div className="sb-section" key={section.label} style={{ marginTop: section.label !== "Main" ? 12 : 0 }}>
            <div className="sb-section-label">{section.label}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sb-item${isActive ? " sb-active" : ""}`}
              >
                <span className="sb-icon">{item.icon}</span>
                {item.label}
                {item.badge && <span className="sb-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}

        <div className="sb-bottom">
          <NavLink
            to="/app/settings"
            className={({ isActive }) => `sb-item${isActive ? " sb-active" : ""}`}
          >
            <span className="sb-icon">⚙️</span> Settings
          </NavLink>
          <div className="sb-user">
            <div className="sb-avatar">R</div>
            <div className="sb-uinfo">
              <div className="sb-name">Rahul Sharma</div>
              <div className="sb-role">General User</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}