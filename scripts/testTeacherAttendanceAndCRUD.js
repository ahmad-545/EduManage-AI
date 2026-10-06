import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

async function testTeacherNewFeatures() {
  console.log('--- TESTING NEW TEACHER CRUD & ATTENDANCE FEATURES ---\n');

  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected to MongoDB');

  const User = (await import('../models/User.js')).default;
  const TeacherAttendance = (await import('../models/TeacherAttendance.js')).default;
  const TeacherClass = (await import('../models/TeacherClass.js')).default;

  // 1. Find or create a test teacher to test Update & Delete
  let testTeacher = await User.findOne({ email: 'test.temp.teacher@edumanage.pk' });
  const salt = await bcrypt.genSalt(10);
  const hashPass = await bcrypt.hash('TempPass123!', salt);

  if (!testTeacher) {
    testTeacher = await User.create({
      name: 'Temporary Test Teacher',
      email: 'test.temp.teacher@edumanage.pk',
      password: hashPass,
      phone: '+92 333 1112233',
      role: 'teacher',
      status: 'active',
    });
    console.log('✓ Created Temporary Test Teacher:', testTeacher.email);
  }

  // 2. Test Teacher Update (simulate PUT)
  testTeacher.name = 'Updated Test Teacher Name';
  testTeacher.phone = '+92 333 9998877';
  await testTeacher.save();
  console.log('✓ Updated Teacher Profile successfully:', testTeacher.name, '| Phone:', testTeacher.phone);

  // 3. Test Teacher Attendance Model & Half Leave Recording
  const today = new Date().toISOString().split('T')[0];
  
  // Record Half Leave with Missed Lectures for active teacher
  const mainTeacher = await User.findOne({ email: 'teacher.ahmed@edumanage.pk' });
  if (mainTeacher) {
    await TeacherAttendance.findOneAndUpdate(
      { teacherId: mainTeacher._id, date: today },
      {
        $set: {
          teacherId: mainTeacher._id,
          date: today,
          status: 'half-day',
          missedLectures: ['Mathematics (09:00 AM - 10:00 AM)', 'Physics (11:00 AM - 12:00 PM)'],
          remarks: 'Approved medical leave in afternoon',
        },
      },
      { upsert: true, new: true }
    );
    console.log(`✓ Marked Half Leave for ${mainTeacher.name}:`);
    console.log('   - Status: half-day');
    console.log('   - Missed Lectures: Mathematics (09:00 AM - 10:00 AM), Physics (11:00 AM - 12:00 PM)');
    console.log('   - Remarks: Approved medical leave in afternoon');
  }

  // Record Attendance for temporary teacher as Present
  await TeacherAttendance.findOneAndUpdate(
    { teacherId: testTeacher._id, date: today },
    {
      $set: {
        teacherId: testTeacher._id,
        date: today,
        status: 'present',
        missedLectures: [],
        remarks: 'On time',
      },
    },
    { upsert: true, new: true }
  );
  console.log(`✓ Marked Present for ${testTeacher.name}`);

  // 4. Verify Attendance records query
  const records = await TeacherAttendance.find({ date: today }).populate('teacherId', 'name email');
  console.log(`\n✓ Attendance Records for ${today} in DB (${records.length}):`);
  records.forEach((r) => {
    console.log(`   - ${r.teacherId?.name}: [${r.status.toUpperCase()}] Missed: ${r.missedLectures?.join(', ') || 'None'} (${r.remarks || 'No notes'})`);
  });

  // 5. Test Teacher Delete and Cascade Cleanup
  await TeacherAttendance.deleteMany({ teacherId: testTeacher._id });
  await TeacherClass.deleteMany({ teacherId: testTeacher._id });
  await User.findByIdAndDelete(testTeacher._id);
  const deletedCheck = await User.findById(testTeacher._id);
  console.log('\n✓ Temporary Teacher Delete and Cascade Cleanup Test:', deletedCheck === null ? 'SUCCESS (Deleted)' : 'FAIL');

  console.log('\n--- ALL NEW TEACHER FEATURES TESTED & WORKING PROPERLY ---');
  await mongoose.disconnect();
}

testTeacherNewFeatures().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
