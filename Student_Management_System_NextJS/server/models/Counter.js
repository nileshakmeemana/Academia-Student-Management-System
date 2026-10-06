const mongoose = require('mongoose');

// Sequential numeric ids so the UI can keep showing "Student ID 1", "Teacher ID 1"
// like the original MySQL AUTO_INCREMENT columns did.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

async function nextSeq(name) {
  const doc = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
}

async function bumpSeq(name, atLeast) {
  const doc = await Counter.findById(name);
  if (!doc) return Counter.create({ _id: name, seq: atLeast });
  if (doc.seq < atLeast) {
    doc.seq = atLeast;
    await doc.save();
  }
  return doc;
}

module.exports = { Counter, nextSeq, bumpSeq };
