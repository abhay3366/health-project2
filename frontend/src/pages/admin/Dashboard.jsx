import { useState, useMemo } from "react";
import {
  LayoutDashboard, Users, Settings, UserCheck, Bell, TrendingUp,
  ChevronRight, ChevronLeft, LogOut, X, Plus, Search, Filter,
  MoreVertical, ArrowLeft, ShieldCheck, UserMinus, Trash2,
  ToggleLeft, ToggleRight, ArrowUpDown, Phone, MapPin, Award, Hash, Calendar
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = ["bg-orange-400","bg-pink-400","bg-lime-700","bg-green-500","bg-purple-500","bg-teal-500","bg-red-400","bg-yellow-500","bg-indigo-500","bg-rose-400"];
const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];
const PAGE_SIZE = 10;
const CENTERS = ["Punjabi Bagh","Rajouri Garden","Janakpuri","Dwarka","Rohini","Pitampura"];
const MEMBERSHIPS = ["Silver","Gold","Platinum","Diamond"];
const MEDICAL_CONDITIONS = ["Diabetes","High BP","Thyroid","Low BP"];
const MED_ICONS = { Diabetes:"🩸", "High BP":"❤️", Thyroid:"🦋", "Low BP":"💧" };

// Theme gradient as inline style helper
const GRADIENT = { background: "linear-gradient(135deg, #4c8f1f, #6fbf1d)" };
const GRADIENT_HOVER = { background: "linear-gradient(135deg, #3d7219, #5aa018)" };

// ─── Mock Data ────────────────────────────────────────────────────────────────
const growthData = [
  { month:"Jan", users:40 },{ month:"Feb", users:75 },{ month:"Mar", users:90 },
  { month:"Apr", users:110 },{ month:"May", users:160 },{ month:"Jun", users:175 },
  { month:"Jul", users:210 },{ month:"Aug", users:195 },{ month:"Sep", users:240 },{ month:"Oct", users:260 },
];

const seedUsers = [
  { id:1,  name:"Amit Verma",    email:"amit@ex.com",    role:"coach", isActive:true,  coach_id:null, joined:"Today",     color:"bg-orange-400", age:32, phone:"9876543210", center:"Punjabi Bagh",   membership:"Gold",     medicalHistory:[] },
  { id:2,  name:"Sneha Gupta",   email:"sneha@ex.com",   role:"coach", isActive:true,  coach_id:null, joined:"Yesterday", color:"bg-pink-400",   age:28, phone:"9988776655", center:"Rajouri Garden", membership:"Platinum", medicalHistory:["Thyroid"] },
  { id:3,  name:"Rahul Singh",   email:"rahul@ex.com",   role:"coach", isActive:false, coach_id:null, joined:"Yesterday", color:"bg-lime-700",   age:35, phone:"9871234560", center:"Dwarka",         membership:"Silver",   medicalHistory:["High BP"] },
  { id:4,  name:"Rajesh Kumar",  email:"rajesh@ex.com",  role:"user",  isActive:true,  coach_id:1,    joined:"Today",     color:"bg-lime-500",   age:40, phone:"9012345678", center:"Punjabi Bagh",   membership:"Gold",     medicalHistory:["Diabetes"] },
  { id:5,  name:"Anita Sharma",  email:"anita@ex.com",   role:"user",  isActive:true,  coach_id:2,    joined:"Yesterday", color:"bg-pink-500",   age:26, phone:"9123456780", center:"Rohini",         membership:"Silver",   medicalHistory:[] },
  { id:6,  name:"Vikram Patel",  email:"vikram@ex.com",  role:"user",  isActive:true,  coach_id:null, joined:"Yesterday", color:"bg-green-500",  age:33, phone:"9234567801", center:"Janakpuri",      membership:"Diamond",  medicalHistory:["Low BP"] },
  { id:7,  name:"Pooja Mehta",   email:"pooja@ex.com",   role:"user",  isActive:false, coach_id:1,    joined:"Apr 20",   color:"bg-purple-500", age:29, phone:"9345678012", center:"Pitampura",      membership:"Gold",     medicalHistory:[] },
  { id:8,  name:"Karan Joshi",   email:"karan@ex.com",   role:"user",  isActive:true,  coach_id:2,    joined:"Apr 18",   color:"bg-teal-500",   age:31, phone:"9456780123", center:"Dwarka",         membership:"Platinum", medicalHistory:["Diabetes","High BP"] },
  { id:9,  name:"Priya Nair",    email:"priya@ex.com",   role:"user",  isActive:true,  coach_id:1,    joined:"Apr 15",   color:"bg-rose-400",   age:27, phone:"9567801234", center:"Rajouri Garden", membership:"Silver",   medicalHistory:[] },
  { id:10, name:"Dev Malhotra",  email:"dev@ex.com",     role:"user",  isActive:false, coach_id:null, joined:"Apr 10",   color:"bg-indigo-500", age:38, phone:"9678012345", center:"Punjabi Bagh",   membership:"Gold",     medicalHistory:["Thyroid"] },
  { id:11, name:"Nisha Reddy",   email:"nisha@ex.com",   role:"user",  isActive:true,  coach_id:3,    joined:"Apr 8",    color:"bg-yellow-500", age:24, phone:"9780123456", center:"Rohini",         membership:"Diamond",  medicalHistory:[] },
  { id:12, name:"Arjun Kapoor",  email:"arjun@ex.com",   role:"coach", isActive:true,  coach_id:null, joined:"Apr 5",    color:"bg-green-400",  age:36, phone:"9801234567", center:"Janakpuri",      membership:"Platinum", medicalHistory:[] },
  { id:13, name:"Meera Singh",   email:"meera@ex.com",   role:"user",  isActive:true,  coach_id:12,   joined:"Apr 2",    color:"bg-orange-300", age:30, phone:"9812345678", center:"Pitampura",      membership:"Silver",   medicalHistory:["Low BP"] },
];

