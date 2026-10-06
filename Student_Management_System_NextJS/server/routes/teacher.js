const router = require('express').Router();
const mongoose = require('mongoose');
const { Teacher, Course, Student, Enrollment, Grade, Attendance } = require('../models');
const { asyncHandler, HttpError, isBlank, today, isDateString } = require('../utils/http');
const { calculateTotal, letterFor, describeGrade } = require('../utils/grading');
const { studentOut, courseOut } = require('../services/people');

const STATUSES = ['Present', 'Late', 'Absent'];

// Every handler needs the teacher profile of the signed-in user ("Teacher profile not found").
router.use(
  asyncHandler(async (req, res, next) => {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) throw new HttpError(404, 'Teacher profile not found');
    req.teacher = teacher;
    next();
  })
);

// "Verify that the teacher teaches this course"
async function ownCourse(req) {
  const { courseId } = req.params;
  if (!mongoose.isValidObjectId(courseId)) throw new HttpError(404, 'Course not found');
  const course = await Course.findOne({ _id: courseId, teacher: req.teacher._id });
  if (!course) throw new HttpError(403, 'You can only manage courses you teach.');
  return course;
}

async function enrolledStudents(courseId) {
  const rows = await Enrollment.find({ course: courseId }, 'student');
  const students = await Student.find({ _id: { $in: rows.map((r) => r.student) } }).sort({ seq: 1 });
  return students;
}

async function assertEnrolled(courseId, studentId) {
  if (!mongoose.isValidObjectId(studentId) || !(await Enrollment.exists({ course: courseId, student: studentId }))) {
    throw new HttpError(400, 'That student is not enrolled in this course.');
  }
}

function parseScore(raw, label) {
  if (isBlank(raw)) return null;
  const n = Number(raw);
  if (Number.isNaN(n) || n < 0 || n > 100) throw new HttpError(400, `${label} must be between 0 and 100.`);
  return Math.round(n * 100) / 100;
}

/* ---------------- dashboard ---------------- */
router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const courses = await Course.find({ teacher: req.teacher._id }).sort({ seq: 1 });
    const counts = await Promise.all(courses.map((c) => Enrollment.countDocuments({ course: c._id })));
    res.json({
      teacher: {
        id: req.teacher.seq,
        firstName: req.teacher.firstName,
        lastName: req.teacher.lastName,
        hireDate: req.teacher.hireDate,
        email: req.user.email,
      },
      courses: courses.map((c, i) => ({ ...courseOut(c), enrolledCount: counts[i] })),
      recentActivities: ['Review recent grade updates.', 'Check recent attendance records.'],
    });
  })
);

router.get(
  '/courses',
  asyncHandler(async (req, res) => {
    const courses = await Course.find({ teacher: req.teacher._id }).sort({ seq: 1 });
    res.json({ courses: courses.map((c) => courseOut(c)) });
  })
);

/* ---------------- grades ---------------- */
router.get(
  '/courses/:courseId/grades',
  asyncHandler(async (req, res) => {
    const course = await ownCourse(req);
    const students = await enrolledStudents(course._id);
    const grades = await Grade.find({ course: course._id });
    const byStudent = new Map(grades.map((g) => [String(g.student), g]));
    res.json({
      course: courseOut(course),
      students: students.map((s) => ({
        ...studentOut(s),
        grade: describeGrade(byStudent.get(String(s._id)), course.creditHours),
      })),
    });
  })
);

// TeacherServlet.updateGrade — insert or update, recomputing total and letter grade.
router.put(
  '/courses/:courseId/grades/:studentId',
  asyncHandler(async (req, res) => {
    const course = await ownCourse(req);
    const { studentId } = req.params;
    await assertEnrolled(course._id, studentId);

    const assignmentScore = parseScore(req.body.assignmentScore, 'Assignment score');
    const midtermScore = parseScore(req.body.midtermScore, 'Midterm score');
    const finalScore = parseScore(req.body.finalScore, 'Final score');
    const totalScore = calculateTotal(assignmentScore, midtermScore, finalScore);

    await Grade.findOneAndUpdate(
      { student: studentId, course: course._id },
      { assignmentScore, midtermScore, finalScore, totalScore, grade: letterFor(totalScore) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ message: 'Grade updated successfully' });
  })
);

