const router = require('express').Router();
const { User, Student, Teacher } = require('../models');
const { asyncHandler, HttpError, isBlank, clean } = require('../utils/http');
const { personalFields, requireNames, studentOut, teacherOut } = require('../services/people');
const { assertStrongPassword } = require('../utils/password');
const { issueToken } = require('../middleware/auth');
const { rateLimit } = require('../utils/rateLimit');
const { PASSWORD_IP_LIMIT } = require('../config/security');

async function profilePayload(user) {
  const payload = { user: user.toSafeJSON(), student: null, teacher: null };
  if (user.role === 'student') {
    const s = await Student.findOne({ user: user._id });
    payload.student = s ? studentOut(s) : null;
  } else if (user.role === 'teacher') {
    const t = await Teacher.findOne({ user: user._id });
    payload.teacher = t ? teacherOut(t) : null;
  }
  return payload;
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await profilePayload(req.user));
  })
);

// /profile/update-student and /profile/update-teacher
router.put(
  '/',
  asyncHandler(async (req, res) => {
    const { role } = req.user;
    if (role !== 'student' && role !== 'teacher') throw new HttpError(403, 'Unauthorized access');
    const Model = role === 'student' ? Student : Teacher;
    const doc = await Model.findOne({ user: req.user._id });
    if (!doc) throw new HttpError(404, `${role === 'student' ? 'Student' : 'Teacher'} profile not found`);
    const fields = personalFields(req.body, role);
    requireNames(fields);
    if (!fields.dob) delete fields.dob;
    Object.assign(doc, fields);
    await doc.save();
    res.json({ message: 'Profile updated successfully', ...(await profilePayload(req.user)) });
  })
);

router.put(
  '/password',
  rateLimit('password', PASSWORD_IP_LIMIT, 'Too many password attempts.'),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if ([currentPassword, newPassword, confirmPassword].some(isBlank)) throw new HttpError(400, 'All fields are required');
    if (newPassword !== confirmPassword) throw new HttpError(400, 'New passwords do not match');
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.checkPassword(currentPassword))) throw new HttpError(400, 'Current password is incorrect');
    if (currentPassword === newPassword) throw new HttpError(400, 'Choose a password you have not used here before.');
    assertStrongPassword(newPassword, { username: user.username, email: user.email });
    user.password = newPassword;
    // Signs out every other device; this browser gets a fresh session below.
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    await user.save();
    issueToken(res, user);
    res.json({ message: 'Password changed. Other devices have been signed out.' });
  })
);

router.put(
  '/email',
  rateLimit('password', PASSWORD_IP_LIMIT, 'Too many password attempts.'),
  asyncHandler(async (req, res) => {
    const newEmail = clean(req.body.newEmail);
    const { password } = req.body;
    if (!newEmail || isBlank(password)) throw new HttpError(400, 'All fields are required');
    const user = await User.findById(req.user._id).select('+password');
    if (newEmail.toLowerCase() !== user.email && (await User.exists({ email: newEmail.toLowerCase() }))) {
      throw new HttpError(409, 'Email already in use');
    }
    if (!(await user.checkPassword(password))) throw new HttpError(400, 'Password is incorrect');
    user.email = newEmail;
    await user.save();
    res.json({ message: 'Email updated successfully', ...(await profilePayload(user)) });
  })
);

module.exports = router;
