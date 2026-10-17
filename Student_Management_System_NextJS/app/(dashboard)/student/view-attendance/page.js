'use client';

import { useEffect, useState } from 'react';
import { BookPlus, CalendarCheck, CalendarDays, ChartColumn } from 'lucide-react';
import { usePage } from '@/components/PageContext';
import {
  Beacon, Card, CardHeader, Empty, ErrorCard, LinkButton, Loading, Meter, Metric, MiniStat, Segmented, Table, Td, Tr, cx, useLoad,
} from '@/components/ui';
import { attendanceTone, dayName, pct, rateColor, rateLabel, rateTone } from '@/lib/format';

const CELL = {
  Present: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  Late: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  Absent: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
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
            <LinkButton variant="rowDark" href="/student/course-registration"><BookPlus className="w-4 h-4" />Register for courses</LinkButton>
          </Empty>
        ) : (
          <div className="divide-y divide-slate-200 -mt-3">
            {courses.map((c) => (
              <div key={c._id} data-course={c.code} className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 py-3.5 text-sm">
                <div className="w-full sm:w-64 min-w-0">
                  <div className="font-medium text-slate-900">{c.code}</div>
                  <div className="text-slate-600 truncate">{c.name}</div>
                </div>
                <Meter value={c.percentage} color={rateColor(c.percentage)} />
                <span className="w-14 text-right font-medium text-slate-900 tabular-nums">{pct(c.percentage)}</span>
                <span className="w-36 text-right"><Beacon tone={rateTone(c.percentage)}>{rateLabel(c.percentage)}</Beacon></span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {anyRecords && (
        <>
          <Segmented label="Course" value={tab} onChange={setTab} items={courses.map((c) => ({ value: c._id, label: c.code }))} />

          {active && (active.records.length === 0 ? (
            <Card><Empty>No attendance records available for {active.name} yet.</Empty></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Attendance calendar for the selected course */}
              <Card className="md:col-span-4 flex flex-col">
                <CardHeader icon={CalendarDays} title={`${active.code} attendance days`} subtitle={rateLabel(active.percentage)} />
                <Metric label="Attendance rate" value={pct(active.percentage)} />
                <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium mt-5">
                  {[...active.records].reverse().map((r) => (
                    <div key={r.date} title={`${r.date} · ${r.status}`}
                      className={cx('h-8 rounded-md flex items-center justify-center tabular-nums', CELL[r.status])}>
                      {Number(r.date.slice(8, 10))}
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-5 flex flex-wrap items-center gap-2">
                  <Beacon tone="emerald">Present</Beacon>
                  <Beacon tone="amber">Late</Beacon>
                  <Beacon tone="rose">Absent</Beacon>
                </div>
              </Card>

              <Card className="md:col-span-8">
                <CardHeader icon={CalendarCheck} title={active.name} subtitle="Detailed attendance records" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-4">
                  <MiniStat value={active.stats.total} label="Total classes" />
                  <MiniStat value={active.stats.present} label="Present" tone="text-emerald-700" />
                  <MiniStat value={active.stats.late} label="Late" tone="text-amber-700" />
                  <MiniStat value={active.stats.absent} label="Absent" tone="text-rose-600" />
                </div>
                <Table head={['Date', 'Day', 'Status']} minWidth={360}>
                  {active.records.map((r) => (
                    <Tr key={r.date}>
                      <Td className="font-medium text-slate-900 tabular-nums">{r.date}</Td>
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
