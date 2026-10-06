const router = require('express').Router();
const mongoose = require('mongoose');
const { Student, Course, Enrollment, Grade, Attendance } = require('../models');
const { asyncHandler, HttpError, today } = require('../utils/http');
const {
  describeGrade,
  calculateGPA,
  totalEarnedCredits,
  overallStatus,
} = require('../utils/grading');
const { courseOut, teacherNameMap } = require('../services/people');

router.use(
  asyncHandler(async (req, res, next) => {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) throw new HttpError(404, 'Student profile not found');
    req.student = student;
    next();
  })
);

async function enrolledCourses(studentId) {
  const rows = await Enrollment.find({ student: studentId }, 'course');
  return Course.find({ _id: { $in: rows.map((r) => r.course) } }).sort({ seq: 1 });
}

// GPA, credits and status exactly as StudentServlet calculated them.
async function academicSummary(studentId) {
  const grades = await Grade.find({ student: studentId });
  const courses = await Course.find({ _id: { $in: grades.map((g) => g.course) } });
  const creditMap = new Map(courses.map((c) => [String(c._id), c.creditHours]));
  const entries = grades
    .filter((g) => creditMap.has(String(g.course)))
    .map((g) => ({ grade: g.grade, creditHours: creditMap.get(String(g.course)) }));
  const gpa = calculateGPA(entries);
  const hasGrades = entries.some((e) => e.grade != null);
  return {
    grades,
    summary: {
      gpa,
      totalEarnedCredits: totalEarnedCredits(entries),
      academicStatus: overallStatus(gpa, hasGrades),
    },
  };
}

const studentCard = (req) => ({
  id: req.student.seq,
  firstName: req.student.firstName,
  lastName: req.student.lastName,
  enrollmentDate: req.student.enrollmentDate,
  email: req.user.email,
});

/* ---------------- dashboard ---------------- */
router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const [courses, names, { summary }] = await Promise.all([
      enrolledCourses(req.student._id),
      teacherNameMap(),
      academicSummary(req.student._id),
    ]);
    res.json({
      student: studentCard(req),
      summary,
      courses: courses.map((c) => courseOut(c, names)),
      deadlines: [
        { title: 'Course Selection', description: 'Check available courses for enrollment.' },
        { title: 'Attendance Records', description: 'Review your attendance records.' },
      ],
    });
  })
);

/* ---------------- my courses / registration ---------------- */
router.get(
  '/courses',
  asyncHandler(async (req, res) => {
    const [courses, names] = await Promise.all([enrolledCourses(req.student._id), teacherNameMap()]);
    res.json({ courses: courses.map((c) => courseOut(c, names)) });
  })
);

router.get(
  '/registration',
  asyncHandler(async (req, res) => {
    const [all, enrolled, names] = await Promise.all([
      Course.find().sort({ seq: 1 }),
      Enrollment.find({ student: req.student._id }, 'course'),
      teacherNameMap(),
    ]);
    const enrolledIds = new Set(enrolled.map((e) => String(e.course)));
    res.json({
      courses: all.map((c) => ({ ...courseOut(c, names), enrolled: enrolledIds.has(String(c._id)) })),
    });
  })
);

async function findCourse(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Course not found');
  const course = await Course.findById(id);
  if (!course) throw new HttpError(404, 'Course not found');
  return course;
}

router.post(
  '/courses/:courseId/enroll',
  asyncHandler(async (req, res) => {
    const course = await findCourse(req.params.courseId);
    if (await Enrollment.exists({ student: req.student._id, course: course._id })) {
      throw new HttpError(409, `You are already enrolled in ${course.code}.`);
    }
    await Enrollment.create({ student: req.student._id, course: course._id, enrollmentDate: today() });
    res.status(201).json({ message: 'Successfully enrolled in course' });
  })
);

router.delete(
  '/courses/:courseId',
  asyncHandler(async (req, res) => {
    const course = await findCourse(req.params.courseId);
    const { deletedCount } = await Enrollment.deleteOne({ student: req.student._id, course: course._id });
    if (!deletedCount) throw new HttpError(400, 'Failed to drop course');
    res.json({ message: 'Successfully dropped course' });
  })
);

/* ---------------- grades ---------------- */
router.get(
  '/grades',
  asyncHandler(async (req, res) => {
    const [courses, { grades, summary }] = await Promise.all([
      enrolledCourses(req.student._id),
      academicSummary(req.student._id),
    ]);
    const byCourse = new Map(grades.map((g) => [String(g.course), g]));
    res.json({
      summary,
      courses: courses.map((c) => ({
        ...courseOut(c),
        grade: describeGrade(byCourse.get(String(c._id)), c.creditHours),
      })),
    });
  })
);

/* ---------------- attendance ---------------- */
router.get(
  '/attendance',
  asyncHandler(async (req, res) => {
    const [courses, records] = await Promise.all([
      enrolledCourses(req.student._id),
      Attendance.find({ student: req.student._id }).sort({ date: -1 }),
    ]);
    res.json({
      courses: courses.map((c) => {
        const list = records.filter((r) => String(r.course) === String(c._id));
        const present = list.filter((r) => r.status === 'Present').length;
        const late = list.filter((r) => r.status === 'Late').length;
        const absent = list.filter((r) => r.status === 'Absent').length;
        return {
          ...courseOut(c),
          // AttendanceDao.getAttendancePercentage counts only "Present"
          percentage: list.length ? (present / list.length) * 100 : 0,
          stats: { total: list.length, present, late, absent },
          records: list.map((r) => ({ date: r.date, status: r.status })),
        };
      }),
    });
  })
);

module.exports = router;
