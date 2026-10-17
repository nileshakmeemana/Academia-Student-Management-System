'use client';

import { BellRing, BookOpen, Presentation, Users } from 'lucide-react';
import { usePage } from '@/components/PageContext';
import {
  ActionCards, BarChart, Card, CardHeader, ContentGrid, Empty, ErrorCard, LinkButton, ListRow, Loading, Metric,
  Overview, SectionHead, SideTitle, Table, Td, TeacherCell, Tr, useLoad,
} from '@/components/ui';

export default function AdminDashboard() {
  usePage({ title: 'Dashboard', subtitle: 'Students, teachers and courses across the institution' });
  const { data, loading, error } = useLoad('/admin/dashboard');

  if (loading) return <Loading variant="dashboard" />;
  if (error) return <ErrorCard message={error} />;

  const courses = data.courses || [];
  const unassigned = courses.filter((c) => !c.teacherName).length;
  const avg = courses.length ? (data.enrollmentCount / courses.length).toFixed(1) : '0';

  return (
    <>
      <Overview
        metric={
          <div className="grid grid-cols-3 md:grid-cols-1 gap-4 md:gap-5">
            <Metric label="Enrollments" value={data.enrollmentCount} />
            <Metric label="Avg. per course" value={avg} size="md" />
            <Metric label="Unassigned courses" value={unassigned} size="md" />
          </div>
        }
        chart={
          <div>
            <div className="text-13 font-medium text-slate-600 mb-3">Students per course</div>
            <BarChart bars={courses.slice(0, 10).map((c) => ({ label: c.code, value: c.enrolledCount }))} emptyLabel="No enrollments yet." />
          </div>
        }
        stats={[
          { label: 'Total students', value: data.studentCount },
          { label: 'Teachers', value: data.teacherCount },
          { label: 'Courses', value: data.courseCount },
        ]}
      />

      <ContentGrid
        main={
          <>
            <div>
              <SectionHead title="Manage records" />
              <div className="mt-5">
                <ActionCards
                  cols="sm:grid-cols-2 2xl:grid-cols-3"
                  items={[
                    { href: '/admin/manage-students', label: 'Manage students', sub: 'Records, enrollments and details', icon: Users },
                    { href: '/admin/manage-teachers', label: 'Manage teachers', sub: 'Records, assignments and details', icon: Presentation },
                    { href: '/admin/manage-courses', label: 'Manage courses', sub: 'Details and assigned teachers', icon: BookOpen },
                  ]}
                />
              </div>
            </div>

            <Card>
              <CardHeader title="Courses at a glance" subtitle={`${courses.length} course${courses.length === 1 ? '' : 's'} · ${unassigned} without a teacher`}>
                <LinkButton variant="rowLight" href="/admin/manage-courses">Manage</LinkButton>
              </CardHeader>
              {courses.length === 0 ? (
                <Empty>No courses yet.</Empty>
              ) : (
                <Table head={['Course', 'Teacher', 'Credit hours', { label: 'Students', right: true }]} minWidth={520}>
                  {courses.map((c) => (
                    <Tr key={c._id}>
                      <Td>
                        <div className="font-medium text-slate-900">{c.code}</div>
                        <div className="text-slate-600 truncate max-w-[260px]">{c.name}</div>
                      </Td>
                      <Td><TeacherCell name={c.teacherName} /></Td>
                      <Td className="tabular-nums">{c.creditHours}</Td>
                      <Td right className="font-medium text-slate-900 tabular-nums">{c.enrolledCount}</Td>
                    </Tr>
                  ))}
                </Table>
              )}
            </Card>
          </>
        }
        side={
          <div>
            <SideTitle>Notices for administrators</SideTitle>
            <div className="mt-4 space-y-2">
              {data.recentActivities?.length ? (
                data.recentActivities.map((a) => <ListRow key={a} icon={BellRing} title={a} />)
              ) : (
                <p className="text-sm text-slate-600">No recent activities.</p>
              )}
            </div>
          </div>
        }
      />
    </>
  );
}