const recentActivity = [
  { user:"Amit Verma",   activity:"Updated Workout Plan", date:"Today",     color:"bg-orange-400" },
  { user:"Anita Sharma", activity:"Logged Water Intake",  date:"Yesterday", color:"bg-pink-500"   },
  { user:"Vikram Patel", activity:"Completed Session",    date:"Yesterday", color:"bg-green-500"  },
];

const formatDateTime = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Avatar({ name, color, size = "sm" }) {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "??";
  const s = { xs:"w-6 h-6 text-xs", sm:"w-8 h-8 text-xs", md:"w-10 h-10 text-sm", lg:"w-12 h-12 text-base" }[size];
  return (
    <div className={`${s} ${color||"bg-gray-400"} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

function RoleBadge({ role }) {
  const map = { coach:"bg-lime-100 text-lime-800", user:"bg-emerald-100 text-emerald-700", admin:"bg-purple-100 text-purple-700" };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[role]||"bg-gray-100 text-gray-600"}`}>{role.charAt(0).toUpperCase()+role.slice(1)}</span>;
}

function StatusPill({ active }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${active?"bg-green-100 text-green-600":"bg-red-100 text-red-500"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active?"bg-green-500":"bg-red-400"}`}/>{active?"Active":"Inactive"}
    </span>
  );
}

function MembershipBadge({ membership }) {
  const map = { Silver:"bg-slate-100 text-slate-600", Gold:"bg-yellow-100 text-yellow-700", Platinum:"bg-sky-100 text-sky-700", Diamond:"bg-purple-100 text-purple-700" };
  const icons = { Silver:"🥈", Gold:"🥇", Platinum:"💎", Diamond:"💠" };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[membership]||"bg-gray-100 text-gray-500"}`}>{icons[membership]||""} {membership||"—"}</span>;
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2">
      <span className="w-2 h-2 bg-green-400 rounded-full"/>{msg}
    </div>
  );
}

