const mongoose = require('mongoose');
const { nextSeq } = require('./Counter');

const studentSchema = new mongoose.Schema({
  seq: { type: Number, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  firstName: { type: String, required: true, trim: true, maxlength: 50 },
  lastName: { type: String, required: true, trim: true, maxlength: 50 },
  dob: { type: String, default: null }, // YYYY-MM-DD
  gender: { type: String, enum: ['Male', 'Female', 'Other', null], default: null },
  address: { type: String, default: null },
  phone: { type: String, default: null, maxlength: 20 },
  enrollmentDate: { type: String, default: null }, // YYYY-MM-DD
});

studentSchema.pre('save', async function preSave(next) {
  if (this.isNew && this.seq == null) this.seq = await nextSeq('students');
  next();
});

module.exports = mongoose.model('Student', studentSchema);
