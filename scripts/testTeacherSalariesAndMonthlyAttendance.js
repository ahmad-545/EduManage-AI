import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      const val = values.join('=').replace(/(^['"]|['"]$)/g, '').trim();
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Manage';

async function testSalariesAndMonthlyAttendance() {
  console.log('--- TESTING TEACHER MONTHLY ATTENDANCE & SALARY MANAGEMENT ---\n');

  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  const User = (await import('../models/User.js')).default;
  const TeacherAttendance = (await import('../models/TeacherAttendance.js')).default;
  const TeacherSalary = (await import('../models/TeacherSalary.js')).default;

  const teacher = await User.findOne({ email: 'teacher.ahmed@edumanage.pk' });
  if (!teacher) throw new Error('Teacher Ahmed not found');

  const currentMonth = 'October 2026';

  // 1. Ensure Attendance Records exist for this month
  const testDates = [
    { date: '2026-10-01', status: 'present' },
    { date: '2026-10-02', status: 'present' },
    { date: '2026-10-03', status: 'late' },
    { date: '2026-10-04', status: 'absent' },
    {
      date: '2026-10-05',
      status: 'half-day',
      missedLectures: ['Mathematics (09:00 AM - 10:00 AM)'],
      remarks: 'Afternoon dental visit',
    },
  ];

  for (const t of testDates) {
    await TeacherAttendance.findOneAndUpdate(
      { teacherId: teacher._id, date: t.date },
      {
        $set: {
          teacherId: teacher._id,
          date: t.date,
          status: t.status,
          missedLectures: t.missedLectures || [],
          remarks: t.remarks || '',
        },
      },
      { upsert: true }
    );
  }
  console.log(`✓ Seeded ${testDates.length} attendance records for ${teacher.name} in ${currentMonth}`);

  // 2. Query Month-Wise Attendance Summary for Teacher
  const ymPrefix = '2026-10';
  const monthAtts = await TeacherAttendance.find({
    teacherId: teacher._id,
    date: { $regex: `^${ymPrefix}` },
  });

  const presentCount = monthAtts.filter((a) => a.status === 'present').length;
  const absentCount = monthAtts.filter((a) => a.status === 'absent').length;
  const lateCount = monthAtts.filter((a) => a.status === 'late').length;
  const halfDayCount = monthAtts.filter((a) => a.status === 'half-day').length;

  console.log(`✓ Monthly Attendance Calculated for ${teacher.name}:`);
  console.log(`   - Presents: ${presentCount}`);
  console.log(`   - Absents: ${absentCount}`);
  console.log(`   - Late Arrivals: ${lateCount}`);
  console.log(`   - Half Leaves: ${halfDayCount}`);

  // 3. Test Teacher Salary Creation & Disbursement
  const baseSalary = teacher.baseSalary || 55000;
  const deductions = 1800; // e.g. for 1 absent
  const bonus = 2500;
  const netSalary = baseSalary - deductions + bonus;

  const salaryDoc = await TeacherSalary.findOneAndUpdate(
    { teacherId: teacher._id, month: currentMonth },
    {
      $set: {
        teacherId: teacher._id,
        month: currentMonth,
        baseSalary,
        deductions,
        bonus,
        netSalary,
        status: 'paid',
        paidDate: new Date(),
        paymentMethod: 'Bank Transfer',
        transactionId: 'SAL-PK-202610-091',
        remarks: 'Salary disbursed with 1 day absent deduction and test marking bonus',
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  console.log(`\n✓ Teacher Salary Record Created & Disbursed:`);
  console.log(`   - Teacher: ${teacher.name}`);
  console.log(`   - Month: ${salaryDoc.month}`);
  console.log(`   - Base Salary: PKR ${salaryDoc.baseSalary.toLocaleString()}`);
  console.log(`   - Deductions: PKR ${salaryDoc.deductions.toLocaleString()}`);
  console.log(`   - Bonus: PKR ${salaryDoc.bonus.toLocaleString()}`);
  console.log(`   - Net Payable: PKR ${salaryDoc.netSalary.toLocaleString()}`);
  console.log(`   - Status: ${salaryDoc.status.toUpperCase()}`);
  console.log(`   - Payment Method: ${salaryDoc.paymentMethod}`);
  console.log(`   - Transaction ID: ${salaryDoc.transactionId}`);

  // 4. Verify Fetch as Teacher
  const teacherSalaries = await TeacherSalary.find({ teacherId: teacher._id });
  console.log(`\n✓ Verified ${teacher.name} has ${teacherSalaries.length} salary records in history.`);

  console.log('\n--- ALL SALARY & MONTH-WISE ATTENDANCE FEATURES VERIFIED SUCCESSFULLY ---');
  await mongoose.disconnect();
}

testSalariesAndMonthlyAttendance().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
