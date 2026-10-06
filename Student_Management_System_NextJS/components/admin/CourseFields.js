'use client';

import { Field, INPUT } from '@/components/ui';

// Course form fields — add-course modal and edit-course.jsp
export default function CourseFields({ value = {}, teachers = [], idPrefix = '', teacherLabel = 'Teacher' }) {
  const id = (n) => `${idPrefix}${n}`;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Course Code" htmlFor={id('code')}>
        <input className={INPUT} id={id('code')} name="code" defaultValue={value.code || ''} required maxLength={10} placeholder="SE204.3" />
      </Field>
      <Field label="Credit Hours" htmlFor={id('creditHours')}>
        <input className={INPUT} type="number" id={id('creditHours')} name="creditHours" defaultValue={value.creditHours ?? ''} min={1} max={6} required />
      </Field>
      <Field label="Course Name" htmlFor={id('name')} className="sm:col-span-2">
        <input className={INPUT} id={id('name')} name="name" defaultValue={value.name || ''} required maxLength={100} />
      </Field>
      <Field label="Description" htmlFor={id('description')} className="sm:col-span-2">
        <textarea className={INPUT} id={id('description')} name="description" rows={3} defaultValue={value.description || ''} />
      </Field>
      <Field label={teacherLabel} htmlFor={id('teacherId')} className="sm:col-span-2">
        <select className={INPUT} id={id('teacherId')} name="teacherId" defaultValue={value.teacherId || ''}>
          <option value="">Select teacher</option>
          {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
      </Field>
    </div>
  );
}
