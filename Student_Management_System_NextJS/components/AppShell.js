'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Award, Bell, BookOpen, BookPlus, CalendarCheck, ChevronDown, ClipboardList, Home, LayoutGrid,
  Menu, PanelLeftClose, Plus, Presentation, Search, UserPlus, UserRound, Users, X,
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { PageProvider, usePageContext } from './PageContext';
import { Avatar, BrandLogo, Loading, cx } from './ui';
import { api } from '@/lib/api';

// Same menus as includes/header.jsp, grouped the way the mockup groups its sidebar.
const NAV = {
  admin: [
    { group: 'Overview', items: [{ href: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid }] },
    {
      group: 'Records',
      items: [
        { href: '/admin/manage-students', label: 'Students', icon: Users, count: 'studentCount', match: ['/admin/edit-student'] },
        { href: '/admin/manage-teachers', label: 'Teachers', icon: Presentation, count: 'teacherCount', match: ['/admin/edit-teacher'] },
        { href: '/admin/manage-courses', label: 'Courses', icon: BookOpen, count: 'courseCount', match: ['/admin/edit-course', '/admin/assign-teacher'] },
      ],
    },
  ],
  teacher: [
    { group: 'Overview', items: [{ href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutGrid }] },
    {
      group: 'Teaching',
      items: [
        { href: '/teacher/manage-grades', label: 'Grades', icon: ClipboardList },
        { href: '/teacher/manage-attendance', label: 'Attendance', icon: CalendarCheck, match: ['/teacher/take-attendance'] },
      ],
    },
  ],
  student: [
    { group: 'Overview', items: [{ href: '/student/dashboard', label: 'Dashboard', icon: LayoutGrid }] },
    {
      group: 'Academics',
      items: [
        { href: '/student/view-courses', label: 'My Courses', icon: BookOpen },
        { href: '/student/course-registration', label: 'Course Registration', icon: BookPlus },
        { href: '/student/view-grades', label: 'Grades', icon: Award },
        { href: '/student/view-attendance', label: 'Attendance', icon: CalendarCheck },
      ],
    },
  ],
};

// "+ New" quick actions per role
const NEW_ACTIONS = {
  admin: [
    { href: '/admin/manage-students?new=1', label: 'Add Student', icon: UserPlus, color: 'text-emerald-600' },
    { href: '/admin/manage-teachers?new=1', label: 'Add Teacher', icon: Presentation, color: 'text-blue-600' },
    { href: '/admin/manage-courses?new=1', label: 'Add Course', icon: BookOpen, color: 'text-amber-600' },
  ],
  teacher: [
    { href: '/teacher/manage-attendance', label: 'Take Attendance', icon: CalendarCheck, color: 'text-emerald-600' },
    { href: '/teacher/manage-grades', label: 'Enter Grades', icon: ClipboardList, color: 'text-blue-600' },
  ],
  student: [
    { href: '/student/course-registration', label: 'Enroll in a Course', icon: BookPlus, color: 'text-emerald-600' },
    { href: '/student/view-grades', label: 'Check Grades', icon: Award, color: 'text-blue-600' },
  ],
};

const ROLE_LABEL = { admin: 'Administrator', teacher: 'Teacher', student: 'Student' };
const NOTICE_SOURCE = {
  admin: ['/admin/dashboard', (d) => d.recentActivities.map((t) => ({ title: t }))],
  teacher: ['/teacher/dashboard', (d) => d.recentActivities.map((t) => ({ title: t }))],
  student: ['/student/dashboard', (d) => d.deadlines.map((n) => ({ title: n.title, sub: n.description }))],
};

const todayLabel = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

// Ref-based outside-click so popovers close reliably under the App Router.
function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

