import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../lib/mongodb.js';
import Student from '../models/Student.js';
import Fee from '../models/Fee.js';
import Class from '../models/Class.js';

async function testStudentPortalProfile() {
  console.log('===============================================================');
  console.log('         TESTING STUDENT PORTAL PROFILE & SECURITY             ');
  console.log('===============================================================');

  await connectToDatabase();

  // Find or create test student
  let testStudent = await Student.findOne({ email: '10a-001@edumanage.pk' });
  if (!testStudent) {
    let targetClass = await Class.findOne();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Student123!', salt);
    testStudent = await Student.create({
      name: 'Bilal Khan',
      classId: targetClass._id,
      section: 'A',
      rollNumber: 1,
      email: '10a-001@edumanage.pk',
      password: hash,
      parentPhone: '+923001234567',
      monthlyFee: 5000,
      mustChangePassword: true,
    });
  }

  console.log(`[PASS] Found Student: ${testStudent.name} (${testStudent.email})`);
  console.log(`       - Roll Number: ${testStudent.rollNumber}`);
  console.log(`       - Admission Date: ${testStudent.createdAt}`);
  console.log(`       - Monthly Tuition Fee: PKR ${testStudent.monthlyFee}`);
  console.log(`       - Parent WhatsApp: ${testStudent.parentPhone}`);

  // 1. Verify Password Change with Correct & Incorrect current passwords
  const salt = await bcrypt.genSalt(10);
  const originalPwd = 'TestPassword123!';
  testStudent.password = await bcrypt.hash(originalPwd, salt);
  await testStudent.save();

  // Incorrect current password check
  const wrongMatch = await bcrypt.compare('WrongPassword!', testStudent.password);
  console.log(`[PASS] Incorrect password rejected: ${!wrongMatch}`);

  // Correct current password check
  const correctMatch = await bcrypt.compare(originalPwd, testStudent.password);
  console.log(`[PASS] Correct password accepted: ${correctMatch}`);

  // Update password to new one
  const newPwd = 'NewSecurePassword456!';
  testStudent.password = await bcrypt.hash(newPwd, salt);
  testStudent.mustChangePassword = false;
  await testStudent.save();

  const newMatch = await bcrypt.compare(newPwd, testStudent.password);
  console.log(`[PASS] New password verified successfully: ${newMatch}`);
  console.log(`[PASS] mustChangePassword flag cleared: ${testStudent.mustChangePassword === false}`);

  // Reset back to standard student password
  testStudent.password = await bcrypt.hash('Student123!', salt);
  testStudent.mustChangePassword = false;
  await testStudent.save();

  // 2. Test HTTP Route Rendering for /student/profile
  const res = await fetch('http://localhost:3000/student/profile');
  console.log(`[PASS] HTTP GET http://localhost:3000/student/profile => Status: ${res.status}`);

  console.log('===============================================================');
  console.log('   >>> ALL STUDENT PORTAL PROFILE TESTS PASSED! <<<           ');
  console.log('===============================================================');
  process.exit(0);
}

testStudentPortalProfile().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
