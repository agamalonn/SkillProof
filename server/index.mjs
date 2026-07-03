import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const dataDir = path.join(rootDir, 'data')
const dbPath = path.join(dataDir, 'skillproof-db.json')
const distDir = path.join(rootDir, 'dist')
const port = Number(process.env.PORT || 8787)
const host = process.env.HOST || '127.0.0.1'
const sessionMaxAgeSeconds = 60 * 60 * 24 * 7

const missions = [
  {
    id: 'frontend-dashboard-performance',
    issue: '#102',
    track: 'Frontend',
    title: 'Repair a slow customer dashboard',
    company: 'B2B SaaS operations team',
    level: 'Junior+',
    estimate: '6-8 hours',
    repo: 'skillproof-labs/customer-dashboard',
    branch: 'fix/customer-dashboard-rendering',
    skills: ['React', 'API integration', 'Performance'],
    summary:
      'A customer table freezes when 500 records are loaded. Improve rendering, preserve the existing API contract, and document the performance tradeoffs.',
    deliverables: [
      'Refactor the dashboard into maintainable components',
      'Add loading, empty, and error states',
      'Reduce unnecessary rerenders during search and filtering',
    ],
    acceptance: [
      'Search and filtering stay responsive with 500 records',
      'No breaking change to the API response shape',
      'The PR includes before/after notes and basic UI tests',
    ],
  },
  {
    id: 'backend-monthly-reports',
    issue: '#118',
    track: 'Backend',
    title: 'Build a monthly reporting endpoint',
    company: 'Fintech internal tooling',
    level: 'Junior',
    estimate: '8-10 hours',
    repo: 'skillproof-labs/monthly-reports-api',
    branch: 'feature/monthly-report-endpoint',
    skills: ['Node.js', 'API design', 'PostgreSQL'],
    summary:
      'Operations needs an endpoint that returns monthly transaction totals by customer and status, with validation and predictable error responses.',
    deliverables: [
      'Create GET /api/reports/monthly',
      'Implement date filtering and grouped totals',
      'Return safe 400 responses for invalid input',
    ],
    acceptance: [
      'The endpoint returns total amount, count, and status breakdowns',
      'Invalid dates and missing required filters return clear errors',
      'At least four tests cover success and failure cases',
    ],
  },
  {
    id: 'fullstack-team-invites',
    issue: '#126',
    track: 'Full Stack',
    title: 'Ship team invitation flow',
    company: 'HR platform product team',
    level: 'Junior+',
    estimate: '10-12 hours',
    repo: 'skillproof-labs/team-invites',
    branch: 'feature/team-invitations',
    skills: ['React', 'Node.js', 'Auth flows'],
    summary:
      'A team admin needs to invite a colleague, assign a role, and track whether the invitation is pending or accepted.',
    deliverables: [
      'Build a validated invite form',
      'Create an invitation token API',
      'Show pending and accepted invitations in the UI',
    ],
    acceptance: [
      'Invalid email and missing role are blocked',
      'Invitation tokens are generated server-side',
      'The PR explains product decisions and security assumptions',
    ],
  },
  {
    id: 'data-ticket-priority',
    issue: '#133',
    track: 'Data',
    title: 'Classify support ticket priority',
    company: 'Support analytics team',
    level: 'Junior',
    estimate: '6-9 hours',
    repo: 'skillproof-labs/support-priority-model',
    branch: 'feature/ticket-priority-baseline',
    skills: ['Python', 'Pandas', 'Machine learning'],
    summary:
      'Use an anonymized support dataset to build a baseline model that predicts low, medium, or high ticket priority.',
    deliverables: [
      'Clean missing text and duplicate rows',
      'Train a simple baseline with a train/test split',
      'Explain precision, recall, and misclassified examples',
    ],
    acceptance: [
      'The notebook runs from top to bottom without broken cells',
      'Metrics are visible and explained in plain language',
      'The README explains how to reproduce the result',
    ],
  },
  {
    id: 'devops-github-actions-ci',
    issue: '#141',
    track: 'DevOps',
    title: 'Add CI to a React + API project',
    company: 'Developer experience team',
    level: 'Junior',
    estimate: '4-6 hours',
    repo: 'skillproof-labs/starter-ci',
    branch: 'chore/github-actions-ci',
    skills: ['GitHub Actions', 'CI', 'Testing'],
    summary:
      'A starter project works locally, but pull requests do not run automated checks. Add a workflow that protects main from broken changes.',
    deliverables: [
      'Run the workflow on pull_request',
      'Execute install, lint, tests, and build',
      'Add a status badge and contributor notes to the README',
    ],
    acceptance: [
      'The PR fails when lint or tests fail',
      'Dependency caching is enabled',
      'The README documents the check sequence',
    ],
  },
  {
    id: 'security-login-hardening',
    issue: '#149',
    track: 'Security',
    title: 'Harden a login form',
    company: 'Marketplace security team',
    level: 'Junior+',
    estimate: '7-9 hours',
    repo: 'skillproof-labs/login-hardening',
    branch: 'security/login-rate-limit',
    skills: ['OWASP', 'Node.js', 'Security testing'],
    summary:
      'A login endpoint allows unlimited failed attempts. Add practical protections while keeping normal sign-in smooth.',
    deliverables: [
      'Add rate limiting by IP and account',
      'Use generic errors that do not reveal whether an account exists',
      'Write tests for failed-attempt lockout behavior',
    ],
    acceptance: [
      'Brute-force attempts are blocked after a defined threshold',
      'Login errors do not leak account existence',
      'The PR documents remaining security risks',
    ],
  },
]

