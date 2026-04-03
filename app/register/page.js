"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Karla:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* kill autofill white flash */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #1e1e1e inset !important;
    -webkit-text-fill-color: #f0f0f0 !important;
    caret-color: #f0f0f0 !important;
    transition: background-color 9999s ease-in-out 0s;
  }

  @keyframes rg-bg-drift {
    0%   { transform: translate(-50%,-50%) rotate(0deg)   scale(1);   }
    33%  { transform: translate(-48%,-52%) rotate(120deg) scale(1.05); }
    66%  { transform: translate(-52%,-48%) rotate(240deg) scale(.97);  }
    100% { transform: translate(-50%,-50%) rotate(360deg) scale(1);   }
  }
  @keyframes rg-fade-in {
    from { opacity:0; transform: translateY(12px) scale(.98); }
    to   { opacity:1; transform: translateY(0)    scale(1);   }
  }
  @keyframes rg-spin { to { transform: rotate(360deg); } }
  @keyframes rg-slide-down {
    from { opacity:0; transform: translateY(-6px); }
    to   { opacity:1; transform: translateY(0);    }
  }

  .rg-page {
    min-height: 100vh;
    background: #0a0a0a;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    position: relative;
    overflow: hidden;
    font-family: 'Karla', sans-serif;
  }

  /* animated aurora blobs */
  .rg-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    animation: rg-bg-drift 18s linear infinite;
  }
  .rg-blob-1 {
    width: 520px; height: 520px;
    top: 30%; left: 20%;
    background: radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%);
    animation-duration: 20s;
  }
  .rg-blob-2 {
    width: 400px; height: 400px;
    top: 60%; left: 65%;
    background: radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%);
    animation-duration: 26s;
    animation-direction: reverse;
  }
  .rg-blob-3 {
    width: 300px; height: 300px;
    top: 10%; left: 70%;
    background: radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%);
    animation-duration: 15s;
  }

  /* modal card */
  .rg-card {
    position: relative;
    width: 100%;
    max-width: 460px;
    background: rgba(22,22,22,0.85);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    padding: 32px 32px 28px;
    box-shadow:
      0 0 0 1px rgba(249,115,22,0.06),
      0 24px 64px rgba(0,0,0,0.7),
      0 2px 0 rgba(255,255,255,0.04) inset;
    animation: rg-fade-in .5s cubic-bezier(.22,1,.36,1) both;
  }

  /* top tab switcher */
  .rg-tabs {
    display: inline-flex;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 100px;
    padding: 4px;
    margin-bottom: 28px;
  }
  .rg-tab {
    padding: 8px 24px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.4);
    transition: color .2s, background .2s, box-shadow .2s;
    font-family: 'Karla', sans-serif;
    letter-spacing: .01em;
  }
  .rg-tab.active {
    background: rgba(255,255,255,0.1);
    color: #f0f0f0;
    box-shadow: 0 1px 4px rgba(0,0,0,0.4);
  }

  .rg-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 900;
    font-size: 28px;
    color: #f0f0f0;
    letter-spacing: .02em;
    margin-bottom: 20px;
  }

  /* role pills */
  .rg-role-row {
    display: flex;
    gap: 8px;
    margin-bottom: 18px;
  }
  .rg-role-pill {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    transition: border-color .2s, background .2s, box-shadow .2s;
    font-family: 'Karla', sans-serif;
  }
  .rg-role-pill:hover {
    border-color: rgba(249,115,22,0.2);
    background: rgba(249,115,22,0.04);
  }
  .rg-role-pill.active {
    border-color: rgba(249,115,22,0.45);
    background: rgba(249,115,22,0.08);
    box-shadow: 0 0 14px rgba(249,115,22,0.1);
  }
  .rg-role-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.2);
    flex-shrink: 0;
    transition: background .2s, border-color .2s;
  }
  .rg-role-pill.active .rg-role-dot {
    background: #F97316;
    border-color: #F97316;
  }
  .rg-role-name {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
    transition: color .2s;
  }
  .rg-role-pill.active .rg-role-name { color: #f0f0f0; }
  .rg-role-emoji { font-size: 15px; }

  /* input rows */
  .rg-row { display: flex; gap: 10px; margin-bottom: 10px; }
  .rg-field { flex: 1; position: relative; }
  .rg-field-full { margin-bottom: 10px; position: relative; }

  .rg-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 13px 16px 13px 16px;
    color: #f0f0f0;
    font-size: 14px;
    font-family: 'Karla', sans-serif;
    outline: none;
    transition: border-color .2s, background .2s, box-shadow .2s;
  }
  .rg-input.with-icon { padding-left: 42px; }
  .rg-input::placeholder { color: rgba(255,255,255,0.2); }
  .rg-input:focus {
    border-color: rgba(249,115,22,0.4);
    background: rgba(249,115,22,0.03);
    box-shadow: 0 0 0 3px rgba(249,115,22,0.07);
  }

  .rg-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255,255,255,0.2);
    pointer-events: none;
    display: flex;
    align-items: center;
  }

  /* pw strength */
  .rg-pw-bars {
    display: flex; gap: 4px; margin-top: 7px;
  }
  .rg-pw-bar {
    flex: 1; height: 2px; border-radius: 2px;
    background: rgba(255,255,255,0.08);
    transition: background .3s;
  }
  .rg-pw-label {
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: .07em;
    margin-top: 4px;
    transition: color .3s;
  }

  /* CTA button */
  .rg-btn {
    width: 100%;
    margin-top: 6px;
    padding: 14px;
    border-radius: 12px;
    border: none;
    background: #f0f0f0;
    color: #0a0a0a;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Karla', sans-serif;
    letter-spacing: .04em;
    cursor: pointer;
    transition: background .2s, box-shadow .2s, transform .15s, color .2s;
  }
  .rg-btn:hover:not(:disabled) {
    background: #fff;
    box-shadow: 0 0 28px rgba(249,115,22,0.25);
    transform: translateY(-1px);
  }
  .rg-btn:active:not(:disabled) { transform: translateY(0); }
  .rg-btn:disabled { opacity: .45; cursor: not-allowed; }
  .rg-btn.orange {
    background: #F97316;
    color: #fff;
  }
  .rg-btn.orange:hover:not(:disabled) {
    background: #ea6a0a;
    box-shadow: 0 0 28px rgba(249,115,22,0.4);
  }

  /* divider */
  .rg-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 18px 0;
  }
  .rg-divider-line { flex:1; height:1px; background: rgba(255,255,255,0.06); }
  .rg-divider-text {
    font-size: 10px;
    color: rgba(255,255,255,0.2);
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: .1em;
  }

  /* social buttons */
  .rg-social-row { display: flex; gap: 10px; }
  .rg-social-btn {
    flex: 1;
    display: flex; align-items: center; justify-content: center;
    gap: 8px;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.04);
    cursor: pointer;
    transition: border-color .2s, background .2s;
    font-family: 'Karla', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.6);
  }
  .rg-social-btn:hover {
    border-color: rgba(255,255,255,0.14);
    background: rgba(255,255,255,0.07);
    color: #f0f0f0;
  }

  /* error */
  .rg-error {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.18);
    border-radius: 10px;
    padding: 10px 14px;
    margin-bottom: 14px;
    animation: rg-slide-down .25s ease both;
  }
  .rg-error p { color: #f87171; font-size: 13px; }

  .rg-footer {
    text-align: center;
    margin-top: 20px;
    font-size: 11px;
    color: rgba(255,255,255,0.2);
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: .04em;
    line-height: 1.6;
  }
  .rg-footer a { color: rgba(249,115,22,0.7); text-decoration: none; }
  .rg-footer a:hover { color: #F97316; }

  .rg-spin { animation: rg-spin .7s linear infinite; }
`;

function pwStrength(pw) {
  if (!pw) return null;
  if (pw.length < 6)                               return { label:"Too short", color:"#ef4444", bars:1 };
  if (pw.length < 8)                               return { label:"Weak",      color:"#f97316", bars:2 };
  if (/[A-Z]/.test(pw) && /[0-9!@#$]/.test(pw))  return { label:"Strong",    color:"#22c55e", bars:4 };
  return                                                  { label:"Fair",      color:"#eab308", bars:3 };
}

function RegisterForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const defaultRole  = searchParams.get("role") || "customer";

  const [tab, setTab]       = useState("signup"); // "signup" | "signin"
  const [form, setForm]     = useState({ firstName:"", lastName:"", email:"", password:"", role: defaultRole });
  const [signIn_form, setSignInForm] = useState({ email:"", password:"" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);

  const strength = pwStrength(form.password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res  = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ name:`${form.firstName} ${form.lastName}`.trim(), email:form.email, password:form.password, role:form.role }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    const result = await signIn("credentials", { email:form.email, password:form.password, redirect:false });
    if (result?.ok) router.push(form.role === "shop_owner" ? "/dashboard/shop" : "/dashboard/customer");
    else router.push("/login");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const result = await signIn("credentials", { email:signIn_form.email, password:signIn_form.password, redirect:false });
    if (result?.error) { setError("Invalid email or password."); setLoading(false); }
    else router.push("/");
  };

  const handleGoogle = async () => {
    setGLoading(true);
    await signIn("google", { callbackUrl:"/" });
  };

  return (
    <>
      <style>{STYLE}</style>
      <div className="rg-page">
        {/* aurora blobs */}
        <div className="rg-blob rg-blob-1" />
        <div className="rg-blob rg-blob-2" />
        <div className="rg-blob rg-blob-3" />

        <div className="rg-card">

          {/* tab switcher */}
          <div className="rg-tabs">
            <button className={`rg-tab ${tab==="signup"?"active":""}`} onClick={() => { setTab("signup"); setError(""); }}>
              Sign up
            </button>
            <button className={`rg-tab ${tab==="signin"?"active":""}`} onClick={() => { setTab("signin"); setError(""); }}>
              Sign in
            </button>
          </div>

          {/* ── SIGN UP ── */}
          {tab === "signup" && (
            <>
              <h1 className="rg-title">Create an account</h1>

              {/* role pills */}
              <div className="rg-role-row">
                {[
                  { value:"customer",   label:"Customer",   emoji:"🔍" },
                  { value:"shop_owner", label:"Shop Owner",  emoji:"🏪" },
                ].map((r) => (
                  <button
                    key={r.value} type="button"
                    className={`rg-role-pill ${form.role===r.value?"active":""}`}
                    onClick={() => setForm({...form, role:r.value})}
                  >
                    <span className="rg-role-emoji">{r.emoji}</span>
                    <span className="rg-role-name">{r.label}</span>
                    <div className="rg-role-dot" style={{ marginLeft:"auto" }} />
                  </button>
                ))}
              </div>

              {error && <div className="rg-error"><p>⚠ {error}</p></div>}

              <form onSubmit={handleRegister}>
                {/* name row */}
                <div className="rg-row">
                  <div className="rg-field">
                    <input className="rg-input" type="text" required placeholder="First name"
                      value={form.firstName}
                      onChange={(e) => setForm({...form, firstName:e.target.value})} />
                  </div>
                  <div className="rg-field">
                    <input className="rg-input" type="text" required placeholder="Last name"
                      value={form.lastName}
                      onChange={(e) => setForm({...form, lastName:e.target.value})} />
                  </div>
                </div>

                {/* email */}
                <div className="rg-field-full">
                  <div className="rg-input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                    </svg>
                  </div>
                  <input className="rg-input with-icon" type="email" required placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) => setForm({...form, email:e.target.value})} />
                </div>

                {/* password */}
                <div className="rg-field-full">
                  <div className="rg-input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input className="rg-input with-icon" type="password" required minLength={6} placeholder="Create password"
                    value={form.password}
                    onChange={(e) => setForm({...form, password:e.target.value})} />
                  {form.password && (
                    <>
                      <div className="rg-pw-bars">
                        {[1,2,3,4].map((n) => (
                          <div key={n} className="rg-pw-bar"
                            style={{ background: strength && n<=strength.bars ? strength.color : undefined }} />
                        ))}
                      </div>
                      <div className="rg-pw-label" style={{ color: strength?.color }}>{strength?.label}</div>
                    </>
                  )}
                </div>

                <button type="submit" disabled={loading} className="rg-btn orange">
                  {loading
                    ? <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                        <svg className="rg-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" style={{opacity:.25}}/>
                          <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" style={{opacity:.75}}/>
                        </svg>
                        Creating account…
                      </span>
                    : "Create an account"
                  }
                </button>
              </form>

              <div className="rg-divider">
                <div className="rg-divider-line"/>
                <span className="rg-divider-text">OR SIGN IN WITH</span>
                <div className="rg-divider-line"/>
              </div>

              <div className="rg-social-row">
                <button className="rg-social-btn" onClick={handleGoogle} disabled={gLoading}>
                  {gLoading
                    ? <svg className="rg-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#F97316" strokeWidth="3" style={{opacity:.3}}/>
                        <path fill="#F97316" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                  }
                  Google
                </button>
                <button className="rg-social-btn" disabled>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{color:"#f0f0f0"}}>
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple
                </button>
              </div>
            </>
          )}

          {/* ── SIGN IN ── */}
          {tab === "signin" && (
            <>
              <h1 className="rg-title">Welcome back</h1>

              {error && <div className="rg-error"><p>⚠ {error}</p></div>}

              <form onSubmit={handleLogin} style={{display:"flex",flexDirection:"column",gap:10}}>
                <div className="rg-field-full" style={{marginBottom:0}}>
                  <div className="rg-input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                    </svg>
                  </div>
                  <input className="rg-input with-icon" type="email" required placeholder="Enter your email"
                    value={signIn_form.email}
                    onChange={(e) => setSignInForm({...signIn_form, email:e.target.value})} />
                </div>

                <div className="rg-field-full" style={{marginBottom:0}}>
                  <div className="rg-input-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input className="rg-input with-icon" type="password" required placeholder="Your password"
                    value={signIn_form.password}
                    onChange={(e) => setSignInForm({...signIn_form, password:e.target.value})} />
                </div>

                <div style={{textAlign:"right", marginTop:2}}>
                  <Link href="/forgot-password" style={{fontSize:12, color:"rgba(249,115,22,0.7)", textDecoration:"none", fontFamily:"'JetBrains Mono',monospace"}}>
                    Forgot password?
                  </Link>
                </div>

                <button type="submit" disabled={loading} className="rg-btn" style={{marginTop:2}}>
                  {loading
                    ? <span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                        <svg className="rg-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" style={{opacity:.25}}/>
                          <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" style={{opacity:.75}}/>
                        </svg>
                        Signing in…
                      </span>
                    : "Sign in →"
                  }
                </button>
              </form>

              <div className="rg-divider">
                <div className="rg-divider-line"/>
                <span className="rg-divider-text">OR SIGN IN WITH</span>
                <div className="rg-divider-line"/>
              </div>

              <div className="rg-social-row">
                <button className="rg-social-btn" onClick={handleGoogle} disabled={gLoading}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button className="rg-social-btn" disabled>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{color:"#f0f0f0"}}>
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple
                </button>
              </div>
            </>
          )}

          {/* footer */}
          <p className="rg-footer">
            By creating an account, you agree to our{" "}
            <Link href="/terms">Terms &amp; Service</Link>
            {" "}and{" "}
            <Link href="/privacy">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}