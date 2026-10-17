'use client';

import { Award, BellRing, BookPlus, CalendarCheck, UserRound } from 'lucide-react';
import { usePage } from '@/components/PageContext';
import {
  ActionCards, BarChart, Beacon, Card, CardHeader, ContentGrid, Empty, ErrorCard, KV, LinkButton, ListRow, Loading,
  Metric, Overview, SectionHead, SideTitle, Table, Td, TeacherCell, Tr, useLoad,
} from '@/components/ui';
import { gpa, isoDay, statusTone } from '@/lib/format';

export default function StudentDashboard() {
  const { data, loading, error } = useLoad('/student/dashboard');
  const s = data?.student;
  usePage({ title: 'Dashboard', subtitle: s ? `Welcome back, ${s.firstName} ${s.lastName}` : '' });

  if (loading) return <Loading variant="dashboard" />;
  if (error) return <ErrorCard message={error} />;

  const totalCredits = data.courses.reduce((n, c) => n + (Number(c.creditHours) || 0), 0);

  return (
    <>
      <Overview
        metric={
          <Metric label="Current GPA" value={gpa(data.summary.gpa)}>
            <div className="mt-2"><Beacon tone={statusTone(data.summary.academicStatus)}>{data.summary.academicStatus}</Beacon></div>
          </Metric>
        }
        chart={
          <div>
            <div className="text-13 font-medium text-slate-600 mb-3">Credit hours by enrolled course</div>
            <BarChart bars={data.courses.map((c) => ({ label: c.code, value: Number(c.creditHours) || 0 }))} emptyLabel="You are not enrolled in any courses yet." />
          </div>
        }
        stats={[
          { label: 'Credits earned', value: data.summary.totalEarnedCredits },
          { label: 'Enrolled courses', value: data.courses.length },
          { label: 'Credit hours this term', value: totalCredits },
        ]}
      />

      <ContentGrid
        main={
          <>
            <div>
              <SectionHead title="Your academics" />
              <div className="mt-5">
                <ActionCards
                  items={[
                    { href: '/student/view-grades', label: 'View grades', sub: 'Scores, grade points and GPA', icon: Award },
                    { href: '/student/view-attendance', label: 'View attendance', sub: 'Your rate and records per course', icon: CalendarCheck },
                    { href: '/student/course-registration', label: 'Register for courses', sub: 'Enroll in or drop a course', icon: BookPlus },
                    { href: '/profile', label: 'Edit profile', sub: 'Personal details and password', icon: UserRound },
                  ]}
                />
              </div>
            </div>

            <Card>
              <CardHeader title="Enrolled courses" subtitle="Courses you are taking">
                <LinkButton variant="rowLight" href="/student/view-courses">View all</LinkButton>
              </CardHeader>
              {data.courses.length === 0 ? (
                <Empty>
                  <span>You are not enrolled in any courses yet.</span>
                  <LinkButton variant="rowDark" href="/student/course-registration"><BookPlus className="w-4 h-4" />Register for courses</LinkButton>
                </Empty>
              ) : (
                <Table head={['Course', 'Credit hours', 'Teacher']} minWidth={520}>
                  {data.courses.map((c) => (
                    <Tr key={c._id}>
                      <Td>
                        <div className="font-medium text-slate-900">{c.code}</div>
                        <div className="text-slate-600">{c.name}</div>
                      </Td>
                      <Td className="tabular-nums">{c.creditHours}</Td>
                      <Td><TeacherCell name={c.teacherName} /></Td>
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
                <KV label="Student ID">{s.id}</KV>
                <KV label="Email"><span title={s.email}>{s.email}</span></KV>
                <KV label="Enrolled on">{isoDay(s.enrollmentDate)}</KV>
              </div>
            </div>
            <div>
              <SideTitle>Notices</SideTitle>
              <div className="mt-4 space-y-2">
                {data.deadlines.length ? (
                  data.deadlines.map((d) => <ListRow key={d.title} icon={BellRing} title={d.title} sub={d.description} />)
                ) : (
                  <p className="text-sm text-slate-600">No notices for students.</p>
                )}
              </div>
            </div>
          </>
        }
      />
    </>
  );
}