function createEmptyDb() {
  return { users: [], sessions: {}, submissions: [] }
}

function readDb() {
  if (!fs.existsSync(dbPath)) {
    return createEmptyDb()
  }

  return JSON.parse(fs.readFileSync(dbPath, 'utf8'))
}

function writeDb(db) {
  fs.mkdirSync(dataDir, { recursive: true })
  const tempPath = `${dbPath}.tmp`
  fs.writeFileSync(tempPath, `${JSON.stringify(db, null, 2)}\n`)
  fs.renameSync(tempPath, dbPath)
}

function sendJson(res, status, payload, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  })
  res.end(JSON.stringify(payload))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 1_000_000) {
        reject(new Error('Request body is too large'))
        req.destroy()
      }
    })

    req.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
  })
}

function randomId(prefix) {
  return `${prefix}_${crypto.randomBytes(16).toString('base64url')}`
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex')
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function verifyPassword(password, user) {
  const expected = Buffer.from(user.passwordHash, 'hex')
  const actual = Buffer.from(hashPassword(password, user.salt), 'hex')
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase()
}

function publicUser(user) {
  if (!user) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    headline: user.headline || '',
    githubUrl: user.githubUrl || '',
    createdAt: user.createdAt,
  }
}

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || '')
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const [key, ...value] = cookie.split('=')
        return [key, decodeURIComponent(value.join('='))]
      }),
  )
}

function sessionCookie(token) {
  const secure = process.env.COOKIE_SECURE === 'true' ? '; Secure' : ''
  return `sp_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${sessionMaxAgeSeconds}${secure}`
}

function clearSessionCookie() {
  return 'sp_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0'
}

function createSession(db, userId) {
  const token = crypto.randomBytes(32).toString('base64url')
  db.sessions[hashToken(token)] = {
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + sessionMaxAgeSeconds * 1000).toISOString(),
  }
  return token
}

function getSessionUser(req, db) {
  const token = parseCookies(req).sp_session
  if (!token) {
    return null
  }

  const tokenHash = hashToken(token)
  const session = db.sessions[tokenHash]
  if (!session || new Date(session.expiresAt).getTime() < Date.now()) {
    delete db.sessions[tokenHash]
    writeDb(db)
    return null
  }

  return db.users.find((user) => user.id === session.userId) || null
}

function isValidGithubPullRequest(url) {
  try {
    const parsed = new URL(url)
    return parsed.hostname === 'github.com' && parsed.pathname.includes('/pull/')
  } catch {
    return false
  }
}

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'same-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
}

