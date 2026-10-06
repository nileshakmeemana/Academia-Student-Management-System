/* Imports the rows from Database/student_management_system.sql into MongoDB.
 * Run:  npm run seed      (wipes the SMS collections first; reads MONGO_URI from .env.local or .env)
 *
 * The BCrypt hashes are copied as-is, so the original logins still work:
 *   admin / 123      teacher / 123      nilesh / 32915NNAmcc
 */
require('dotenv').config({ path: ['.env.local', '.env'] });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const {
  User, Student, Teacher, Course, Enrollment, Grade, Attendance, Counter,
} = require('./models');

const oid = () => new mongoose.Types.ObjectId();

async function run() {
  await connectDB(process.env.MONGO_URI);
  const models = [User, Student, Teacher, Course, Enrollment, Grade, Attendance, Counter];
  await Promise.all(models.map((m) => m.deleteMany({})));
  await Promise.all(models.map((m) => m.syncIndexes()));

  // users (id 2, 3, 4)
  const users = {
    2: { _id: oid(), seq: 2, username: 'nilesh', password: '$2a$10$fqZQRvnGo4YDNVvBpjnGW.8XTIYRGC4mwWWKUEVy28Y4z2Xt8OW.a', email: 'nilesh@gmail.com', role: 'student', createdAt: new Date('2025-05-03T19:36:10Z') },
    3: { _id: oid(), seq: 3, username: 'admin', password: '$2a$10$isNyEHCJQZg3ORbL3DR3req1CjaUQmRtMH1itpcdMtyI4ej4Dsav6', email: 'admin@sms.com', role: 'admin', createdAt: new Date('2025-05-03T20:40:00Z') },
    4: { _id: oid(), seq: 4, username: 'teacher', password: '$2a$10$GvblyW/qT5w/ODZSP5wiBOUJZCs/NDD17kaJ/bd9HGaTCHicVnSNu', email: 'teacher@sms.com', role: 'teacher', createdAt: new Date('2025-05-03T20:48:24Z') },
  };
  // Raw collection inserts skip the pre-save hooks, so hashes and ids stay exactly as in MySQL.
  await User.collection.insertMany(Object.values(users));

  const teacher = { _id: oid(), seq: 1, user: users[4]._id, firstName: 'Chaminda', lastName: 'Wijesinghe', dob: null, gender: 'Male', address: 'Colombo', phone: '0787223917', hireDate: '2025-05-04', qualification: 'Master of Science in Computer Science' };
  await Teacher.collection.insertOne(teacher);

  const student = { _id: oid(), seq: 1, user: users[2]._id, firstName: 'Nilesh', lastName: 'Akmeemana', dob: '2003-01-24', gender: 'Male', address: 'Colombo', phone: '0787223917', enrollmentDate: '2025-05-04' };
  await Student.collection.insertOne(student);

  const course = { _id: oid(), seq: 1, code: 'SE204.3', name: 'Development of Enterprise Applications I', description: 'DEA - 1', creditHours: 4, teacher: teacher._id };
  await Course.collection.insertOne(course);

  await Enrollment.collection.insertOne({ student: student._id, course: course._id, enrollmentDate: '2025-05-09' });

  await Grade.collection.insertOne({ student: student._id, course: course._id, assignmentScore: 90, midtermScore: 90, finalScore: 90, totalScore: 90, grade: 'A' });

  await Attendance.collection.insertMany([
    { student: student._id, course: course._id, date: '2025-05-05', status: 'Present' },
    { student: student._id, course: course._id, date: '2025-05-07', status: 'Absent' },
    { student: student._id, course: course._id, date: '2025-05-08', status: 'Present' },
  ]);

  // Continue numbering after the imported rows.
  await Counter.insertMany([
    { _id: 'users', seq: 4 },
    { _id: 'students', seq: 1 },
    { _id: 'teachers', seq: 1 },
    { _id: 'courses', seq: 1 },
  ]);

  console.log('Seed complete: 3 users, 1 teacher, 1 student, 1 course, 1 enrollment, 1 grade, 3 attendance rows.');
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
