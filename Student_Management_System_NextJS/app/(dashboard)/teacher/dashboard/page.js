'use client';

import { BellRing, BookOpen, CalendarCheck, CalendarDays, ChartColumn, ClipboardList, Hash, LayoutGrid, UserRound, Users } from 'lucide-react';
import { usePage } from '@/components/PageContext';
import {
  BarChart, Card, CardHeader, DarkLinks, Empty, ErrorCard, KV, Kpi, KpiGrid, LinkButton, ListRow, Loading, RowActions,
  Table, Td, Tr, useLoad,
} from '@/components/ui';
import { isoDay } from '@/lib/format';

export default function TeacherDashboard() {
  const { data, loading, error } = useLoad('/teacher/dashboard');
  const t = data?.teacher;
  usePage({ title: 'Teacher Dashboard', subtitle: t ? `Welcome, ${t.firstName} ${t.lastName}` : '' });

  if (loading) return <Loading />;
  if (error) return <ErrorCard message={error} />;

  const totalStudents = data.courses.reduce((n, c) => n + c.enrolledCount, 0);

  return (
    <>
      <KpiGrid>
        <Kpi icon={Hash} label="Teacher ID" value={t.id} />
        <Kpi icon={BookOpen} label="Courses You Teach" value={data.courses.length} />
        <Kpi icon={Users} label="Students Enrolled" value={totalStudents} />
        <Kpi icon={CalendarDays} label="Hire Date" value={isoDay(t.hireDate)} />
      </KpiGrid>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7">
          <CardHeader icon={BookOpen} title="Courses You Teach" subtitle="Open grades or attendance for a course" />
          {data.courses.length === 0 ? (
            <Empty>You are not assigned to any courses yet.</Empty>
          ) : (
            <Table head={['Course Code', 'Course Name', 'Credit Hours', 'Students Enrolled', { label: 'Actions', right: true }]} minWidth={620}>
              {data.courses.map((c) => (
                <Tr key={c._id}>
                  <Td className="font-semibold text-slate-900 whitespace-nowrap">{c.code}</Td>
                  <Td>{c.name}</Td>
                  <Td>{c.creditHours}</Td>
                  <Td className="font-semibold text-slate-700">{c.enrolledCount}</Td>
                  <Td right>
                    <RowActions>
                      <LinkButton variant="rowDark" href={`/teacher/manage-grades?courseId=${c._id}`}><ClipboardList className="w-3 h-3" />Grades</LinkButton>
                      <LinkButton variant="rowLight" href={`/teacher/manage-attendance?courseId=${c._id}`}><CalendarCheck className="w-3 h-3" />Attendance</LinkButton>
                    </RowActions>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader icon={ChartColumn} title="Students per Course" subtitle="Enrollment in the courses you teach" />
          <BarChart bars={data.courses.map((c) => ({ label: c.code, value: c.enrolledCount }))} emptyLabel="No students enrolled yet." />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-4">
          <DarkLinks
            icon={LayoutGrid}
            title="Quick Links"
            items={[
              { href: '/teacher/manage-grades', label: 'Manage Grades', sub: 'Enter assignment, midterm and final scores.', icon: ClipboardList },
              { href: '/teacher/manage-attendance', label: 'Manage Attendance', sub: 'Take attendance and review past days.', icon: CalendarCheck },
              { href: '/profile', label: 'Edit Profile', sub: 'Personal details and password.', icon: UserRound },
            ]}
          />
        </div>
        <Card className="md:col-span-4">
          <CardHeader icon={UserRound} title="Your Details" subtitle="From your teacher profile" />
          <div className="divide-y divide-slate-50">
            <KV label="Teacher ID">{t.id}</KV>
            <KV label="Email">{t.email}</KV>
            <KV label="Hire Date">{isoDay(t.hireDate)}</KV>
          </div>
        </Card>
        <Card className="md:col-span-4">
          <CardHeader icon={BellRing} title="Notices for Teacher" subtitle="Reminders" />
          {data.recentActivities.length ? (
            <div className="space-y-1">{data.recentActivities.map((a) => <ListRow key={a} icon={BellRing} title={a} />)}</div>
          ) : (
            <Empty>No recent activities.</Empty>
          )}
        </Card>
      </div>
    </>
  );
}
