const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { nextSeq } = require('./Counter');

const userSchema = new mongoose.Schema(
  {
    seq: { type: Number, unique: true },
    username: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    password: { type: String, required: true, select: false },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 100 },
    role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

userSchema.pre('save', async function preSave(next) {
  if (this.isNew && this.seq == null) this.seq = await nextSeq('users');
  // Passwords are hashed with BCrypt exactly like the Java app. The $2a$ hashes carried
  // over from the MySQL dump are already hashed, so they are stored unchanged.
  if (this.isModified('password') && !/^\$2[aby]\$\d{2}\$.{53}$/.test(this.password)) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.checkPassword = function checkPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    _id: this._id,
    id: this.seq,
    username: this.username,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
