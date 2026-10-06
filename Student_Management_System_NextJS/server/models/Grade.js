const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  assignmentScore: { type: Number, default: null },
  midtermScore: { type: Number, default: null },
  finalScore: { type: Number, default: null },
  totalScore: { type: Number, default: null },
  grade: { type: String, default: null, maxlength: 2 },
});

gradeSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Grade', gradeSchema);