/* ---------------- attendance ---------------- */
router.get(
  '/courses/:courseId/attendance',
  asyncHandler(async (req, res) => {
    const course = await ownCourse(req);
    const students = await enrolledStudents(course._id);
    const records = await Attendance.find({ course: course._id }).sort({ date: -1 });

    // { "2025-05-08": { "<studentId>": "Present" } }, newest date first
    const byDate = {};
    for (const r of records) {
      byDate[r.date] = byDate[r.date] || {};
      byDate[r.date][String(r.student)] = r.status;
    }
    const dates = Object.keys(byDate).sort().reverse();

    // Attendance Summary — rate counts Present + Late, like manage-attendance.jsp
    const summary = students.map((s) => {
      const id = String(s._id);
      let present = 0;
      let late = 0;
      let absent = 0;
      for (const d of dates) {
        const st = byDate[d][id];
        if (st === 'Present') present += 1;
        else if (st === 'Late') late += 1;
        else if (st === 'Absent') absent += 1;
      }
      const total = present + late + absent;
      return { studentId: id, present, late, absent, rate: total > 0 ? ((present + late) * 100) / total : 0 };
    });

    res.json({ course: courseOut(course), students: students.map((s) => studentOut(s)), dates, byDate, summary });
  })
);

// showTakeAttendanceForm — existing records for a date (defaults to today)
router.get(
  '/courses/:courseId/attendance/sheet',
  asyncHandler(async (req, res) => {
    const course = await ownCourse(req);
    const date = isDateString(req.query.date) ? req.query.date : today();
    const students = await enrolledStudents(course._id);
    const existing = await Attendance.find({ course: course._id, date });
    const map = Object.fromEntries(existing.map((a) => [String(a.student), a.status]));
    res.json({ course: courseOut(course), date, students: students.map((s) => studentOut(s)), existing: map });
  })
);

async function upsertAttendance(courseId, studentId, date, status) {
  await Attendance.findOneAndUpdate(
    { student: studentId, course: courseId, date },
    { status },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

// takeAttendance — bulk save for one date
router.post(
  '/courses/:courseId/attendance',
  asyncHandler(async (req, res) => {
    const course = await ownCourse(req);
    const { date, records } = req.body;
    if (!isDateString(date)) throw new HttpError(400, 'Choose a valid date.');
    if (!Array.isArray(records) || records.length === 0) throw new HttpError(400, 'No students selected');

    const enrolled = new Set((await Enrollment.find({ course: course._id }, 'student')).map((e) => String(e.student)));
    for (const r of records) {
      if (!r || !enrolled.has(String(r.studentId)) || !STATUSES.includes(r.status)) continue;
      // eslint-disable-next-line no-await-in-loop
      await upsertAttendance(course._id, r.studentId, date, r.status);
    }
    res.json({ message: 'Attendance recorded successfully' });
  })
);

// updateAttendance — one student, one date
router.put(
  '/courses/:courseId/attendance/:date/:studentId',
  asyncHandler(async (req, res) => {
    const course = await ownCourse(req);
    const { date, studentId } = req.params;
    if (!isDateString(date)) throw new HttpError(400, 'Choose a valid date.');
    if (!STATUSES.includes(req.body.status)) throw new HttpError(400, 'Choose Present, Late or Absent.');
    await assertEnrolled(course._id, studentId);
    await upsertAttendance(course._id, studentId, date, req.body.status);
    res.json({ message: 'Attendance updated successfully' });
  })
);

module.exports = router;
