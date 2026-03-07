import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import sidebarNavigationData from "../utils/sidebarNavigationData";
import {
  LogOut, Leaf, LayoutDashboard, TrendingUp, Activity, Plus,
  Footprints, Clock, ClipboardList, CalendarDays, History,
  FileBarChart2, Download, Bell, MessageCircle, User
} from "lucide-react";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const nav = sidebarNavigationData[user.role] || [];

  return (
    <div className="flex min-h-screen" style={{ background: "#f7fef0" }}>

      {/* ── Sidebar ── */}
      <aside
        className={`${collapsed ? "w-16" : "w-56"} flex flex-col flex-shrink-0 shadow-xl transition-all duration-250 overflow-hidden`}
        style={{ background: "linear-gradient(180deg, #3a6d17 0%, #4c8f1f 40%, #5da820 100%)" }}
      >

        {/* Logo / Toggle */}
        <div
          className="flex items-center gap-2.5 px-4 py-5 cursor-pointer flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}
          onClick={() => setCollapsed(!collapsed)}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
            style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)" }}
          >
            <Leaf size={15} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-white font-bold text-sm tracking-tight block leading-tight">AWC by SR</span>
              <span className="text-white/50 text-[10px] font-medium tracking-wide">Wellness Portal</span>
            </div>
          )}
        </div>

        {/* Role Badge */}
        {!collapsed && (
          <div className="px-4 pt-4 pb-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <span className="text-xs">
                {{ admin: "👑", coach: "🏋️", user: "🧑" }[user.role] || "🧑"}
              </span>
              <span className="text-[11px] font-semibold text-white/70 capitalize tracking-wide">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Nav — Admin & Coach (data-driven) */}
        {(user.role === "admin" || user.role === "coach") && (
          <nav className="flex-1 px-3 py-3 space-y-0.5">
            {nav.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={
                    active
                      ? {
                          background: "rgba(255,255,255,0.92)",
                          color: "#4c8f1f",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                        }
                      : {
                          color: "rgba(255,255,255,0.65)",
                          background: "transparent",
                        }
                  }
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.95)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "rgba(255,255,255,0.65)";
                    }
                  }}
                >
                  <span className={`text-lg flex-shrink-0 ${active ? "" : "opacity-80"}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="truncate text-[13px]">{item.label}</span>
                  )}
                  {/* Active indicator dot when collapsed */}
                  {collapsed && active && (
                    <span
                      className="absolute right-1 w-1 h-1 rounded-full"
                      style={{ background: "#6fbf1d" }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Nav — User */}
        {user.role === "user" && (
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">

            <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <LayoutDashboard size={16} /> Dashboard
            </Link>

           <p className="text-[10px] text-white/40 mt-3 mb-1 px-3 uppercase tracking-wider">Meal Tracker</p>

            <Link to="/user/meal/add" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <Plus size={16} /> Add Meal
            </Link>

            <Link to="/user/meal/history" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <Footprints size={16} /> Meal History
            </Link>

            <p className="text-[10px] text-white/40 mt-3 mb-1 px-3 uppercase tracking-wider">Activity Tracker</p>

            <Link to="/user/activity/add" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <Plus size={16} /> Add Activity
            </Link>

            <Link to="/user/activity/history" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <Footprints size={16} /> Activity History
            </Link>

            <p className="text-[10px] text-white/40 mt-3 mb-1 px-3 uppercase tracking-wider">Medicine Reminder</p>

            <Link to="/user/medicine/add" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <Plus size={16} /> Add Medicine
            </Link>

            <Link to="/user/medicine/schedule" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <Clock size={16} /> Medicine Schedule
            </Link>

            <Link to="/user/medicine/history" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <ClipboardList size={16} /> Reminder History
            </Link>

            <p className="text-[10px] text-white/40 mt-3 mb-1 px-3 uppercase tracking-wider">Appointments</p>

            <Link to="/user/appointments/book" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <Plus size={16} /> Book Appointment
            </Link>

            <Link to="/user/appointments/upcoming" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <CalendarDays size={16} /> Upcoming
            </Link>

            <Link to="/user/appointments/history" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <History size={16} /> History
            </Link>

            <p className="text-[10px] text-white/40 mt-3 mb-1 px-3 uppercase tracking-wider">Reports</p>

            <Link to="/user/reports/weekly" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <FileBarChart2 size={16} /> Weekly Report
            </Link>

            <Link to="/user/reports/monthly" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <FileBarChart2 size={16} /> Monthly Report
            </Link>

            <Link to="/user/reports/download" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <Download size={16} /> Download
            </Link>

            <p className="text-[10px] text-white/40 mt-3 mb-1 px-3 uppercase tracking-wider">More</p>

            <Link to="/user/notifications" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <Bell size={16} /> Notifications
            </Link>

            <Link to="/user/chat" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <MessageCircle size={16} /> Doctor Chat
            </Link>

            <Link to="/user/health/history" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <ClipboardList size={16} /> Health History
            </Link>

            <Link to="/user/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-[13px]">
              <User size={16} /> Profile
            </Link>

          </nav>
        )}

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "0 16px" }} />

        {/* User box */}
        <div className="p-3">
          {!collapsed ? (
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-inner"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
              >
                {user.avatar || user.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[13px] font-semibold text-white truncate leading-tight">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 mt-0.5 w-fit transition-colors"
                  style={{ color: "rgba(252,165,165,0.8)", fontSize: "11px", fontWeight: 500 }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgb(252,165,165)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(252,165,165,0.8)")}
                >
                  <LogOut size={11} strokeWidth={2.5} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "rgba(252,165,165,0.8)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                e.currentTarget.style.color = "rgb(252,165,165)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                e.currentTarget.style.color = "rgba(252,165,165,0.8)";
              }}
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}