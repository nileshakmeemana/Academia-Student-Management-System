'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, UserRound } from 'lucide-react';
import PersonFields from '@/components/PersonFields';
import { usePage } from '@/components/PageContext';
import { Button, Card, CardHeader, ErrorCard, FormError, LinkButton, Loading, useLoad } from '@/components/ui';
import { api, formToObject } from '@/lib/api';

// edit-student.jsp / edit-teacher.jsp
export default function PersonEditor({ role, id }) {
  const isStudent = role === 'student';
  const endpoint = `/admin/${isStudent ? 'students' : 'teachers'}/${id}`;
  const back = `/admin/${isStudent ? 'manage-students' : 'manage-teachers'}`;
  const Noun = isStudent ? 'Student' : 'Teacher';
  const router = useRouter();
  const { data, loading, error } = useLoad(endpoint);
  const person = data?.[role];
  usePage({ title: `Edit ${Noun}`, subtitle: person ? `${person.name} (ID ${person.id})` : '' });
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      await api(endpoint, { method: 'PUT', body: formToObject(e.currentTarget) });
      router.push(`${back}?updated=1`);
    } catch (err) {
      setFormError(err.message);
      setBusy(false);
    }
  }

  if (loading) return <Loading />;
  if (error) return <ErrorCard message={error} />;

  return (
    <Card className="max-w-3xl">
      <CardHeader icon={UserRound} title={`Edit ${Noun} Information`} subtitle={`Username: ${person.username}`}>
        <LinkButton variant="rowLight" href={back}><ArrowLeft className="w-3 h-3" />Back to list</LinkButton>
      </CardHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormError message={formError} />
        <PersonFields value={person} role={role} withEmail />
        <div className="flex flex-wrap justify-end gap-2.5 pt-2">
          <LinkButton variant="outline" href={back}>Cancel</LinkButton>
          <Button variant="dark" type="submit" disabled={busy}><Save className="w-3.5 h-3.5" />{busy ? 'Saving…' : `Update ${Noun}`}</Button>
        </div>
      </form>
    </Card>
  );
}
