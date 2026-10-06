'use client';

import { useEffect, useState } from 'react';
import { BookPlus, CalendarCheck, CalendarDays, ChartColumn } from 'lucide-react';
import { usePage } from '@/components/PageContext';
import {
  Beacon, Card, CardHeader, Empty, ErrorCard, LinkButton, Loading, Meter, MiniStat, Table, Td, Tr, cx, useLoad,
} from '@/components/ui';
import { attendanceTone, dayName, pct, rateColor, rateLabel, rateTone } from '@/lib/format';

const CELL = {
  Present: 'bg-[#65d33a] text-slate-950 font-extrabold shadow-md',
  Late: 'bg-white/10 text-amber-300 font-bold',
  Absent: 'hatch-pattern text-slate-500',
};

export default function ViewAttendancePage() {
  usePage({ title: 'My Attendance', subtitle: 'Your attendance rate counts the days you were marked present' });
  const { data, loading, error } = useLoad('/student/attendance');
  const [tab, setTab] = useState(null);

  useEffect(() => {
    if (data?.courses?.length) setTab((cur) => cur || data.courses[0]._id);
  }, [data]);

  if (loading) return <Loading />;
  if (error) return <ErrorCard message={error} />;

  const courses = data.courses;
  const anyRecords = courses.some((c) => c.records.length > 0);
  const active = courses.find((c) => c._id === tab);

  return (
    <>
      <Card>
        <CardHeader icon={ChartColumn} title="Attendance Summary" subtitle="One row per enrolled course" />
        {courses.length === 0 ? (
          <Empty>
            <span>You are not enrolled in any courses yet.</span>
            <LinkButton variant="rowDark" href="/student/course-registration"><BookPlus className="w-3 h-3" />Register for Courses</LinkButton>
          </Empty>
        ) : (
          <div className="divide-y divide-slate-50">
            {courses.map((c) => (
              <div key={c._id} data-course={c.code} className="flex flex-wrap sm:flex-nowrap items-center gap-3 py-3 text-xs">
                <div className="w-full sm:w-64 min-w-0">
                  <div className="font-semibold text-slate-900">{c.code}</div>
                  <div className="text-[10px] text-slate-400 truncate">{c.name}</div>
                </div>
                <Meter value={c.percentage} color={rateColor(c.percentage)} />
                <span className="w-12 text-right font-bold text-slate-900 tabular-nums">{pct(c.percentage)}</span>
                <span className="w-32 text-right"><Beacon tone={rateTone(c.percentage)}>{rateLabel(c.percentage)}</Beacon></span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {anyRecords && (
        <>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Course">
            {courses.map((c) => (
              <button key={c._id} type="button" role="tab" aria-selected={c._id === tab} onClick={() => setTab(c._id)}
                className={cx('py-1.5 px-3.5 text-xs rounded-full transition',
                  c._id === tab ? 'bg-[#7ee352] text-slate-950 font-bold' : 'bg-white text-slate-600 font-medium hover:text-slate-950 shadow-subtle')}>
                {c.code}
              </button>
            ))}
          </div>

          {active && (active.records.length === 0 ? (
            <Card><Empty>No attendance records available for {active.name} yet.</Empty></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Dark attendance matrix, as in the mockup's "April Student Attendance" card */}
              <div className="md:col-span-4 bg-[#1e2229] text-white rounded-card p-5 shadow-subtle flex flex-col">
                <div className="flex items-center gap-2 pb-3">
                  <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                    <CalendarDays className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-xs font-bold tracking-tight text-white">{active.code} Attendance Days</h3>
                </div>
                <div className="pb-4">
                  <div className="text-3xl font-extrabold tracking-tight text-white">{pct(active.percentage)}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">attendance rate · {rateLabel(active.percentage)}</div>
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] mt-1">
                  {[...active.records].reverse().map((r) => (
                    <div key={r.date} title={`${r.date} · ${r.status}`}
                      className={cx('h-6 rounded-full flex items-center justify-center', CELL[r.status])}>
                      {Number(r.date.slice(8, 10))}
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-5 flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#65d33a]" />Present</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white/10 ring-1 ring-amber-300" />Late</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full hatch-pattern ring-1 ring-white/20" />Absent</span>
                </div>
              </div>

              <Card className="md:col-span-8">
                <CardHeader icon={CalendarCheck} title={active.name} subtitle="Detailed attendance records" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-4">
                  <MiniStat value={active.stats.total} label="Total Classes" tone="text-slate-900" />
                  <MiniStat value={active.stats.present} label="Present" />
                  <MiniStat value={active.stats.late} label="Late" tone="text-amber-700" />
                  <MiniStat value={active.stats.absent} label="Absent" tone="text-rose-600" />
                </div>
                <Table head={['Date', 'Day', 'Status']} minWidth={360}>
                  {active.records.map((r) => (
                    <Tr key={r.date}>
                      <Td className="font-semibold text-slate-900 tabular-nums">{r.date}</Td>
                      <Td>{dayName(r.date)}</Td>
                      <Td><Beacon tone={attendanceTone(r.status)}>{r.status}</Beacon></Td>
                    </Tr>
                  ))}
                </Table>
              </Card>
            </div>
          ))}
        </>
      )}
    </>
  );
}
