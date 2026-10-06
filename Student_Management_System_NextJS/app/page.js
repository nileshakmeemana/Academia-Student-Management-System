import Link from 'next/link';
import { ArrowDown, ArrowRight, BarChart3, BookOpen, CalendarCheck, ClipboardList } from 'lucide-react';
import { PublicFooter, PublicHeader } from '@/components/PublicShell';

// index.jsp content in the mockup's landing layout
const FEATURES = [
  { icon: BookOpen, title: 'Course Management', text: 'Easily manage courses, assignments, and course materials. Track student progress and performance.', foot: 'Admins · Students' },
  { icon: ClipboardList, title: 'Grade Tracking', text: 'Record and monitor student grades, generate reports, and analyze academic performance.', foot: 'Teachers · Students' },
  { icon: CalendarCheck, title: 'Attendance Management', text: 'Track student attendance, generate attendance reports, and identify attendance patterns.', foot: 'Teachers · Students' },
  { icon: BarChart3, title: 'Reports & Analytics', text: 'Generate comprehensive reports and gain insights into student performance and institutional metrics.', foot: 'GPA · Credits · Rates' },
];

const WORKSPACES = [
  { n: '01 / Administrators', title: 'Manage the institution', text: 'Add, edit and remove students, teachers and courses, and assign a teacher to every course.' },
  { n: '02 / Teachers', title: 'Run your courses', text: 'Enter assignment, midterm and final scores, and take or correct attendance for any day.' },
  { n: '03 / Students', title: 'Follow your progress', text: 'Register for courses, and see your grades, GPA, credits earned and attendance rate.' },
];

export default function HomePage() {
  return (
    <>
      <PublicHeader showNav />
      <section className="w-full flex-1">
        <div className="w-full px-6 sm:px-10 lg:px-12 py-12 lg:py-20 max-w-7xl mx-auto space-y-24">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.12]">
              Welcome to Student Management System
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              A central platform for efficient management of student data, courses, grades, and attendance, optimizing administrative workflows.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link href="/login" className="h-11 px-6 rounded-xl bg-[#65d33a] hover:bg-[#5ec435] text-slate-950 font-bold text-xs sm:text-sm shadow-subtle transition active:scale-[0.98] flex items-center gap-2">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 text-slate-950" strokeWidth={2.5} />
              </Link>
              <Link href="/register" className="h-11 px-6 rounded-xl bg-[#1e2229] hover:bg-black text-white font-semibold text-xs sm:text-sm shadow-subtle transition active:scale-[0.98] flex items-center gap-2">
                <span>Create Your Account</span>
              </Link>
              <a href="#features" className="h-11 px-5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm shadow-subtle transition flex items-center gap-2">
                <ArrowDown className="w-4 h-4 text-slate-500" />
                <span>Learn More</span>
              </a>
            </div>
          </div>

          <div id="features" className="space-y-10 scroll-mt-24">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Features</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">Everything you need to manage your institution</h2>
              <p className="text-xs sm:text-sm text-slate-600">Courses, grades and attendance in one place, shared between admins, teachers and students.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map(({ icon: Icon, title, text, foot }) => (
                <div key={title} className="bg-white rounded-card p-6 shadow-subtle flex flex-col justify-between space-y-6 hover:shadow-float transition">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1e2229] text-white flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-950 tracking-tight">{title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400">{foot}</div>
                </div>
              ))}
            </div>
          </div>

          <div id="workspaces" className="space-y-10 scroll-mt-24">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Workspaces</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">One system, three roles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {WORKSPACES.map((w) => (
                <div key={w.n} className="bg-white/60 p-6 rounded-card space-y-3">
                  <div className="text-xs font-bold text-slate-400">{w.n}</div>
                  <h3 className="text-lg font-bold text-slate-950">{w.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{w.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">Ready to get started?</h2>
              <p className="text-xs sm:text-sm text-slate-600">Create your account today.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/register" className="h-11 px-6 rounded-xl bg-[#1e2229] hover:bg-black text-white font-semibold text-xs sm:text-sm shadow-subtle transition active:scale-[0.98] flex items-center gap-2">Sign Up</Link>
              <Link href="/login" className="h-11 px-5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm shadow-subtle transition flex items-center gap-2">Sign In</Link>
            </div>
          </div>
        </div>
        <PublicFooter />
      </section>
    </>
  );
}
