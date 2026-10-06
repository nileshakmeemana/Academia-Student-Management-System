'use client';

import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { Card, CardHeader, INPUT, LABEL } from '@/components/ui';

// The "Select Course" card at the top of manage-grades.jsp / manage-attendance.jsp.
export default function CoursePicker({ courses, selected, basePath }) {
  const router = useRouter();
  return (
    <Card>
      <CardHeader icon={BookOpen} title="Select Course" subtitle={courses.length ? 'Only courses you teach are listed' : 'You are not assigned to any courses yet.'} />
      <div className="max-w-md">
        <label className={LABEL} htmlFor="courseId">Course</label>
        <select
          id="courseId"
          className={INPUT}
          value={selected || ''}
          onChange={(e) => router.replace(e.target.value ? `${basePath}?courseId=${e.target.value}` : basePath)}
          disabled={!courses.length}
        >
          <option value="">Select a course</option>
          {courses.map((c) => <option key={c._id} value={c._id}>{c.code} - {c.name}</option>)}
        </select>
      </div>
    </Card>
  );
}
