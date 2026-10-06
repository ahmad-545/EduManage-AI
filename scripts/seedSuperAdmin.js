import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load .env.local manually if not loaded
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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/manage';
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@edumanage.pk';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'AdminPass123!';
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Super Administrator';

// Inline Schemas for independent execution
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: { type: String, enum: ['admin', 'teacher'] },
  status: { type: String, enum: ['pending', 'active'] },
  baseSalary: { type: Number, default: 50000 },
}, { timestamps: true });

const ClassSchema = new mongoose.Schema({
  className: String,
  section: String,
}, { timestamps: true });

const SubjectSchema = new mongoose.Schema({
  subjectName: String,
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
}, { timestamps: true });

const StudentSchema = new mongoose.Schema({
  name: String,
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  section: String,
  rollNumber: Number,
  email: { type: String, unique: true },
  password: String,
  parentPhone: String,
  mustChangePassword: { type: Boolean, default: true },
  admissionFee: { type: Number, default: 5000 },
  monthlyFee: { type: Number, default: 4500 },
  admissionDate: { type: Date, default: Date.now },
}, { timestamps: true });

const TeacherClassSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
}, { timestamps: true });

const ScheduleSchema = new mongoose.Schema({
  teacherClassId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherClass' },
  day: String,
  timeSlot: String,
}, { timestamps: true });

const FeeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  month: String,
  amount: Number,
  status: String,
  paidDate: Date,
  dueDate: Date,
  paymentMethod: String,
  transactionId: String,
}, { timestamps: true });

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  date: String,
  status: String,
}, { timestamps: true });

const GradeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  examType: String,
  marks: Number,
  totalMarks: Number,
}, { timestamps: true });

const QuizSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  title: String,
  maxMarks: Number,
  date: String,
}, { timestamps: true });

const QuizResultSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  marksObtained: Number,
}, { timestamps: true });