function Shell({ children }) {
  const { user, logout } = useAuth();
  const { meta, query, setQuery } = usePageContext();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [counts, setCounts] = useState({});
  const [notices, setNotices] = useState(null);
  const searchRef = useRef(null);
  const bell = usePopover();
  const newMenu = usePopover();
  const profile = usePopover();

  useEffect(() => setMobileOpen(false), [pathname]);

  // Admin sidebar shows live record counts.
  useEffect(() => {
    if (user.role !== 'admin') return;
    api('/admin/dashboard').then(setCounts).catch(() => {});
  }, [user.role, pathname]);

  const loadNotices = useCallback(() => {
    const [path, pick] = NOTICE_SOURCE[user.role] || [];
    if (!path || notices) return;
    api(path).then((d) => setNotices(pick(d))).catch(() => setNotices([]));
  }, [user.role, notices]);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  // ⌘K / Ctrl+K focuses search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const groups = NAV[user.role] || [];
  const isActive = (item) => pathname === item.href || (item.match || []).some((m) => pathname.startsWith(m));

  const navLink = (item) => {
    const Icon = item.icon;
    const active = isActive(item);
    const count = item.count && counts[item.count] != null ? counts[item.count] : null;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cx(
          'flex items-center justify-between gap-3 px-3.5 transition',
          active ? 'py-2.5 rounded-[10px] bg-[#7ee352] text-slate-950 font-bold' : 'py-2 rounded-[10px] text-slate-600 hover:text-slate-950 hover:bg-white/60 font-medium'
        )}
      >
        <span className="flex items-center gap-3">
          <Icon className={cx('w-4 h-4', active ? 'text-slate-950' : 'text-slate-500')} strokeWidth={active ? 2.5 : 2} />
          <span>{item.label}</span>
        </span>
        {count != null && <span className={cx('text-[11px] font-bold', active ? 'text-slate-900' : 'text-slate-400')}>{count}</span>}
      </Link>
    );
  };

  return (
    <div className="flex-1 w-full h-screen overflow-hidden flex flex-row">
      {/* mobile overlay */}
      <div
        className={cx('fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm lg:hidden', mobileOpen ? 'block' : 'hidden')}
        onClick={() => setMobileOpen(false)}
      />

      {/* Left Navigation Sidebar */}
      <aside
        className={cx(
          'w-64 bg-[#f5f6f8] flex-shrink-0 flex flex-col justify-between p-5 transition-all duration-300 select-none z-40',
          'fixed inset-y-0 left-0 lg:static',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed && 'lg:-ml-64'
        )}
      >
        <div className="space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between px-2 pt-1">
            <Link href={groups[0]?.items[0]?.href || '/'} className="flex items-center gap-2.5">
              <BrandLogo className="w-32 h-auto" />
            </Link>
            <button
              type="button"
              onClick={() => (mobileOpen ? setMobileOpen(false) : setCollapsed(true))}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
              title="Toggle Sidebar"
              aria-label="Hide sidebar"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          <nav className="space-y-5 text-xs">
            {groups.map((g) => (
              <div className="space-y-1" key={g.group}>
                <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{g.group}</div>
                {g.items.map(navLink)}
              </div>
            ))}
          </nav>
        </div>

        <div className="space-y-2 pt-4 text-xs font-medium">
          <Link href="/" className="flex items-center gap-3 px-3.5 py-2 rounded-[10px] text-slate-600 hover:text-slate-950 hover:bg-white/60 transition">
            <Home className="w-4 h-4 text-slate-500" />
            <span>Landing Page</span>
          </Link>
          {navLink({ href: '/profile', label: 'Profile', icon: UserRound })}
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 h-full overflow-y-auto bg-[#eceef0] p-6 lg:p-8 space-y-6 min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => (collapsed ? setCollapsed(false) : setMobileOpen(true))}
              className={cx('p-2 bg-white rounded-xl shadow-xs text-slate-700', collapsed ? 'inline-flex' : 'lg:hidden')}
              aria-label="Show sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 truncate">{meta.title || todayLabel()}</h1>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">{meta.subtitle || todayLabel()}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {meta.search && (
              <div className="relative flex-1 sm:w-64 max-w-xs">
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={meta.search}
                  aria-label={meta.search}
                  className="w-full bg-[#f4f5f7] border border-slate-200/80 rounded-full pl-9 pr-10 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition"
                />
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <div className="hidden sm:block absolute right-2.5 top-1.5 text-[10px] font-bold text-slate-400 px-1 py-0.5 rounded border border-slate-200 bg-white">⌘K</div>
              </div>
            )}

            {/* Notification Bell: role notices */}
            <div className="relative" ref={bell.ref}>
              <button
                type="button"
                onClick={() => { bell.setOpen((o) => !o); newMenu.setOpen(false); profile.setOpen(false); }}
                className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition relative"
                aria-label="Notices"
              >
                <Bell className="w-4 h-4" />
                {notices?.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 absolute top-2 right-2" />}
              </button>
              {bell.open && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl p-2 shadow-popover z-50 border border-slate-100 space-y-1 text-xs">
                  <div className="px-3 py-2 font-bold text-slate-950">Notices for {ROLE_LABEL[user.role].toLowerCase()}s</div>
                  <div className="h-px bg-slate-100 my-1" />
                  {notices === null ? (
                    <div className="px-3 py-2 text-slate-400">Loading…</div>
                  ) : notices.length === 0 ? (
                    <div className="px-3 py-2 text-slate-400">No notices right now.</div>
                  ) : (
                    notices.map((n) => (
                      <div key={n.title} className="px-3 py-2 rounded-xl hover:bg-slate-50">
                        <div className="font-semibold text-slate-800">{n.title}</div>
                        {n.sub && <div className="text-[11px] text-slate-500 mt-0.5">{n.sub}</div>}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* + New quick actions */}
            <div className="relative" ref={newMenu.ref}>
              <button
                type="button"
                onClick={() => { newMenu.setOpen((o) => !o); bell.setOpen(false); profile.setOpen(false); }}
                className="h-9 px-4 rounded-full bg-[#1e2229] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-subtle transition active:scale-[0.98]"
                aria-expanded={newMenu.open}
              >
                <Plus className={cx('w-3.5 h-3.5 transition-transform duration-200', newMenu.open && 'rotate-45')} strokeWidth={2.5} />
                <span>New</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>
              {newMenu.open && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl p-2 shadow-popover z-50 border border-slate-100 space-y-1 text-xs">
                  {(NEW_ACTIONS[user.role] || []).map(({ href, label, icon: Icon, color }) => (
                    <button
                      key={href}
                      type="button"
                      onClick={() => { newMenu.setOpen(false); router.push(href); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={cx('w-4 h-4', color)} />
                        <span>{label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile menu */}
            <div className="relative" ref={profile.ref}>
              <button
                type="button"
                onClick={() => { profile.setOpen((o) => !o); bell.setOpen(false); newMenu.setOpen(false); }}
                className="w-9 h-9 rounded-full ring-2 ring-[#e2e5e9] p-0.5 hover:ring-slate-900 transition flex items-center justify-center relative focus:outline-none"
                aria-label="Account menu"
              >
                <Avatar name={user.username} size="w-full h-full text-xs" dark />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-white" />
              </button>
              {profile.open && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl p-2 shadow-popover z-50 border border-slate-100 text-xs space-y-1">
                  <div className="px-3 py-2">
                    <div className="font-bold text-slate-950 truncate">Welcome, {user.username}</div>
                    <div className="text-[11px] text-slate-500">{ROLE_LABEL[user.role]}</div>
                  </div>
                  <div className="h-px bg-slate-100 my-1" />
                  <Link href="/profile" onClick={() => profile.setOpen(false)} className="block w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 transition">
                    Profile
                  </Link>
                  <button type="button" onClick={logout} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 font-semibold transition">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}

export default function AppShell({ children }) {
  const { user, ready } = useAuth();
  if (!ready || !user) return <Loading label="Checking your session…" />;
  return (
    <PageProvider>
      <Shell>{children}</Shell>
    </PageProvider>
  );
}
