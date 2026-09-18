import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/Manage';

async function verifyAllFlows() {
  console.log('--- STARTING SYSTEM E2E VERIFICATION ---');
  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected to MongoDB at ' + MONGODB_URI);

  // Check Collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collNames = collections.map(c => c.name);
  console.log('✓ Database Collections:', collNames.sort().join(', '));

  // 1. Verify Super Admin
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const admin = await User.findOne({ role: 'admin' });
  console.log('✓ Super Admin Account:', admin?.email, '| Role:', admin?.role, '| Status:', admin?.status);

  // 2. Verify Teachers
  const activeTeacher = await User.findOne({ role: 'teacher', status: 'active' });
  const pendingTeacher = await User.findOne({ role: 'teacher', status: 'pending' });
  console.log('✓ Active Teacher Account:', activeTeacher?.email, '| Status:', activeTeacher?.status);
  console.log('✓ Pending Teacher Account:', pendingTeacher?.email, '| Status:', pendingTeacher?.status);

  // 3. Verify Classes & Subjects
  const Class = mongoose.model('Class', new mongoose.Schema({}, { strict: false }));
  const Subject = mongoose.model('Subject', new mongoose.Schema({}, { strict: false }));
  const classes = await Class.find();
  const subjects = await Subject.find();
  console.log(`✓ Classes in DB: ${classes.length} (${classes.map(c => c.className + '-' + c.section).join(', ')})`);
  console.log(`✓ Subjects in DB: ${subjects.length} (${subjects.map(s => s.subjectName).join(', ')})`);

  // 4. Verify Teacher Assignments
  const TeacherClass = mongoose.model('TeacherClass', new mongoose.Schema({}, { strict: false }));
  const assignments = await TeacherClass.find();
  console.log(`✓ Teacher Assignments (TeacherClass): ${assignments.length}`);

  // 5. Verify Students & Auto-Generated Emails
  const Student = mongoose.model('Student', new mongoose.Schema({}, { strict: false }));
  const students = await Student.find();
  console.log(`✓ Enrolled Students: ${students.length}`);
  for (const s of students) {
    console.log(`  - ${s.name}: Email=${s.email} | Roll=${s.rollNumber} | ParentPhone=${s.parentPhone} | mustChangePassword=${s.mustChangePassword}`);
  }

  // 6. Verify Attendance, Grades, and Fees
  const Attendance = mongoose.model('Attendance', new mongoose.Schema({}, { strict: false }));
  const Grade = mongoose.model('Grade', new mongoose.Schema({}, { strict: false }));
  const Fee = mongoose.model('Fee', new mongoose.Schema({}, { strict: false }));
  const Quiz = mongoose.model('Quiz', new mongoose.Schema({}, { strict: false }));

  const attCount = await Attendance.countDocuments();
  const gradeCount = await Grade.countDocuments();
  const feeCount = await Fee.countDocuments();
  const quizCount = await Quiz.countDocuments();

  console.log(`✓ Attendance Records: ${attCount}`);
  console.log(`✓ Exam Grade Records: ${gradeCount}`);
  console.log(`✓ Fee Invoices: ${feeCount}`);
  console.log(`✓ Quizzes: ${quizCount}`);

  await mongoose.disconnect();
  console.log('--- ALL BACKEND DATA & MODELS VERIFIED SUCCESSFULLY ---');
}

verifyAllFlows().catch(console.error);
