const router = require('express').Router();
const mongoose = require('mongoose');
const { User, Student, Teacher, Course, Enrollment } = require('../models');
const { asyncHandler, HttpError, clean, isBlank } = require('../utils/http');
const {
  personalFields,
  requireNames,
  assertUnique,
  createAccount,
  deleteStudentCascade,
  deleteTeacherCascade,
  deleteCourseCascade,
  studentOut,
  teacherOut,
  courseOut,
  teacherNameMap,
} = require('../services/people');

const validId = (id) => mongoose.isValidObjectId(id);

async function findOr404(Model, id, label) {
  if (!validId(id)) throw new HttpError(404, `${label} not found`);
  const doc = await Model.findById(id);
  if (!doc) throw new HttpError(404, `${label} not found`);
  return doc;
}

async function resolveTeacherId(raw) {
  const id = clean(raw);
  if (!id) return null;
  if (!validId(id) || !(await Teacher.exists({ _id: id }))) throw new HttpError(400, 'Selected teacher does not exist.');
  return id;
}

function courseFields(body) {
  const code = clean(body.code);
  const name = clean(body.name);
  const creditHours = Number.parseInt(body.creditHours, 10);
  if (!code || !name || Number.isNaN(creditHours)) {
    throw new HttpError(400, 'Course code, name and credit hours are required.');
  }
  if (creditHours < 1 || creditHours > 6) throw new HttpError(400, 'Credit hours must be between 1 and 6.');
  if (code.length > 10) throw new HttpError(400, 'Course code can be at most 10 characters.');
  return { code, name, description: clean(body.description), creditHours };
}

async function assertCodeUnique(code, exceptId) {
  const q = { code };
  if (exceptId) q._id = { $ne: exceptId };
  if (await Course.exists(q)) throw new HttpError(409, `Course code ${code} is already used by another course.`);
}

const usersById = async (ids) => new Map((await User.find({ _id: { $in: ids } })).map((u) => [String(u._id), u]));

/* ---------------- dashboard ---------------- */
router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const [studentCount, teacherCount, courseCount, enrollmentCount, courses, names, perCourse] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Course.find().sort({ seq: 1 }),
      teacherNameMap(),
      Enrollment.aggregate([{ $group: { _id: '$course', n: { $sum: 1 } } }]),
    ]);
    const enrolled = new Map(perCourse.map((r) => [String(r._id), r.n]));
    res.json({
      studentCount,
      teacherCount,
      courseCount,
      enrollmentCount,
      // read-only overview for the dashboard: every course with its teacher and enrolment
      courses: courses.map((c) => ({ ...courseOut(c, names), enrolledCount: enrolled.get(String(c._id)) || 0 })),
      recentActivities: [
        'Add new students, teachers and courses.',
        'Edit students, teachers and courses.',
        'Assign teachers for new courses',
      ],
    });
  })
);

/* ---------------- students ---------------- */
router.get(
  '/students',
  asyncHandler(async (req, res) => {
    const students = await Student.find().sort({ seq: 1 });
    const users = await usersById(students.map((s) => s.user));
    res.json({ students: students.map((s) => studentOut(s, users.get(String(s.user)))) });
  })
);

router.post(
  '/students',
  asyncHandler(async (req, res) => {
    await createAccount(req.body, 'student');
    res.status(201).json({ message: 'Student added successfully' });
  })
);

router.get(
  '/students/:id',
  asyncHandler(async (req, res) => {
    const student = await findOr404(Student, req.params.id, 'Student');
    const user = await User.findById(student.user);
    res.json({ student: studentOut(student, user) });
  })
);

router.put(
  '/students/:id',
  asyncHandler(async (req, res) => {
    const student = await findOr404(Student, req.params.id, 'Student');
    const fields = personalFields(req.body, 'student');
    requireNames(fields);
    // Original only overwrote dob when a value was sent.
    if (!fields.dob) delete fields.dob;
    Object.assign(student, fields);
    await student.save();

    const email = clean(req.body.email);
    if (email) {
      await assertUnique(null, email, student.user);
      await User.updateOne({ _id: student.user }, { $set: { email: email.toLowerCase() } });
    }
    res.json({ message: 'Student updated successfully' });
  })
);

