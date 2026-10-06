'use client';

import { Award, BellRing, BookOpen, BookPlus, CalendarCheck, Gauge, GraduationCap, LayoutGrid, UserRound } from 'lucide-react';
import { usePage } from '@/components/PageContext';
import {
  Beacon, Card, CardHeader, DarkLinks, Empty, ErrorCard, KV, Kpi, KpiGrid, LinkButton, ListRow, Loading, Table, Td,
  TeacherCell, Tr, useLoad,
} from '@/components/ui';
import { gpa, isoDay, statusTone } from '@/lib/format';

export default function StudentDashboard() {
  const { data, loading, error } = useLoad('/student/dashboard');
  const s = data?.student;
  usePage({ title: 'Student Dashboard', subtitle: s ? `Welcome, ${s.firstName} ${s.lastName}` : '' });

  if (loading) return <Loading />;
  if (error) return <ErrorCard message={error} />;

  return (
    <>
      <KpiGrid>
        <Kpi icon={Gauge} label="Current GPA" value={gpa(data.summary.gpa)} />
        <Kpi icon={Award} label="Credits Earned" value={data.summary.totalEarnedCredits} />
        <Kpi icon={GraduationCap} label="Academic Status">
          <div className="mt-1.5"><Beacon tone={statusTone(data.summary.academicStatus)} pulse>{data.summary.academicStatus}</Beacon></div>
        </Kpi>
        <Kpi icon={BookOpen} label="Enrolled Courses" value={data.courses.length} />
      </KpiGrid>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Card className="lg:col-span-7">
          <CardHeader icon={BookOpen} title="Enrolled Courses" subtitle="Courses you are taking">
            <LinkButton variant="rowLight" href="/student/view-courses">View All Courses</LinkButton>
          </CardHeader>
          {data.courses.length === 0 ? (
            <Empty>
              <span>You are not enrolled in any courses yet.</span>
              <LinkButton variant="rowDark" href="/student/course-registration"><BookPlus className="w-3 h-3" />Register for Courses</LinkButton>
            </Empty>
          ) : (
            <Table head={['Course Code', 'Course Name', 'Credit Hours', 'Teacher']} minWidth={520}>
              {data.courses.map((c) => (
                <Tr key={c._id}>
                  <Td className="font-semibold text-slate-900 whitespace-nowrap">{c.code}</Td>
                  <Td>{c.name}</Td>
                  <Td>{c.creditHours}</Td>
                  <Td><TeacherCell name={c.teacherName} /></Td>
                </Tr>
              ))}
            </Table>
          )}
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader icon={UserRound} title="Your Details" subtitle="From your student profile" />
          <div className="divide-y divide-slate-50">
            <KV label="Student ID">{s.id}</KV>
            <KV label="Email">{s.email}</KV>
            <KV label="Enrollment Date">{isoDay(s.enrollmentDate)}</KV>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-5">
          <DarkLinks
            icon={LayoutGrid}
            title="Quick Links"
            items={[
              { href: '/student/view-grades', label: 'View Grades', sub: 'Scores, grade points and your GPA.', icon: Award },
              { href: '/student/view-attendance', label: 'View Attendance', sub: 'Attendance rate and records per course.', icon: CalendarCheck },
              { href: '/profile', label: 'Edit Profile', sub: 'Personal details and password.', icon: UserRound },
            ]}
          />
        </div>
        <Card className="md:col-span-7">
          <CardHeader icon={BellRing} title="Notices for Students" subtitle="Reminders" />
          {data.deadlines.length ? (
            <div className="space-y-1">
              {data.deadlines.map((d) => <ListRow key={d.title} icon={BellRing} title={d.title} sub={d.description} />)}
            </div>
          ) : (
            <Empty>No notices for students.</Empty>
          )}
        </Card>
      </div>
    </>
  );
}
