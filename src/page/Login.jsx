import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=Satoshi:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --green: #22c55e;
    --green-light: #4ade80;
    --green-dark: #16a34a;
    --bg: #f8faf8;
    --surface: #ffffff;
    --border: #e4ede4;
    --text1: #0f1f0f;
    --text2: #5a7a5a;
    --text3: #9ab49a;
  }

  .hos-body {
    background: var(--bg);
    font-family: 'Satoshi', sans-serif;
    min-height: 100vh;
    display: flex;
    overflow: hidden;
  }

  .hos-left {
    flex: 1.1;
    background: var(--text1);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px;
    overflow: hidden;
  }

  .hos-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    animation: hosFloat 8s ease-in-out infinite;
  }
  .hos-orb1 { width: 400px; height: 400px; background: rgba(34,197,94,0.15); top: -100px; left: -100px; animation-delay: 0s; }
  .hos-orb2 { width: 300px; height: 300px; background: rgba(74,222,128,0.1); bottom: 100px; right: -80px; animation-delay: -3s; }
  .hos-orb3 { width: 200px; height: 200px; background: rgba(22,163,74,0.12); top: 40%; left: 30%; animation-delay: -5s; }

  @keyframes hosFloat {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-30px) scale(1.05); }
  }

  .hos-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(34,197,94,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(34,197,94,0.05) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }

  .hos-left-logo {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .hos-logo-mark {
    width: 44px; height: 44px;
    background: var(--green);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
  }

  .hos-logo-name {
    font-family: 'Clash Display', sans-serif;
    font-size: 22px;
    color: #fff;
    letter-spacing: 0.02em;
  }
  .hos-logo-name span { color: var(--green-light); }

  .hos-left-content { position: relative; z-index: 2; }

  .hos-left-tag {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(34,197,94,0.12);
    border: 1px solid rgba(34,197,94,0.25);
    color: var(--green-light);
    font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;
    padding: 6px 14px; border-radius: 50px;
    margin-bottom: 28px;
  }

  .hos-pulse-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--green-light);
    animation: hosPulse 2s infinite;
  }

  @keyframes hosPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .hos-left-heading {
    font-family: 'Clash Display', sans-serif;
    font-size: clamp(38px, 4vw, 56px);
    color: #fff;
    line-height: 1.05;
    margin-bottom: 20px;
  }
  .hos-left-heading span { color: var(--green-light); }

  .hos-left-sub {
    color: rgba(255,255,255,0.45);
    font-size: 15px; line-height: 1.7;
    max-width: 380px; margin-bottom: 40px;
  }

  .hos-stats-row { display: flex; gap: 32px; }

  .hos-stat-item .hos-num {
    font-family: 'Clash Display', sans-serif;
    font-size: 28px; color: #fff;
  }
  .hos-stat-item .hos-num span { color: var(--green-light); }
  .hos-stat-item .hos-lbl { font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 2px; }

  .hos-health-card {
    position: absolute;
    bottom: 48px; right: 48px;
    background: rgba(255,255,255,0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 20px 24px;
    z-index: 2;
    animation: hosCardFloat 4s ease-in-out infinite;
  }

  @keyframes hosCardFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }

  .hos-hc-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 10px; }
  .hos-hc-metrics { display: flex; gap: 20px; }
  .hos-hc-m .hos-val { font-family: 'Clash Display', sans-serif; font-size: 22px; color: #fff; }
  .hos-hc-m .hos-key { font-size: 10px; color: rgba(255,255,255,0.35); margin-top: 2px; }
  .hos-hc-bar { margin-top: 14px; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
  .hos-hc-bar-fill { height: 100%; width: 72%; background: linear-gradient(90deg, var(--green), var(--green-light)); border-radius: 2px; }

  .hos-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 56px;
    background: var(--bg);
    position: relative;
  }

  .hos-right::before {
    content: '';
    position: absolute;
    top: -200px; right: -200px;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .hos-form-wrap { width: 100%; max-width: 400px; }

  .hos-form-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--text3); margin-bottom: 12px; }

  .hos-form-title {
    font-family: 'Clash Display', sans-serif;
    font-size: 36px; color: var(--text1);
    margin-bottom: 6px; line-height: 1.1;
  }

  .hos-form-sub { color: var(--text2); font-size: 14px; margin-bottom: 36px; }
  .hos-form-sub a { color: var(--green-dark); text-decoration: none; font-weight: 500; cursor: pointer; }

  .hos-tab-switch {
    display: flex;
    background: var(--border);
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 32px;
  }

  .hos-tab-btn {
    flex: 1; padding: 10px; border: none;
    background: transparent;
    border-radius: 9px;
    font-family: 'Satoshi', sans-serif;
    font-size: 13px; font-weight: 500;
    color: var(--text2); cursor: pointer;
    transition: all 0.2s;
  }

  .hos-tab-btn.active {
    background: var(--surface);
    color: var(--text1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  .hos-field { margin-bottom: 18px; }

  .hos-field label {
    display: block;
    font-size: 12px; font-weight: 500;
    color: var(--text2);
    letter-spacing: 0.05em;
    margin-bottom: 8px;
  }

  .hos-field input {
    width: 100%;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: 13px 16px;
    font-family: 'Satoshi', sans-serif;
    font-size: 14px; color: var(--text1);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .hos-field input::placeholder { color: var(--text3); }

  .hos-field input:focus {
    border-color: var(--green);
    box-shadow: 0 0 0 3px rgba(34,197,94,0.1);
  }

  .hos-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .hos-pwd-wrap { position: relative; }
  .hos-pwd-wrap input { padding-right: 44px; }

  .hos-pwd-toggle {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: var(--text3); font-size: 16px;
  }

  .hos-forgot-row { display: flex; justify-content: flex-end; margin-top: -8px; margin-bottom: 20px; }
  .hos-forgot-row a { font-size: 12px; color: var(--green-dark); text-decoration: none; font-weight: 500; cursor: pointer; }

  .hos-divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
  .hos-divider::before, .hos-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .hos-divider span { font-size: 12px; color: var(--text3); }

  .hos-social-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 28px; }

  .hos-social-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    border: 1.5px solid var(--border); background: var(--surface);
    border-radius: 11px; padding: 11px; cursor: pointer;
    font-family: 'Satoshi', sans-serif; font-size: 13px; font-weight: 500; color: var(--text1);
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .hos-social-btn:hover { border-color: var(--green); box-shadow: 0 2px 12px rgba(34,197,94,0.1); }

  .hos-social-icon { width: 18px; height: 18px; }

  .hos-btn-submit {
    width: 100%;
    background: var(--text1);
    color: #fff; border: none;
    border-radius: 12px;
    padding: 14px;
    font-family: 'Satoshi', sans-serif;
    font-size: 15px; font-weight: 600;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s, background 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    letter-spacing: 0.02em;
  }

  .hos-btn-submit:hover {
    background: var(--green-dark);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(22,163,74,0.3);
  }

  .hos-arr { transition: transform 0.2s; display: inline-block; }
  .hos-btn-submit:hover .hos-arr { transform: translateX(4px); }

  .hos-terms { text-align: center; font-size: 11px; color: var(--text3); margin-top: 20px; line-height: 1.6; }
  .hos-terms a { color: var(--text2); text-decoration: underline; cursor: pointer; }
`;

const GoogleIcon = () => (
  <svg className="hos-social-icon" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="hos-social-icon" viewBox="0 0 24 24">
    <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function HealthOSLogin() {
  const [tab, setTab] = useState("login");
  const [showPwd, setShowPwd] = useState(false);

  return (
    <>
      <style>{styles}</style>
      <div className="hos-body">

        {/* LEFT PANEL */}
        <div className="hos-left">
          <div className="hos-orb hos-orb1" />
          <div className="hos-orb hos-orb2" />
          <div className="hos-orb hos-orb3" />

          <div className="hos-left-logo">
            <div className="hos-logo-mark">🩺</div>
            <div className="hos-logo-name">Gtel<span>OS</span></div>
          </div>

          <div className="hos-left-content">
            <div className="hos-left-tag">
              <span className="hos-pulse-dot" />
              Your Health, Simplified
            </div>
            <h2 className="hos-left-heading">
              Track Every<br />Aspect of Your<br /><span>Wellness</span>
            </h2>
            <p className="hos-left-sub">
              Diet, exercise, sleep, vitals — ek hi jagah sab kuch monitor karo. Doctors aur trainers ke saath connect karo.
            </p>
            <div className="hos-stats-row">
              <div className="hos-stat-item">
                <div className="hos-num">50<span>K+</span></div>
                <div className="hos-lbl">Active Users</div>
              </div>
              <div className="hos-stat-item">
                <div className="hos-num">10<span>+</span></div>
                <div className="hos-lbl">Health Modules</div>
              </div>
              <div className="hos-stat-item">
                <div className="hos-num">98<span>%</span></div>
                <div className="hos-lbl">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Floating Health Card */}
          <div className="hos-health-card">
            <div className="hos-hc-label">Today's Overview</div>
            <div className="hos-hc-metrics">
              <div className="hos-hc-m">
                <div className="hos-val">7,842</div>
                <div className="hos-key">Steps</div>
              </div>
              <div className="hos-hc-m">
                <div className="hos-val">1,840</div>
                <div className="hos-key">Calories</div>
              </div>
              <div className="hos-hc-m">
                <div className="hos-val">7.2h</div>
                <div className="hos-key">Sleep</div>
              </div>
            </div>
            <div className="hos-hc-bar">
              <div className="hos-hc-bar-fill" />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="hos-right">
          <div className="hos-form-wrap">
            <div className="hos-form-eyebrow">Welcome to GtelOS</div>
            <h1 className="hos-form-title">
              {tab === "login" ? <>Sign in to<br />your account</> : <>Create your<br />free account</>}
            </h1>
            <p className="hos-form-sub">
              {tab === "login"
                ? <>New here? <a onClick={() => setTab("register")}>Create a free account →</a></>
                : <>Already have one? <a onClick={() => setTab("login")}>Sign in →</a></>}
            </p>

            {/* Tab Switch */}
            <div className="hos-tab-switch">
              <button
                className={`hos-tab-btn${tab === "login" ? " active" : ""}`}
                onClick={() => setTab("login")}
              >
                Sign In
              </button>
              <button
                className={`hos-tab-btn${tab === "register" ? " active" : ""}`}
                onClick={() => setTab("register")}
              >
                Register
              </button>
            </div>

            {/* Social Buttons */}
            <div className="hos-social-btns">
              <button className="hos-social-btn">
                <GoogleIcon /> Google
              </button>
              <button className="hos-social-btn">
                <FacebookIcon /> Facebook
              </button>
            </div>

            <div className="hos-divider"><span>or continue with email</span></div>

            {/* LOGIN FORM */}
            {tab === "login" && (
              <form onSubmit={e => e.preventDefault()}>
                <div className="hos-field">
                  <label>Email Address</label>
                  <input type="email" placeholder="you@example.com" />
                </div>
                <div className="hos-field">
                  <label>Password</label>
                  <div className="hos-pwd-wrap">
                    <input type={showPwd ? "text" : "password"} placeholder="Enter your password" />
                    <button
                      className="hos-pwd-toggle"
                      type="button"
                      onClick={() => setShowPwd(p => !p)}
                    >
                      👁
                    </button>
                  </div>
                </div>
                <div className="hos-forgot-row">
                  <a href="#">Forgot password?</a>
                </div>
                <button className="hos-btn-submit" type="submit">
                  Sign In <span className="hos-arr">→</span>
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {tab === "register" && (
              <form onSubmit={e => e.preventDefault()}>
                <div className="hos-field-row">
                  <div className="hos-field">
                    <label>First Name</label>
                    <input type="text" placeholder="Rahul" />
                  </div>
                  <div className="hos-field">
                    <label>Last Name</label>
                    <input type="text" placeholder="Sharma" />
                  </div>
                </div>
                <div className="hos-field">
                  <label>Email Address</label>
                  <input type="email" placeholder="you@example.com" />
                </div>
                <div className="hos-field">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="+91 98765 43210" />
                </div>
                <div className="hos-field">
                  <label>Password</label>
                  <div className="hos-pwd-wrap">
                    <input type="password" placeholder="Min 8 characters" />
                    <button className="hos-pwd-toggle" type="button">👁</button>
                  </div>
                </div>
                <button className="hos-btn-submit" type="submit">
                  Create Account <span className="hos-arr">→</span>
                </button>
              </form>
            )}

            <p className="hos-terms">
              By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}