async function handleApi(req, res, url) {
  const db = readDb()

  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true })
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/missions') {
    sendJson(res, 200, { missions })
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/auth/me') {
    const user = getSessionUser(req, db)
    if (!user) {
      sendJson(res, 401, { error: 'Not authenticated' })
      return
    }

    sendJson(res, 200, { user: publicUser(user) })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/signup') {
    const body = await readBody(req)
    const name = String(body.name || '').trim()
    const email = normalizeEmail(body.email)
    const password = String(body.password || '')
    const role = ['candidate', 'employer'].includes(body.role) ? body.role : 'candidate'

    if (name.length < 2) {
      sendJson(res, 400, { error: 'Name must be at least 2 characters.' })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sendJson(res, 400, { error: 'Enter a valid email address.' })
      return
    }

    if (password.length < 8) {
      sendJson(res, 400, { error: 'Password must be at least 8 characters.' })
      return
    }

    if (db.users.some((user) => user.email === email)) {
      sendJson(res, 409, { error: 'An account already exists for this email.' })
      return
    }

    const salt = crypto.randomBytes(16).toString('hex')
    const user = {
      id: randomId('usr'),
      name,
      email,
      role,
      headline: role === 'employer' ? 'Hiring team' : 'Junior developer',
      githubUrl: '',
      salt,
      passwordHash: hashPassword(password, salt),
      createdAt: new Date().toISOString(),
    }

    db.users.push(user)
    const token = createSession(db, user.id)
    writeDb(db)
    sendJson(res, 201, { user: publicUser(user) }, { 'Set-Cookie': sessionCookie(token) })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    const body = await readBody(req)
    const email = normalizeEmail(body.email)
    const password = String(body.password || '')
    const user = db.users.find((candidate) => candidate.email === email)

    if (!user || !verifyPassword(password, user)) {
      sendJson(res, 401, { error: 'Email or password is incorrect.' })
      return
    }

    const token = createSession(db, user.id)
    writeDb(db)
    sendJson(res, 200, { user: publicUser(user) }, { 'Set-Cookie': sessionCookie(token) })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/logout') {
    const token = parseCookies(req).sp_session
    if (token) {
      delete db.sessions[hashToken(token)]
      writeDb(db)
    }

    sendJson(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie() })
    return
  }

  if (req.method === 'PATCH' && url.pathname === '/api/profile') {
    const user = getSessionUser(req, db)
    if (!user) {
      sendJson(res, 401, { error: 'Not authenticated' })
      return
    }

    const body = await readBody(req)
    user.name = String(body.name || user.name).trim().slice(0, 80)
    user.headline = String(body.headline || '').trim().slice(0, 140)
    user.githubUrl = String(body.githubUrl || '').trim().slice(0, 200)

    writeDb(db)
    sendJson(res, 200, { user: publicUser(user) })
    return
  }

  if (req.method === 'GET' && url.pathname === '/api/submissions') {
    const user = getSessionUser(req, db)
    if (!user) {
      sendJson(res, 401, { error: 'Not authenticated' })
      return
    }

    sendJson(res, 200, {
      submissions: db.submissions
        .filter((submission) => submission.userId === user.id)
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)),
    })
    return
  }

  if (req.method === 'POST' && url.pathname === '/api/submissions') {
    const user = getSessionUser(req, db)
    if (!user) {
      sendJson(res, 401, { error: 'Not authenticated' })
      return
    }

    const body = await readBody(req)
    const mission = missions.find((item) => item.id === body.missionId)
    const pullRequestUrl = String(body.pullRequestUrl || '').trim()
    const githubRepo = String(body.githubRepo || '').trim()

    if (!mission) {
      sendJson(res, 400, { error: 'Choose a valid mission.' })
      return
    }

    if (!/^[\w.-]+\/[\w.-]+$/.test(githubRepo)) {
      sendJson(res, 400, { error: 'Use the repository format owner/repository.' })
      return
    }

    if (!isValidGithubPullRequest(pullRequestUrl)) {
      sendJson(res, 400, { error: 'Submit a valid GitHub pull request URL.' })
      return
    }

    const submission = {
      id: randomId('sub'),
      userId: user.id,
      missionId: mission.id,
      missionTitle: mission.title,
      githubRepo,
      pullRequestUrl,
      notes: String(body.notes || '').trim().slice(0, 1200),
      status: 'submitted',
      reviewScore: null,
      submittedAt: new Date().toISOString(),
    }

    db.submissions.push(submission)
    writeDb(db)
    sendJson(res, 201, { submission })
    return
  }

  sendJson(res, 404, { error: 'Not found' })
}

function contentType(filePath) {
  const ext = path.extname(filePath)
  return (
    {
      '.css': 'text/css; charset=utf-8',
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
    }[ext] || 'application/octet-stream'
  )
}

function serveStatic(req, res, url) {
  if (!fs.existsSync(distDir)) {
    sendJson(res, 404, { error: 'Client build not found. Run npm run build first.' })
    return
  }

  const requestedPath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)
  let filePath = path.normalize(path.join(distDir, requestedPath))

  if (!filePath.startsWith(distDir)) {
    sendJson(res, 403, { error: 'Forbidden' })
    return
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html')
  }

  res.writeHead(200, {
    'Content-Type': contentType(filePath),
    'Cache-Control': filePath.endsWith('index.html') ? 'no-store' : 'public, max-age=31536000, immutable',
  })
  fs.createReadStream(filePath).pipe(res)
}

const server = http.createServer(async (req, res) => {
  setSecurityHeaders(res)
  const url = new URL(req.url || '/', `http://${req.headers.host || `127.0.0.1:${port}`}`)

  try {
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url)
      return
    }

    if (req.method === 'GET' || req.method === 'HEAD') {
      serveStatic(req, res, url)
      return
    }

    sendJson(res, 405, { error: 'Method not allowed' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error'
    sendJson(res, message === 'Invalid JSON' ? 400 : 500, { error: message })
  }
})

server.listen(port, host, () => {
  console.log(`SkillProof API listening on http://${host}:${port}`)
})
