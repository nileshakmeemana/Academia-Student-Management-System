'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, UserPlus, Users, Presentation } from 'lucide-react';
import Modal from '@/components/Modal';
import AccountFields from '@/components/AccountFields';
import PersonFields from '@/components/PersonFields';
import { usePage } from '@/components/PageContext';
import {
  Button, Card, CardHeader, Empty, ErrorCard, FormError, IdChip, LinkButton, Loading, PersonCell, RowActions,
  Table, Td, Tr, matches, useFlash, useLoad,
} from '@/components/ui';
import { api, formToObject } from '@/lib/api';
import { dash, isoDay } from '@/lib/format';

// Shared by manage-students.jsp and manage-teachers.jsp — same table, search, add modal and delete.
const CONFIG = {
  student: {
    endpoint: '/admin/students',
    listKey: 'students',
    title: 'Manage Students',
    subtitle: 'Every student account, with contact details and enrollment date',
    noun: 'student',
    Noun: 'Student',
    icon: Users,
    editHref: (id) => `/admin/edit-student/${id}`,
    columns: [
      { label: 'Gender', value: (r) => r.gender },
      { label: 'Phone', value: (r) => r.phone },
      { label: 'Enrollment Date', value: (r) => isoDay(r.enrollmentDate) },
    ],
  },
  teacher: {
    endpoint: '/admin/teachers',
    listKey: 'teachers',
    title: 'Manage Teachers',
    subtitle: 'Every teacher account, with qualifications and hire date',
    noun: 'teacher',
    Noun: 'Teacher',
    icon: Presentation,
    editHref: (id) => `/admin/edit-teacher/${id}`,
    columns: [
      { label: 'Qualification', value: (r) => r.qualification, wrap: true },
      { label: 'Phone', value: (r) => r.phone },
      { label: 'Hire Date', value: (r) => isoDay(r.hireDate) },
    ],
  },
};

export default function PeopleManager({ role }) {
  const cfg = CONFIG[role];
  const query = usePage({ title: cfg.title, subtitle: cfg.subtitle, search: `Search ${cfg.noun}s…` });
  const { data, loading, error, reload } = useLoad(cfg.endpoint);
  const { ok, error: fail } = useFlash();
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  // ?updated=1 (back from edit) and ?new=1 (from the "+ New" menu)
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    if (qs.get('updated')) ok(`${cfg.Noun} updated successfully`);
    if (qs.get('new')) setAdding(true);
    if (qs.toString()) window.history.replaceState(null, '', window.location.pathname);
  }, [ok, cfg.Noun]);

  const all = data?.[cfg.listKey] || [];
  const rows = all.filter((r) => matches(query, r.id, r.name, r.email, ...cfg.columns.map((c) => c.value(r))));

  async function onAdd(e) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const res = await api(cfg.endpoint, { method: 'POST', body: formToObject(e.currentTarget) });
      setAdding(false);
      ok(res.message);
      reload();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(row) {
    if (!window.confirm(`Are you sure you want to delete this ${cfg.noun}?`)) return;
    try {
      const res = await api(`${cfg.endpoint}/${row._id}`, { method: 'DELETE' });
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
        <CardHeader icon={cfg.icon} title={`${cfg.Noun} List`} subtitle={data ? `${all.length} total${query ? ` · ${rows.length} matching` : ''}` : ''}>
          <Button variant="pill" onClick={() => { setFormError(''); setAdding(true); }}>
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />Add New {cfg.Noun}
          </Button>
        </CardHeader>
        {loading && !data ? (
          <Loading />
        ) : rows.length === 0 ? (
          <Empty>{query ? `No ${cfg.noun}s match “${query}”.` : `No ${cfg.noun}s yet. Add the first one with “Add New ${cfg.Noun}”.`}</Empty>
        ) : (
          <Table head={['ID', 'Name', 'Email', ...cfg.columns.map((c) => c.label), { label: 'Actions', right: true }]} minWidth={860}>
            {rows.map((r) => (
              <Tr key={r._id}>
                <Td><IdChip>{r.id}</IdChip></Td>
                <Td><PersonCell name={r.name} sub={r.username} /></Td>
                <Td>{dash(r.email)}</Td>
                {cfg.columns.map((c) => (
                  <Td key={c.label} className={c.wrap ? 'max-w-[240px] whitespace-normal leading-relaxed' : 'whitespace-nowrap'}>{dash(c.value(r))}</Td>
                ))}
                <Td right>
                  <RowActions>
                    <LinkButton variant="rowLight" href={cfg.editHref(r._id)}><Pencil className="w-3 h-3" />Edit</LinkButton>
                    <Button variant="rowDanger" onClick={() => onDelete(r)}><Trash2 className="w-3 h-3" />Delete</Button>
                  </RowActions>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={adding} onClose={() => setAdding(false)} title={`Add New ${cfg.Noun}`} subtitle="Creates the login and the profile together" size="max-w-2xl">
        <form onSubmit={onAdd} className="space-y-4">
          <FormError message={formError} />
          <AccountFields idPrefix="add-" />
          <div className="pt-2 space-y-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{cfg.Noun} details</div>
            <PersonFields role={role} idPrefix="add-p-" />
          </div>
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            <Button variant="dark" type="submit" disabled={busy}><UserPlus className="w-3.5 h-3.5" />{busy ? 'Adding…' : `Add ${cfg.Noun}`}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
