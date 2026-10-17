'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Award, Bell, BookOpen, BookPlus, CalendarCheck, ChevronDown, ChevronsUpDown, ClipboardList, House, LayoutGrid,
  LogOut, Menu, Plus, Presentation, Search, Settings, UserPlus, Users, X,
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { PageProvider, usePageContext } from './PageContext';
import { Avatar, BrandLogo, Loading, btnClass, cx } from './ui';
import { api } from '@/lib/api';

// Same menus as includes/header.jsp, as the flat sidebar list from academia.html.
const NAV = {
  admin: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/admin/manage-students', label: 'Students', icon: Users, count: 'studentCount', match: ['/admin/edit-student'] },
    { href: '/admin/manage-teachers', label: 'Teachers', icon: Presentation, count: 'teacherCount', match: ['/admin/edit-teacher'] },
    { href: '/admin/manage-courses', label: 'Courses', icon: BookOpen, count: 'courseCount', match: ['/admin/edit-course', '/admin/assign-teacher'] },
  ],
  teacher: [
    { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/teacher/manage-grades', label: 'Grades', icon: ClipboardList },
    { href: '/teacher/manage-attendance', label: 'Attendance', icon: CalendarCheck, match: ['/teacher/take-attendance'] },
  ],
  student: [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/student/view-courses', label: 'My Courses', icon: BookOpen },
    { href: '/student/course-registration', label: 'Course Registration', icon: BookPlus },
    { href: '/student/view-grades', label: 'Grades', icon: Award },
    { href: '/student/view-attendance', label: 'Attendance', icon: CalendarCheck },
  ],
};

const FOOT_NAV = [
  { href: '/', label: 'Landing page', icon: House },
  { href: '/profile', label: 'Profile & settings', icon: Settings },
];

// "+ New" quick actions per role
const NEW_ACTIONS = {
  admin: [
    { href: '/admin/manage-students?new=1', label: 'Add student', icon: UserPlus },
    { href: '/admin/manage-teachers?new=1', label: 'Add teacher', icon: Presentation },
    { href: '/admin/manage-courses?new=1', label: 'Add course', icon: BookOpen },
  ],
  teacher: [
    { href: '/teacher/manage-attendance', label: 'Take attendance', icon: CalendarCheck },
    { href: '/teacher/manage-grades', label: 'Enter grades', icon: ClipboardList },
  ],
  student: [
    { href: '/student/course-registration', label: 'Enroll in a course', icon: BookPlus },
    { href: '/student/view-grades', label: 'Check grades', icon: Award },
  ],
};

const ROLE_LABEL = { admin: 'Administrator', teacher: 'Teacher', student: 'Student' };
const NOTICE_SOURCE = {
  admin: ['/admin/dashboard', (d) => d.recentActivities.map((t) => ({ title: t }))],
  teacher: ['/teacher/dashboard', (d) => d.recentActivities.map((t) => ({ title: t }))],
  student: ['/student/dashboard', (d) => d.deadlines.map((n) => ({ title: n.title, sub: n.description }))],
};

const POPOVER = 'absolute z-50 bg-white rounded-xl border border-slate-200 shadow-lg p-1.5 text-sm';
const MENU_ITEM = 'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-slate-700 font-medium hover:bg-slate-50 transition text-left [&_svg]:text-slate-400';

