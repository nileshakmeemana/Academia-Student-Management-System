import PersonEditor from '@/components/admin/PersonEditor';

export default function EditTeacherPage({ params }) {
  return <PersonEditor role="teacher" id={params.id} />;
}
