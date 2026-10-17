import Link from 'next/link';
import {
  ArrowDown, ArrowRight, BookOpen, CalendarCheck, ChartColumn, Check, CircleCheck, ClipboardCheck, House, Users,
} from 'lucide-react';
import { PublicFooter, PublicHeader } from '@/components/PublicShell';
import { btnClass, cx } from '@/components/styles';
import { BRAND } from '@/lib/brand';

// index.jsp content in the academia.html landing layout
const DOT = {
  brand: 'bg-brand-500',
  blue: 'bg-[#2e90fa]',
  indigo: 'bg-[#6172f3]',
  pink: 'bg-[#ee46bc]',
  orange: 'bg-[#ef6820]',
  green: 'bg-emerald-500',
};

const FEATURES = [
  { icon: BookOpen, title: 'Course Management', text: 'Easily manage courses, assignments, and course materials. Track student progress and performance.', tags: [['Admins', 'brand'], ['Students', 'blue']] },
  { icon: ClipboardCheck, title: 'Grade Tracking', text: 'Record and monitor student grades, generate reports, and analyze academic performance.', tags: [['Teachers', 'indigo'], ['Students', 'blue']] },
  { icon: CalendarCheck, title: 'Attendance Management', text: 'Track student attendance, generate attendance reports, and identify attendance patterns.', tags: [['Teachers', 'indigo'], ['Students', 'blue']] },
  { icon: ChartColumn, title: 'Reports & Analytics', text: 'Generate comprehensive reports and gain insights into student performance and institutional metrics.', tags: [['GPA', 'pink'], ['Credits', 'orange'], ['Rates', 'green']] },
];

const ROLES = [
  { n: '01', who: 'Administrators', icon: Users, title: 'Manage the institution', text: 'Add, edit and remove students, teachers and courses, and assign a teacher to every course.', items: ['Student & teacher records', 'Course catalogue', 'Teacher assignments'] },
  { n: '02', who: 'Teachers', icon: ClipboardCheck, title: 'Run your courses', text: 'Enter assignment, midterm and final scores, and take or correct attendance for any day.', items: ['Assignment, midterm & final scores', 'Daily attendance', 'Corrections for any day'] },
  { n: '03', who: 'Students', icon: BookOpen, title: 'Follow your progress', text: 'Register for courses, and see your grades, GPA, credits earned and attendance rate.', items: ['Course registration', 'Grades, GPA & credits', 'Attendance rate'] },
];

const PREVIEW_NAV = [
  [House, 'Home'],
  [ChartColumn, 'Dashboard', true],
  [BookOpen, 'Courses'],
  [ClipboardCheck, 'Grades'],
  [CalendarCheck, 'Attendance'],
  [Users, 'Students'],
];
const PREVIEW_STATS = [['Students', '1,248', '↑ 6.2%'], ['Active courses', '64', '↑ 4'], ['Average GPA', '3.42', '↑ 0.08'], ['Attendance rate', '94%', '↑ 1.4%']];
const PREVIEW_GRADES = [['NP', 'Nimal Perera', 'A', 'g'], ['SF', 'Shalini Fernando', 'A-', 'b'], ['KS', 'Kavindu Silva', 'B+', 'g'], ['TJ', 'Tharushi Jayasinghe', 'C+', 'a']];
const CHIP = {
  g: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  a: 'text-[#b54708] bg-[#fffaeb] border-[#fedf89]',
  b: 'text-brand-700 bg-brand-50 border-brand-200',
};

const iconTile = 'w-10 h-10 rounded-[10px] grid place-items-center bg-white text-slate-700 shadow-skeuo';

function Tag({ label, tone }) {
  return (
    <span className="inline-flex items-center gap-[5px] px-[7px] py-px rounded-md border border-slate-300 shadow-xs text-xs leading-[18px] font-medium text-slate-700">
      <i className={cx('block w-1.5 h-1.5 rounded-full', DOT[tone])} />
      {label}
    </span>
  );
}

function SectionHead({ eyebrow, title, text }) {
  return (
    <div className="text-center max-w-[720px] mx-auto">
      <div className="text-sm font-semibold text-brand-700">{eyebrow}</div>
      <h2 className="mt-2.5 text-[26px] leading-[34px] sm:text-[32px] sm:leading-10 font-semibold tracking-[-0.02em] text-slate-900">{title}</h2>
      <p className="mt-3.5 text-[15px] sm:text-base leading-6 text-slate-600">{text}</p>
    </div>
  );
}

