const router = require('express').Router();
const { User } = require('../models');
const { asyncHandler, HttpError, isBlank } = require('../utils/http');
const { issueToken, clearToken, requireAuth } = require('../middleware/auth');
const { createAccount } = require('../services/people');

// LoginServlet
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (isBlank(username) || isBlank(password)) throw new HttpError(400, 'Enter your username and password.');
    const user = await User.findOne({ username: String(username).trim() }).select('+password');
    if (!user || !(await user.checkPassword(password))) {
      throw new HttpError(401, 'Invalid username or password');
    }
    issueToken(res, user);
    res.json({ user: user.toSafeJSON() });
  })
);

// RegisterServlet (students and teachers only, like the original role dropdown)
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!['student', 'teacher'].includes(role)) throw new HttpError(400, 'All fields are required');
    await createAccount(req.body, role);
    res.status(201).json({ message: 'Registration successful. Please login.' });
  })
);

// LogoutServlet
router.post('/logout', (req, res) => {
  clearToken(res);
  res.json({ message: 'You have been signed out.' });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

module.exports = router;
