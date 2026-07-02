import { useMemo, useState } from 'react'

const disciplines = ['הכל', 'Frontend', 'Backend', 'Full Stack', 'Data', 'DevOps', 'Cyber']

const sampleTasks = [
  {
    issue: '#102',
    discipline: 'Frontend',
    title: 'תיקון דשבורד לקוחות איטי',
    company: 'SaaS B2B - משימה מדומה מתוך backlog אמיתי',
    estimate: '6-8 שעות',
    level: 'Junior+',
    repo: 'skillproof-labs/customer-dashboard',
    branch: 'fix/customer-dashboard-rendering',
    tags: ['React', 'API', 'Performance'],
    accent: 'sky',
    brief:
      'עמוד לקוחות נטען לאט וקופא כאשר יש 500 רשומות. צריך לשפר את חוויית השימוש בלי לשנות את ה-API הקיים.',
    work: [
      'לפצל את רכיב הטבלה לרכיבים קטנים וברורים',
      'להוסיף מצבי loading, empty ו-error',
      'למנוע רינדורים מיותרים בזמן חיפוש וסינון',
    ],
    acceptance: [
      'חיפוש וסינון מרגישים חלקים גם עם 500 רשומות',
      'אין שינוי בפורמט הנתונים שמגיע מהשרת',
      'נוספו בדיקות בסיסיות לרכיבי UI מרכזיים',
    ],
  },
  {
    issue: '#118',
    discipline: 'Backend',
    title: 'בניית endpoint לדוחות חודשיים',
    company: 'Fintech Ops - משימת API',
    estimate: '8-10 שעות',
    level: 'Junior',
    repo: 'skillproof-labs/monthly-reports-api',
    branch: 'feature/monthly-report-endpoint',
    tags: ['Node.js', 'Express', 'PostgreSQL'],
    accent: 'emerald',
    brief:
      'צוות operations צריך endpoint שמחזיר סיכום עסקאות לפי חודש, סטטוס ולקוח, עם ולידציה וטיפול בשגיאות.',
    work: [
      'להוסיף route חדש תחת /api/reports/monthly',
      'לכתוב שאילתת aggregation עם סינון לפי תאריכים',
      'להחזיר הודעות שגיאה ברורות לקלט לא תקין',
    ],
    acceptance: [
      'ה-endpoint מחזיר totals, count וחלוקה לפי status',
      'קלט חסר או תאריך לא תקין מחזירים 400',
      'יש לפחות 4 בדיקות שמכסות הצלחה וכישלון',
    ],
  },
  {
    issue: '#126',
    discipline: 'Full Stack',
    title: 'פיצ׳ר הזמנת חבר צוות',
    company: 'HR Tech - פיצ׳ר מוצר מלא',
    estimate: '10-12 שעות',
    level: 'Junior+',
    repo: 'skillproof-labs/team-invites',
    branch: 'feature/team-invitations',
    tags: ['React', 'Node.js', 'Auth'],
    accent: 'amber',
    brief:
      'מנהל צוות צריך להזמין משתמש חדש למערכת, לבחור לו role, ולראות סטטוס הזמנה עד להצטרפות.',
    work: [
      'לבנות טופס הזמנה עם ולידציה בצד לקוח',
      'להוסיף API ליצירת invitation token',
      'להציג רשימת הזמנות עם סטטוסים pending ו-accepted',
    ],
    acceptance: [
      'אי אפשר לשלוח הזמנה בלי email תקין ו-role',
      'token נשמר בשרת ומוחזר רק פעם אחת',
      'ה-PR כולל תיעוד קצר של החלטות המימוש',
    ],
  },
  {
    issue: '#133',
    discipline: 'Data',
    title: 'סיווג פניות תמיכה לפי דחיפות',
    company: 'Support Platform - משימת Data מעשית',
    estimate: '6-9 שעות',
    level: 'Junior',
    repo: 'skillproof-labs/support-priority-model',
    branch: 'feature/ticket-priority-baseline',
    tags: ['Python', 'Pandas', 'ML'],
    accent: 'rose',
    brief:
      'יש קובץ פניות תמיכה אנונימי. צריך לבנות baseline שמסווג פנייה לדחיפות נמוכה, בינונית או גבוהה.',
    work: [
      'לנקות טקסטים חסרים וכפילויות',
      'לבנות baseline פשוט עם train/test split',
      'להציג precision/recall והסבר קצר על tradeoffs',
    ],
    acceptance: [
      'ה-notebook רץ מהתחלה עד הסוף בלי תאים שבורים',
      'יש מטריקות ברורות וטבלת דוגמאות שגויות',
      'נכתב README שמסביר איך להריץ את המודל',
    ],
  },
  {
    issue: '#141',
    discipline: 'DevOps',
    title: 'הקמת CI לפרויקט React + API',
    company: 'Developer Tools - משימת תשתית',
    estimate: '4-6 שעות',
    level: 'Junior',
    repo: 'skillproof-labs/starter-ci',
    branch: 'chore/github-actions-ci',
    tags: ['GitHub Actions', 'CI', 'Testing'],
    accent: 'violet',
    brief:
      'פרויקט starter עובד מקומית, אבל אין בדיקות אוטומטיות ב-PR. צריך להוסיף workflow שמגן על main.',
    work: [
      'להגדיר workflow שרץ על pull_request',
      'להריץ install, lint, tests ו-build',
      'להוסיף badge ל-README והסבר קצר למפתחים',
    ],
    acceptance: [
      'PR נכשל אם lint או tests נכשלים',
      'ה-workflow משתמש ב-cache לתלויות',
      'README כולל צילום או תיאור של סטטוס הבדיקות',
    ],
  },
  {
    issue: '#149',
    discipline: 'Cyber',
    title: 'הקשחת טופס התחברות',
    company: 'Marketplace - משימת AppSec',
    estimate: '7-9 שעות',
    level: 'Junior+',
    repo: 'skillproof-labs/login-hardening',
    branch: 'security/login-rate-limit',
    tags: ['OWASP', 'Node.js', 'Security'],
    accent: 'cyan',
    brief:
      'טופס login קיים מאפשר ניסיונות חוזרים בלי הגבלה. צריך להוסיף הגנות בסיסיות בלי לפגוע בחוויית משתמש תקינה.',
    work: [
      'להוסיף rate limit לפי IP ומשתמש',
      'להחזיר הודעות שגיאה שלא חושפות אם המשתמש קיים',
      'לכתוב בדיקות שמוודאות חסימה אחרי ניסיונות כושלים',
    ],
    acceptance: [
      'ניסיון brute force נחסם אחרי סף מוגדר',
      'אין דליפת מידע דרך הודעות שגיאה',
      'ה-PR כולל הסבר קצר על סיכוני אבטחה שנותרו',
    ],
  },
]

