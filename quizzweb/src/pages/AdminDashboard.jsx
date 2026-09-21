import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'
import StatCard from '../components/StatCard'
import StudentTable from '../components/StudentTable'
import { formatDuration } from '../components/Timer'
import { Brand } from '../components/Logo'

const VIOLATION_WEIGHT_LABELS = [
  { type: 'AI_APP_SWITCH', label: 'Switched to another app', weight: 2 },
  { type: 'COPY', label: 'Copy attempt', weight: 2 },
  { type: 'PASTE', label: 'Paste attempt', weight: 2 },
  { type: 'CUT', label: 'Cut attempt', weight: 2 },
  { type: 'FULLSCREEN_EXIT', label: 'Exited fullscreen', weight: 1 },
  { type: 'CONTEXT_MENU', label: 'Right-click', weight: 1 },
  { type: 'TAB_SWITCH', label: 'Tab switch', weight: 1 },
  { type: 'WINDOW_BLUR', label: 'Window blur', weight: 1 },
]
import { useAdminAuth } from '../context/AdminAuthContext'
import { useToast } from '../context/ToastContext'
import { adminApi, errorMessage } from '../services/api'

export default function AdminDashboard() {
  const { admin, logout } = useAdminAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [resetOpen, setResetOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selected, setSelected] = useState([])
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [viewing, setViewing] = useState(null)

  const loadStudents = async () => {
    setLoading(true)
    try {
      const { data } = await adminApi.get('/admin/students')
      setStudents(data.students)
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        logout()
        navigate('/admin/login', { replace: true })
      } else {
        toast.error(errorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleReset = async () => {
    setDeleting(true)
    try {
      const { data } = await adminApi.delete('/admin/students', { data: { confirm: true } })
      toast.success(data.message)
      setResetOpen(false)
      setSelected([])
      setStudents([])
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (!selected.length) return
    setDeleting(true)
    try {
      const { data } = await adminApi.delete('/admin/students', { data: { student_ids: selected } })
      toast.success(data.message)
      setDeleteOpen(false)
      setStudents((prev) => prev.filter((s) => !selected.includes(s.id)))
      setSelected([])
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const handleToggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleToggleAll = () => {
    setSelected((prev) =>
      prev.length === filtered.length ? [] : filtered.map((s) => s.id),
    )
  }

  const stats = useMemo(() => {
    const completed = students.filter((s) => s.score != null)
    const totalScore = completed.reduce((sum, s) => sum + (s.score || 0), 0)
    const highest = completed.length ? Math.max(...completed.map((s) => s.score || 0)) : 0
    const average = completed.length ? totalScore / completed.length : 0
    return {
      total: students.length,
      completed: completed.length,
      average: average.toFixed(1),
      highest: completed.length ? highest : '—',
    }
  }, [students])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let rows = students
    if (q) {
      rows = rows.filter((s) =>
        [s.name, s.college_name, s.email, s.phone_number].some((v) =>
          String(v || '').toLowerCase().includes(q),
        ),
      )
    }
    if (filter === 'completed') rows = rows.filter((s) => s.score != null)
    if (filter === 'pending') rows = rows.filter((s) => s.score == null)
    if (filter === 'high') rows = rows.filter((s) => (s.score ?? 0) >= 35)
    return rows
  }, [students, search, filter])

  const handleLogout = () => {
    logout()
    toast.info('Logged out of admin portal.')
    navigate('/admin/login', { replace: true })
  }

  const formatDateTime = (iso) => {
    if (!iso) return '—'
    try {
      return new Date(`${iso}Z`).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch {
      return iso
    }
  }

  const studentInitials = (name = '') =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()

  const viewed = viewing
  const viewPct = viewed?.score != null && viewed.score > 0
    ? ((viewed.score / 50) * 100).toFixed(1)
    : '0'

  return (
    <div className="admin-page page-enter">
      <header className="admin-topbar">
        <div className="container admin-topbar-inner">
          <Brand to="/admin/dashboard" context="Administration" size={34} />
          <div className="admin-profile">
            <span className="admin-avatar">{(admin?.name || 'A')[0]}</span>
            <div className="who">
              <div className="name">{admin?.name || 'Administrator'}</div>
              <div className="role">Admin</div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.08)', color: '#cbd5e1' }} className="btn-sm" >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container dashboard">
        <div className="dashboard-head">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Monitor student participation and competition results.</p>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading student data…" />
        ) : (
          <>
            <div className="stat-grid">
              <StatCard
                tone="primary"
                label="Total Students"
                value={stats.total}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9.5" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                }
              />
              <StatCard
                tone="success"
                label="Completed"
                value={stats.completed}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m8.5 12.5 2.5 2.5 5-5.5" />
                  </svg>
                }
              />
              <StatCard
                tone="warning"
                label="Average Score"
                value={stats.average}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 3 2.5 20h19L12 3Z" />
                    <path d="M12 9v5" />
                    <path d="M12 17.5h.01" />
                  </svg>
                }
              />
              <StatCard
                tone="secondary"
                label="Highest Score"
                value={stats.highest}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9h12v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9Z" />
                    <path d="M5 5h14" />
                    <path d="M12 3v2" />
                  </svg>
                }
              />
            </div>

            <div className="section-label">Students</div>
            <div className="card dashboard-card">
              <div className="toolbar">
                <div className="search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    className="input"
                    placeholder="Search by name, college, email or phone…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search students"
                  />
                </div>
                <select
                  className="select"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  aria-label="Filter students"
                >
                  <option value="all">All students</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Not attempted</option>
                  <option value="high">Score ≥ 35</option>
                </select>
                {selected.length > 0 && (
                  <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                    Delete Selected ({selected.length})
                  </Button>
                )}
              </div>
              <StudentTable
                students={filtered}
                selectable
                selectedIds={selected}
                onToggle={handleToggle}
                onToggleAll={handleToggleAll}
                onView={(s) => setViewing(s)}
                emptyText={students.length ? 'No students match your search.' : 'No students registered yet.'}
              />
            </div>

            <div className="section-label">Danger Zone</div>
            <div className="danger-card">
              <div className="danger-head">
                <span className="danger-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                </span>
                <div>
                  <h3>Reset Student Data</h3>
                  <div className="sub">Permanently deletes all registered students and their results.</div>
                </div>
              </div>
              <div className="danger-body">
                <p>
                  This action wipes the competition database. Every student account, score and
                  completion record will be removed. It cannot be undone.
                </p>
                <Button variant="danger" onClick={() => setResetOpen(true)}>
                  Reset Student Data
                </Button>
              </div>
            </div>
          </>
        )}
      </main>

      <Modal open={!!viewing} title={`Student Profile: ${viewed?.name || 'Student'}`} icon="info" onClose={() => setViewing(null)}>
        {viewed && (
          <div className="student-detail">
            <div className="sd-head">
              <span className="sd-avatar">
                <span>{studentInitials(viewed.name)}</span>
                {viewed.completed && (
                  <span className="sd-avatar-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                )}
              </span>
              <div className="sd-id-block">
                <span className="sd-eyebrow">Student Profile</span>
                <h3 className="sd-name">{viewed.name}</h3>
                <span className="sd-college">{viewed.college_name}</span>
              </div>
              <div className={`sd-cstatus ${viewed.completed ? 'on' : 'off'}`}>
                <span className="dot" />
                {viewed.completed ? 'Completed' : 'Not attempted'}
              </div>
            </div>

            <div className="sd-grid">
              <div className={`sd-stat ${viewed.score != null ? 'good' : 'muted'}`}>
                <span className="sd-stat-ic tik" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></svg>
                </span>
                <div className="v">{viewed.score != null ? `${viewed.score} / 50` : '—'}</div>
                <div className="l">Score</div>
              </div>
              <div className="sd-stat">
                <span className="sd-stat-ic time" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                </span>
                <div className="v">{viewed.completed_time != null ? formatDuration(viewed.completed_time) : '—'}</div>
                <div className="l">Time Taken</div>
              </div>
              <div className="sd-stat">
                <span className="sd-stat-ic shield" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 5 6v5c0 4.4 2.9 7.6 7 9 4.1-1.4 7-4.6 7-9V6l-7-3Z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                </span>
                <div className="v">{viewed.violations ?? 0}</div>
                <div className="l">Violations</div>
              </div>
              <div className="sd-stat">
                <span className="sd-stat-ic pct" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20 20 4" /><circle cx="8" cy="9" r="2.3" /><circle cx="16" cy="15" r="2.3" /></svg>
                </span>
                <div className="v">{viewPct}%</div>
                <div className="l">Percentage</div>
              </div>
            </div>

            <div className="sd-section-label">Contact & Timeline</div>
            <div className="sd-rows">
              <div className="sd-row">
                <span className="sd-row-ic mail" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></svg>
                </span>
                <div className="sd-row-group">
                  <span className="k">Email</span>
                  <strong>{viewed.email}</strong>
                </div>
              </div>
              <div className="sd-row">
                <span className="sd-row-ic phone" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l1.5 4-2.4 1.6a12 12 0 0 0 6.3 6.3L16 13.5l4 1.5v4a2 2 0 0 1-2.2 2A17 17 0 0 1 3 6.2 2 2 0 0 1 5 4Z" /></svg>
                </span>
                <div className="sd-row-group">
                  <span className="k">Phone</span>
                  <strong>+91 {viewed.phone_number}</strong>
                </div>
              </div>
              <div className="sd-row">
                <span className="sd-row-ic start" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                </span>
                <div className="sd-row-group">
                  <span className="k">Started At</span>
                  <strong>{formatDateTime(viewed.started_at)}</strong>
                </div>
              </div>
              <div className="sd-row">
                <span className="sd-row-ic done" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8.5 13 2.5 2.5 4.5-5" /></svg>
                </span>
                <div className="sd-row-group">
                  <span className="k">Submitted At</span>
                  <strong>{formatDateTime(viewed.submitted_at)}</strong>
                </div>
              </div>
            </div>

            {(viewed.violations_detail?.length ?? 0) > 0 && (
              <div className="sd-violations">
                <div className="sd-v-head">Violation Log</div>
                <ul>
                  {VIOLATION_WEIGHT_LABELS
                    .filter((entry) => (viewed.violations_detail || []).some((v) => v.type === entry.type))
                    .map((entry) => {
                      const v = viewed.violations_detail.find((x) => x.type === entry.type)
                      return (
                        <li key={entry.type}>
                          <span>{entry.label}</span>
                          <strong>{v.count} × {entry.weight}</strong>
                        </li>
                      )
                    })}
                </ul>
              </div>
            )}

            <div className="modal-actions">
              <Button variant="primary" block onClick={() => setViewing(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={deleteOpen} title="Delete selected students?" icon="danger" onClose={() => !deleting && setDeleteOpen(false)}>
        <p>
          <strong>Are you sure you want to delete the {selected.length} selected student{selected.length === 1 ? '' : 's'}?</strong>
        </p>
        <p style={{ marginTop: 6 }}>
          The selected accounts and their results will be permanently removed from the
          database. This action cannot be reversed.
        </p>
        <div className="modal-actions">
          <Button variant="outline" disabled={deleting} onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDeleteSelected}>
            Delete {selected.length} Student{selected.length === 1 ? '' : 's'}
          </Button>
        </div>
      </Modal>

      <Modal open={resetOpen} title="Delete all student data?" icon="danger" onClose={() => !deleting && setResetOpen(false)}>
        <p>
          <strong>Are you sure you want to permanently delete the student data?</strong>
        </p>
        <p style={{ marginTop: 6 }}>
          {students.length} student{students.length === 1 ? '' : 's'} will be removed from the
          database. This action cannot be reversed.
        </p>
        <div className="modal-actions">
          <Button variant="outline" disabled={deleting} onClick={() => setResetOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleReset}>
            Delete Data
          </Button>
        </div>
      </Modal>
    </div>
  )
}