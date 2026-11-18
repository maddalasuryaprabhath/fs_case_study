import { useState } from "react";
import api from "./api.js";

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function updateForm(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      let response;
      if (mode === "register") {
        response = await api.post("/auth/register", form);
      } else {
        response = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
          role
        });
      }
      onAuthenticated(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-header">
          <span className="college-logo">🎓</span>
          <h1>ANITS College</h1>
          <p>Student Management System</p>
        </div>

        <div className="auth-toggle">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Login
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={updateForm}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="student@anits.edu.in"
              value={form.email}
              onChange={updateForm}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={updateForm}
              required
            />
          </div>

          {mode === "login" && (
            <div className="form-group">
              <label>Login as</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" disabled={busy} className="btn-primary full-width">
            {busy ? "Please wait…" : mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        {mode === "login" && (
          <div className="auth-hint">
            <p><strong>Demo Credentials:</strong></p>
            <p>Admin: admin@college.edu / admin123</p>
            <p>Student: surya.prabhath@anits.edu.in / student123</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Auth;
