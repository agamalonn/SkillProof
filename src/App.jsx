import { useEffect, useMemo, useState } from 'react'

const tracks = ['All', 'Frontend', 'Backend', 'Full Stack', 'Data', 'DevOps', 'Security']

const trackStyles = {
  Frontend: 'border-sky-200 bg-sky-50 text-sky-800',
  Backend: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  'Full Stack': 'border-amber-200 bg-amber-50 text-amber-800',
  Data: 'border-rose-200 bg-rose-50 text-rose-800',
  DevOps: 'border-violet-200 bg-violet-50 text-violet-800',
  Security: 'border-cyan-200 bg-cyan-50 text-cyan-800',
}

const workflowSteps = [
  ['Scope', 'Choose a mission with clear acceptance criteria.'],
  ['Build', 'Work in a branch and commit in reviewable slices.'],
  ['Submit', 'Attach a GitHub pull request to your profile.'],
  ['Review', 'Collect proof that hiring teams can inspect.'],
]

const emptyAuthForm = {
  name: '',
  email: '',
  password: '',
  role: 'candidate',
}

const emptySubmissionForm = {
  githubRepo: '',
  pullRequestUrl: '',
  notes: '',
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || 'Something went wrong.')
  }

  return payload
}

function App() {
  const [user, setUser] = useState(null)
  const [missions, setMissions] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [selectedTrack, setSelectedTrack] = useState('All')
  const [selectedMissionId, setSelectedMissionId] = useState('')
  const [authMode, setAuthMode] = useState('signup')
  const [authForm, setAuthForm] = useState(emptyAuthForm)
  const [profileForm, setProfileForm] = useState({ name: '', headline: '', githubUrl: '' })
  const [submissionForm, setSubmissionForm] = useState(emptySubmissionForm)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPlatform() {
      setLoading(true)
      setError('')

      try {
        const missionResponse = await apiRequest('/api/missions')
        setMissions(missionResponse.missions)
        setSelectedMissionId(missionResponse.missions[0]?.id || '')
      } catch (requestError) {
        setError(requestError.message)
      }

      try {
        const me = await apiRequest('/api/auth/me')
        setUser(me.user)
        setProfileForm({
          name: me.user.name || '',
          headline: me.user.headline || '',
          githubUrl: me.user.githubUrl || '',
        })
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadPlatform()
  }, [])

  useEffect(() => {
    if (!user) {
      setSubmissions([])
      return
    }

    loadSubmissions()
  }, [user])

  async function loadSubmissions() {
    try {
      const response = await apiRequest('/api/submissions')
      setSubmissions(response.submissions)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const filteredMissions = useMemo(() => {
    if (selectedTrack === 'All') {
      return missions
    }

    return missions.filter((mission) => mission.track === selectedTrack)
  }, [missions, selectedTrack])

  const selectedMission = useMemo(
    () => missions.find((mission) => mission.id === selectedMissionId) || missions[0],
    [missions, selectedMissionId],
  )

  const completedMissionIds = useMemo(
    () => new Set(submissions.map((submission) => submission.missionId)),
    [submissions],
  )

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setBusy('auth')
    setError('')
    setNotice('')

    try {
      const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: authMode === 'signup' ? authForm : { email: authForm.email, password: authForm.password },
      })

      setUser(response.user)
      setProfileForm({
        name: response.user.name || '',
        headline: response.user.headline || '',
        githubUrl: response.user.githubUrl || '',
      })
      setAuthForm(emptyAuthForm)
      setNotice(authMode === 'signup' ? 'Account created. Welcome to SkillProof.' : 'Signed in successfully.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy('')
    }
  }

  async function handleLogout() {
    setBusy('logout')
    setError('')
    setNotice('')

    try {
      await apiRequest('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setSubmissions([])
      setNotice('Signed out.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy('')
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setBusy('profile')
    setError('')
    setNotice('')

    try {
      const response = await apiRequest('/api/profile', {
        method: 'PATCH',
        body: profileForm,
      })
      setUser(response.user)
      setNotice('Profile updated.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy('')
    }
  }

  async function handleSubmissionSubmit(event) {
    event.preventDefault()
    if (!selectedMission) {
      return
    }

    setBusy('submission')
    setError('')
    setNotice('')

    try {
      await apiRequest('/api/submissions', {
        method: 'POST',
        body: {
          ...submissionForm,
          missionId: selectedMission.id,
        },
      })
      setSubmissionForm(emptySubmissionForm)
      await loadSubmissions()
      setNotice('Pull request submitted for review.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy('')
    }
  }

  function selectMission(mission) {
    setSelectedMissionId(mission.id)
    if (!user) {
      setAuthMode('signup')
      setNotice('Create an account to submit your pull request and track reviews.')
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-[#171717]">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-[#fbfaf7]/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <a href="#workspace" className="flex items-center gap-3" aria-label="SkillProof workspace">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white shadow-sm">
              <img src="/favicon.svg" alt="" className="h-7 w-7" />
            </span>
            <span className="text-xl font-black text-zinc-950">SkillProof</span>
          </a>

          <div className="hidden items-center gap-1 rounded-lg border border-black/10 bg-white p-1 text-sm font-bold text-zinc-600 md:flex">
            <a href="#missions" className="rounded-md px-3 py-2 hover:bg-zinc-100 hover:text-zinc-950">
              Missions
            </a>
            <a href="#workflow" className="rounded-md px-3 py-2 hover:bg-zinc-100 hover:text-zinc-950">
              Workflow
            </a>
            <a href="#submissions" className="rounded-md px-3 py-2 hover:bg-zinc-100 hover:text-zinc-950">
              Proof
            </a>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden items-center gap-3 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm sm:flex">
                  <UserMark name={user.name} />
                  <div className="min-w-0">
                    <p className="max-w-36 truncate font-black text-zinc-950">{user.name}</p>
                    <p className="text-xs font-bold text-zinc-500">
                      {user.role === 'employer' ? 'Employer' : 'Candidate'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-black text-zinc-700 shadow-sm hover:bg-zinc-100"
                  disabled={busy === 'logout'}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-black text-zinc-700 shadow-sm hover:bg-zinc-100"
                >
                  Sign in
                </button>
                <a
                  href="#account"
                  className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-zinc-800"
                >
                  Join
                </a>
              </>
            )}
          </div>
        </nav>
      </header>

      <main id="workspace" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <section className="rounded-lg border border-black/10 bg-[#171717] text-white shadow-xl shadow-black/10">
          <div className="grid gap-0 lg:grid-cols-[1fr_430px]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-black uppercase text-emerald-200">
                  Verified work platform
                </span>
                <span className="rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase text-zinc-200">
                  GitHub-native
                </span>
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
                Build a hiring signal from real engineering work.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300 md:text-lg">
                SkillProof turns junior learning into reviewable product work: scoped missions, GitHub pull requests,
                acceptance criteria, and a portfolio trail hiring teams can inspect.
              </p>

              <div className="mt-8 grid gap-3 text-zinc-950 sm:grid-cols-3">
                <Metric value={missions.length || '—'} label="active missions" tone="light" />
                <Metric value={submissions.length} label="submitted proofs" tone="light" />
                <Metric value={user ? 'active' : 'guest'} label="workspace" tone="light" />
              </div>
            </div>

            <ProofConsole user={user} selectedMission={selectedMission} submissions={submissions} />
          </div>
        </section>

        {(notice || error) && (
          <div
            className={`mt-5 rounded-lg border px-4 py-3 text-sm font-bold shadow-sm ${
              error
                ? 'border-rose-200 bg-rose-50 text-rose-800'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            {error || notice}
          </div>
        )}

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            <MissionBoard
              loading={loading}
              missions={filteredMissions}
              selectedTrack={selectedTrack}
              setSelectedTrack={setSelectedTrack}
              selectedMission={selectedMission}
              completedMissionIds={completedMissionIds}
              onSelect={selectMission}
            />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {user ? (
              <>
                <AccountPanel
                  user={user}
                  profileForm={profileForm}
                  setProfileForm={setProfileForm}
                  onSubmit={handleProfileSubmit}
                  busy={busy === 'profile'}
                />
                <SubmissionPanel
                  mission={selectedMission}
                  form={submissionForm}
                  setForm={setSubmissionForm}
                  onSubmit={handleSubmissionSubmit}
                  busy={busy === 'submission'}
                />
              </>
            ) : (
              <AuthPanel
                mode={authMode}
                setMode={setAuthMode}
                form={authForm}
                setForm={setAuthForm}
                onSubmit={handleAuthSubmit}
                busy={busy === 'auth'}
              />
            )}
          </aside>
        </section>

        <section id="workflow" className="mt-10 rounded-lg border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <p className="text-xs font-black uppercase text-emerald-700">Review workflow</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-zinc-950">
                A workflow that looks like the job.
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {workflowSteps.map(([title, text], index) => (
                <WorkflowStep key={title} index={index + 1} title={title} text={text} />
              ))}
            </div>
          </div>
        </section>

        <SubmissionsSection user={user} submissions={submissions} />
      </main>
    </div>
  )
}

function ProofConsole({ user, selectedMission, submissions }) {
  const latestSubmission = submissions[0]

  return (
    <div className="border-t border-white/10 bg-[#101010] p-6 lg:border-l lg:border-t-0">
      <div className="rounded-lg border border-white/10 bg-white/[0.04]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-xs font-black uppercase text-zinc-500">Workspace status</p>
            <p className="mt-1 text-sm font-black text-white">{user ? 'Authenticated' : 'Guest mode'}</p>
          </div>
          <span className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-2.5 py-1 text-xs font-black text-emerald-200">
            live
          </span>
        </div>

        <div className="space-y-4 p-4">
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-zinc-500">Selected mission</p>
                <h2 className="mt-2 text-lg font-black leading-snug text-white">
                  {selectedMission?.title || 'Mission loading'}
                </h2>
              </div>
              <span className="rounded-md bg-white px-2.5 py-1 text-xs font-black text-zinc-950">
                {selectedMission?.issue || '#'}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {['Issue', 'Branch', 'PR'].map((label, index) => (
                <div key={label} className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                  <p className="text-[11px] font-black uppercase text-zinc-500">{label}</p>
                  <p className={`mt-1 text-sm font-black ${index < 2 || latestSubmission ? 'text-emerald-200' : 'text-zinc-500'}`}>
                    {index < 2 || latestSubmission ? 'ready' : 'open'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white p-4 text-zinc-950">
            <p className="text-xs font-black uppercase text-zinc-500">Latest proof</p>
            <p className="mt-2 text-sm font-black">
              {latestSubmission ? latestSubmission.missionTitle : 'No pull request submitted yet'}
            </p>
            <div className="mt-4 h-2 rounded-md bg-zinc-100">
              <div className={`h-2 rounded-md bg-emerald-500 ${latestSubmission ? 'w-3/4' : 'w-1/4'}`}></div>
            </div>
            <p className="mt-3 text-xs font-bold text-zinc-500">
              {latestSubmission ? 'Submitted for review' : 'Select a mission and attach a GitHub PR'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MissionBoard({ loading, missions, selectedTrack, setSelectedTrack, selectedMission, completedMissionIds, onSelect }) {
  return (
    <section id="missions" className="rounded-lg border border-black/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-emerald-700">Mission board</p>
          <h2 className="mt-2 text-3xl font-black text-zinc-950">Production-style challenges</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {tracks.map((track) => (
            <button
              key={track}
              type="button"
              onClick={() => setSelectedTrack(track)}
              className={`rounded-md border px-3 py-2 text-sm font-black shadow-sm transition ${
                selectedTrack === track
                  ? 'border-zinc-950 bg-zinc-950 text-white'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-400 hover:bg-white'
              }`}
            >
              {track}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-sm font-bold text-zinc-600">
          Loading platform...
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              active={mission.id === selectedMission?.id}
              completed={completedMissionIds.has(mission.id)}
              onSelect={() => onSelect(mission)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function Metric({ value, label, tone = 'default' }) {
  const isLight = tone === 'light'

  return (
    <div className={`rounded-lg border p-4 ${isLight ? 'border-white/15 bg-white text-zinc-950' : 'border-zinc-200 bg-white'}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-[11px] font-black uppercase text-zinc-500">{label}</p>
    </div>
  )
}

function MissionCard({ mission, active, completed, onSelect }) {
  return (
    <article
      className={`group rounded-lg border p-5 transition ${
        active
          ? 'border-zinc-950 bg-[#fffdf8] shadow-md shadow-black/5'
          : 'border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50'
      }`}
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_160px] xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-black text-zinc-700">
              {mission.issue}
            </span>
            <span className={`rounded-md border px-2.5 py-1 text-xs font-black ${trackStyles[mission.track] || trackStyles.Frontend}`}>
              {mission.track}
            </span>
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-black text-zinc-600">
              {mission.level}
            </span>
            {completed && (
              <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-800">
                submitted
              </span>
            )}
          </div>

          <h3 className="mt-4 text-xl font-black leading-tight text-zinc-950">{mission.title}</h3>
          <p className="mt-1 text-sm font-bold text-zinc-500">{mission.company}</p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-600">{mission.summary}</p>
        </div>

        <div className="grid gap-2 xl:justify-items-end">
          <button
            type="button"
            onClick={onSelect}
            className={`w-full rounded-lg px-4 py-2.5 text-sm font-black transition xl:w-auto ${
              active
                ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                : 'bg-zinc-950 text-white hover:bg-zinc-800'
            }`}
          >
            {active ? 'Selected' : 'Start mission'}
          </button>
          <p className="text-xs font-bold text-zinc-500">{mission.estimate}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {mission.skills.map((skill) => (
          <span key={skill} className="rounded-md bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-700">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-5 border-t border-zinc-200 pt-5 md:grid-cols-2">
        <MissionList title="Deliverables" items={mission.deliverables} />
        <MissionList title="Acceptance criteria" items={mission.acceptance} check />
      </div>

      <div className="mt-5 grid gap-3 border-t border-zinc-200 pt-5 text-sm text-zinc-600 md:grid-cols-2 xl:grid-cols-3">
        <MetaLine label="Repository" value={mission.repo} />
        <MetaLine label="Branch" value={mission.branch} />
        <MetaLine label="Track" value={mission.track} />
      </div>
    </article>
  )
}

function MissionList({ title, items, check = false }) {
  return (
    <div>
      <h4 className="text-xs font-black uppercase text-zinc-500">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={`mt-1.5 shrink-0 font-black ${check ? 'text-emerald-700' : 'text-zinc-400'}`}>
              {check ? '✓' : '•'}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MetaLine({ label, value }) {
  return (
    <p className="min-w-0">
      <span className="block text-[11px] font-black uppercase text-zinc-500">{label}</span>
      <span className="mt-1 block truncate font-mono text-xs font-bold text-zinc-950">{value}</span>
    </p>
  )
}

function AuthPanel({ mode, setMode, form, setForm, onSubmit, busy }) {
  const isSignup = mode === 'signup'

  return (
    <section id="account" className="rounded-lg border border-black/10 bg-white p-5 shadow-md shadow-black/5">
      <div className="grid grid-cols-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1">
        {['signup', 'login'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`rounded-md px-3 py-2 text-sm font-black ${
              mode === item ? 'bg-zinc-950 text-white shadow-sm' : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            {item === 'signup' ? 'Create' : 'Sign in'}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <p className="text-xs font-black uppercase text-emerald-700">{isSignup ? 'New workspace' : 'Welcome back'}</p>
        <h2 className="mt-2 text-2xl font-black text-zinc-950">
          {isSignup ? 'Create your proof profile' : 'Continue your mission work'}
        </h2>
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        {isSignup && (
          <>
            <Field
              label="Full name"
              value={form.name}
              onChange={(value) => setForm({ ...form, name: value })}
              autoComplete="name"
              required
            />

            <label className="block">
              <span className="text-sm font-black text-zinc-800">Account type</span>
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-zinc-950"
              >
                <option value="candidate">Candidate</option>
                <option value="employer">Employer</option>
              </select>
            </label>
          </>
        )}

        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => setForm({ ...form, email: value })}
          autoComplete="email"
          required
        />

        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(value) => setForm({ ...form, password: value })}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          required
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-950 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          disabled={busy}
        >
          {busy ? 'Working...' : isSignup ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-xs font-black uppercase text-zinc-500">Account includes</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-black text-zinc-700">
          <span>Profile</span>
          <span>PR proof</span>
          <span>Reviews</span>
        </div>
      </div>
    </section>
  )
}

function AccountPanel({ user, profileForm, setProfileForm, onSubmit, busy }) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-5 shadow-md shadow-black/5">
      <div className="flex items-start gap-3">
        <UserMark name={user.name} large />
        <div className="min-w-0">
          <p className="text-xs font-black uppercase text-emerald-700">Account</p>
          <h2 className="mt-1 truncate text-2xl font-black text-zinc-950">{user.name}</h2>
          <p className="truncate text-sm font-bold text-zinc-500">{user.email}</p>
        </div>
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <Field label="Display name" value={profileForm.name} onChange={(value) => setProfileForm({ ...profileForm, name: value })} />
        <Field
          label="Headline"
          value={profileForm.headline}
          onChange={(value) => setProfileForm({ ...profileForm, headline: value })}
          placeholder="Junior frontend developer"
        />
        <Field
          label="GitHub profile"
          type="url"
          value={profileForm.githubUrl}
          onChange={(value) => setProfileForm({ ...profileForm, githubUrl: value })}
          placeholder="https://github.com/your-user"
        />
        <button
          type="submit"
          className="w-full rounded-lg border border-zinc-950 px-4 py-2.5 text-sm font-black text-zinc-950 hover:bg-zinc-950 hover:text-white disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-400"
          disabled={busy}
        >
          {busy ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </section>
  )
}

function SubmissionPanel({ mission, form, setForm, onSubmit, busy }) {
  return (
    <section className="rounded-lg border border-black/10 bg-zinc-950 p-5 text-white shadow-md shadow-black/10">
      <p className="text-xs font-black uppercase text-emerald-300">Submit proof</p>
      <h2 className="mt-2 text-2xl font-black leading-tight">{mission?.title || 'Select a mission'}</h2>
      <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs font-bold text-zinc-300">
        {mission?.repo || 'Repository'} · {mission?.branch || 'Branch'}
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <Field
          dark
          label="Repository"
          value={form.githubRepo}
          onChange={(value) => setForm({ ...form, githubRepo: value })}
          placeholder="owner/repository"
          required
        />
        <Field
          dark
          label="Pull request URL"
          type="url"
          value={form.pullRequestUrl}
          onChange={(value) => setForm({ ...form, pullRequestUrl: value })}
          placeholder="https://github.com/owner/repo/pull/1"
          required
        />

        <label className="block">
          <span className="text-sm font-black text-zinc-100">Reviewer notes</span>
          <textarea
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            className="mt-2 min-h-28 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2.5 text-sm font-bold text-white outline-none placeholder:text-zinc-500 focus:border-emerald-300"
            placeholder="What changed, how you tested it, and where you want feedback."
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-300 px-4 py-3 text-sm font-black text-zinc-950 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:text-zinc-300"
          disabled={busy || !mission}
        >
          {busy ? 'Submitting...' : 'Submit pull request'}
        </button>
      </form>
    </section>
  )
}

function WorkflowStep({ index, title, text }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <p className="grid h-8 w-8 place-items-center rounded-md bg-zinc-950 text-sm font-black text-white">{index}</p>
      <h3 className="mt-4 font-black text-zinc-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
    </div>
  )
}

function SubmissionsSection({ user, submissions }) {
  return (
    <section id="submissions" className="py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-emerald-700">Proof archive</p>
          <h2 className="mt-2 text-3xl font-black text-zinc-950">My submissions</h2>
        </div>
        {user && <span className="text-sm font-black text-zinc-500">{submissions.length} submitted</span>}
      </div>

      {!user ? (
        <div className="mt-5 rounded-lg border border-zinc-200 bg-white p-6 text-sm font-bold text-zinc-600 shadow-sm">
          Create an account or sign in to track submissions.
        </div>
      ) : submissions.length ? (
        <div className="mt-5 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
          {submissions.map((submission) => (
            <div key={submission.id} className="grid gap-4 border-b border-zinc-200 p-5 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase text-emerald-700">{submission.status}</p>
                <h3 className="mt-1 truncate text-lg font-black text-zinc-950">{submission.missionTitle}</h3>
                <p className="mt-2 truncate text-sm font-bold text-zinc-500">{submission.githubRepo}</p>
                {submission.notes && <p className="mt-3 text-sm leading-6 text-zinc-600">{submission.notes}</p>}
                <p className="mt-3 text-xs font-bold text-zinc-500">
                  Submitted {new Date(submission.submittedAt).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <a
                href={submission.pullRequestUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-black text-zinc-700 hover:bg-zinc-100"
              >
                Open PR
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-zinc-200 bg-white p-6 text-sm font-bold text-zinc-600 shadow-sm">
          Select a mission and submit your first pull request.
        </div>
      )}
    </section>
  )
}

function UserMark({ name, large = false }) {
  const initials = String(name || 'SP')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-lg bg-emerald-300 font-black text-zinc-950 ${
        large ? 'h-12 w-12 text-base' : 'h-9 w-9 text-sm'
      }`}
    >
      {initials || 'SP'}
    </span>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '', autoComplete, required = false, dark = false }) {
  return (
    <label className="block">
      <span className={`text-sm font-black ${dark ? 'text-zinc-100' : 'text-zinc-800'}`}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className={`mt-2 w-full rounded-lg border px-3 py-2.5 text-sm font-bold outline-none ${
          dark
            ? 'border-white/15 bg-white/10 text-white placeholder:text-zinc-500 focus:border-emerald-300'
            : 'border-zinc-300 bg-white text-zinc-950 placeholder:text-zinc-400 focus:border-zinc-950'
        }`}
      />
    </label>
  )
}

export default App
