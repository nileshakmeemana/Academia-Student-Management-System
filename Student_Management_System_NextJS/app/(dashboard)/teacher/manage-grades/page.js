'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClipboardList, PencilLine, Save } from 'lucide-react';
import Modal from '@/components/Modal';
import CoursePicker from '@/components/teacher/CoursePicker';
import { usePage } from '@/components/PageContext';
import {
  Beacon, Button, Card, CardHeader, Empty, ErrorCard, Field, FormError, INPUT, IdChip, Loading, PersonCell, RowActions,
  Table, Td, Tr, matches, useFlash, useLoad,
} from '@/components/ui';
import { api, formToObject } from '@/lib/api';
import { gradeTone, point, score, statusTone } from '@/lib/format';

function ManageGrades() {
  const courseId = useSearchParams().get('courseId');
  const query = usePage({
    title: 'Manage Grades',
    subtitle: 'Assignment 30%, midterm 30% and final 40% make up the total score',
    search: courseId ? 'Search students…' : null,
  });
  const courses = useLoad('/teacher/courses');
  const grades = useLoad(courseId ? `/teacher/courses/${courseId}/grades` : null);
  const { ok } = useFlash();
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const course = grades.data?.course;
  const all = grades.data?.students || [];
  const rows = all.filter((s) => matches(query, s.id, s.name, s.grade?.grade, s.grade?.academicStatus));

  async function onSave(e) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const res = await api(`/teacher/courses/${courseId}/grades/${editing._id}`, { method: 'PUT', body: formToObject(e.currentTarget) });
      setEditing(null);
      ok(res.message);
      grades.reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const g = editing?.grade;

  return (
    <>
      <ErrorCard message={courses.error} />
      {courses.loading ? <Loading /> : courses.data && (
        <CoursePicker courses={courses.data.courses} selected={courseId} basePath="/teacher/manage-grades" />
      )}

      {courseId && <ErrorCard message={grades.error} />}
      {courseId && grades.loading && !grades.data && <Loading />}
      {course && (
        <Card>
          <CardHeader icon={ClipboardList} title={`Grades for ${course.code} - ${course.name}`} subtitle={`${course.creditHours} credits · ${all.length} students`} />
          {all.length === 0 ? (
            <Empty>No students enrolled in this course yet.</Empty>
          ) : rows.length === 0 ? (
            <Empty>No students match “{query}”.</Empty>
          ) : (
            <Table head={['Student ID', 'Name', 'Assignment', 'Midterm', 'Final', 'Total', 'Grade', 'Grade Point', 'Credits Earned', 'Academic Status', { label: 'Action', right: true }]} minWidth={1080}>
              {rows.map((s) => (
                <Tr key={s._id}>
                  <Td><IdChip>{s.id}</IdChip></Td>
                  <Td><PersonCell name={s.name} /></Td>
                  <Td>{score(s.grade?.assignmentScore)}</Td>
                  <Td>{score(s.grade?.midtermScore)}</Td>
                  <Td>{score(s.grade?.finalScore)}</Td>
                  <Td className="font-bold text-slate-900">{score(s.grade?.totalScore)}</Td>
                  <Td><Beacon tone={gradeTone(s.grade?.grade)}>{s.grade?.grade || 'N/A'}</Beacon></Td>
                  <Td>{point(s.grade?.gradePoint)}</Td>
                  <Td>{s.grade?.earnedCredits ?? 0}</Td>
                  <Td><Beacon tone={statusTone(s.grade?.academicStatus)}>{s.grade?.academicStatus || 'Not Graded'}</Beacon></Td>
                  <Td right>
                    <RowActions>
                      <Button variant="rowDark" onClick={() => { setFormError(''); setEditing(s); }}><PencilLine className="w-3 h-3" />Update Grade</Button>
                    </RowActions>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing ? `Update Grade for ${editing.name}` : ''} subtitle="Leave a score empty if it hasn't been marked yet" size="max-w-md">
        {editing && (
          <form onSubmit={onSave} className="space-y-4">
            <FormError message={formError} />
            {[
              ['assignmentScore', 'Assignment Score (30%)', g?.assignmentScore],
              ['midtermScore', 'Midterm Score (30%)', g?.midtermScore],
              ['finalScore', 'Final Score (40%)', g?.finalScore],
            ].map(([name, label, val]) => (
              <Field key={name} label={label} htmlFor={name}>
                <input className={INPUT} type="number" id={name} name={name} defaultValue={val ?? ''} min={0} max={100} step="0.01" placeholder="0 – 100" />
              </Field>
            ))}
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

export default function ManageGradesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ManageGrades />
    </Suspense>
  );
}
