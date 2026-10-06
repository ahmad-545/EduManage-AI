import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../lib/mongodb';
import Student from '../../../../models/Student';
import Class from '../../../../models/Class';
import Fee from '../../../../models/Fee';
import { getServerAuthSession } from '../../../../lib/permissions';
import { sendStudentCredentialsWhatsApp } from '../../../../lib/whatsapp';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    await connectToDatabase();
    const students = await Student.find()
      .populate('classId', 'className section')
      .select('-password')
      .sort({ classId: 1, rollNumber: 1 });

    const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());
    const studentIds = students.map((s) => s._id);
    const fees = await Fee.find({ studentId: { $in: studentIds } });

    const feeMap = {};
    fees.forEach((f) => {
      const sid = f.studentId.toString();
      if (!feeMap[sid]) {
        feeMap[sid] = {
          currentMonthStatus: 'not_generated',
          totalPaid: 0,
          totalPending: 0,
          hasPending: false,
          latestFeeMonth: f.month,
        };
      }
      if (f.month === currentMonth) {
        feeMap[sid].currentMonthStatus = f.status;
      }
      if (f.status === 'paid') {
        feeMap[sid].totalPaid += f.amount || 0;
      } else {
        feeMap[sid].totalPending += f.amount || 0;
        feeMap[sid].hasPending = true;
      }
    });

    const enhancedStudents = students.map((s) => {
      const sObj = s.toObject();
      const fInfo = feeMap[s._id.toString()] || {
        currentMonthStatus: 'not_generated',
        totalPaid: 0,
        totalPending: 0,
        hasPending: false,
      };
      sObj.feeSummary = fInfo;
      return sObj;
    });

    return NextResponse.json({ students: enhancedStudents });
  } catch (err) {
    console.error('Fetch students error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const {
      name,
      classId,
      className,
      section,
      rollNumber,
      parentPhone,
      password: customPassword,
      monthlyFee,
      admissionFee,
      initialFeeStatus,
      initialFeeMonth,
      paymentMethod,
    } = await req.json();

    if (!name || (!classId && !className) || !rollNumber || !parentPhone) {
      return NextResponse.json(
        { error: 'Name, Class, Roll Number, and Parent Phone are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let targetClass = null;
    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      targetClass = await Class.findById(classId);
    }

    // Auto-resolve or create class on the fly if text input provided
    if (!targetClass && className) {
      const normalizedName = className.trim();
      const normalizedSection = (section || 'A').trim().toUpperCase();
      targetClass = await Class.findOne({
        className: new RegExp(`^${normalizedName}$`, 'i'),
        section: normalizedSection,
      });

      if (!targetClass) {
        targetClass = await Class.create({
          className: normalizedName,
          section: normalizedSection,
        });
      }
    }

    if (!targetClass) {
      return NextResponse.json({ error: 'Class could not be resolved or created.' }, { status: 400 });
    }

    const resolvedClassId = targetClass._id;
    const targetSection = (section || targetClass.section || 'A').toUpperCase().trim();
    const parsedRoll = parseInt(rollNumber, 10);
    const parsedMonthlyFee = monthlyFee !== undefined && !isNaN(Number(monthlyFee)) ? Math.max(0, Number(monthlyFee)) : 5000;
    const parsedAdmissionFee = admissionFee !== undefined && !isNaN(Number(admissionFee)) ? Math.max(0, Number(admissionFee)) : 0;

    // Verify compound uniqueness (classId, section, rollNumber)
    const duplicate = await Student.findOne({
      classId: resolvedClassId,
      section: targetSection,
      rollNumber: parsedRoll,
    });

    if (duplicate) {
      return NextResponse.json(
        { error: `Roll Number #${parsedRoll} already exists in ${targetClass.className} - Section ${targetSection}.` },
        { status: 409 }
      );
    }

    // Auto-generate email: {classNumber}{section}-{rollNumber, zero-padded to 3 digits}@{schoolDomain}
    const classNumberMatch = targetClass.className.match(/\d+/);
    const classNumber = classNumberMatch ? classNumberMatch[0] : targetClass.className.toLowerCase().replace(/\s+/g, '');
    const paddedRoll = String(parsedRoll).padStart(3, '0');
    const schoolDomain = process.env.SCHOOL_DOMAIN || 'edumanage.pk';
    const autoEmail = `${classNumber}${targetSection.toLowerCase()}-${paddedRoll}@${schoolDomain}`;

    // Check if auto-generated email already exists
    const emailExists = await Student.findOne({ email: autoEmail });
    if (emailExists) {
      return NextResponse.json(
        { error: `Auto-generated login ID (${autoEmail}) is already assigned. Please use a distinct roll number.` },
        { status: 409 }
      );
    }

    // Allow custom password written by Super Admin, or auto-generate
    const rawPassword = customPassword && customPassword.trim().length >= 4
      ? customPassword.trim()
      : ('Std' + crypto.randomBytes(3).toString('hex') + '!');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // Create student
    const student = await Student.create({
      name: name.trim(),
      classId: resolvedClassId,
      section: targetSection,
      rollNumber: parsedRoll,
      email: autoEmail,
      password: hashedPassword,
      parentPhone: parentPhone.trim(),
      mustChangePassword: true,
      monthlyFee: parsedMonthlyFee,
      admissionFee: parsedAdmissionFee,
    });

    // Create initial monthly fee challan / receipt
    let createdFee = null;
    const currentMonthName = initialFeeMonth || new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());
    const isPaid = initialFeeStatus === 'paid';
    const totalAdmissionInvoice = parsedMonthlyFee + parsedAdmissionFee;

    if (totalAdmissionInvoice > 0) {
      createdFee = await Fee.create({
        studentId: student._id,
        month: currentMonthName,
        amount: totalAdmissionInvoice,
        status: isPaid ? 'paid' : 'pending',
        paidDate: isPaid ? new Date() : null,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        paymentMethod: isPaid ? (paymentMethod || 'Cash') : 'Cash',
        transactionId: isPaid ? `ADM-${Date.now().toString().slice(-6)}` : '',
      });
    }

    // Send credentials to parent's WhatsApp / phone
    let whatsappResult = null;
    try {
      whatsappResult = await sendStudentCredentialsWhatsApp({
        to: parentPhone.trim(),
        studentName: name.trim(),
        email: autoEmail,
        password: rawPassword,
        schoolName: process.env.SCHOOL_NAME || 'EduManage AI Academy',
      });
    } catch (wsErr) {
      console.warn('WhatsApp credential dispatch warning:', wsErr.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Student admitted successfully! Login credentials dispatched to parent's WhatsApp (${parentPhone}).`,
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
          classId: student.classId,
          section: student.section,
          rollNumber: student.rollNumber,
          parentPhone: student.parentPhone,
          mustChangePassword: student.mustChangePassword,
        },
        credentials: {
          studentName: student.name,
          loginId: autoEmail,
          password: rawPassword,
          parentPhone: student.parentPhone,
        },
        whatsappResult,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Student admission error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
