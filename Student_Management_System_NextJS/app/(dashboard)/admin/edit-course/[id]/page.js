'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Save } from 'lucide-react';
import CourseFields from '@/components/admin/CourseFields';
import { usePage } from '@/components/PageContext';
import { Button, Card, CardHeader, ErrorCard, FormError, LinkButton, Loading, useLoad } from '@/components/ui';
import { api, formToObject } from '@/lib/api';

export default function EditCoursePage({ params }) {
  const router = useRouter();
  const { data, loading, error } = useLoad(`/admin/courses/${params.id}`);
  const course = data?.course;
  usePage({ title: 'Edit Course', subtitle: course ? `${course.code} ${course.name}` : '' });
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      await api(`/admin/courses/${params.id}`, { method: 'PUT', body: formToObject(e.currentTarget) });
      router.push('/admin/manage-courses?updated=1');
    } catch (err) {
      setFormError(err.message);
      setBusy(false);
    }
  }

  if (loading) return <Loading />;
  if (error) return <ErrorCard message={error} />;

  return (
    <Card className="max-w-3xl">
      <CardHeader icon={BookOpen} title="Edit Course Information" subtitle={`Course ID ${course.id}`}>
        <LinkButton variant="rowLight" href="/admin/manage-courses"><ArrowLeft className="w-3 h-3" />Back to courses</LinkButton>
      </CardHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormError message={formError} />
        <CourseFields value={course} teachers={data.teachers} />
        <div className="flex flex-wrap justify-end gap-2.5 pt-2">
          <LinkButton variant="outline" href="/admin/manage-courses">Cancel</LinkButton>
          <Button variant="dark" type="submit" disabled={busy}><Save className="w-3.5 h-3.5" />{busy ? 'Saving…' : 'Update Course'}</Button>
        </div>
      </form>
    </Card>
  );
}
