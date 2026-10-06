'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Pencil, Plus, Trash2, UserCheck } from 'lucide-react';
import Modal from '@/components/Modal';
import CourseFields from '@/components/admin/CourseFields';
import { usePage } from '@/components/PageContext';
import {
  Button, Card, CardHeader, Empty, ErrorCard, FormError, IdChip, LinkButton, Loading, RowActions, Table, Td,
  TeacherCell, Tr, matches, useFlash, useLoad,
} from '@/components/ui';
import { api, formToObject } from '@/lib/api';

const RETURN_MESSAGES = { updated: 'Course updated successfully', assigned: 'Teacher assigned successfully' };

export default function ManageCoursesPage() {
  const query = usePage({ title: 'Manage Courses', subtitle: 'Course details, credit hours and the teacher assigned to each', search: 'Search courses…' });
  const { data, loading, error, reload } = useLoad('/admin/courses');
  const { ok, error: fail } = useFlash();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const key = Object.keys(RETURN_MESSAGES).find((k) => qs.get(k));
    if (key) ok(RETURN_MESSAGES[key]);
    if (qs.get('new')) setAdding(true);
    if (qs.toString()) window.history.replaceState(null, '', window.location.pathname);
  }, [ok]);

  const all = data?.courses || [];
  const rows = all.filter((c) => matches(query, c.id, c.code, c.name, c.creditHours, c.teacherName || 'Not Assigned'));

  async function onAdd(e) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const res = await api('/admin/courses', { method: 'POST', body: formToObject(e.currentTarget) });
      setAdding(false);
      ok(res.message);
      reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(course) {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const res = await api(`/admin/courses/${course._id}`, { method: 'DELETE' });
      ok(res.message);
      reload();
    } catch (err) {
      fail(err.message);
    }
  }

  return (
    <>
      <ErrorCard message={error} />
      <Card>
        <CardHeader icon={BookOpen} title="Course List" subtitle={data ? `${all.length} total${query ? ` · ${rows.length} matching` : ''}` : ''}>
          <Button variant="pill" onClick={() => { setFormError(''); setAdding(true); }}>
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />Add New Course
          </Button>
        </CardHeader>
        {loading && !data ? (
          <Loading />
        ) : rows.length === 0 ? (
          <Empty>{query ? `No courses match “${query}”.` : 'No courses yet. Add the first one with “Add New Course”.'}</Empty>
        ) : (
          <Table head={['ID', 'Code', 'Name', 'Credit Hours', 'Teacher', { label: 'Actions', right: true }]} minWidth={820}>
            {rows.map((c) => (
              <Tr key={c._id}>
                <Td><IdChip>{c.id}</IdChip></Td>
                <Td className="font-semibold text-slate-900 whitespace-nowrap">{c.code}</Td>
                <Td>{c.name}</Td>
                <Td>{c.creditHours}</Td>
                <Td><TeacherCell name={c.teacherName} /></Td>
                <Td right>
                  <RowActions>
                    <LinkButton variant="rowLight" href={`/admin/edit-course/${c._id}`}><Pencil className="w-3 h-3" />Edit</LinkButton>
                    <LinkButton variant="rowDark" href={`/admin/assign-teacher/${c._id}`}><UserCheck className="w-3 h-3" />Assign Teacher</LinkButton>
                    <Button variant="rowDanger" onClick={() => onDelete(c)}><Trash2 className="w-3 h-3" />Delete</Button>
                  </RowActions>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add New Course" subtitle="Assigning a teacher is optional">
        <form onSubmit={onAdd} className="space-y-4">
          <FormError message={formError} />
          <CourseFields teachers={data?.teachers || []} idPrefix="add-" teacherLabel="Teacher (Optional)" />
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            <Button variant="dark" type="submit" disabled={busy}><Plus className="w-3.5 h-3.5" />{busy ? 'Adding…' : 'Add Course'}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
