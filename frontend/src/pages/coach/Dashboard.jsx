import { useState } from "react";

const mockUser = { id: "coach_1", name: "Alex Rivera" };
const initUsers = [
  { id: "1", name: "Jordan Lee", email: "jordan@example.com", role: "user", isActive: true, createdAt: "2024-11-01" },
  { id: "2", name: "Sam Chen", email: "sam@example.com", role: "user", isActive: true, createdAt: "2024-12-15" },
  { id: "3", name: "Morgan Blake", email: "morgan@example.com", role: "user", isActive: false, createdAt: "2025-01-20" },
  { id: "4", name: "Casey Park", email: "casey@example.com", role: "user", isActive: true, createdAt: "2025-02-10" },
];

const AVATARS = ["🌿","🍃","🌱","🌾","🍀","🌲","🌳","🌵"];
function getAvatar(name) { return AVATARS[name.charCodeAt(0) % AVATARS.length]; }
function getHue(name) { return 100 + (name.charCodeAt(0) * 13) % 60; }

function useForm(defaults) {
  const [v, setV] = useState(defaults);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const reg = (k) => ({ value: v[k] || "", onChange: (e) => setV(x => ({ ...x, [k]: e.target.value })) });
  const validate = () => {
    const e = {};
    if (!v.name || v.name.length < 2) e.name = "Min 2 characters";
    if (!v.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = "Valid email required";
    if (!v.password || v.password.length < 4) e.password = "Min 4 characters";
    return e;
  };
  const submit = (fn) => async (e) => {
    e.preventDefault();
    const e2 = validate(); setErrs(e2);
    if (Object.keys(e2).length) return;
    setBusy(true); await fn(v); setBusy(false);
  };
  const reset = () => { setV(defaults); setErrs({}); };
  return { reg, submit, reset, errs, busy };
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position:"fixed",top:20,right:20,zIndex:9999,
      background:"linear-gradient(135deg,#16a34a,#22c55e)",
      color:"#fff",borderRadius:14,padding:"13px 22px",
      fontSize:13,fontWeight:700,
      boxShadow:"0 8px 32px rgba(22,163,74,0.35)",
      display:"flex",alignItems:"center",gap:8,
      animation:"toastIn 0.35s cubic-bezier(.34,1.56,.64,1)",
    }}>
      ✓ {msg}
    </div>
  );
}

