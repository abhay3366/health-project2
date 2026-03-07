import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "coach") navigate("/coach");
      else navigate("/user");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .anim { animation: fadeUp 0.45s ease both; }
        .d1 { animation-delay: 0.05s; }
        .d2 { animation-delay: 0.12s; }
        .d3 { animation-delay: 0.19s; }
        .d4 { animation-delay: 0.26s; }
        .input-focus:focus-within { box-shadow: 0 0 0 3px rgba(76,175,80,0.18); }
        .btn-glow:not(:disabled):hover { box-shadow: 0 8px 28px rgba(76,175,80,0.45) !important; transform: translateY(-1px); }
        .btn-glow:not(:disabled):active { transform: translateY(0px); }
      `}</style>

      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1b5e20 0%, #2e7d32 40%, #43a047 75%, #66bb6a 100%)" }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 65%)" }} />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(0,0,0,0.15) 0%, transparent 65%)" }} />
          <div className="animate-float absolute top-16 right-24 w-12 h-12 rounded-full border border-white/10 bg-white/5" style={{ animationDelay: "0s" }} />
          <div className="animate-float absolute bottom-32 left-20 w-7 h-7 rounded-full border border-white/10 bg-white/5" style={{ animationDelay: "2s" }} />
          <div className="animate-float absolute top-1/2 right-16 w-4 h-4 rounded-full bg-white/10" style={{ animationDelay: "4s" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Card container */}
        <div className="relative w-full max-w-[400px]">
          {/* Glow */}
          <div className="absolute -inset-2 rounded-[28px] blur-2xl opacity-25"
            style={{ background: "linear-gradient(135deg, #a5d6a7, #4caf50)" }} />

          <div className="relative bg-white rounded-[24px] shadow-2xl overflow-hidden">
            {/* Top accent bar */}
            <div className="h-[3px]"
              style={{ background: "linear-gradient(90deg, #2e7d32, #4caf50, #8bc34a)" }} />

            <div className="px-7 pt-7 pb-7">

              {/* Logo */}
              <div className="text-center mb-7 anim d1">
                <div className="inline-flex items-center justify-center rounded-2xl mb-3"
                  style={{
                    background: "linear-gradient(135deg, #43a047, #8bc34a)",
                    boxShadow: "0 8px 20px rgba(76,175,80,0.35)",
                    width: 52, height: 52,
                  }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M17 8C8 10 5.9 16.17 3.82 19.99L5.71 21l1-1.73c.97.57 2.15.73 3.29.73C16 20 20 14 20 8c-1.51.92-3.24 1.69-3 2.25C15.5 5.71 17 8 17 8z" fill="white" fillOpacity="0.9" />
                    <path d="M3 20c1.5-4 3-6 5-8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h1 className="text-[21px] font-extrabold text-gray-900 tracking-tight">AWC Wellness</h1>
                <p className="text-sm text-gray-400 mt-1 font-medium">Login to your account</p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-red-500 text-xs font-medium mb-4 anim d1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">

                {/* Email */}
                <div className="anim d2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-1.5">
                    Email Address
                  </label>
                  <div
                    className={`input-focus flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-200
                      ${focusedField === "email" ? "border-green-400 bg-white" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={focusedField === "email" ? "#4caf50" : "#9ca3af"} strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="you@example.com"
                      className="flex-1 bg-transparent text-sm font-medium text-gray-800 placeholder-gray-300 outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="anim d3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                      Password
                    </label>
                    <button type="button" className="text-[10px] font-semibold"
                      style={{ color: "#43a047" }}>
                      Forgot password?
                    </button>
                  </div>
                  <div
                    className={`input-focus flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-200
                      ${focusedField === "password" ? "border-green-400 bg-white" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={focusedField === "password" ? "#4caf50" : "#9ca3af"} strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent text-sm font-medium text-gray-800 placeholder-gray-300 outline-none"
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
                      {showPass ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <div className="anim d4 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-glow w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #43a047, #66bb6a)",
                      boxShadow: "0 4px 18px rgba(76,175,80,0.35)",
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign In
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              </form>

              {/* Bottom hint */}
              <div className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-3 mt-5 anim d4">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="mt-0.5 shrink-0">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <p className="text-[11px] text-gray-400 leading-relaxed text-left">
                  Coaches & Users are created by Admin. Their credentials are set at the time of creation.
                </p>
              </div>

            </div>
          </div>

          {/* Trust badge */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
              Secured by AWC Health Systems
            </span>
          </div>
        </div>
      </div>
    </>
  );
}