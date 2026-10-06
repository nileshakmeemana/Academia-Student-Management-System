'use client';

import { useState } from 'react';
import { BookPlus, Info, LogOut } from 'lucide-react';
import { usePage } from '@/components/PageContext';
import {
  Beacon, Button, Card, CardHeader, Empty, ErrorCard, ListRow, Loading, RowActions, Table, Td, TeacherCell, Tr,
  matches, useFlash, useLoad,
} from '@/components/ui';
import { api } from '@/lib/api';

const GUIDELINES = [
  'You can enroll in multiple courses at once.',
  'Once enrolled, you can drop a course if needed.',
  'Make sure to check the course prerequisites before enrolling.',
  'Some courses may have limited seats available.',
  'Contact your academic advisor if you need help with course selection.',
];

export default function CourseRegistrationPage() {
  const query = usePage({ title: 'Course Registration', subtitle: 'Enroll in available courses or drop ones you no longer need', search: 'Search courses…' });
  const { data, loading, error, reload } = useLoad('/student/registration');
  const { ok, error: fail } = useFlash();
  const [busyId, setBusyId] = useState(null);

  const all = data?.courses || [];
  const rows = all.filter((c) =>
    matches(query, c.code, c.name, c.description, c.creditHours, c.teacherName || 'Not Assigned', c.enrolled ? 'Enrolled' : 'Not Enrolled')
  );
  const enrolledCount = all.filter((c) => c.enrolled).length;

  async function toggle(course) {
    if (course.enrolled && !window.confirm('Are you sure you want to drop this course?')) return;
    setBusyId(course._id);
    try {
      const res = course.enrolled
        ? await api(`/student/courses/${course._id}`, { method: 'DELETE' })
        : await api(`/student/courses/${course._id}/enroll`, { method: 'POST' });
      ok(res.message);
      reload();
    } catch (err) {
      fail(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <ErrorCard message={error} />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <Card className="xl:col-span-8">
          <CardHeader icon={BookPlus} title="Available Courses" subtitle={data ? `${all.length} offered · ${enrolledCount} enrolled` : ''} />
          {loading && !data ? (
            <Loading />
          ) : all.length === 0 ? (
            <Empty>No courses are offered yet. Check back after the administrator adds them.</Empty>
          ) : rows.length === 0 ? (
            <Empty>No courses match “{query}”.</Empty>
          ) : (
            <Table head={['Course Code', 'Course Name', 'Description', 'Credit Hours', 'Teacher', 'Status', { label: 'Action', right: true }]} minWidth={860}>
              {rows.map((c) => (
                <Tr key={c._id}>
                  <Td className="font-semibold text-slate-900 whitespace-nowrap">{c.code}</Td>
                  <Td>{c.name}</Td>
                  <Td className="max-w-[200px] whitespace-normal leading-relaxed">{c.description || '—'}</Td>
                  <Td>{c.creditHours}</Td>
                  <Td><TeacherCell name={c.teacherName} /></Td>
                  <Td>{c.enrolled ? <Beacon tone="emerald" pulse>Enrolled</Beacon> : <Beacon>Not Enrolled</Beacon>}</Td>
                  <Td right>
                    <RowActions>
                      {c.enrolled ? (
                        <Button variant="rowDanger" onClick={() => toggle(c)} disabled={busyId === c._id}>
                          <LogOut className="w-3 h-3" />{busyId === c._id ? 'Dropping…' : 'Drop Course'}
                        </Button>
                      ) : (
                        <Button variant="rowDark" onClick={() => toggle(c)} disabled={busyId === c._id}>
                          <BookPlus className="w-3 h-3" />{busyId === c._id ? 'Enrolling…' : 'Enroll'}
                        </Button>
                      )}
                    </RowActions>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader icon={Info} title="Registration Guidelines" subtitle="Before you enroll" />
          <div className="space-y-1">
            {GUIDELINES.map((g) => <ListRow key={g} icon={Info} title={g} />)}
          </div>
        </Card>
      </div>
    </>
  );
}
