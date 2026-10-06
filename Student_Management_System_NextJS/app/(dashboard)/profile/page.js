'use client';

import { useRef, useState } from 'react';
import { BookOpen, KeyRound, Mail, Presentation, Save, ShieldCheck, UserRound, Users } from 'lucide-react';
import Modal from '@/components/Modal';
import PersonFields from '@/components/PersonFields';
import { useAuth } from '@/components/AuthProvider';
import { usePage } from '@/components/PageContext';
import {
  Avatar, Button, Card, CardHeader, DarkLinks, Empty, ErrorCard, Field, FormError, INPUT, KV, Loading, useFlash, useLoad,
} from '@/components/ui';
import { api, formToObject } from '@/lib/api';
import { isoDay } from '@/lib/format';

const ROLE_LABEL = { admin: 'Administrator', teacher: 'Teacher', student: 'Student' };

export default function ProfilePage() {
  usePage({ title: 'User Profile', subtitle: 'Your sign-in details and personal information' });
  const { setUser } = useAuth();
  const { data, loading, error, setData } = useLoad('/profile');
  const { ok } = useFlash();
  const [modal, setModal] = useState(null); // 'password' | 'email'
  const [formError, setFormError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [busy, setBusy] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const newPw = useRef(null);
  const confirmPw = useRef(null);

  const user = data?.user;
  const person = data?.student || data?.teacher;

  async function onProfile(e) {
    e.preventDefault();
    setBusy(true);
    setProfileError('');
    try {
      const res = await api('/profile', { method: 'PUT', body: formToObject(e.currentTarget) });
      setData(res);
      setFormKey((k) => k + 1);
      ok(res.message);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onModalSubmit(e, path) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const res = await api(path, { method: 'PUT', body: formToObject(e.currentTarget) });
      if (res.user) {
        setData(res);
        setUser(res.user);
      }
      setModal(null);
      ok(res.message);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const checkMatch = () => {
    if (!newPw.current || !confirmPw.current) return;
    confirmPw.current.setCustomValidity(newPw.current.value !== confirmPw.current.value ? "Passwords don't match" : '');
  };
  const open = (name) => { setFormError(''); setModal(name); };

  if (loading) return <Loading />;
  if (error) return <ErrorCard message={error} />;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-4 space-y-5">
          <Card>
            <div className="flex items-center gap-3 pb-4">
              <Avatar name={user.username} size="w-12 h-12 text-base" dark />
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-950 truncate">{person ? person.name : user.username}</div>
                <div className="text-[11px] text-slate-400 font-medium">{ROLE_LABEL[user.role]}</div>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              <KV label="Username">{user.username}</KV>
              <KV label="Email">{user.email}</KV>
              <KV label="Role">{ROLE_LABEL[user.role]}</KV>
              <KV label="Account Created">{isoDay(user.createdAt)}</KV>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-4">
              <Button variant="outline" onClick={() => open('password')}><KeyRound className="w-3.5 h-3.5" />Change Password</Button>
              <Button variant="outline" onClick={() => open('email')}><Mail className="w-3.5 h-3.5" />Update Email</Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {user.role === 'admin' ? (
            <div className="space-y-5">
              <Card>
                <CardHeader icon={ShieldCheck} title="Administrator" subtitle="Personal information" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  As an administrator, you can manage all aspects of the system. Use the navigation menu to access the different management sections.
                </p>
              </Card>
              <DarkLinks
                icon={ShieldCheck}
                title="Management"
                items={[
                  { href: '/admin/manage-students', label: 'Manage Students', icon: Users },
                  { href: '/admin/manage-teachers', label: 'Manage Teachers', icon: Presentation },
                  { href: '/admin/manage-courses', label: 'Manage Courses', icon: BookOpen },
                ]}
              />
            </div>
          ) : (
            <Card>
              <CardHeader icon={UserRound} title="Personal Information" subtitle="Visible to administrators" />
              {person ? (
                <form onSubmit={onProfile} key={formKey} className="space-y-4">
                  <FormError message={profileError} />
                  <PersonFields value={person} role={user.role} />
                  <div className="flex justify-end pt-2">
                    <Button variant="dark" type="submit" disabled={busy}><Save className="w-3.5 h-3.5" />{busy ? 'Saving…' : 'Update Profile'}</Button>
                  </div>
                </form>
              ) : (
                <Empty>No profile information available.</Empty>
              )}
            </Card>
          )}
        </div>
      </div>

      <Modal open={modal === 'password'} onClose={() => setModal(null)} title="Change Password" subtitle="You'll use the new password next time you sign in" size="max-w-md">
        <form className="space-y-4" onSubmit={(e) => onModalSubmit(e, '/profile/password')}>
          <FormError message={formError} />
          <Field label="Current Password" htmlFor="currentPassword">
            <input className={INPUT} type="password" id="currentPassword" name="currentPassword" required autoComplete="current-password" />
          </Field>
          <Field label="New Password" htmlFor="newPassword">
            <input className={INPUT} type="password" id="newPassword" name="newPassword" required ref={newPw} onInput={checkMatch} autoComplete="new-password" />
          </Field>
          <Field label="Confirm New Password" htmlFor="confirmPassword">
            <input className={INPUT} type="password" id="confirmPassword" name="confirmPassword" required ref={confirmPw} onInput={checkMatch} autoComplete="new-password" />
          </Field>
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="dark" type="submit" disabled={busy}><KeyRound className="w-3.5 h-3.5" />{busy ? 'Saving…' : 'Change Password'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'email'} onClose={() => setModal(null)} title="Update Email" subtitle="Confirm with your password" size="max-w-md">
        <form className="space-y-4" onSubmit={(e) => onModalSubmit(e, '/profile/email')}>
          <FormError message={formError} />
          <Field label="Current Email" htmlFor="currentEmail">
            <input className={INPUT} type="email" id="currentEmail" value={user.email} readOnly />
          </Field>
          <Field label="New Email" htmlFor="newEmail">
            <input className={INPUT} type="email" id="newEmail" name="newEmail" required />
          </Field>
          <Field label="Password (to confirm)" htmlFor="emailPassword">
            <input className={INPUT} type="password" id="emailPassword" name="password" required autoComplete="current-password" />
          </Field>
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
            <Button variant="dark" type="submit" disabled={busy}><Mail className="w-3.5 h-3.5" />{busy ? 'Saving…' : 'Update Email'}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
