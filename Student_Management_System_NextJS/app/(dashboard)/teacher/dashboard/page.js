'use client';

import { BellRing, CalendarCheck, ClipboardList, UserRound } from 'lucide-react';
import { usePage } from '@/components/PageContext';
import {
  ActionCards, BarChart, Card, CardHeader, ContentGrid, Empty, ErrorCard, KV, LinkButton, ListRow, Loading, Metric,
  Overview, RowActions, SectionHead, SideTitle, Table, Td, Tr, useLoad,
} from '@/components/ui';
import { isoDay } from '@/lib/format';

export default function TeacherDashboard() {
  const { data, loading, error } = useLoad('/teacher/dashboard');
  const t = data?.teacher;
  usePage({ title: 'Dashboard', subtitle: t ? `Welcome back, ${t.firstName} ${t.lastName}` : '' });

  if (loading) return <Loading variant="dashboard" />;
  if (error) return <ErrorCard message={error} />;

  const totalStudents = data.courses.reduce((n, c) => n + c.enrolledCount, 0);

  return (
    <>
      <Overview
        metric={<Metric label="Students enrolled" value={totalStudents} />}
        chart={
          <div>
            <div className="text-13 font-medium text-slate-600 mb-3">Students per course</div>
            <BarChart bars={data.courses.map((c) => ({ label: c.code, value: c.enrolledCount }))} emptyLabel="No students enrolled yet." />
          </div>
        }
        stats={[
          { label: 'Courses you teach', value: data.courses.length },
          { label: 'Teacher ID', value: t.id },
          { label: 'Hire date', value: isoDay(t.hireDate) },
        ]}
      />

      <ContentGrid
        main={
          <>
            <div>
              <SectionHead title="Start teaching" />
              <div className="mt-5">
                <ActionCards
                  items={[
                    { href: '/teacher/manage-grades', label: 'Manage grades', sub: 'Assignment, midterm and final scores', icon: ClipboardList },
                    { href: '/teacher/manage-attendance', label: 'Manage attendance', sub: 'Take attendance or review past days', icon: CalendarCheck },
                  ]}
                />
              </div>
            </div>

            <Card>
              <CardHeader title="Courses you teach" subtitle="Open grades or attendance for a course" />
              {data.courses.length === 0 ? (
                <Empty>You are not assigned to any courses yet.</Empty>
              ) : (
                <Table head={['Course', 'Credit hours', 'Students', { label: 'Actions', right: true }]} minWidth={600}>
                  {data.courses.map((c) => (
                    <Tr key={c._id}>
                      <Td>
                        <div className="font-medium text-slate-900">{c.code}</div>
                        <div className="text-slate-600">{c.name}</div>
                      </Td>
                      <Td className="tabular-nums">{c.creditHours}</Td>
                      <Td className="font-medium text-slate-900 tabular-nums">{c.enrolledCount}</Td>
                      <Td right>
                        <RowActions>
                          <LinkButton variant="rowLight" href={`/teacher/manage-grades?courseId=${c._id}`}><ClipboardList className="w-4 h-4" />Grades</LinkButton>
                          <LinkButton variant="rowLight" href={`/teacher/manage-attendance?courseId=${c._id}`}><CalendarCheck className="w-4 h-4" />Attendance</LinkButton>
                        </RowActions>
                      </Td>
                    </Tr>
                  ))}
                </Table>
              )}
            </Card>
          </>
        }
        side={
          <>
            <div>
              <SideTitle>Your details</SideTitle>
              <div className="mt-2 divide-y divide-slate-200">
                <KV label="Teacher ID">{t.id}</KV>
                <KV label="Email"><span title={t.email}>{t.email}</span></KV>
                <KV label="Hire date">{isoDay(t.hireDate)}</KV>
              </div>
              <LinkButton variant="rowLight" href="/profile" className="mt-3 w-full"><UserRound className="w-4 h-4" />Edit profile</LinkButton>
            </div>
            <div>
              <SideTitle>Notices</SideTitle>
              <div className="mt-4 space-y-2">
                {data.recentActivities.length ? (
                  data.recentActivities.map((a) => <ListRow key={a} icon={BellRing} title={a} />)
                ) : (
                  <p className="text-sm text-slate-600">No recent activities.</p>
                )}
              </div>
            </div>
          </>
        }
      />
    </>
  );
}
