import { useEffect, useState } from "react";
import api from "./api.js";
import Auth from "./Auth.jsx";

const DEPARTMENTS = ["All", "CSE", "CSE (AI&ML)", "CSE (Data Science)", "ECE", "IT", "Mechanical"];
const FEE_STATUSES = ["All", "Paid", "Pending", "Partial"];

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [tab, setTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [feeFilter, setFeeFilter] = useState("All");
  const [notice, setNotice] = useState({ msg: "", type: "" });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    registrationNumber: "",
    name: "",
    department: "CSE",
    email: "",
    semester: 1,
    gpa: 8.0,
    tuitionFee: 50000,
    feeStatus: "Paid"
  });
  const [editingReg, setEditingReg] = useState(null);

  function handleAuthenticated(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  function showNotice(msg, type = "success") {
    setNotice({ msg, type });
    setTimeout(() => setNotice({ msg: "", type: "" }), 4000);
  }

  async function loadStudents() {
    setLoading(true);
    try {
      const params = {};
      if (query) params.q = query;
      if (deptFilter !== "All") params.department = deptFilter;
      if (feeFilter !== "All") params.feeStatus = feeFilter;
      const res = await api.get("/students", { params });
      setStudents(res.data);
    } catch (e) {
      showNotice(e.response?.data?.message || "Failed to load students.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalytics() {
    try {
      const res = await api.get("/students/analytics/stats");
      setAnalytics(res.data);
    } catch (e) {
      showNotice("Could not load analytics.", "error");
    }
  }

  useEffect(() => {
    if (!user) return;
    if (tab === "students") loadStudents();
    if (tab === "analytics") loadAnalytics();
  }, [user, tab, deptFilter, feeFilter]);

  function resetForm() {
    setForm({
      registrationNumber: "",
      name: "",
      department: "CSE",
      email: "",
      semester: 1,
      gpa: 8.0,
      tuitionFee: 50000,
      feeStatus: "Paid"
    });
    setEditingReg(null);
  }

  function beginEdit(student) {
    setEditingReg(student.registrationNumber);
    setForm({
      registrationNumber: student.registrationNumber,
      name: student.name,
      department: student.department,
      email: student.email || "",
      semester: student.semester || 1,
      gpa: student.gpa || 8.0,
      tuitionFee: student.tuitionFee || 50000,
      feeStatus: student.feeStatus || "Paid"
    });
    setTab("add");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingReg) {
        await api.put(`/students/${editingReg}`, form);
        showNotice(`Student ${form.registrationNumber} updated successfully.`);
      } else {
        await api.post("/students", form);
        showNotice(`Student ${form.registrationNumber} added successfully.`);
      }
      resetForm();
      setTab("students");
      loadStudents();
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to save student record.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(registrationNumber) {
    if (!window.confirm(`Are you sure you want to delete student ${registrationNumber}? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/students/${registrationNumber}`);
      showNotice(`Student ${registrationNumber} deleted successfully.`);
      loadStudents();
    } catch (err) {
      showNotice(err.response?.data?.message || "Failed to delete student.", "error");
    }
  }

  if (!user) {
    return <Auth onAuthenticated={handleAuthenticated} />;
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="header-logo">🎓</span>
          <div>
            <h1>ANITS College</h1>
            <p>Student Management System</p>
          </div>
        </div>
        <div className="header-right">
          <span className="user-badge">{user.role === "admin" ? "🛡 Admin" : "🎓 Student"}</span>
          <span className="user-name">{user.name}</span>
          <button onClick={logout} className="btn-logout">Logout</button>
        </div>
      </header>

      {notice.msg && (
        <div className={`notice ${notice.type}`}>{notice.msg}</div>
      )}

      <nav className="tab-nav">
        <button className={tab === "students" ? "active" : ""} onClick={() => setTab("students")}>
          👥 Students
        </button>
        {isAdmin && (
          <>
            <button className={tab === "add" ? "active" : ""} onClick={() => { resetForm(); setTab("add"); }}>
              {editingReg ? "✏️ Edit Student" : "➕ Add Student"}
            </button>
            <button className={tab === "analytics" ? "active" : ""} onClick={() => setTab("analytics")}>
              📊 Analytics
            </button>
          </>
        )}
      </nav>

      <main className="main-content">
        {/* ---- Students Tab ---- */}
        {tab === "students" && (
          <section className="section">
            <div className="section-header">
              <h2>Student Records</h2>
              <div className="filter-row">
                <input
                  className="search-box"
                  type="text"
                  placeholder="🔍 Search by name, reg no, dept, email…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadStudents()}
                />
                <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
                <select value={feeFilter} onChange={(e) => setFeeFilter(e.target.value)}>
                  {FEE_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={loadStudents} className="btn-secondary">Search</button>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading student records…</div>
            ) : students.length === 0 ? (
              <div className="empty-state">No student records found.</div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Reg. No.</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Semester</th>
                      <th>GPA</th>
                      <th>Tuition Fee</th>
                      <th>Fee Status</th>
                      {isAdmin && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.registrationNumber}>
                        <td><code>{s.registrationNumber}</code></td>
                        <td>{s.name}</td>
                        <td><span className="dept-badge">{s.department}</span></td>
                        <td>{s.semester}</td>
                        <td>{s.gpa}</td>
                        <td>₹{s.tuitionFee?.toLocaleString()}</td>
                        <td>
                          <span className={`fee-badge ${s.feeStatus?.toLowerCase()}`}>{s.feeStatus}</span>
                        </td>
                        {isAdmin && (
                          <td className="actions-cell">
                            <button className="btn-edit" onClick={() => beginEdit(s)}>Edit</button>
                            <button className="btn-delete" onClick={() => handleDelete(s.registrationNumber)}>Delete</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ---- Add / Edit Student Tab ---- */}
        {tab === "add" && isAdmin && (
          <section className="section">
            <h2>{editingReg ? `Edit Student: ${editingReg}` : "Add New Student"}</h2>
            <form className="student-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Registration Number *</label>
                  <input
                    type="text"
                    value={form.registrationNumber}
                    onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                    placeholder="e.g. A24126552094"
                    required
                    disabled={!!editingReg}
                  />
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Student full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  >
                    {DEPARTMENTS.filter(d => d !== "All").map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="student@anits.edu.in"
                  />
                </div>
                <div className="form-group">
                  <label>Semester (1-8)</label>
                  <input
                    type="number"
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })}
                    min={1}
                    max={8}
                  />
                </div>
                <div className="form-group">
                  <label>GPA (0-10)</label>
                  <input
                    type="number"
                    value={form.gpa}
                    onChange={(e) => setForm({ ...form, gpa: Number(e.target.value) })}
                    min={0}
                    max={10}
                    step={0.01}
                  />
                </div>
                <div className="form-group">
                  <label>Tuition Fee (₹)</label>
                  <input
                    type="number"
                    value={form.tuitionFee}
                    onChange={(e) => setForm({ ...form, tuitionFee: Number(e.target.value) })}
                    min={0}
                    step={1000}
                  />
                </div>
                <div className="form-group">
                  <label>Fee Status</label>
                  <select
                    value={form.feeStatus}
                    onChange={(e) => setForm({ ...form, feeStatus: e.target.value })}
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={busy}>
                  {busy ? "Saving…" : editingReg ? "Update Student" : "Add Student"}
                </button>
                <button type="button" className="btn-secondary" onClick={() => { resetForm(); setTab("students"); }}>
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ---- Analytics Tab ---- */}
        {tab === "analytics" && isAdmin && analytics && (
          <section className="section analytics">
            <h2>📊 Aggregated Analytics Dashboard</h2>

            <div className="stats-cards">
              <div className="stat-card primary">
                <span className="stat-label">Total Students</span>
                <span className="stat-value">{analytics.totalStudents}</span>
              </div>
              <div className="stat-card success">
                <span className="stat-label">College Avg GPA</span>
                <span className="stat-value">{analytics.collegeAvgGpa}</span>
              </div>
              <div className="stat-card warning">
                <span className="stat-label">Total Tuition Revenue</span>
                <span className="stat-value">₹{analytics.totalRevenue?.toLocaleString()}</span>
              </div>
            </div>

            <h3>Department-wise Breakdown</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Students</th>
                    <th>Avg GPA</th>
                    <th>Min GPA</th>
                    <th>Max GPA</th>
                    <th>Total Tuition (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.departmentWise?.map((d) => (
                    <tr key={d.department}>
                      <td><span className="dept-badge">{d.department}</span></td>
                      <td>{d.studentCount}</td>
                      <td>{d.avgGpa}</td>
                      <td>{d.minGpa}</td>
                      <td>{d.maxGpa}</td>
                      <td>₹{d.totalTuition?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3>Fee Collection Status</h3>
            <div className="fee-summary">
              {analytics.feeStatusWise?.map((f) => (
                <div className="fee-card" key={f._id}>
                  <span className={`fee-badge ${f._id?.toLowerCase()}`}>{f._id}</span>
                  <span>{f.count} students</span>
                  <span>₹{f.collectedAmount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Anil Neerukonda Institute of Technology and Sciences (ANITS) | Full-Stack Web Development | 23CM4121</p>
      </footer>
    </div>
  );
}

export default App;
