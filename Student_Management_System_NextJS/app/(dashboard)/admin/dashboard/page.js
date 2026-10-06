'use client';

import { BellRing, BookOpen, ChartColumn, LayoutGrid, Presentation, UserCheck, Users } from 'lucide-react';
import { usePage } from '@/components/PageContext';
import {
  BarChart, Card, CardHeader, DarkLinks, Empty, ErrorCard, Kpi, KpiGrid, LinkButton, ListRow, Loading, MiniStat,
  Table, Td, TeacherCell, Tr, useLoad,
} from '@/components/ui';

export default function AdminDashboard() {
  usePage({ title: 'Admin Dashboard', subtitle: 'Students, teachers and courses across the institution' });
  const { data, loading, error } = useLoad('/admin/dashboard');

  if (loading) return <Loading />;
  if (error) return <ErrorCard message={error} />;

  const courses = data.courses || [];
  const unassigned = courses.filter((c) => !c.teacherName).length;
  const avg = courses.length ? (data.enrollmentCount / courses.length).toFixed(1) : '0';

  return (
    <>
      <KpiGrid>
        <Kpi icon={Users} label="Students" value={data.studentCount} />
        <Kpi icon={Presentation} label="Teachers" value={data.teacherCount} />
        <Kpi icon={BookOpen} label="Courses" value={data.courseCount} />
        <Kpi icon={UserCheck} label="Enrollments" value={data.enrollmentCount} />
      </KpiGrid>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7">
          <CardHeader icon={BookOpen} title="Courses at a glance" subtitle={`${courses.length} courses · ${unassigned} without a teacher`}>
            <LinkButton variant="rowLight" href="/admin/manage-courses">Manage</LinkButton>
          </CardHeader>
          {courses.length === 0 ? (
            <Empty>No courses yet.</Empty>
          ) : (
            <Table head={['Course', 'Teacher', 'Credit Hours', { label: 'Students', right: true }]} minWidth={480}>
              {courses.map((c) => (
                <Tr key={c._id}>
                  <Td>
                    <div className="font-semibold text-slate-900">{c.code}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[220px]">{c.name}</div>
                  </Td>
                  <Td><TeacherCell name={c.teacherName} /></Td>
                  <Td>{c.creditHours}</Td>
                  <Td right className="font-semibold text-slate-700">{c.enrolledCount}</Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader icon={ChartColumn} title="Students per course" subtitle="Enrollment count by course code" />
          <div className="grid grid-cols-3 gap-2 pb-3">
            <MiniStat value={avg} label="Avg. per course" />
            <MiniStat value={unassigned} label="Unassigned courses" tone={unassigned ? 'text-amber-700' : 'text-emerald-700'} />
            <MiniStat value={data.enrollmentCount} label="Enrollments" />
          </div>
          <BarChart bars={courses.slice(0, 8).map((c) => ({ label: c.code, value: c.enrolledCount }))} emptyLabel="No enrollments yet." />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-5">
          <DarkLinks
            icon={LayoutGrid}
            title="Management"
            items={[
              { href: '/admin/manage-students', label: 'Manage Students', sub: 'Student records, enrollments, and information.', icon: Users },
              { href: '/admin/manage-teachers', label: 'Manage Teachers', sub: 'Teacher records, assignments, and information.', icon: Presentation },
              { href: '/admin/manage-courses', label: 'Manage Courses', sub: 'Course details, assignments, and schedules.', icon: BookOpen },
            ]}
          />
        </div>
        <Card className="md:col-span-7">
          <CardHeader icon={BellRing} title="Notices for Administrator" subtitle="Things you can do here" />
          {data.recentActivities?.length ? (
            <div className="space-y-1">
              {data.recentActivities.map((a) => <ListRow key={a} icon={BellRing} title={a} />)}
            </div>
          ) : (
            <Empty>No recent activities</Empty>
          )}
        </Card>
      </div>
    </>
  );
}
