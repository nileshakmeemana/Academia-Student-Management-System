'use client';

import { useState } from 'react';
import { BookOpen, BookPlus, LogOut } from 'lucide-react';
import { usePage } from '@/components/PageContext';
import {
  Button, Card, CardHeader, Empty, ErrorCard, LinkButton, Loading, RowActions, Table, Td, TeacherCell, Tr, matches,
  useFlash, useLoad,
} from '@/components/ui';
import { api } from '@/lib/api';

export default function ViewCoursesPage() {
  const query = usePage({ title: 'My Courses', subtitle: 'Courses you are enrolled in', search: 'Search courses…' });
  const { data, loading, error, reload } = useLoad('/student/courses');
  const { ok, error: fail } = useFlash();
  const [busyId, setBusyId] = useState(null);

  const all = data?.courses || [];
  const rows = all.filter((c) => matches(query, c.code, c.name, c.description, c.creditHours, c.teacherName || 'Not Assigned'));

  async function onDrop(course) {
    if (!window.confirm('Are you sure you want to drop this course?')) return;
    setBusyId(course._id);
    try {
      const res = await api(`/student/courses/${course._id}`, { method: 'DELETE' });
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
      <Card>
        <CardHeader icon={BookOpen} title="Enrolled Courses" subtitle={data ? `${all.length} course${all.length === 1 ? '' : 's'}` : ''}>
          <LinkButton variant="pill" href="/student/course-registration"><BookPlus className="w-3.5 h-3.5" />Register for Courses</LinkButton>
        </CardHeader>
        {loading && !data ? (
          <Loading />
        ) : all.length === 0 ? (
          <Empty>
            <span>You are not enrolled in any courses yet.</span>
            <LinkButton variant="rowDark" href="/student/course-registration"><BookPlus className="w-3 h-3" />Register for Courses</LinkButton>
          </Empty>
        ) : rows.length === 0 ? (
          <Empty>No courses match “{query}”.</Empty>
        ) : (
          <Table head={['Course Code', 'Course Name', 'Description', 'Credit Hours', 'Teacher', { label: 'Action', right: true }]} minWidth={820}>
            {rows.map((c) => (
              <Tr key={c._id}>
                <Td className="font-semibold text-slate-900 whitespace-nowrap">{c.code}</Td>
                <Td>{c.name}</Td>
                <Td className="max-w-[260px] whitespace-normal leading-relaxed">{c.description || '—'}</Td>
                <Td>{c.creditHours}</Td>
                <Td><TeacherCell name={c.teacherName} /></Td>
                <Td right>
                  <RowActions>
                    <Button variant="rowDanger" onClick={() => onDrop(c)} disabled={busyId === c._id}>
                      <LogOut className="w-3 h-3" />{busyId === c._id ? 'Dropping…' : 'Drop Course'}
                    </Button>
                  </RowActions>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  );
}