router.delete(
  '/students/:id',
  asyncHandler(async (req, res) => {
    const student = await findOr404(Student, req.params.id, 'Student');
    await deleteStudentCascade(student);
    res.json({ message: 'Student deleted successfully' });
  })
);

/* ---------------- teachers ---------------- */
router.get(
  '/teachers',
  asyncHandler(async (req, res) => {
    const teachers = await Teacher.find().sort({ seq: 1 });
    const users = await usersById(teachers.map((t) => t.user));
    res.json({ teachers: teachers.map((t) => teacherOut(t, users.get(String(t.user)))) });
  })
);

router.post(
  '/teachers',
  asyncHandler(async (req, res) => {
    await createAccount(req.body, 'teacher');
    res.status(201).json({ message: 'Teacher added successfully' });
  })
);

router.get(
  '/teachers/:id',
  asyncHandler(async (req, res) => {
    const teacher = await findOr404(Teacher, req.params.id, 'Teacher');
    const user = await User.findById(teacher.user);
    res.json({ teacher: teacherOut(teacher, user) });
  })
);

router.put(
  '/teachers/:id',
  asyncHandler(async (req, res) => {
    const teacher = await findOr404(Teacher, req.params.id, 'Teacher');
    const fields = personalFields(req.body, 'teacher');
    requireNames(fields);
    if (!fields.dob) delete fields.dob;
    Object.assign(teacher, fields);
    await teacher.save();

    const email = clean(req.body.email);
    if (email) {
      await assertUnique(null, email, teacher.user);
      await User.updateOne({ _id: teacher.user }, { $set: { email: email.toLowerCase() } });
    }
    res.json({ message: 'Teacher updated successfully' });
  })
);

router.delete(
  '/teachers/:id',
  asyncHandler(async (req, res) => {
    const teacher = await findOr404(Teacher, req.params.id, 'Teacher');
    await deleteTeacherCascade(teacher);
    res.json({ message: 'Teacher deleted successfully' });
  })
);

/* ---------------- courses ---------------- */
async function teacherOptions() {
  const teachers = await Teacher.find().sort({ seq: 1 });
  return teachers.map((t) => ({ _id: t._id, id: t.seq, name: `${t.firstName} ${t.lastName}` }));
}

router.get(
  '/courses',
  asyncHandler(async (req, res) => {
    const [courses, names, teachers] = await Promise.all([
      Course.find().sort({ seq: 1 }),
      teacherNameMap(),
      teacherOptions(),
    ]);
    res.json({ courses: courses.map((c) => courseOut(c, names)), teachers });
  })
);

router.post(
  '/courses',
  asyncHandler(async (req, res) => {
    const fields = courseFields(req.body);
    await assertCodeUnique(fields.code);
    const teacher = await resolveTeacherId(req.body.teacherId);
    await Course.create({ ...fields, teacher });
    res.status(201).json({ message: 'Course added successfully' });
  })
);

router.get(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    const course = await findOr404(Course, req.params.id, 'Course');
    const [names, teachers] = await Promise.all([teacherNameMap(), teacherOptions()]);
    res.json({ course: courseOut(course, names), teachers });
  })
);

router.put(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    const course = await findOr404(Course, req.params.id, 'Course');
    const fields = courseFields(req.body);
    await assertCodeUnique(fields.code, course._id);
    Object.assign(course, fields, { teacher: await resolveTeacherId(req.body.teacherId) });
    await course.save();
    res.json({ message: 'Course updated successfully' });
  })
);

// AdminServlet.assignTeacher — empty teacherId removes the current teacher.
router.put(
  '/courses/:id/teacher',
  asyncHandler(async (req, res) => {
    const course = await findOr404(Course, req.params.id, 'Course');
    course.teacher = isBlank(req.body.teacherId) ? null : await resolveTeacherId(req.body.teacherId);
    await course.save();
    res.json({ message: 'Teacher assigned successfully' });
  })
);

router.delete(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    const course = await findOr404(Course, req.params.id, 'Course');
    await deleteCourseCascade(course);
    res.json({ message: 'Course deleted successfully' });
  })
);

module.exports = router;
