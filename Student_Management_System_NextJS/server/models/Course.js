const mongoose = require('mongoose');
const { nextSeq } = require('./Counter');

const courseSchema = new mongoose.Schema({
  seq: { type: Number, unique: true },
  code: { type: String, required: true, unique: true, trim: true, maxlength: 10 },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: null },
  creditHours: { type: Number, default: null },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null, index: true },
});

courseSchema.pre('save', async function preSave(next) {
  if (this.isNew && this.seq == null) this.seq = await nextSeq('courses');
  next();
});

module.exports = mongoose.model('Course', courseSchema);
