import mongoose from 'mongoose';
import connectToDatabase from '../lib/mongodb.js';
import Student from '../models/Student.js';
import Fee from '../models/Fee.js';
import Class from '../models/Class.js';
import User from '../models/User.js';

async function testStudentAdmissionAndProfiles() {
  console.log('===============================================================');
  console.log('   TESTING STUDENT ADMISSION FEES & 360° PROFILE LEDGER        ');
  console.log('===============================================================');

  await connectToDatabase();

  // 1. Verify Class
  let targetClass = await Class.findOne({ className: 'Class 10', section: 'A' });
  if (!targetClass) {
    targetClass = await Class.create({ className: 'Class 10', section: 'A' });
  }
  console.log(`[PASS] Using Class: ${targetClass.className} - Section ${targetClass.section}`);

  // 2. Test Student Creation with Monthly Fee & Initial Fee Voucher
  const testRoll = 99;
  await Student.deleteMany({ rollNumber: testRoll, classId: targetClass._id });
  
  const testStudent = await Student.create({
    name: 'Zayan Test Student',
    classId: targetClass._id,
    section: 'A',
    rollNumber: testRoll,
    email: `10a-0${testRoll}@edumanage.pk`,
    password: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
    parentPhone: '+923001122334',
    mustChangePassword: true,
    monthlyFee: 6500,
    admissionFee: 2500,
  });
  console.log(`[PASS] Created Student: ${testStudent.name} with Monthly Fee: PKR ${testStudent.monthlyFee}`);

  // Clean and create test Fee
  await Fee.deleteMany({ studentId: testStudent._id });
  const testFee = await Fee.create({
    studentId: testStudent._id,
    month: 'October 2026',
    amount: testStudent.monthlyFee + testStudent.admissionFee,
    status: 'paid',
    paidDate: new Date(),
    paymentMethod: 'Cash',
    transactionId: 'TEST-TXN-001',
  });
  console.log(`[PASS] Created Initial Fee: ${testFee.month} - Amount: PKR ${testFee.amount} (${testFee.status})`);

  // 3. Test Student 360° Data Aggregation
  const studentDossier = await Student.findById(testStudent._id)
    .populate('classId', 'className section')
    .select('-password');
  const fees = await Fee.find({ studentId: testStudent._id }).sort({ createdAt: -1 });

  let totalInvoiced = 0;
  let totalPaid = 0;
  fees.forEach((f) => {
    totalInvoiced += f.amount || 0;
    if (f.status === 'paid') totalPaid += f.amount || 0;
  });

  console.log(`[PASS] Dossier Calculated: Total Invoiced = PKR ${totalInvoiced}, Total Paid = PKR ${totalPaid}`);

  // 4. Test Generating a 2nd Pending Fee Voucher (November 2026)
  const fee2 = await Fee.create({
    studentId: testStudent._id,
    month: 'November 2026',
    amount: testStudent.monthlyFee,
    status: 'pending',
    dueDate: new Date('2026-11-10'),
  });
  console.log(`[PASS] Created 2nd Month Pending Fee: ${fee2.month} - Amount: PKR ${fee2.amount}`);

  // 5. Test Paying the 2nd Fee Voucher
  fee2.status = 'paid';
  fee2.paidDate = new Date();
  fee2.paymentMethod = 'EasyPaisa';
  fee2.transactionId = 'EP-998877';
  await fee2.save();
  console.log(`[PASS] Successfully Paid 2nd Fee: Status = ${fee2.status}, Method = ${fee2.paymentMethod}`);

  // Cleanup test records
  await Fee.deleteMany({ studentId: testStudent._id });
  await Student.findByIdAndDelete(testStudent._id);
  console.log('[PASS] Test Cleanup completed cleanly.');

  console.log('===============================================================');
  console.log('   >>> ALL STUDENT ADMISSION & FEE PROFILE TESTS PASSED! <<<   ');
  console.log('===============================================================');
  process.exit(0);
}

testStudentAdmissionAndProfiles().catch((err) => {
  console.error('Test Failed:', err);
  process.exit(1);
});
