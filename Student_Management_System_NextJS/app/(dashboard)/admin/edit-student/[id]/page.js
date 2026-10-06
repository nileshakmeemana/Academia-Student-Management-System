import PersonEditor from '@/components/admin/PersonEditor';

export default function EditStudentPage({ params }) {
  return <PersonEditor role="student" id={params.id} />;
}
