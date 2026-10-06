'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarCheck, CalendarPlus, ChartColumn, PencilLine, Save, SquarePen } from 'lucide-react';
import Modal from '@/components/Modal';
import CoursePicker from '@/components/teacher/CoursePicker';
import StatusPicker from '@/components/teacher/StatusPicker';
import { usePage } from '@/components/PageContext';
import {
  Beacon, Button, Card, CardHeader, Empty, ErrorCard, Field, FormError, INPUT, IdChip, LinkButton, Loading, Meter,
  PersonCell, RowActions, Table, Td, Tr, cx, matches, useFlash, useLoad,
} from '@/components/ui';
import { api } from '@/lib/api';
import { attendanceTone, longDate, pct, rateColor, todayIso } from '@/lib/format';

function ManageAttendance() {
  const router = useRouter();
  const courseId = useSearchParams().get('courseId');
  const query = usePage({
    title: 'Manage Attendance',
    subtitle: "Take attendance by day and review each student's attendance rate",
    search: courseId ? 'Search students…' : null,
  });
  const courses = useLoad('/teacher/courses');
  const sheet = useLoad(courseId ? `/teacher/courses/${courseId}/attendance` : null);
  const { ok } = useFlash();
  const [activeDate, setActiveDate] = useState(null);
  const [picking, setPicking] = useState(false);
  const [pickDate, setPickDate] = useState(todayIso());
  const [editing, setEditing] = useState(null); // { student, date, status }
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const data = sheet.data;
  const dates = data?.dates || [];
  const students = (data?.students || []).filter((s) => matches(query, s.id, s.name));

  // Newest date tab is open by default; keep the current tab after a reload if it still exists.
  useEffect(() => {
    const list = data?.dates || [];
    setActiveDate((cur) => (list.includes(cur) ? cur : list[0] || null));
  }, [data]);

  // Returning from take-attendance shows the servlet's success message.
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    if (qs.get('saved')) {
      ok('Attendance recorded successfully');
      qs.delete('saved');
      window.history.replaceState(null, '', `${window.location.pathname}?${qs.toString()}`);
    }
  }, [ok]);

  async function onUpdate(e) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const res = await api(`/teacher/courses/${courseId}/attendance/${editing.date}/${editing.student._id}`, {
        method: 'PUT',
        body: { status: editing.status },
      });
      setEditing(null);
      ok(res.message);
      sheet.reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const summaryById = Object.fromEntries((data?.summary || []).map((s) => [s.studentId, s]));
  const takeHref = (date) => `/teacher/take-attendance?courseId=${courseId}${date ? `&date=${date}` : ''}`;

  return (
    <>
      <ErrorCard message={courses.error} />
      {courses.loading ? <Loading /> : courses.data && (
        <CoursePicker courses={courses.data.courses} selected={courseId} basePath="/teacher/manage-attendance" />
      )}

      {courseId && <ErrorCard message={sheet.error} />}
      {courseId && sheet.loading && !data && <Loading />}
      {data && (
        <>
          <Card>
            <CardHeader icon={CalendarCheck} title={`Attendance for ${data.course.code} - ${data.course.name}`} subtitle={`${dates.length} day${dates.length === 1 ? '' : 's'} recorded`}>
              <Button variant="outline" className="h-9" onClick={() => { setPickDate(todayIso()); setPicking(true); }}>
                <CalendarPlus className="w-3.5 h-3.5" />Another Date
              </Button>
              <LinkButton variant="pill" href={takeHref()}><CalendarCheck className="w-3.5 h-3.5" />Take Today&apos;s Attendance</LinkButton>
            </CardHeader>

            {dates.length === 0 ? (
              <Empty>
                <span>No attendance records available for this course yet.</span>
                <LinkButton variant="rowDark" href={takeHref()}>Take attendance now</LinkButton>
              </Empty>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 pb-4" role="tablist">
                  {dates.map((d) => (
                    <button key={d} type="button" role="tab" aria-selected={d === activeDate} onClick={() => setActiveDate(d)}
                      className={cx('py-1.5 px-3 text-[11px] rounded-full border transition tabular-nums',
                        d === activeDate ? 'border-[#7ee352] bg-[#7ee352] text-slate-950 font-bold' : 'font-medium border-slate-200 bg-white text-slate-600 hover:border-slate-400')}>
                      {d}
                    </button>
                  ))}
                </div>
                {activeDate && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                      <div className="text-xs font-bold text-slate-900">Attendance for {longDate(activeDate)}</div>
                      <LinkButton variant="rowLight" href={takeHref(activeDate)}><SquarePen className="w-3 h-3" />Edit This Day&apos;s Attendance</LinkButton>
                    </div>
                    <Table head={['Student ID', 'Name', 'Status', { label: 'Action', right: true }]} minWidth={520}>
                      {students.map((s) => {
                        const st = data.byDate[activeDate]?.[s._id];
                        return (
                          <Tr key={s._id}>
                            <Td><IdChip>{s.id}</IdChip></Td>
                            <Td><PersonCell name={s.name} /></Td>
                            <Td>{st ? <Beacon tone={attendanceTone(st)}>{st}</Beacon> : <Beacon>Not Recorded</Beacon>}</Td>
                            <Td right>
                              <RowActions>
                                <Button variant="rowLight" onClick={() => { setFormError(''); setEditing({ student: s, date: activeDate, status: st || 'Present' }); }}>
                                  <PencilLine className="w-3 h-3" />Update
                                </Button>
                              </RowActions>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Table>
                  </>
                )}
              </>
            )}
          </Card>

          <Card>
            <CardHeader icon={ChartColumn} title="Attendance Summary" subtitle="Rate counts present and late days" />
            {data.students.length === 0 ? (
              <Empty>No students enrolled in this course yet.</Empty>
            ) : (
              <Table head={['Student Name', 'Present', 'Late', 'Absent', 'Attendance Rate']} minWidth={620}>
                {students.map((s) => {
                  const sm = summaryById[s._id] || { present: 0, late: 0, absent: 0, rate: 0 };
                  return (
                    <Tr key={s._id}>
                      <Td><PersonCell name={s.name} /></Td>
                      <Td>{sm.present}</Td>
                      <Td>{sm.late}</Td>
                      <Td>{sm.absent}</Td>
                      <Td>
                        <div className="flex items-center gap-3 min-w-[180px]">
                          <Meter value={sm.rate} color={rateColor(sm.rate)} />
                          <span className="w-12 text-right font-bold text-slate-900 tabular-nums">{pct(sm.rate)}</span>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </Table>
            )}
          </Card>
        </>
      )}

      <Modal open={picking} onClose={() => setPicking(false)} title="Select Date for Attendance" subtitle="Opens the attendance sheet for that day" size="max-w-md">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); router.push(takeHref(pickDate)); }}>
          <Field label="Date" htmlFor="selectDate">
            <input className={INPUT} type="date" id="selectDate" value={pickDate} onChange={(e) => setPickDate(e.target.value)} required />
          </Field>
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <Button variant="outline" onClick={() => setPicking(false)}>Cancel</Button>
            <Button variant="dark" type="submit"><CalendarCheck className="w-3.5 h-3.5" />Go to Selected Date</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing ? `Update Attendance for ${editing.student.name}` : ''} subtitle={editing ? longDate(editing.date) : ''} size="max-w-md">
        {editing && (
          <form className="space-y-4" onSubmit={onUpdate}>
            <FormError message={formError} />
            <StatusPicker name="status" label="Status" value={editing.status} onChange={(st) => setEditing({ ...editing, status: st })} />
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button variant="dark" type="submit" disabled={busy}><Save className="w-3.5 h-3.5" />{busy ? 'Saving…' : 'Save Changes'}</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}

export default function ManageAttendancePage() {
  return (
    <Suspense fallback={<Loading />}>
      <ManageAttendance />
    </Suspense>
  );
}