// ─── GradientButton ───────────────────────────────────────────────────────────
function GradientButton({ onClick, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      style={GRADIENT}
      onMouseEnter={e => Object.assign(e.currentTarget.style, GRADIENT_HOVER)}
      onMouseLeave={e => Object.assign(e.currentTarget.style, GRADIENT)}
      className={`flex items-center gap-2 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, type, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[92vh] flex flex-col overflow-hidden">
        <div style={GRADIENT} className="px-7 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-bold text-white text-lg tracking-tight">{title}</h3>
            <p className="text-white/60 text-xs mt-0.5">{type === "coach" ? "Add a new coach to the platform" : "Register a new member"}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
            <X size={15}/>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-7 py-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Form helpers ─────────────────────────────────────────────────────────────
function FLabel({ children }) {
  return <label className="block text-xs font-semibold text-gray-800 mb-1.5 uppercase tracking-wide">{children}</label>;
}

function FReadonly({ label, value, icon }) {
  return (
    <div>
      <FLabel>{label}</FLabel>
      <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-600">
        {icon && <span className="text-gray-300 flex-shrink-0">{icon}</span>}
        <span className="font-mono text-xs">{value}</span>
      </div>
    </div>
  );
}

function FInput({ label, icon, ...props }) {
  return (
    <div>
      <FLabel>{label}</FLabel>
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 flex-shrink-0">{icon}</span>}
        <input {...props} className={`w-full border border-gray-200 rounded-xl ${icon?"pl-9":"pl-3.5"} pr-3.5 py-2.5 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:border-[#6fbf1d] transition-all placeholder-gray-300`}
          style={{ "--tw-ring-color": "#6fbf1d44" }}/>
      </div>
    </div>
  );
}

function FSelect({ label, icon, children, ...props }) {
  return (
    <div>
      <FLabel>{label}</FLabel>
      <div className="relative">
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex-shrink-0">{icon}</span>}
        <select {...props} className={`w-full border border-gray-200 rounded-xl ${icon?"pl-9":"pl-3.5"} pr-3.5 py-2.5 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:border-[#6fbf1d] transition-all appearance-none`}>
          {children}
        </select>
      </div>
    </div>
  );
}

function FSectionDivider({ children }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-100"/>
      <span className="text-[11px] font-bold text-green-700 uppercase tracking-widest">{children}</span>
      <div className="flex-1 h-px bg-gray-100"/>
    </div>
  );
}

// ─── Registration Form ────────────────────────────────────────────────────────
function RegistrationForm({ form, setForm, modal, coaches, loading, onSubmit, onClose }) {
  const toggle = cond => setForm(f => ({
    ...f,
    medicalHistory: f.medicalHistory.includes(cond)
      ? f.medicalHistory.filter(c => c !== cond)
      : [...f.medicalHistory, cond]
  }));

  return (
    <form onSubmit={onSubmit}>
      <FSectionDivider>Basic Info</FSectionDivider>
      <div className="grid grid-cols-2 gap-3">
        <FReadonly label="Auto Generated ID" value={form.autoId} icon={<Hash size={13}/>}/>
        <FInput label="DOB" type="date"       value={form.dateTime} icon={<Calendar size={13}/>}/>
        <FInput label="Full Name" type="text"   placeholder="e.g. Rahul Sharma" value={form.name}  onChange={e=>setForm({...form,name:e.target.value})} required/>
        <FInput label="Age"       type="number" placeholder="e.g. 35" min="1" max="120" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} required/>
      </div>

      <FSectionDivider>Contact & Account</FSectionDivider>
      <div className="grid grid-cols-2 gap-3">
        <FInput label="Phone" type="tel" placeholder="9876543210" icon={<Phone size={13}/>} value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required/>
        <FInput label="Email" type="email" placeholder="john@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/>
        <FInput label="Password" type="password" placeholder="Set a password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>
        {modal==="user" && coaches.length>0 && (
          <FSelect label="Assign Coach (optional)" value={form.coach_id} onChange={e=>setForm({...form,coach_id:e.target.value})}>
            <option value="">— No Coach —</option>
            {coaches.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </FSelect>
        )}
      </div>

      <FSectionDivider>Center & Membership</FSectionDivider>
      <div className="grid grid-cols-2 gap-3">
        <FSelect label="Center" icon={<MapPin size={13}/>} value={form.center} onChange={e=>setForm({...form,center:e.target.value})} required>
          <option value="">— Select Center —</option>
          {CENTERS.map(c=><option key={c} value={c}>{c}</option>)}
        </FSelect>
        <FSelect label="Membership Plan" icon={<Award size={13}/>} value={form.membership} onChange={e=>setForm({...form,membership:e.target.value})} required>
          <option value="">— Select Plan —</option>
          {MEMBERSHIPS.map(m=><option key={m} value={m}>{m}</option>)}
        </FSelect>
      </div>

      <FSectionDivider>Medical History</FSectionDivider>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {MEDICAL_CONDITIONS.map(cond => {
          const on = form.medicalHistory.includes(cond);
          return (
            <button key={cond} type="button" onClick={()=>toggle(cond)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left cursor-pointer select-none ${
                on ? "border-[#6fbf1d] bg-green-50 text-[#4c8f1f] shadow-sm"
                   : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-gray-100"
              }`}>
              <span className="text-base">{MED_ICONS[cond]}</span>
              <span className="text-sm font-medium">{cond}</span>
              <div className={`ml-auto w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${on?"border-[#6fbf1d]":"border-gray-300"}`}
                style={on ? { background: "linear-gradient(135deg, #4c8f1f, #6fbf1d)" } : {}}>
                {on && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          style={loading ? {} : GRADIENT}
          className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 shadow-lg">
          {loading
            ? <span className="flex items-center justify-center gap-2 bg-gray-300 rounded-xl py-0 -my-0"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</span>
            : "Save Registration"}
        </button>
        <button type="button" onClick={onClose}
          className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Full Data Table ──────────────────────────────────────────────────────────
function FullDataTable({ data, columns, searchKeys, filterOptions, filterKey, emptyMsg, actions }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage]     = useState(1);
  const [openMenu, setOpenMenu] = useState(null);

  const filtered = useMemo(() => {
    let d = data;
    if (filter !== "all" && filterKey) d = d.filter(r => String(r[filterKey]) === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      d = d.filter(r => searchKeys.some(k => String(r[k]||"").toLowerCase().includes(q)));
    }
    return d;
  }, [data, search, filter]);

  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none transition-all"/>
        </div>
        {filterOptions && (
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <Filter size={12} className="text-gray-400"/>
            <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
              className="text-xs text-gray-600 bg-transparent focus:outline-none cursor-pointer font-medium">
              <option value="all">All</option>
              {filterOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}
        <span className="ml-auto text-xs text-gray-400 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl font-medium">
          {filtered.length} results
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">
                  <div className="flex items-center gap-1">{col.label}{col.sortable && <ArrowUpDown size={10} className="text-gray-300"/>}</div>
                </th>
              ))}
              {actions && <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length+(actions?1:0)} className="text-center py-14">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><Search size={16} className="text-gray-300"/></div>
                  <p className="text-sm text-gray-400">{search?"No results found":emptyMsg}</p>
                  {search && <button onClick={() => setSearch("")} className="text-xs hover:underline" style={{ color:"#4c8f1f" }}>Clear search</button>}
                </div>
              </td></tr>
            ) : paged.map((row, idx) => (
              <tr key={row.id} className={`border-b border-gray-50 transition-colors ${idx%2===0?"hover:bg-[#f4fce8]":"bg-gray-50/20 hover:bg-[#f4fce8]"}`}>
                {columns.map(col => (
                  <td key={col.key} className="px-5 py-3 text-sm text-gray-600">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-5 py-3">
                    <div className="relative">
                      <button onClick={() => setOpenMenu(openMenu===row.id?null:row.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        <MoreVertical size={15}/>
                      </button>
                      {openMenu===row.id && (
                        <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[160px]">
                          {actions(row).map(a => (
                            <button key={a.label} onClick={() => { a.onClick(row); setOpenMenu(null); }}
                              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors hover:bg-gray-50 ${a.danger?"text-red-500":"text-gray-700"}`}>
                              {a.icon}{a.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {(() => {
        const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
        if (totalPages <= 1) return null;
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        const visible = pages.filter(p => p===1 || p===totalPages || Math.abs(p-page)<=1);
        return (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-400">
              Showing {Math.min((page-1)*PAGE_SIZE+1,filtered.length)}–{Math.min(page*PAGE_SIZE,filtered.length)} of <span className="font-semibold text-gray-600">{filtered.length}</span>
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(page-1)} disabled={page===1} className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30 transition-colors border border-transparent hover:border-gray-200"><ChevronLeft size={14}/></button>
              {visible.map((p, i, arr) => (
                <span key={p}>
                  {i > 0 && arr[i-1] !== p-1 && <span className="text-gray-300 text-xs px-1">…</span>}
                  <button onClick={() => setPage(p)}
                    style={p===page ? GRADIENT : {}}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${p===page?"text-white shadow-sm":"text-gray-500 hover:bg-white hover:text-gray-800 border border-transparent hover:border-gray-200"}`}>
                    {p}
                  </button>
                </span>
              ))}
              <button onClick={() => setPage(page+1)} disabled={page===totalPages} className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-gray-700 disabled:opacity-30 transition-colors border border-transparent hover:border-gray-200"><ChevronRight size={14}/></button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── COACHES PAGE ─────────────────────────────────────────────────────────────
function CoachesPage({ allUsers, setAllUsers, showToast, openModal, goBack }) {
  const coaches  = allUsers.filter(u => u.role === "coach");
  const userList = allUsers.filter(u => u.role === "user");

  const handleDemote = u => { if (!window.confirm(`Demote ${u.name}?`)) return; setAllUsers(p => p.map(x => x.id===u.id?{...x,role:"user"}:x)); showToast(`${u.name} demoted`); };
  const handleDelete = u => { if (!window.confirm(`Delete ${u.name}?`)) return; setAllUsers(p => p.filter(x => x.id!==u.id)); showToast(`${u.name} deleted`); };
  const handleToggle = u => { setAllUsers(p => p.map(x => x.id===u.id?{...x,isActive:!x.isActive}:x)); showToast(`${u.name} ${u.isActive?"deactivated":"activated"}`); };

  const cols = [
    { key:"name", label:"Coach", sortable:true, render: r => (
      <div className="flex items-center gap-3"><Avatar name={r.name} color={r.color} size="md"/>
        <div><p className="font-semibold text-gray-800">{r.name}</p><p className="text-xs text-gray-400">{r.email}</p></div>
      </div>
    )},
    { key:"role",       label:"Role",       render: r => <RoleBadge role={r.role}/> },
    { key:"isActive",   label:"Status",     render: r => <StatusPill active={r.isActive}/> },
    { key:"center",     label:"Center",     render: r => <span className="text-xs text-gray-600">{r.center||"—"}</span> },
    { key:"membership", label:"Membership", render: r => <MembershipBadge membership={r.membership}/> },
    { key:"users",      label:"Users",      render: r => { const cnt=userList.filter(u=>u.coach_id===r.id).length; return <span className="font-semibold" style={{ color:"#4c8f1f" }}>{cnt} <span className="text-gray-400 font-normal">users</span></span>; }},
    { key:"joined",     label:"Joined",     sortable:true },
  ];
  const actions = u => [
    { label: u.isActive?"Deactivate":"Activate", icon: u.isActive?<ToggleLeft size={13}/>:<ToggleRight size={13}/>, onClick: handleToggle },
    { label:"Demote to User", icon:<UserMinus size={13}/>, onClick: handleDemote },
    { label:"Delete",         icon:<Trash2 size={13}/>,    onClick: handleDelete, danger:true },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header style={GRADIENT} className="px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="flex items-center gap-1.5 text-white/80 hover:bg-white/20 px-3 py-2 rounded-xl transition-colors text-sm font-medium">
            <ArrowLeft size={15}/> Back
          </button>
          <div className="w-px h-5 bg-white/30"/>
          <div>
            <h1 className="text-lg font-bold text-white">All Coaches</h1>
            <p className="text-xs text-white/70">{coaches.length} coaches registered</p>
          </div>
        </div>
        <GradientButton onClick={() => openModal("coach")} className="bg-white/20 hover:bg-white/30" style={{}}>
          <Plus size={13}/> Create Coach
        </GradientButton>
      </header>
      <div className="flex-1 overflow-y-auto p-5">
        <FullDataTable data={coaches} columns={cols} searchKeys={["name","email"]}
          filterOptions={[{value:"true",label:"Active"},{value:"false",label:"Inactive"}]}
          filterKey="isActive" emptyMsg="No coaches yet" actions={actions}/>
      </div>
    </div>
  );
}

// ─── USERS PAGE ───────────────────────────────────────────────────────────────
function UsersPage({ allUsers, setAllUsers, showToast, openModal, goBack }) {
  const coaches  = allUsers.filter(u => u.role === "coach");
  const userList = allUsers.filter(u => u.role === "user");

  const handlePromote = u => { if (!window.confirm(`Promote ${u.name}?`)) return; setAllUsers(p => p.map(x => x.id===u.id?{...x,role:"coach",coach_id:null}:x)); showToast(`${u.name} promoted! 🎉`); };
  const handleDelete  = u => { if (!window.confirm(`Delete ${u.name}?`)) return; setAllUsers(p => p.filter(x => x.id!==u.id)); showToast(`${u.name} deleted`); };

  const cols = [
    { key:"name", label:"User", sortable:true, render: r => (
      <div className="flex items-center gap-3"><Avatar name={r.name} color={r.color} size="md"/>
        <div><p className="font-semibold text-gray-800">{r.name}</p><p className="text-xs text-gray-400">{r.email}</p></div>
      </div>
    )},
    { key:"role",       label:"Role",       render: r => <RoleBadge role={r.role}/> },
    { key:"isActive",   label:"Status",     render: r => <StatusPill active={r.isActive}/> },
    { key:"center",     label:"Center",     render: r => <span className="text-xs text-gray-600">{r.center||"—"}</span> },
    { key:"membership", label:"Membership", render: r => <MembershipBadge membership={r.membership}/> },
    { key:"coach_id",   label:"Coach",      render: r => { const c=coaches.find(x=>x.id===r.coach_id); return c?<div className="flex items-center gap-1.5"><Avatar name={c.name} color={c.color} size="xs"/><span className="text-xs font-semibold" style={{ color:"#4c8f1f" }}>{c.name}</span></div>:<span className="text-gray-300 text-xs">Unassigned</span>; }},
    { key:"joined",     label:"Joined",     sortable:true },
  ];
  const actions = u => [
    { label:"Promote to Coach", icon:<ShieldCheck size={13}/>, onClick: handlePromote },
    { label:"Delete",           icon:<Trash2 size={13}/>,      onClick: handleDelete, danger:true },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header style={GRADIENT} className="px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="flex items-center gap-1.5 text-white/80 hover:bg-white/20 px-3 py-2 rounded-xl transition-colors text-sm font-medium">
            <ArrowLeft size={15}/> Back
          </button>
          <div className="w-px h-5 bg-white/30"/>
          <div>
            <h1 className="text-lg font-bold text-white">All Users</h1>
            <p className="text-xs text-white/70">{userList.length} users registered</p>
          </div>
        </div>
        <button
          onClick={() => openModal("user")}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95"
        >
          <Plus size={13}/> Create User
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-5">
        <FullDataTable data={userList} columns={cols} searchKeys={["name","email"]}
          filterOptions={coaches.map(c => ({ value:String(c.id), label:c.name }))}
          filterKey="coach_id" emptyMsg="No users yet" actions={actions}/>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({ allUsers, setAllUsers, showToast, openModal, navigate }) {
  const coaches  = allUsers.filter(u => u.role === "coach");
  const userList = allUsers.filter(u => u.role === "user");
  const latestCoaches = [...coaches].reverse().slice(0, 10);
  const latestUsers   = [...userList].reverse().slice(0, 10);

  const handleDemote  = u => { if (!window.confirm(`Demote ${u.name}?`)) return; setAllUsers(p => p.map(x => x.id===u.id?{...x,role:"user"}:x)); showToast(`${u.name} demoted`); };
  const handleDelete  = u => { if (!window.confirm(`Delete ${u.name}?`)) return; setAllUsers(p => p.filter(x => x.id!==u.id)); showToast(`${u.name} deleted`); };
  const handleToggle  = u => { setAllUsers(p => p.map(x => x.id===u.id?{...x,isActive:!x.isActive}:x)); showToast(`${u.name} ${u.isActive?"deactivated":"activated"}`); };
  const handlePromote = u => { if (!window.confirm(`Promote ${u.name}?`)) return; setAllUsers(p => p.map(x => x.id===u.id?{...x,role:"coach",coach_id:null}:x)); showToast(`${u.name} promoted! 🎉`); };

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"Total Coaches", value:coaches.length,  icon:"🏋️", bg:"bg-lime-50"  },
          { label:"Total Users",   value:userList.length, icon:"👤", bg:"bg-sky-50"   },
          { label:"Active Users",  value:allUsers.filter(u=>u.isActive).length, icon:"🟢", bg:"bg-green-50", trend:`▲ ${allUsers.filter(u=>u.joined==="Today"&&u.isActive).length} Today` },
          { label:"New Signups",   value:allUsers.filter(u=>u.joined==="Today").length, icon:"✨", bg:"bg-lime-50", trend:"▲ 2 This Week" },
        ].map(({ label, value, icon, bg, trend }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
                <p className="text-3xl font-black text-gray-800 mt-1 tracking-tight">{value}</p>
                {trend && <p className="text-xs text-green-500 font-semibold mt-1">{trend}</p>}
              </div>
              <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center text-lg`}>{icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Top Coaches */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div><h2 className="text-sm font-bold text-gray-800">User Growth</h2><p className="text-xs text-gray-400 mt-0.5">Platform member trend</p></div>
            <select className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 text-gray-600 bg-gray-50 focus:outline-none">
              <option>Monthly</option><option>Weekly</option><option>Yearly</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={growthData} margin={{ top:5, right:5, left:-25, bottom:0 }}>
              <defs>
                <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4c8f1f" stopOpacity={0.28}/>
                  <stop offset="95%" stopColor="#6fbf1d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius:"12px", border:"none", boxShadow:"0 4px 20px rgba(0,0,0,0.1)", fontSize:"11px" }}/>
              <Area type="monotone" dataKey="users" stroke="#4c8f1f" strokeWidth={2.5} fill="url(#ug)"
                dot={{ fill:"#6fbf1d", r:3, strokeWidth:2, stroke:"#fff" }} activeDot={{ r:5 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-800">Top Coaches</h2>
            <button onClick={() => openModal("coach")} className="text-xs font-semibold flex items-center gap-1" style={{ color:"#4c8f1f" }}><Plus size={11}/> Add</button>
          </div>
          <div className="space-y-2.5">
            {coaches.slice(0,4).map((c, i) => {
              const cnt = userList.filter(u => u.coach_id===c.id).length;
              const max = Math.max(...coaches.map(x => userList.filter(u => u.coach_id===x.id).length), 1);
              return (
                <div key={c.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                  <span className="text-xs text-gray-300 font-bold w-4 text-center">{i+1}</span>
                  <Avatar name={c.name} color={c.color}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-gray-800 truncate">{c.name}</p>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{cnt}</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${(cnt/max)*100}%`, background:"linear-gradient(90deg, #4c8f1f, #6fbf1d)" }}/>
                    </div>
                  </div>
                </div>
              );
            })}
            {coaches.length===0 && <p className="text-xs text-gray-300 text-center py-6">No coaches yet</p>}
          </div>
        </div>
      </div>

      {/* Recent Signups + Activity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-800">Recent Signups</h2>
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg">Last 4</span>
          </div>
          <div className="space-y-2">
            {allUsers.slice(-4).reverse().map(u => (
              <div key={u.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <Avatar name={u.name} color={u.color}/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.joined}</p>
                </div>
                <RoleBadge role={u.role}/>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {recentActivity.map(a => (
              <div key={a.user+a.activity} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <Avatar name={a.user} color={a.color}/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{a.user}</p>
                  <p className="text-xs text-gray-400 truncate">{a.activity}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{a.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Coaches */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-700">🏋️ Coaches <span className="text-gray-400 font-normal ml-1">(latest {latestCoaches.length})</span></h2>
          <button onClick={() => navigate("coaches")} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors border"
            style={{ color:"#4c8f1f", borderColor:"#b3df7a", background:"#f4fce8" }}>
            View All {coaches.length} Coaches <ChevronRight size={13}/>
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>{["Coach","Role","Status","Center","Plan","Joined","Actions"].map(h=>(
                <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {latestCoaches.length === 0
                ? <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No coaches yet</td></tr>
                : latestCoaches.map((u, idx) => (
                  <tr key={u.id} className={`border-b border-gray-50 transition-colors ${idx%2===0?"hover:bg-[#f4fce8]":"bg-gray-50/20 hover:bg-[#f4fce8]"}`}>
                    <td className="px-5 py-3"><div className="flex items-center gap-2.5"><Avatar name={u.name} color={u.color}/><div><p className="font-semibold text-gray-800 text-sm">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div></div></td>
                    <td className="px-5 py-3"><RoleBadge role={u.role}/></td>
                    <td className="px-5 py-3"><StatusPill active={u.isActive}/></td>
                    <td className="px-5 py-3 text-xs text-gray-600">{u.center||"—"}</td>
                    <td className="px-5 py-3"><MembershipBadge membership={u.membership}/></td>
                    <td className="px-5 py-3 text-sm text-gray-500">{u.joined}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={()=>handleToggle(u)} className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors font-medium">{u.isActive?"Deactivate":"Activate"}</button>
                        <button onClick={()=>handleDemote(u)} className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors font-medium">↓ Demote</button>
                        <button onClick={()=>handleDelete(u)} className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-colors font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest Users */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-700">🧑 Users <span className="text-gray-400 font-normal ml-1">(latest {latestUsers.length})</span></h2>
          <button onClick={() => navigate("users")} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors border"
            style={{ color:"#4c8f1f", borderColor:"#b3df7a", background:"#f4fce8" }}>
            View All {userList.length} Users <ChevronRight size={13}/>
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>{["User","Role","Coach","Center","Plan","Joined","Actions"].map(h=>(
                <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {latestUsers.length === 0
                ? <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No users yet</td></tr>
                : latestUsers.map((u, idx) => {
                  const coach = allUsers.find(c => c.id===u.coach_id && c.role==="coach");
                  return (
                    <tr key={u.id} className={`border-b border-gray-50 transition-colors ${idx%2===0?"hover:bg-[#f4fce8]":"bg-gray-50/20 hover:bg-[#f4fce8]"}`}>
                      <td className="px-5 py-3"><div className="flex items-center gap-2.5"><Avatar name={u.name} color={u.color}/><div><p className="font-semibold text-gray-800 text-sm">{u.name}</p><p className="text-xs text-gray-400">{u.email}</p></div></div></td>
                      <td className="px-5 py-3"><RoleBadge role={u.role}/></td>
                      <td className="px-5 py-3">{coach?<div className="flex items-center gap-1.5"><Avatar name={coach.name} color={coach.color} size="xs"/><span className="text-xs font-semibold" style={{ color:"#4c8f1f" }}>{coach.name}</span></div>:<span className="text-gray-300 text-xs">Unassigned</span>}</td>
                      <td className="px-5 py-3 text-xs text-gray-600">{u.center||"—"}</td>
                      <td className="px-5 py-3"><MembershipBadge membership={u.membership}/></td>
                      <td className="px-5 py-3 text-sm text-gray-500">{u.joined}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={()=>handlePromote(u)} className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors font-medium"
                            style={{ background:"#f4fce8", color:"#4c8f1f", borderColor:"#b3df7a" }}>⬆ Promote</button>
                          <button onClick={()=>handleDelete(u)} className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 transition-colors font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function AdminApp() {
  const [page, setPage]         = useState("dashboard");
  const [allUsers, setAllUsers] = useState(seedUsers);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState({});
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState("");
  const [nextId, setNextId]     = useState(seedUsers.length + 1);

  const coaches = allUsers.filter(u => u.role === "coach");

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const openModal = type => {
    setForm({ autoId: String(nextId + 10000), dateTime: formatDateTime(), name:"", email:"", password:"", age:"", phone:"", coach_id:"", center:"", membership:"", medicalHistory:[] });
    setModal(type);
  };

  const handleCreate = e => {
    e.preventDefault(); setLoading(true);
    setTimeout(() => {
      setAllUsers(prev => [...prev, {
        id: nextId, name: form.name, email: form.email, role: modal, isActive: true,
        coach_id: modal==="user" ? (form.coach_id ? Number(form.coach_id) : null) : null,
        joined: "Today", color: randomColor(),
        age: form.age, phone: form.phone, center: form.center,
        membership: form.membership, medicalHistory: form.medicalHistory,
      }]);
      setNextId(n => n+1); setModal(null); setLoading(false);
      showToast(`${modal==="coach"?"Coach":"User"} registered! 🎉`);
    }, 500);
  };

  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{ background:"#f7fef0" }}>
      <Toast msg={toast}/>

      {page === "dashboard" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <header style={GRADIENT} className="px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-md">
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">AWC by SR — Wellness Portal</h1>
              <p className="text-xs text-white/70">Full platform control · {allUsers.length} total members</p>
            </div>
          
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => openModal("coach")}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95"
              >
                <Plus size={13}/> Create Coach
              </button>
              <button
                onClick={() => openModal("user")}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95"
              >
                <Plus size={13}/> Create User
              </button>
              <button className="relative p-2 text-white/80 hover:bg-white/20 rounded-xl transition-colors">
                <Bell size={17}/>
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-400 rounded-full"/>
              </button>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs border border-white/30" style={{ background:"rgba(255,255,255,0.2)" }}>AD</div>
            </div>
          </header>
          <DashboardPage allUsers={allUsers} setAllUsers={setAllUsers} showToast={showToast} openModal={openModal} navigate={setPage}/>
        </div>
      )}

      {page === "coaches" && <CoachesPage allUsers={allUsers} setAllUsers={setAllUsers} showToast={showToast} openModal={openModal} goBack={() => setPage("dashboard")}/>}
      {page === "users"   && <UsersPage   allUsers={allUsers} setAllUsers={setAllUsers} showToast={showToast} openModal={openModal} goBack={() => setPage("dashboard")}/>}

      {modal && (
        <Modal title={modal==="coach"?"🏋️ Coach Registration":"🧑 User Registration"} type={modal} onClose={() => setModal(null)}>
          <RegistrationForm form={form} setForm={setForm} modal={modal} coaches={coaches} loading={loading} onSubmit={handleCreate} onClose={() => setModal(null)}/>
        </Modal>
      )}
    </div>
  );
}