async function seed() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  const Class = mongoose.models.Class || mongoose.model('Class', ClassSchema);
  const Subject = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
  const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
  const TeacherClass = mongoose.models.TeacherClass || mongoose.model('TeacherClass', TeacherClassSchema);
  const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
  const Fee = mongoose.models.Fee || mongoose.model('Fee', FeeSchema);
  const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
  const Grade = mongoose.models.Grade || mongoose.model('Grade', GradeSchema);
  const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);
  const QuizResult = mongoose.models.QuizResult || mongoose.model('QuizResult', QuizResultSchema);

  // 1. Seed Super Admin
  const existingAdmin = await User.findOne({ email: SUPER_ADMIN_EMAIL.toLowerCase() });
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, salt);

  if (!existingAdmin) {
    await User.create({
      name: SUPER_ADMIN_NAME,
      email: SUPER_ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      phone: '+92 300 1234567',
      role: 'admin',
      status: 'active',
    });
    console.log(`[OK] Super Admin created: ${SUPER_ADMIN_EMAIL}`);
  } else {
    existingAdmin.password = hashedPassword;
    existingAdmin.status = 'active';
    existingAdmin.role = 'admin';
    await existingAdmin.save();
    console.log(`[OK] Super Admin updated: ${SUPER_ADMIN_EMAIL}`);
  }

  // 2. Seed Base Classes
  const classDefs = [
    { className: 'Class 9', section: 'A' },
    { className: 'Class 10', section: 'A' },
    { className: 'Class 10', section: 'B' },
  ];

  const classMap = {};
  for (const c of classDefs) {
    let cls = await Class.findOne({ className: c.className, section: c.section });
    if (!cls) {
      cls = await Class.create(c);
      console.log(`[OK] Created Class: ${c.className} - Section ${c.section}`);
    }
    classMap[`${c.className}-${c.section}`] = cls;
  }

  // 3. Seed Base Subjects
  const class10A = classMap['Class 10-A'];
  const subjectNames = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'];
  const subjectMap = {};

  if (class10A) {
    for (const name of subjectNames) {
      let subj = await Subject.findOne({ classId: class10A._id, subjectName: name });
      if (!subj) {
        subj = await Subject.create({ classId: class10A._id, subjectName: name });
        console.log(`[OK] Created Subject: ${name} for Class 10-A`);
      }
      subjectMap[name] = subj;
    }
  }

  // 4. Seed an Approved Teacher & a Pending Teacher
  const teacherEmail = 'teacher.ahmed@edumanage.pk';
  let teacherAhmed = await User.findOne({ email: teacherEmail });
  if (!teacherAhmed) {
    const tPass = await bcrypt.hash('TeacherPass123!', salt);
    teacherAhmed = await User.create({
      name: 'Sir Ahmed Raza',
      email: teacherEmail,
      password: tPass,
      phone: '+92 321 9876543',
      role: 'teacher',
      status: 'active',
      baseSalary: 65000,
    });
    console.log(`[OK] Created Approved Teacher: ${teacherEmail} (Password: TeacherPass123!)`);
  }

  const pendingEmail = 'teacher.sana@edumanage.pk';
  let pendingTeacher = await User.findOne({ email: pendingEmail });
  if (!pendingTeacher) {
    const pPass = await bcrypt.hash('TeacherPass123!', salt);
    pendingTeacher = await User.create({
      name: 'Ms. Sana Tariq',
      email: pendingEmail,
      password: pPass,
      phone: '+92 333 5554433',
      role: 'teacher',
      status: 'pending',
    });
    console.log(`[OK] Created Pending Teacher for approval queue: ${pendingEmail}`);
  } else {
    pendingTeacher.status = 'pending';
    await pendingTeacher.save();
    console.log(`[OK] Reset Pending Teacher for approval queue: ${pendingEmail}`);
  }

  // 5. Assign Teacher Ahmed to Class 10-A Mathematics & Physics
  if (teacherAhmed && class10A && subjectMap['Mathematics']) {
    let tcMath = await TeacherClass.findOne({
      teacherId: teacherAhmed._id,
      classId: class10A._id,
      subjectId: subjectMap['Mathematics']._id,
    });
    if (!tcMath) {
      tcMath = await TeacherClass.create({
        teacherId: teacherAhmed._id,
        classId: class10A._id,
        subjectId: subjectMap['Mathematics']._id,
      });
      console.log('[OK] Assigned Teacher Ahmed to Class 10-A Mathematics');
    }

    // Schedule for Math
    const schedMath = await Schedule.findOne({ teacherClassId: tcMath._id });
    if (!schedMath) {
      await Schedule.create({
        teacherClassId: tcMath._id,
        day: 'Monday',
        timeSlot: '09:00 AM - 10:00 AM',
      });
      await Schedule.create({
        teacherClassId: tcMath._id,
        day: 'Wednesday',
        timeSlot: '09:00 AM - 10:00 AM',
      });
      await Schedule.create({
        teacherClassId: tcMath._id,
        day: 'Friday',
        timeSlot: '09:00 AM - 10:00 AM',
      });
      console.log('[OK] Created Schedule for Class 10-A Mathematics');
    }
  }

  // 6. Seed Sample Students in Class 10-A
  const studentEmail = '10a-001@edumanage.pk';
  let studentBilal = await Student.findOne({ email: studentEmail });
  if (!studentBilal && class10A) {
    const sPass = await bcrypt.hash('StudentPass123!', salt);
    studentBilal = await Student.create({
      name: 'Bilal Khan',
      classId: class10A._id,
      section: 'A',
      rollNumber: 1,
      email: studentEmail,
      password: sPass,
      parentPhone: '+92 300 8887766',
      mustChangePassword: true,
      admissionFee: 5000,
      monthlyFee: 4500,
      admissionDate: new Date('2026-08-01'),
    });
    console.log(`[OK] Created Student Bilal Khan: ${studentEmail} (Password: StudentPass123!)`);

    // Add Fees for Bilal Khan
    await Fee.create({
      studentId: studentBilal._id,
      month: 'August 2026',
      amount: 4500,
      status: 'paid',
      paidDate: new Date('2026-08-05'),
      paymentMethod: 'Cash',
      transactionId: 'REC-202608-001',
    });
    await Fee.create({
      studentId: studentBilal._id,
      month: 'September 2026',
      amount: 4500,
      status: 'pending',
      dueDate: new Date('2026-09-10'),
    });
    console.log('[OK] Seeded Fee records for Bilal Khan');

    // Add Attendance & Grades for Bilal Khan in Mathematics
    if (subjectMap['Mathematics']) {
      await Attendance.create({
        studentId: studentBilal._id,
        subjectId: subjectMap['Mathematics']._id,
        date: '2026-09-15',
        status: 'present',
      });
      await Attendance.create({
        studentId: studentBilal._id,
        subjectId: subjectMap['Mathematics']._id,
        date: '2026-09-16',
        status: 'present',
      });
      await Attendance.create({
        studentId: studentBilal._id,
        subjectId: subjectMap['Mathematics']._id,
        date: '2026-09-17',
        status: 'late',
      });

      // Grade
      await Grade.create({
        studentId: studentBilal._id,
        subjectId: subjectMap['Mathematics']._id,
        examType: 'Midterm Examination',
        marks: 88,
        totalMarks: 100,
      });

      // Quiz
      const mathQuiz = await Quiz.create({
        subjectId: subjectMap['Mathematics']._id,
        title: 'Quiz 1: Quadratic Equations',
        maxMarks: 20,
        date: '2026-09-14',
      });

      await QuizResult.create({
        quizId: mathQuiz._id,
        studentId: studentBilal._id,
        marksObtained: 18,
      });

      console.log('[OK] Seeded Attendance, Grades, and Quiz for Bilal Khan in Math');
    }
  }

  console.log('\n=============================================');
  console.log(' SEEDING COMPLETE! Login accounts available:');
  console.log(' 1. Super Admin: admin@edumanage.pk / AdminPass123!');
  console.log(' 2. Teacher:     teacher.ahmed@edumanage.pk / TeacherPass123!');
  console.log(' 3. Pending:     teacher.sana@edumanage.pk / TeacherPass123! (Pending approval)');
  console.log(' 4. Student:     10a-001@edumanage.pk / StudentPass123! (Class 10-A, Roll 1)');
  console.log('=============================================\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
