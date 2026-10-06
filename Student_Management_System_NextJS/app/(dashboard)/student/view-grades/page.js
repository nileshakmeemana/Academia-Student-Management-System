'use client';

import { Award, BookPlus, ChartColumn, ClipboardList, Gauge, GraduationCap, ListChecks } from 'lucide-react';
import { usePage } from '@/components/PageContext';
import {
  BarChart, Beacon, Card, CardHeader, Empty, ErrorCard, Kpi, KpiGrid, LinkButton, Loading, Table, Td, Tr, useLoad,
} from '@/components/ui';
import { gpa, gradeTone, point, score, statusTone } from '@/lib/format';

const LEGEND = [
  ['A (90-100)', '4.0 Points', 'Excellent', 'emerald'],
  ['B (80-89)', '3.0 Points', 'Good', 'blue'],
  ['C (70-79)', '2.0 Points', 'Average', 'teal'],
  ['D (60-69)', '1.0 Points', 'Poor', 'amber'],
  ['F (0-59)', '0.0 Points', 'Failing', 'rose'],
];

export default function ViewGradesPage() {
  usePage({ title: 'My Grades', subtitle: 'Scores, grade points and credits for every course you are enrolled in' });
  const { data, loading, error } = useLoad('/student/grades');

  if (loading) return <Loading />;
  if (error) return <ErrorCard message={error} />;

  const courses = data.courses;
  // Grade distribution (the old Chart.js pie), drawn as the mockup's bar chart
  const bars = ['A', 'B', 'C', 'D', 'F', null].map((k) => ({
    label: k || 'Not Graded',
    value: courses.filter((c) => (c.grade?.grade ?? null) === k).length,
  }));

  return (
    <>
      <KpiGrid cols={3}>
        <Kpi icon={Gauge} label="Current GPA" value={gpa(data.summary.gpa)} />
        <Kpi icon={Award} label="Credits Earned" value={data.summary.totalEarnedCredits} />
        <Kpi icon={GraduationCap} label="Academic Status">
          <div className="mt-1.5"><Beacon tone={statusTone(data.summary.academicStatus)} pulse>{data.summary.academicStatus}</Beacon></div>
        </Kpi>
      </KpiGrid>

      <Card>
        <CardHeader icon={ClipboardList} title="Course Grades" subtitle="Assignment 30% · Midterm 30% · Final 40%" />
        {courses.length === 0 ? (
          <Empty>
            <span>You are not enrolled in any courses yet.</span>
            <LinkButton variant="rowDark" href="/student/course-registration"><BookPlus className="w-3 h-3" />Register for Courses</LinkButton>
          </Empty>
        ) : (
          <Table head={['Course Code', 'Course Name', 'Credit Hours', 'Assignment', 'Midterm', 'Final', 'Total', 'Grade', 'Grade Point', 'Credits Earned', 'Status']} minWidth={1040}>
            {courses.map((c) => {
              const g = c.grade;
              return (
                <Tr key={c._id}>
                  <Td className="font-semibold text-slate-900 whitespace-nowrap">{c.code}</Td>
                  <Td>{c.name}</Td>
                  <Td>{c.creditHours}</Td>
                  <Td>{score(g?.assignmentScore)}</Td>
                  <Td>{score(g?.midtermScore)}</Td>
                  <Td>{score(g?.finalScore)}</Td>
                  <Td className="font-bold text-slate-900">{score(g?.totalScore)}</Td>
                  <Td>{g?.grade ? <Beacon tone={gradeTone(g.grade)}>{g.grade}</Beacon> : <Beacon>Not Graded</Beacon>}</Td>
                  <Td>{point(g?.gradePoint)}</Td>
                  <Td>{g?.earnedCredits ?? 0}</Td>
                  <Td>{g ? <Beacon tone={statusTone(g.academicStatus)}>{g.academicStatus}</Beacon> : <Beacon>Not Available</Beacon>}</Td>
                </Tr>
              );
            })}
          </Table>
        )}
      </Card>

      {courses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <Card className="lg:col-span-7">
            <CardHeader icon={ChartColumn} title="Grade Distribution" subtitle={`Across ${courses.length} enrolled course${courses.length === 1 ? '' : 's'}`} />
            <BarChart bars={bars} />
          </Card>
          <Card className="lg:col-span-5">
            <CardHeader icon={ListChecks} title="Grade Legend" subtitle="How totals map to grades" />
            <div className="divide-y divide-slate-50">
              {LEGEND.map(([range, pts, label, tone]) => (
                <div key={range} className="flex items-center justify-between py-2.5 text-xs">
                  <span><span className="font-semibold text-slate-900">{range}</span><span className="text-slate-400"> · {pts}</span></span>
                  <Beacon tone={tone}>{label}</Beacon>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