function StatCard({ label, value, icon, color, delay }) {
  return (
    <div style={{
      background:"#fff",borderRadius:20,padding:"24px 22px",
      border:`1.5px solid ${color}33`,
      boxShadow:`0 4px 28px ${color}15`,
      animation:`cardIn 0.5s ease ${delay}s both`,
      position:"relative",overflow:"hidden",
    }}>
      <div style={{
        position:"absolute",top:-18,right:-18,
        width:72,height:72,borderRadius:"50%",
        background:`${color}18`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:28,
      }}>{icon}</div>
      <div style={{ fontSize:38,fontWeight:900,color,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:11,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.08em",marginTop:6 }}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const user = mockUser;
  const [users, setUsers] = useState(initUsers);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");
  const [nid, setNid] = useState(50);
  const form = useForm({ name:"", email:"", password:"" });

  const fire = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };
  const openModal = () => { form.reset(); setModal(true); };

  const onAdd = async (d) => {
    await new Promise(r => setTimeout(r, 500));
    setUsers(u => [...u, { id: String(nid), name:d.name, email:d.email, role:"user", isActive:true, createdAt:new Date().toISOString() }]);
    setNid(n => n+1); setModal(false);
    fire(`${d.name} joined your team!`);
  };

  const onRemove = (u) => {
    if (!window.confirm(`Remove ${u.name}?`)) return;
    setUsers(us => us.filter(x => x.id !== u.id));
    fire(`${u.name} removed`);
  };

  const active = users.filter(u => u.isActive).length;

  return (
    <>
      <style>{`
       
      

        @keyframes toastIn { from { opacity:0; transform:translateX(30px) scale(0.9) } to { opacity:1; transform:translateX(0) scale(1) } }
        @keyframes cardIn { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeSlide { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes overlayIn { from { opacity:0 } to { opacity:1 } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.94) translateY(20px) } to { opacity:1; transform:scale(1) translateY(0) } }
        @keyframes rowIn { from { opacity:0; transform:translateX(-8px) } to { opacity:1; transform:translateX(0) } }

        .action-btn { transition: all 0.18s; }
        .action-btn:hover { transform: translateY(-1px); filter: brightness(1.08); }
        .row-hover:hover td { background: #f0fdf4 !important; }

        .nav-pill { transition: all 0.2s; }
        .nav-pill:hover { background: #dcfce7 !important; }

        input:focus { outline: none; border-color: #22c55e !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.15) !important; }
      `}</style>

      <Toast msg={toast} />

      <div style={{ minHeight:"100vh", background:"linear-gradient(150deg,#f0fdf4 0%,#ecfdf5 40%,#f7fef9 100%)" }}>

        {/* Top Nav */}
        <nav style={{
          background:"rgba(255,255,255,0.85)",backdropFilter:"blur(12px)",
          borderBottom:"1.5px solid #dcfce7",
          padding:"0 36px",height:64,
          display:"flex",alignItems:"center",justifyContent:"space-between",
          position:"sticky",top:0,zIndex:100,
        }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#16a34a,#4ade80)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🌿</div>
            <span style={{ fontWeight:800,fontSize:20,color:"#14532d",letterSpacing:"-0.3px" }}>CoachFlow</span>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#bbf7d0,#86efac)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#15803d" }}>
              {user.name[0]}
            </div>
            <div>
              <div style={{ fontSize:13,fontWeight:700,color:"#14532d" }}>{user.name}</div>
              <div style={{ fontSize:10,color:"#6b7280",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em" }}>Head Coach</div>
            </div>
          </div>
        </nav>

        <div style={{margin:"0 auto",padding:"36px 24px" }}>

          {/* Page Header */}
          <div style={{ marginBottom:32,animation:"fadeSlide 0.4s ease" }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}>
              <span style={{ fontSize:11,fontWeight:700,color:"#16a34a",textTransform:"uppercase",letterSpacing:"0.1em",background:"#dcfce7",padding:"3px 10px",borderRadius:20 }}>Dashboard</span>
            </div>
            <h1 style={{ fontWeight:900,fontSize:34,color:"#14532d",letterSpacing:"-0.5px",lineHeight:1.1 }}>
              Your Training Hub
            </h1>
            <p style={{ color:"#6b7280",fontSize:14,marginTop:6,fontWeight:500 }}>
              Manage your athletes and track team performance
            </p>
          </div>

          {/* Stats */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:32 }}>
            <StatCard label="Total Athletes" value={users.length} icon="👥" color="#16a34a" delay={0} />
            <StatCard label="Active Now" value={active} icon="⚡" color="#0d9488" delay={0.08} />
            <StatCard label="On Break" value={users.length - active} icon="🌙" color="#d97706" delay={0.16} />
          </div>

          {/* Scoped Notice */}
          <div style={{
            background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",
            border:"1.5px solid #86efac",borderRadius:16,
            padding:"14px 18px",marginBottom:28,
            display:"flex",gap:12,alignItems:"center",
            animation:"fadeSlide 0.5s ease 0.2s both",
          }}>
            <div style={{ width:36,height:36,borderRadius:10,background:"#bbf7d0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>🔒</div>
            <div>
              <div style={{ fontSize:13,fontWeight:700,color:"#15803d" }}>Scoped to your team</div>
              <div style={{ fontSize:12,color:"#4b7a56",marginTop:2 }}>You only see athletes assigned to you. New users are auto-added to your roster.</div>
            </div>
          </div>

          {/* Table Card */}
          <div style={{
            background:"#fff",borderRadius:22,
            border:"1.5px solid #dcfce7",
            boxShadow:"0 8px 40px rgba(22,163,74,0.08)",
            overflow:"hidden",
            animation:"fadeSlide 0.5s ease 0.25s both",
          }}>

            {/* Table Header */}
            <div style={{ padding:"20px 24px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1.5px solid #f0fdf4" }}>
              <div>
                <h2 style={{ fontSize:18,fontWeight:800,color:"#14532d" }}>
                  My Roster
                  <span style={{ marginLeft:10,background:"#dcfce7",color:"#15803d",fontSize:12,fontWeight:700,padding:"2px 10px",borderRadius:20 }}>
                    {users.length}
                  </span>
                </h2>
                <p style={{ fontSize:12,color:"#9ca3af",fontWeight:500,marginTop:2 }}>All athletes currently under your coaching</p>
              </div>
              <button
                onClick={openModal}
                className="action-btn"
                style={{
                  background:"linear-gradient(135deg,#16a34a,#22c55e)",
                  color:"#fff",border:"none",borderRadius:12,
                  padding:"10px 20px",fontSize:13,fontWeight:700,
                  cursor:"pointer",display:"flex",alignItems:"center",gap:6,
                  boxShadow:"0 4px 16px rgba(22,163,74,0.3)",
                }}
              >
                <span style={{ fontSize:16 }}>+</span> Add Athlete
              </button>
            </div>

            <table style={{ width:"100%",borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#f9fefb" }}>
                  {["Athlete","Email","Role","Status","Action"].map(h => (
                    <th key={h} style={{ padding:"11px 20px",textAlign:"left",fontSize:10,fontWeight:800,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.09em",borderBottom:"1.5px solid #f0fdf4" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign:"center",padding:"60px 20px" }}>
                      <div style={{ fontSize:40,marginBottom:10 }}>🌱</div>
                      <div style={{ color:"#9ca3af",fontSize:14,fontWeight:500 }}>No athletes yet — add your first one!</div>
                    </td>
                  </tr>
                ) : users.map((u, i) => {
                  const hue = getHue(u.name);
                  return (
                    <tr key={u.id} className="row-hover" style={{ borderBottom: i < users.length-1 ? "1px solid #f0fdf4" : "none", animation:`rowIn 0.3s ease ${i*0.06}s both` }}>
                      <td style={{ padding:"14px 20px" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:11 }}>
                          <div style={{
                            width:38,height:38,borderRadius:12,flexShrink:0,
                            background:`hsl(${hue},60%,88%)`,
                            border:`1.5px solid hsl(${hue},50%,75%)`,
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:17,
                          }}>
                            {getAvatar(u.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight:700,color:"#111827",fontSize:14 }}>{u.name}</div>
                            <div style={{ fontSize:11,color:"#9ca3af",fontWeight:500,marginTop:1 }}>
                              Since {new Date(u.createdAt).toLocaleDateString("en",{month:"short",year:"numeric"})}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"14px 20px",fontSize:13,color:"#6b7280",fontWeight:500 }}>{u.email}</td>
                      <td style={{ padding:"14px 20px" }}>
                        <span style={{ background:"#f0fdf4",color:"#15803d",border:"1px solid #bbf7d0",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em" }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding:"14px 20px" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                          <div style={{ width:7,height:7,borderRadius:"50%",background:u.isActive?"#22c55e":"#d1d5db",boxShadow:u.isActive?"0 0 6px #22c55e":undefined }} />
                          <span style={{ fontSize:12,fontWeight:600,color:u.isActive?"#15803d":"#9ca3af" }}>
                            {u.isActive?"Active":"Inactive"}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding:"14px 20px" }}>
                        <button
                          onClick={() => onRemove(u)}
                          className="action-btn"
                          style={{
                            background:"#fff0f0",color:"#dc2626",border:"1.5px solid #fecaca",
                            borderRadius:9,padding:"6px 14px",fontSize:12,fontWeight:700,cursor:"pointer",
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div style={{ padding:"12px 24px",background:"#f9fefb",borderTop:"1.5px solid #f0fdf4",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ fontSize:12,color:"#9ca3af",fontWeight:500 }}>{active} of {users.length} athletes active</span>
              <div style={{ display:"flex",gap:6 }}>
                {[...Array(Math.ceil(users.length/5))].map((_,i) => (
                  <div key={i} style={{ width:24,height:24,borderRadius:6,background:i===0?"#16a34a":"#f0fdf4",color:i===0?"#fff":"#9ca3af",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,cursor:"pointer" }}>
                    {i+1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{
          position:"fixed",inset:0,zIndex:1000,
          background:"rgba(5,46,22,0.25)",backdropFilter:"blur(6px)",
          display:"flex",alignItems:"center",justifyContent:"center",
          animation:"overlayIn 0.2s ease",padding:20,
        }} onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div style={{
            background:"#fff",borderRadius:24,width:"100%",maxWidth:460,
            boxShadow:"0 32px 80px rgba(5,46,22,0.2)",
            animation:"modalIn 0.3s cubic-bezier(.34,1.3,.64,1)",
            overflow:"hidden",
          }}>
            {/* Modal header */}
            <div style={{ background:"linear-gradient(135deg,#16a34a,#22c55e)",padding:"22px 28px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div>
                  <h3 style={{ fontSize:20,fontWeight:800,color:"#fff",margin:0 }}>Add New Athlete</h3>
                  <p style={{ fontSize:12,color:"rgba(255,255,255,0.75)",marginTop:4,fontWeight:500 }}>They'll be auto-assigned to your team</p>
                </div>
                <button onClick={() => setModal(false)} style={{ width:32,height:32,borderRadius:10,background:"rgba(255,255,255,0.2)",border:"none",color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>×</button>
              </div>
            </div>

            {/* Modal body */}
            <div style={{ padding:"24px 28px" }}>
              <form onSubmit={form.submit(onAdd)} noValidate>
                {[
                  { k:"name", label:"Full Name", type:"text", ph:"Jane Doe" },
                  { k:"email", label:"Email Address", type:"email", ph:"jane@example.com" },
                  { k:"password", label:"Password", type:"text", ph:"Create a password" },
                ].map(({ k, label, type, ph }) => (
                  <div key={k} style={{ marginBottom:18 }}>
                    <label style={{ display:"block",fontSize:11,fontWeight:800,color:"#374151",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:7 }}>
                      {label} <span style={{ color:"#ef4444" }}>*</span>
                    </label>
                    <input
                      type={type}
                      placeholder={ph}
                      {...form.reg(k)}
                      style={{
                        width:"100%",background:form.errs[k]?"#fff5f5":"#f9fefb",
                        border:`1.5px solid ${form.errs[k]?"#fca5a5":"#d1fae5"}`,
                        borderRadius:12,padding:"11px 14px",fontSize:14,
                        color:"#111827",transition:"all 0.2s",
                      }}
                    />
                    {form.errs[k] && <p style={{ color:"#ef4444",fontSize:11,marginTop:5,fontWeight:600 }}>⚠ {form.errs[k]}</p>}
                  </div>
                ))}

                <div style={{ display:"flex",gap:10,marginTop:24 }}>
                  <button
                    type="submit"
                    disabled={form.busy}
                    className="action-btn"
                    style={{
                      flex:1,background:form.busy?"#86efac":"linear-gradient(135deg,#16a34a,#22c55e)",
                      color:"#fff",border:"none",borderRadius:12,
                      padding:"13px 20px",fontSize:14,fontWeight:700,
                      cursor:form.busy?"not-allowed":"pointer",
                      boxShadow:"0 4px 20px rgba(22,163,74,0.3)",
                      
                    }}
                  >
                    {form.busy ? "Adding…" : "✓ Add to My Team"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal(false)}
                    style={{
                      background:"#f9fefb",color:"#6b7280",border:"1.5px solid #d1fae5",
                      borderRadius:12,padding:"13px 20px",fontSize:14,fontWeight:700,
                      cursor:"pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}