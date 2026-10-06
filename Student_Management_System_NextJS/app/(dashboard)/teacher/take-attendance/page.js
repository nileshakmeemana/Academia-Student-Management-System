'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CalendarCheck, CheckCheck, Clock, Send, UserX } from 'lucide-react';
import StatusPicker from '@/components/teacher/StatusPicker';
import { usePage } from '@/components/PageContext';
import {
  Button, Card, CardHeader, Empty, ErrorCard, FormError, INPUT, IdChip, LinkButton, Loading, MiniStat, PersonCell,
  Table, Td, Tr, matches, useLoad,
} from '@/components/ui';
import { api } from '@/lib/api';
import { longDate } from '@/lib/format';

function TakeAttendance() {
  const router = useRouter();
  const params = useSearchParams();
  const courseId = params.get('courseId');
  const dateParam = params.get('date') || '';
  const sheet = useLoad(courseId ? `/teacher/courses/${courseId}/attendance/sheet${dateParam ? `?date=${dateParam}` : ''}` : null);
  const data = sheet.data;
  const query = usePage({ title: 'Take Attendance', subtitle: data ? `${data.course.code} - ${data.course.name}` : '', search: 'Search students…' });
  const [marks, setMarks] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  // Existing status for the day, defaulting to Present (take-attendance.jsp behaviour).
  useEffect(() => {
    if (!data) return;
    setMarks(Object.fromEntries(data.students.map((s) => [s._id, data.existing[s._id] || 'Present'])));
  }, [data]);

  useEffect(() => {
    if (!courseId) router.replace('/teacher/manage-attendance');
  }, [courseId, router]);

  const setAll = (status) => setMarks(Object.fromEntries(Object.keys(marks).map((id) => [id, status])));
  const back = `/teacher/manage-attendance?courseId=${courseId}`;

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      await api(`/teacher/courses/${courseId}/attendance`, {
        method: 'POST',
        body: { date: data.date, records: Object.entries(marks).map(([studentId, status]) => ({ studentId, status })) },
      });
      router.push(`${back}&saved=1`);
    } catch (err) {
      setFormError(err.message);
      setBusy(false);
    }
  }

  if (sheet.error) {
    return (
      <>
        <ErrorCard message={sheet.error} />
        <div><LinkButton variant="white" href="/teacher/manage-attendance"><ArrowLeft className="w-3.5 h-3.5" />Back to Attendance Management</LinkButton></div>
      </>
    );
  }
  if (!data) return <Loading />;

  const counts = ['Present', 'Late', 'Absent'].map((st) => Object.values(marks).filter((m) => m === st).length);
  const recorded = Object.keys(data.existing).length;
  const rows = data.students.filter((s) => matches(query, s.id, s.name));

  return (
    <Card>
      <CardHeader
        icon={CalendarCheck}
        title={longDate(data.date)}
        subtitle={recorded ? `Editing ${recorded} saved record${recorded === 1 ? '' : 's'} for this day` : 'Nothing saved for this day yet'}
      >
        <LinkButton variant="rowLight" href={back}><ArrowLeft className="w-3 h-3" />Back</LinkButton>
      </CardHeader>

      {data.students.length === 0 ? (
        <Empty>
          <span>No students enrolled in this course yet.</span>
          <LinkButton variant="rowDark" href="/teacher/manage-attendance">Back to Attendance Management</LinkButton>
        </Empty>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="date">Date</label>
              <input id="date" className={INPUT} type="date" value={data.date} required
                onChange={(e) => e.target.value && router.replace(`/teacher/take-attendance?courseId=${courseId}&date=${e.target.value}`)} />
            </div>
            <div className="md:col-span-8 grid grid-cols-3 gap-2">
              <MiniStat value={counts[0]} label="Present" />
              <MiniStat value={counts[1]} label="Late" tone="text-amber-700" />
              <MiniStat value={counts[2]} label="Absent" tone="text-rose-600" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="rowLight" onClick={() => setAll('Present')}><CheckCheck className="w-3 h-3" />Mark All Present</Button>
            <Button variant="rowLight" onClick={() => setAll('Late')}><Clock className="w-3 h-3" />Mark All Late</Button>
            <Button variant="rowLight" onClick={() => setAll('Absent')}><UserX className="w-3 h-3" />Mark All Absent</Button>
          </div>

          <FormError message={formError} />
          <Table head={['Student ID', 'Name', 'Status']} minWidth={560}>
            {rows.map((s) => (
              <Tr key={s._id}>
                <Td><IdChip>{s.id}</IdChip></Td>
                <Td><PersonCell name={s.name} /></Td>
                <Td>
                  <StatusPicker name={`status_${s._id}`} label={`Status for ${s.name}`} value={marks[s._id]}
                    onChange={(st) => setMarks((m) => ({ ...m, [s._id]: st }))} />
                </Td>
              </Tr>
            ))}
          </Table>

          <div className="flex flex-wrap justify-end gap-2.5 pt-2">
            <LinkButton variant="outline" href={back}>Cancel</LinkButton>
            <Button variant="green" type="submit" disabled={busy}><Send className="w-3.5 h-3.5" />{busy ? 'Saving…' : 'Submit Attendance'}</Button>
          </div>
        </form>
      )}
    </Card>
  );
}

export default function TakeAttendancePage() {
  return (
    <Suspense fallback={<Loading />}>
      <TakeAttendance />
    </Suspense>
  );
}
