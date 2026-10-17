'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserCheck } from 'lucide-react';
import { usePage } from '@/components/PageContext';
import { Button, Card, CardHeader, ErrorCard, Field, FormError, INPUT, LinkButton, Loading, TeacherCell, useLoad, LABEL } from '@/components/ui';
import { api, formToObject } from '@/lib/api';

export default function AssignTeacherPage({ params }) {
  usePage({ title: 'Assign Teacher to Course', subtitle: 'Choose who teaches this course, or remove the current teacher' });
  const router = useRouter();
  const { data, loading, error } = useLoad(`/admin/courses/${params.id}`);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const course = data?.course;

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      await api(`/admin/courses/${params.id}/teacher`, { method: 'PUT', body: formToObject(e.currentTarget) });
      router.push('/admin/manage-courses?assigned=1');
    } catch (err) {
      setFormError(err.message);
      setBusy(false);
    }
  }

  if (loading) return <Loading variant="form" />;
  if (error) return <ErrorCard message={error} />;

  return (
    <Card>
      <CardHeader icon={UserCheck} title={`Assign Teacher to ${course.code}`} subtitle={course.name}>
        <LinkButton variant="rowLight" href="/admin/manage-courses"><ArrowLeft className="w-4 h-4" />Back</LinkButton>
      </CardHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormError message={formError} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-[18px]">
          <div>
            <div className={LABEL}>Currently assigned</div>
            <div className="h-10 px-3 flex items-center rounded-lg border border-slate-200 bg-slate-50"><TeacherCell name={course.teacherName} /></div>
          </div>
          <Field label="Select Teacher" htmlFor="teacherId">
            <select className={INPUT} id="teacherId" name="teacherId" defaultValue={course.teacherId || ''}>
              <option value="">None (remove current teacher)</option>
              {data.teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap justify-end gap-2.5 pt-2">
          <LinkButton variant="outline" href="/admin/manage-courses">Cancel</LinkButton>
          <Button variant="dark" type="submit" disabled={busy}><UserCheck className="w-4 h-4" />{busy ? 'Saving…' : 'Assign Teacher'}</Button>
        </div>
      </form>
    </Card>
  );
}
