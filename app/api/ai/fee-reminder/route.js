import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Fee from '../../../../models/Fee';
import Student from '../../../../models/Student';
import { getServerAuthSession } from '../../../../lib/permissions';
import { generateFeeReminderAI } from '../../../../lib/ai';
import { sendWhatsAppMessage } from '../../../../lib/whatsapp';

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { feeId, reminderCount = 1, directSend = true } = await req.json();

    if (!feeId) {
      return NextResponse.json({ error: 'feeId is required' }, { status: 400 });
    }

    await connectToDatabase();
    const fee = await Fee.findById(feeId).populate('studentId');

    if (!fee || !fee.studentId) {
      return NextResponse.json({ error: 'Fee or associated student record not found' }, { status: 404 });
    }

    const student = fee.studentId;
    const parentPhone = student.parentPhone;

    // Calculate overdue days
    const now = new Date();
    const dueDate = fee.dueDate ? new Date(fee.dueDate) : new Date(fee.createdAt);
    const diffTime = Math.max(0, now - dueDate);
    const overdueDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Generate Escalating Tone Message via OpenAI
    const { message, generatedBy } = await generateFeeReminderAI({
      studentName: student.name,
      month: fee.month,
      amount: fee.amount,
      overdueDays,
      reminderCount: parseInt(reminderCount, 10) || 1,
      schoolName: process.env.SCHOOL_NAME || 'EduManage AI Academy',
    });

    let whatsappResult = null;
    if (directSend && parentPhone) {
      whatsappResult = await sendWhatsAppMessage({
        to: parentPhone,
        message,
      });
    }

    return NextResponse.json({
      success: true,
      studentName: student.name,
      parentPhone,
      month: fee.month,
      amount: fee.amount,
      overdueDays,
      reminderCount,
      draftMessage: message,
      generatedBy,
      whatsappResult,
    });
  } catch (err) {
    console.error('AI Fee Reminder error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
