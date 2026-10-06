// Ported 1:1 from com.sms.model.Grade and StudentServlet (GPA / credits / status rules).

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// Weights: assignment 30%, midterm 30%, final 40%. Total is only produced when all three exist.
function calculateTotal(assignment, midterm, final) {
  if (assignment == null || midterm == null || final == null) return null;
  return round2(assignment * 0.3 + midterm * 0.3 + final * 0.4);
}

function letterFor(total) {
  if (total == null) return null;
  if (total >= 90) return 'A';
  if (total >= 80) return 'B';
  if (total >= 70) return 'C';
  if (total >= 60) return 'D';
  return 'F';
}

function gradePointFor(letter) {
  if (letter == null) return null;
  return { A: 4.0, B: 3.0, C: 2.0, D: 1.0 }[letter] ?? 0.0;
}

function statusForPoint(point) {
  if (point == null) return 'Not Graded';
  if (point >= 3.5) return 'Excellent';
  if (point >= 3.0) return 'Very Good';
  if (point >= 2.5) return 'Good';
  if (point >= 2.0) return 'Satisfactory';
  if (point >= 1.0) return 'Poor';
  return 'Failing';
}

function earnedCredits(letter, creditHours) {
  return letter != null && letter !== 'F' ? Number(creditHours || 0) : 0;
}

// Shape a stored Grade document (plus its course credit hours) for the UI.
function describeGrade(grade, creditHours) {
  if (!grade) return null;
  const gradePoint = gradePointFor(grade.grade);
  return {
    assignmentScore: grade.assignmentScore,
    midtermScore: grade.midtermScore,
    finalScore: grade.finalScore,
    totalScore: grade.totalScore,
    grade: grade.grade,
    gradePoint,
    academicStatus: statusForPoint(gradePoint),
    earnedCredits: earnedCredits(grade.grade, creditHours),
  };
}

// grades: [{ grade, creditHours }]
function calculateGPA(entries) {
  let points = 0;
  let credits = 0;
  for (const e of entries) {
    const gp = gradePointFor(e.grade);
    if (gp != null) {
      points += gp * Number(e.creditHours || 0);
      credits += Number(e.creditHours || 0);
    }
  }
  return credits > 0 ? round2(points / credits) : 0;
}

function totalEarnedCredits(entries) {
  return entries.reduce((sum, e) => sum + earnedCredits(e.grade, e.creditHours), 0);
}

function overallStatus(gpa, hasGrades) {
  if (!hasGrades) return 'Not Available';
  if (gpa >= 3.5) return 'Excellent';
  if (gpa >= 3.0) return 'Very Good';
  if (gpa >= 2.5) return 'Good';
  if (gpa >= 2.0) return 'Satisfactory';
  if (gpa >= 1.0) return 'Poor';
  return 'Failing';
}

module.exports = {
  calculateTotal,
  letterFor,
  gradePointFor,
  statusForPoint,
  earnedCredits,
  describeGrade,
  calculateGPA,
  totalEarnedCredits,
  overallStatus,
};