// Static product illustration (the mockup's hero screen)
function Preview() {
  return (
    <div className="relative mt-10 sm:mt-14 after:absolute after:inset-x-0 after:bottom-0 after:h-36 after:bg-gradient-to-b after:from-white/0 after:to-white after:pointer-events-none" aria-hidden="true">
      <div className="max-w-[1024px] mx-auto p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 shadow-2xl">
        <div className="grid min-[901px]:grid-cols-[184px_1fr] bg-white border border-slate-200 rounded-[10px] overflow-hidden min-h-[420px] text-left">
          <div className="hidden min-[901px]:block border-r border-slate-200 px-2.5 py-4">
            <div className="flex items-center gap-2 px-1.5 text-13 font-semibold text-slate-900">
              <img src="/Logo.png" alt={BRAND} className="h-[22px] w-auto object-contain" />
            </div>
            <div className="mt-[18px] grid gap-0.5">
              {PREVIEW_NAV.map(([Icon, label, on]) => (
                <div key={label} className={cx('flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-semibold text-slate-700', on && 'bg-slate-100')}>
                  <Icon className="w-4 h-4 text-slate-400" strokeWidth={1.75} />{label}
                </div>
              ))}
            </div>
          </div>
          <div className="p-3.5 sm:px-[22px] sm:py-5 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-[15px] font-semibold text-slate-900">Overview</h4>
              <div className="hidden sm:inline-flex border border-slate-200 rounded-[7px] bg-slate-50">
                {['Semester', '30 days', '7 days'].map((s, i) => (
                  <span key={s} className={cx('-m-px px-[9px] py-1 rounded-md border text-[11px] font-semibold', i === 0 ? 'bg-white text-slate-700 border-slate-300' : 'border-transparent text-slate-500')}>{s}</span>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 min-[1081px]:grid-cols-4 gap-2.5">
              {PREVIEW_STATS.map(([l, v, t]) => (
                <div key={l} className="border border-slate-200 rounded-[10px] p-3 shadow-xs">
                  <div className="text-[11px] leading-4 font-medium text-slate-600">{l}</div>
                  <div className="mt-1 flex items-baseline gap-1.5 text-xl leading-[26px] font-semibold tracking-[-0.01em] text-slate-900">
                    {v} <span className="text-[11px] font-medium text-emerald-600">{t}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid sm:grid-cols-[1.5fr_1fr] gap-2.5">
              <div className="border border-slate-200 rounded-[10px] p-3 shadow-xs min-w-0">
                <h5 className="text-xs font-semibold text-slate-900">Attendance trend</h5>
                <div className="text-[11px] text-slate-500">Weekly average across all courses</div>
                <svg className="mt-2.5 w-full h-[120px] block" viewBox="0 0 400 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#7f56d9" stopOpacity=".14" />
                      <stop offset="1" stopColor="#7f56d9" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <g stroke="#f5f5f5"><line x1="0" x2="400" y1="30" y2="30" /><line x1="0" x2="400" y1="60" y2="60" /><line x1="0" x2="400" y1="90" y2="90" /></g>
                  <path d="M0 78 L36 72 L73 75 L109 64 L145 68 L182 55 L218 58 L255 46 L291 50 L327 38 L364 34 L400 28 L400 120 L0 120Z" fill="url(#pg)" />
                  <path d="M0 78 L36 72 L73 75 L109 64 L145 68 L182 55 L218 58 L255 46 L291 50 L327 38 L364 34 L400 28" fill="none" stroke="#7f56d9" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
              <div className="border border-slate-200 rounded-[10px] p-3 shadow-xs min-w-0">
                <h5 className="text-xs font-semibold text-slate-900">Recent grades</h5>
                <div className="text-[11px] text-slate-500">Midterm results</div>
                <div className="mt-2 divide-y divide-slate-100">
                  {PREVIEW_GRADES.map(([ini, name, g, c]) => (
                    <div key={name} className="flex items-center gap-2 py-[7px]">
                      <span className="w-[22px] h-[22px] rounded-full grid place-items-center text-[9px] font-semibold text-brand-700 bg-brand-50 shrink-0">{ini}</span>
                      <span className="flex-1 min-w-0 truncate text-[11px] font-medium text-slate-900">{name}</span>
                      <span className={cx('text-[10px] leading-4 font-medium px-1.5 rounded-full border', CHIP[c])}>{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="bg-white text-slate-900">
      <PublicHeader />
      <main>
        {/* Hero */}
        <section className="relative pt-12 sm:pt-[72px] overflow-hidden">
          <div className="hero-grid absolute inset-x-0 top-0 h-[560px] pointer-events-none" />
          <div className="relative max-w-[1200px] mx-auto px-4 sm:px-7">
            <div className="text-center max-w-[768px] mx-auto">
              <a href="#workspaces" className="inline-flex items-center gap-2 pl-1 pr-2.5 py-1 border border-slate-300 rounded-[10px] bg-white shadow-xs text-xs sm:text-13 font-medium text-slate-700 hover:bg-slate-50 transition">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-slate-300 rounded-md shadow-xs">
                  <i className="block w-1.5 h-1.5 rounded-full bg-emerald-500 ring-[3px] ring-emerald-100" />New
                </span>
                Built for admins, teachers &amp; students
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <h1 className="mt-4 text-[34px] leading-[42px] sm:text-5xl sm:leading-[58px] font-semibold tracking-[-0.02em] text-slate-900 [text-wrap:balance]">
                Welcome to Student Management System
              </h1>
              <p className="mt-4 sm:mt-5 mx-auto max-w-[600px] text-base sm:text-[17px] leading-6 sm:leading-[27px] text-slate-600">
                A central platform for efficient management of student data, courses, grades, and attendance, optimizing administrative workflows.
              </p>

              <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/login" className={cx(btnClass('primary'), 'h-11 px-4 text-[15px] gap-2')}>
                  Get started<ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/register" className={cx(btnClass('secondary'), 'h-11 px-4 text-[15px]')}>Create your account</Link>
                <a href="#features" className={cx(btnClass('ghost'), 'h-11 px-4 text-[15px] gap-2')}>
                  <ArrowDown className="w-4 h-4" />Learn more
                </a>
              </div>

              <div className="mt-7 flex justify-center flex-wrap gap-x-6 gap-y-2.5 text-13 text-slate-600">
                {['Courses & enrolment', 'GPA & credits', 'Daily attendance'].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <CircleCheck className="w-4 h-4 text-emerald-500" />{t}
                  </span>
                ))}
              </div>
            </div>

            <Preview />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-16 sm:py-[88px] scroll-mt-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-7">
            <SectionHead eyebrow="Features" title="Everything you need to manage your institution" text="Courses, grades and attendance in one place, shared between admins, teachers and students." />
            <div className="mt-9 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 min-[1081px]:grid-cols-4 gap-3.5 sm:gap-5">
              {FEATURES.map(({ icon: Icon, title, text, tags }) => (
                <article key={title} className="flex flex-col p-5 bg-white border border-slate-200 rounded-xl shadow-xs transition hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5">
                  <span className={iconTile}><Icon className="w-5 h-5" /></span>
                  <h3 className="mt-5 text-base font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-[22px] text-slate-600 flex-1">{text}</p>
                  <div className="mt-[18px] flex flex-wrap gap-1.5">
                    {tags.map(([l, t]) => <Tag key={l} label={l} tone={t} />)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Workspaces */}
        <section id="workspaces" className="py-16 sm:py-[88px] bg-slate-50 border-y border-slate-200 scroll-mt-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-7">
            <SectionHead eyebrow="Workspaces" title="One system, three roles" text="Every user signs in to a workspace built around what they need to do." />
            <div className="mt-9 sm:mt-14 grid grid-cols-1 min-[901px]:grid-cols-3 gap-3.5 sm:gap-5 max-w-[560px] min-[901px]:max-w-none mx-auto">
              {ROLES.map(({ n, who, icon: Icon, title, text, items }) => (
                <article key={n} className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-13 font-semibold text-slate-500"><b className="font-semibold text-brand-700">{n}</b> / {who}</span>
                    <span className={iconTile}><Icon className="w-5 h-5" /></span>
                  </div>
                  <h3 className="mt-[18px] text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-[22px] text-slate-600">{text}</p>
                  <ul className="mt-[18px] pt-[18px] border-t border-slate-200 grid gap-2.5">
                    {items.map((it) => (
                      <li key={it} className="flex gap-2.5 text-sm text-slate-600">
                        <span className="w-5 h-5 rounded-full grid place-items-center bg-brand-50 text-brand-600 shrink-0">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </span>
                        {it}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-[88px]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-7">
            <div className="flex flex-col min-[901px]:flex-row min-[901px]:items-center justify-between gap-8 px-5 py-7 sm:p-10 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <h2 className="text-[22px] leading-[30px] sm:text-[26px] sm:leading-[34px] font-semibold tracking-[-0.02em] text-slate-900">Ready to get started?</h2>
                <p className="mt-2 text-base text-slate-600">Create your account today.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link href="/login" className={cx(btnClass('secondary'), 'h-11 px-4 text-[15px]')}>Sign in</Link>
                <Link href="/register" className={cx(btnClass('primary'), 'h-11 px-4 text-[15px]')}>Sign up</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