const todayLabel = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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
  const [navOpen, setNavOpen] = useState(false);
  const [navFilter, setNavFilter] = useState('');
  const [counts, setCounts] = useState({});
  const [notices, setNotices] = useState(null);
  const searchRef = useRef(null);
  const bell = usePopover();
  const newMenu = usePopover();
  const account = usePopover();

  useEffect(() => {
    setNavOpen(false);
    setNavFilter('');
  }, [pathname]);

  // Lock page scroll while the mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [navOpen]);

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
        if (window.innerWidth < 1024) setNavOpen(true);
        setTimeout(() => searchRef.current?.focus(), 0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // The sidebar search filters the table on pages that have one, otherwise the menu.
  const pageSearch = Boolean(meta.search);
  const searchValue = pageSearch ? query : navFilter;
  const onSearch = (v) => (pageSearch ? setQuery(v) : setNavFilter(v));
  const navItems = (NAV[user.role] || []).filter(
    (i) => pageSearch || !navFilter.trim() || i.label.toLowerCase().includes(navFilter.trim().toLowerCase())
  );
  const isActive = (item) =>
    pathname === item.href || (item.href !== '/' && (item.match || []).some((m) => pathname.startsWith(m)));

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
          'flex items-center gap-3 px-3 py-[7px] rounded-md text-sm font-semibold transition-colors',
          active ? 'bg-slate-100 text-slate-800' : 'text-slate-700 hover:bg-slate-50'
        )}
      >
        <Icon className={cx('w-5 h-5 shrink-0', active ? 'text-slate-500' : 'text-slate-400')} strokeWidth={1.75} />
        <span className="truncate">{item.label}</span>
        {count != null && (
          <span className="ml-auto min-w-[22px] px-1.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 text-center tabular-nums">
            {count}
          </span>
        )}
      </Link>
    );
  };

  const closeAll = () => {
    bell.setOpen(false);
    newMenu.setOpen(false);
    account.setOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-40 h-14 bg-white border-b border-slate-200 flex items-center justify-between pl-4 pr-3">
        <Link href={NAV[user.role]?.[0]?.href || '/'}>
          <BrandLogo size="w-[25px] h-[25px]" className="text-sm" />
        </Link>
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Overlay (mobile) */}
      <div
        className={cx(
          'lg:hidden fixed inset-0 z-[45] bg-slate-950/60 backdrop-blur-[4px] transition-opacity',
          navOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setNavOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 w-[228px] bg-white border-r border-slate-200 flex flex-col pt-[18px] pb-3.5 transition-transform duration-[250ms]',
          navOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {navOpen && (
          <button
            type="button"
            onClick={() => setNavOpen(false)}
            className="lg:hidden absolute top-3 -right-12 w-9 h-9 rounded-lg flex items-center justify-center text-white hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="px-3.5">
          <Link href={NAV[user.role]?.[0]?.href || '/'} className="flex pl-0.5">
            <BrandLogo size="w-[25px] h-[25px]" className="text-sm" />
          </Link>

          <label className="mt-[18px] flex items-center gap-2 h-[35px] pl-[11px] pr-[7px] border border-slate-300 rounded-[7px] shadow-xs text-slate-500 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/[0.18] transition">
            <Search className="w-4 h-4 shrink-0" />
            <input
              ref={searchRef}
              type="search"
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={meta.search || 'Search'}
              aria-label={meta.search || 'Search menu'}
              className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-slate-900 placeholder:text-slate-500 [&::-webkit-search-cancel-button]:hidden"
            />
            <kbd className="hidden sm:inline text-xs font-medium text-slate-500 border border-slate-200 rounded px-1 font-sans">⌘K</kbd>
          </label>
        </div>

        <nav className="mt-[18px] px-[11px] flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(navLink)}
          {navItems.length === 0 && <div className="px-3 py-2 text-sm text-slate-500">No matches</div>}
        </nav>

        <div className="mt-auto px-[11px] pt-4">
          <div className="flex flex-col gap-0.5 mb-[18px]">{FOOT_NAV.map(navLink)}</div>

          {/* Account card */}
          <div className="relative" ref={account.ref}>
            <button
              type="button"
              onClick={() => { const o = !account.open; closeAll(); account.setOpen(o); }}
              className="w-full flex items-center gap-[11px] p-[11px] pr-8 border border-slate-200 rounded-[11px] text-left hover:bg-slate-50 transition relative"
              aria-expanded={account.open}
              aria-label="Account menu"
            >
              <Avatar name={user.username} size="w-[35px] h-[35px] text-13" online />
              <span className="min-w-0 flex-1">
                <span className="block text-13 font-semibold text-slate-900 truncate">{user.username}</span>
                <span className="block text-13 text-slate-600 truncate">{user.email}</span>
              </span>
              <ChevronsUpDown className="absolute top-3 right-2.5 w-4 h-4 text-slate-400" />
            </button>
            {account.open && (
              <div className={cx(POPOVER, 'bottom-full mb-2 left-0 right-0')}>
                <div className="px-2.5 py-2">
                  <div className="font-semibold text-slate-900 truncate">{user.username}</div>
                  <div className="text-13 text-slate-600">{ROLE_LABEL[user.role]}</div>
                </div>
                <div className="h-px bg-slate-200 my-1 -mx-1.5" />
                <Link href="/profile" onClick={() => account.setOpen(false)} className={MENU_ITEM}>
                  <Settings className="w-4 h-4" />Profile &amp; settings
                </Link>
                <button type="button" onClick={logout} className={MENU_ITEM}>
                  <LogOut className="w-4 h-4" />Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="lg:ml-[228px] min-w-0 px-4 pt-5 pb-9 sm:px-7 sm:pt-7 sm:pb-11 lg:pl-[30px]">
        <div className="max-w-[1138px] space-y-6 lg:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold tracking-[-0.01em] text-slate-900">{meta.title || 'Dashboard'}</h1>
              <p className="text-sm text-slate-600 mt-1">{meta.subtitle || todayLabel()}</p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Notices */}
              <div className="relative" ref={bell.ref}>
                <button
                  type="button"
                  onClick={() => { const o = !bell.open; closeAll(); bell.setOpen(o); }}
                  className={cx(btnClass('secondary'), 'w-10 !px-0 relative')}
                  aria-label="Notices"
                  aria-expanded={bell.open}
                >
                  <Bell className="w-[18px] h-[18px]" />
                  {notices?.length > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white" />}
                </button>
                {bell.open && (
                  <div className={cx(POPOVER, 'left-0 sm:left-auto sm:right-0 mt-2 w-80 max-w-[calc(100vw-2rem)]')}>
                    <div className="px-2.5 py-2 font-semibold text-slate-900">Notices for {ROLE_LABEL[user.role].toLowerCase()}s</div>
                    <div className="h-px bg-slate-200 my-1 -mx-1.5" />
                    {notices === null ? (
                      <div className="px-2.5 py-2 text-slate-500">Loading…</div>
                    ) : notices.length === 0 ? (
                      <div className="px-2.5 py-2 text-slate-500">No notices right now.</div>
                    ) : (
                      notices.map((n) => (
                        <div key={n.title} className="px-2.5 py-2 rounded-md hover:bg-slate-50 flex gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-[7px] shrink-0" />
                          <span>
                            <span className="block font-medium text-slate-800">{n.title}</span>
                            {n.sub && <span className="block text-13 text-slate-600 mt-0.5">{n.sub}</span>}
                          </span>
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
                  onClick={() => { const o = !newMenu.open; closeAll(); newMenu.setOpen(o); }}
                  className={btnClass('primary')}
                  aria-expanded={newMenu.open}
                >
                  <Plus className="w-4 h-4" strokeWidth={2.25} />
                  <span>New</span>
                  <ChevronDown className={cx('w-4 h-4 text-white/70 transition-transform', newMenu.open && 'rotate-180')} />
                </button>
                {newMenu.open && (
                  <div className={cx(POPOVER, 'left-0 sm:left-auto sm:right-0 mt-2 w-56')}>
                    {(NEW_ACTIONS[user.role] || []).map(({ href, label, icon: Icon }) => (
                      <button key={href} type="button" onClick={() => { newMenu.setOpen(false); router.push(href); }} className={MENU_ITEM}>
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {children}
        </div>
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