const githubSteps = [
  {
    title: '1. בוחרים Issue',
    text: 'כל משימה נפתחת כ-GitHub Issue עם רקע, קבצי starter, דרישות וקריטריוני קבלה.',
  },
  {
    title: '2. עובדים על Branch',
    text: 'הג׳וניור עושה fork או מתחבר ל-repo, יוצר branch לפי שם המשימה, ומתקדם בקומיטים קטנים.',
  },
  {
    title: '3. פותחים Pull Request',
    text: 'ההגשה היא PR אמיתי: diff, בדיקות אוטומטיות, תיאור פתרון ושאלות פתוחות.',
  },
  {
    title: '4. מקבלים Review',
    text: 'SkillProof שומר בפרופיל קישור ל-PR, סטטוס checks, הערות review והוכחת ביצוע שניתן לשלוח למעסיק.',
  },
]

const accentClasses = {
  sky: {
    badge: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
    text: 'text-sky-300',
    button: 'border-sky-400/40 text-sky-100 hover:bg-sky-400/10',
  },
  emerald: {
    badge: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    text: 'text-emerald-300',
    button: 'border-emerald-400/40 text-emerald-100 hover:bg-emerald-400/10',
  },
  amber: {
    badge: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    text: 'text-amber-300',
    button: 'border-amber-400/40 text-amber-100 hover:bg-amber-400/10',
  },
  rose: {
    badge: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
    text: 'text-rose-300',
    button: 'border-rose-400/40 text-rose-100 hover:bg-rose-400/10',
  },
  violet: {
    badge: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
    text: 'text-violet-300',
    button: 'border-violet-400/40 text-violet-100 hover:bg-violet-400/10',
  },
  cyan: {
    badge: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
    text: 'text-cyan-300',
    button: 'border-cyan-400/40 text-cyan-100 hover:bg-cyan-400/10',
  },
}

