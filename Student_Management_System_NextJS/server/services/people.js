const { User, Student, Teacher, Course, Enrollment, Grade, Attendance } = require('../models');
const { HttpError, isBlank, clean, today, isDateString } = require('../utils/http');

const GENDERS = ['Male', 'Female', 'Other'];

// Personal fields shared by students and teachers (register, admin add/edit, profile).
function personalFields(body, role) {
  const dob = clean(body.dob);
  if (dob && !isDateString(dob)) throw new HttpError(400, 'Date of birth must be a valid date.');
  const gender = clean(body.gender);
  if (gender && !GENDERS.includes(gender)) throw new HttpError(400, 'Choose Male, Female or Other for gender.');
  const fields = {
    firstName: clean(body.firstName),
    lastName: clean(body.lastName),
    dob,
    gender,
    address: clean(body.address),
    phone: clean(body.phone),
  };
  if (role === 'teacher') fields.qualification = clean(body.qualification);
  return fields;
}

function requireNames(fields) {
  if (!fields.firstName || !fields.lastName) throw new HttpError(400, 'First name and last name are required.');
}

async function assertUnique(username, email, exceptUserId) {
  const notSelf = exceptUserId ? { _id: { $ne: exceptUserId } } : {};
  if (username && (await User.exists({ username: username.trim(), ...notSelf }))) {
    throw new HttpError(409, 'Username already exists');
  }
  if (email && (await User.exists({ email: email.trim().toLowerCase(), ...notSelf }))) {
    throw new HttpError(409, 'Email already exists');
  }
}

// Mirrors RegisterServlet / AdminServlet.addStudent / addTeacher:
// create the user first, then the role profile stamped with today's date.
async function createAccount(body, role) {
  const { username, password, email } = body;
  if ([username, password, email].some(isBlank)) {
    throw new HttpError(400, 'All fields are required');
  }
  if (body.confirmPassword != null && body.password !== body.confirmPassword) {
    throw new HttpError(400, 'Passwords do not match');
  }
  await assertUnique(username, email);

  const fields = role === 'admin' ? null : personalFields(body, role);
  if (fields) requireNames(fields);

  const user = await User.create({ username: username.trim(), password, email: email.trim(), role });
  try {
    if (role === 'student') {
      await Student.create({ user: user._id, ...fields, enrollmentDate: today() });
    } else if (role === 'teacher') {
      await Teacher.create({ user: user._id, ...fields, hireDate: today() });
    }
  } catch (err) {
    await User.deleteOne({ _id: user._id });
    throw err;
  }
  return user;
}

// ON DELETE CASCADE from the MySQL schema, done by hand.
async function deleteStudentCascade(student) {
  await Promise.all([
    Enrollment.deleteMany({ student: student._id }),
    Grade.deleteMany({ student: student._id }),
    Attendance.deleteMany({ student: student._id }),
  ]);
  await Student.deleteOne({ _id: student._id });
  await User.deleteOne({ _id: student.user });
}

async function deleteTeacherCascade(teacher) {
  await Course.updateMany({ teacher: teacher._id }, { $set: { teacher: null } }); // ON DELETE SET NULL
  await Teacher.deleteOne({ _id: teacher._id });
  await User.deleteOne({ _id: teacher.user });
}

async function deleteCourseCascade(course) {
  await Promise.all([
    Enrollment.deleteMany({ course: course._id }),
    Grade.deleteMany({ course: course._id }),
    Attendance.deleteMany({ course: course._id }),
  ]);
  await Course.deleteOne({ _id: course._id });
}

const fullName = (p) => (p ? `${p.firstName} ${p.lastName}`.trim() : null);

function studentOut(s, user) {
  return {
    _id: s._id,
    id: s.seq,
    firstName: s.firstName,
    lastName: s.lastName,
    name: fullName(s),
    dob: s.dob,
    gender: s.gender,
    address: s.address,
    phone: s.phone,
    enrollmentDate: s.enrollmentDate,
    email: user ? user.email : undefined,
    username: user ? user.username : undefined,
  };
}

function teacherOut(t, user) {
  return {
    _id: t._id,
    id: t.seq,
    firstName: t.firstName,
    lastName: t.lastName,
    name: fullName(t),
    dob: t.dob,
    gender: t.gender,
    address: t.address,
    phone: t.phone,
    hireDate: t.hireDate,
    qualification: t.qualification,
    email: user ? user.email : undefined,
    username: user ? user.username : undefined,
  };
}

// teacherNames: Map<teacherId string, name>
function courseOut(c, teacherNames) {
  const teacherId = c.teacher ? String(c.teacher._id || c.teacher) : null;
  return {
    _id: c._id,
    id: c.seq,
    code: c.code,
    name: c.name,
    description: c.description,
    creditHours: c.creditHours,
    teacherId,
    teacherName: teacherId && teacherNames ? teacherNames.get(teacherId) || null : null,
  };
}

async function teacherNameMap() {
  const teachers = await Teacher.find({}, 'firstName lastName').lean();
  return new Map(teachers.map((t) => [String(t._id), fullName(t)]));
}

module.exports = {
  personalFields,
  requireNames,
  assertUnique,
  createAccount,
  deleteStudentCascade,
  deleteTeacherCascade,
  deleteCourseCascade,
  fullName,
  studentOut,
  teacherOut,
  courseOut,
  teacherNameMap,
};