function App() {
  const [selectedDiscipline, setSelectedDiscipline] = useState('הכל')

  const filteredTasks = useMemo(
    () =>
      selectedDiscipline === 'הכל'
        ? sampleTasks
        : sampleTasks.filter((task) => task.discipline === selectedDiscipline),
    [selectedDiscipline],
  )

  return (
    <div dir="rtl" className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-400/30">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/90 backdrop-blur">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6">
          <a href="#top" className="flex items-center gap-3" aria-label="SkillProof home">
            <img src="/favicon.svg" alt="" className="h-10 w-10" />
            <span dir="ltr" className="text-2xl font-bold text-white">
              SkillProof<span className="text-emerald-300">.</span>
            </span>
          </a>

          <div className="hidden items-center gap-7 text-sm font-medium text-zinc-300 md:flex">
            <a href="#missions" className="transition-colors hover:text-white">
              משימות לדוגמה
            </a>
            <a href="#github" className="transition-colors hover:text-white">
              GitHub
            </a>
            <a href="#employers" className="transition-colors hover:text-white">
              למעסיקים
            </a>
            <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-white transition-colors hover:text-emerald-200">
              התחברות
            </a>
            <a
              href="#missions"
              className="rounded-lg bg-emerald-300 px-5 py-2.5 font-bold text-zinc-950 transition-colors hover:bg-emerald-200"
            >
              להתחיל משימה
            </a>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="border-b border-white/10 bg-[linear-gradient(180deg,#09090b_0%,#111827_52%,#0a0a0a_100%)]">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-300"></span>
                ניסיון מעשי לג׳וניורים דרך משימות GitHub
              </div>

              <h1 className="max-w-4xl text-5xl font-bold leading-tight text-white md:text-6xl">
                הדרך הראשונה להוכיח ניסיון עוד לפני העבודה הראשונה.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300">
                SkillProof נותן לג׳וניורים משימות מוצר אמיתיות: issue ברור, starter repo, בדיקות, pull request ו-review.
                במקום עוד פרויקט צדדי כללי, מקבלים תוצר שאפשר להראות למעסיק.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#missions"
                  className="rounded-lg bg-white px-6 py-3.5 text-center text-base font-bold text-zinc-950 transition-colors hover:bg-zinc-200"
                >
                  לראות משימות לדוגמה
                </a>
                <a
                  href="#github"
                  className="rounded-lg border border-white/20 px-6 py-3.5 text-center text-base font-bold text-white transition-colors hover:bg-white/10"
                >
                  איך זה מתחבר ל-GitHub
                </a>
              </div>
            </div>

            <div dir="ltr" className="rounded-lg border border-white/10 bg-zinc-900 text-left shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-white">Pull Request Preview</p>
                  <p className="mt-1 text-xs text-zinc-400">skillproof-labs/customer-dashboard</p>
                </div>
                <span className="rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
                  checks passed
                </span>
              </div>

              <div className="px-5 py-5">
                <div className="border-b border-white/10 pb-5">
                  <p className="text-xs font-semibold uppercase text-zinc-500">Issue #102</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Fix slow customer dashboard rendering</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">
                    Candidates improve a real React workflow, document their decisions, and submit a focused PR.
                  </p>
                </div>

                <div className="grid gap-0 border-b border-white/10 sm:grid-cols-3">
                  {['lint', 'tests', 'build'].map((check) => (
                    <div key={check} className="border-white/10 py-4 text-center sm:border-l last:sm:border-l-0">
                      <p className="text-xs uppercase text-zinc-500">{check}</p>
                      <p className="mt-1 font-bold text-emerald-300">passed</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">Reviewer note</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">
                        Good state split and readable commits. Add one edge-case test before merge.
                      </p>
                    </div>
                    <span className="rounded-md bg-amber-300 px-2.5 py-1 text-xs font-bold text-zinc-950">review</span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs text-zinc-300">
                    branch: fix/customer-dashboard-rendering
                    <br />
                    files changed: 7 | additions: 214 | deletions: 63
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-zinc-950 py-18">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-6 md:grid-cols-3">
            {[
              ['6', 'משימות לדוגמה שמכסות תחומים שונים'],
              ['PR', 'כל תוצר מוגש כמו עבודה אמיתית'],
              ['Review', 'הוכחת יכולת שאפשר לשלוח למעסיקים'],
            ].map(([stat, label]) => (
              <div key={label} className="border-r-2 border-emerald-300 pr-5">
                <p className="text-4xl font-bold text-white">{stat}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="missions" className="bg-zinc-950 py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-6">
            <div className="max-w-3xl">
              <p className="text-sm font-bold text-emerald-300">משימות לדוגמה</p>
              <h2 className="mt-3 text-4xl font-bold leading-tight text-white">לא עוד ״תבנה Todo app״. משימות עם הקשר, דרישות ותוצר.</h2>
              <p className="mt-5 text-lg leading-8 text-zinc-400">
                כל משימה בנויה כמו ticket אמיתי: יש רקע עסקי, קוד קיים, קריטריוני קבלה, בדיקות, ותהליך הגשה דרך GitHub.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-2 rounded-lg border border-white/10 bg-zinc-900 p-2">
              {disciplines.map((discipline) => (
                <button
                  key={discipline}
                  type="button"
                  onClick={() => setSelectedDiscipline(discipline)}
                  className={`rounded-md px-4 py-2 text-sm font-bold transition-colors ${
                    selectedDiscipline === discipline
                      ? 'bg-white text-zinc-950'
                      : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {discipline}
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {filteredTasks.map((task) => {
                const accent = accentClasses[task.accent]

                return (
                  <article key={task.issue} className="rounded-lg border border-white/10 bg-zinc-900 p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-md border px-3 py-1 text-xs font-bold ${accent.badge}`}>
                            GitHub Issue {task.issue}
                          </span>
                          <span className="rounded-md border border-white/10 px-3 py-1 text-xs font-bold text-zinc-300">
                            {task.discipline}
                          </span>
                          <span className="rounded-md border border-white/10 px-3 py-1 text-xs font-bold text-zinc-300">
                            {task.level}
                          </span>
                        </div>
                        <h3 className="mt-4 text-2xl font-bold text-white">{task.title}</h3>
                        <p className="mt-2 text-sm text-zinc-500">{task.company}</p>
                      </div>
                      <div className="text-sm font-bold text-zinc-300">{task.estimate}</div>
                    </div>

                    <p className="mt-5 leading-7 text-zinc-300">{task.brief}</p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {task.tags.map((tag) => (
                        <span key={tag} className="rounded-md bg-black/30 px-3 py-1 text-xs font-semibold text-zinc-300">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 grid gap-6 md:grid-cols-2">
                      <div>
                        <h4 className={`text-sm font-bold ${accent.text}`}>מה עושים</h4>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
                          {task.work.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-500"></span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className={`text-sm font-bold ${accent.text}`}>קריטריוני קבלה</h4>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-300">
                          {task.acceptance.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="mt-1 text-emerald-300">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-5">
                      <div className="grid gap-3 text-sm text-zinc-400 sm:grid-cols-2">
                        <p>
                          Repo: <code className="text-zinc-200">{task.repo}</code>
                        </p>
                        <p>
                          Branch: <code className="text-zinc-200">{task.branch}</code>
                        </p>
                      </div>
                      <a
                        href="#github"
                        className={`mt-5 inline-flex rounded-lg border px-4 py-2.5 text-sm font-bold transition-colors ${accent.button}`}
                      >
                        לראות איך מגישים ב-GitHub
                      </a>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="github" className="bg-zinc-100 py-20 text-zinc-950">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-bold text-emerald-700">GitHub workflow</p>
              <h2 className="mt-3 text-4xl font-bold leading-tight">החיבור ל-GitHub הוא לא קישוט. הוא חלק מההוכחה.</h2>
              <p className="mt-5 text-lg leading-8 text-zinc-700">
                המטרה היא שמעסיק יראה לא רק ״עשיתי פרויקט״, אלא תהליך עבודה אמיתי: branch מסודר, commits, בדיקות,
                PR עם הסבר ויכולת לקבל review.
              </p>
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex rounded-lg bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800"
              >
                לפתוח GitHub
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {githubSteps.map((step) => (
                <div key={step.title} className="rounded-lg border border-zinc-300 bg-white p-5">
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-700">{step.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-7xl px-5 sm:px-6">
            <div className="grid gap-6 rounded-lg border border-zinc-300 bg-white p-5 lg:grid-cols-4">
              {[
                ['Candidate profile', 'קישורים ל-PRs, שפות, משימות שהושלמו וסטטוס review.'],
                ['Automatic checks', 'lint, tests ו-build רצים בכל הגשה לפני בדיקה אנושית.'],
                ['Reviewer rubric', 'קריטריונים אחידים: קריאות, בדיקות, הבנת דרישה ואיכות פתרון.'],
                ['Employer proof', 'מעסיק מקבל לינק נקי להוכחות, בלי לנחש לפי קורות חיים בלבד.'],
              ].map(([title, text]) => (
                <div key={title} className="border-b border-zinc-200 pb-4 last:border-b-0 lg:border-b-0 lg:border-l lg:pb-0 lg:pl-5 last:lg:border-l-0">
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="employers" className="border-y border-white/10 bg-zinc-950 py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold text-amber-300">למעסיקים</p>
              <h2 className="mt-3 text-4xl font-bold leading-tight text-white">מקבלים מועמדים שכבר נגעו בסוג העבודה שלכם.</h2>
              <p className="mt-5 text-lg leading-8 text-zinc-400">
                במקום לסנן רק לפי מוסד לימודים או שנות ניסיון, אפשר להציע משימה שמדמה בעיה אמיתית מהחברה,
                לקבל PR מסודר, ולראות איך המועמד חושב, בודק ומתקשר.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Sanitized tasks', 'הופכים backlog פנימי למשימה בטוחה שלא חושפת מידע רגיש.'],
                ['Signal stronger than CV', 'רואים diff, בדיקות, בחירות טכניות ויכולת תיקון אחרי review.'],
                ['Junior-friendly funnel', 'נותנים הזדמנות הוגנת בלי להוריד את הרף המקצועי.'],
                ['Reusable challenge bank', 'בונים ספריית משימות לפי צוות, תחום ורמת קושי.'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-lg border border-white/10 bg-zinc-900 p-5">
                  <h3 className="font-bold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-zinc-950 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="" className="h-7 w-7" />
            <span className="font-bold text-white">SkillProof</span>
          </div>
          <p>© {new Date().getFullYear()} SkillProof. Practical proof for junior developers.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
