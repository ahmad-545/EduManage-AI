import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/mongodb';
import Fee from '../../../../models/Fee';
import Student from '../../../../models/Student';
import Class from '../../../../models/Class';
import { getServerAuthSession } from '../../../../lib/permissions';

export async function GET(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const month = searchParams.get('month');
    const studentId = searchParams.get('studentId');

    await connectToDatabase();
    const query = {};
    if (status) query.status = status;
    if (month) query.month = month;
    if (studentId) query.studentId = studentId;

    const fees = await Fee.find(query)
      .populate({
        path: 'studentId',
        select: 'name rollNumber email section parentPhone classId',
        populate: { path: 'classId', select: 'className section' },
      })
      .sort({ createdAt: -1 });

    // Calculate quick stats
    const totalCollected = fees
      .filter((f) => f.status === 'paid')
      .reduce((sum, f) => sum + (f.amount || 0), 0);

    const totalPending = fees
      .filter((f) => f.status === 'pending')
      .reduce((sum, f) => sum + (f.amount || 0), 0);

    return NextResponse.json({
      fees,
      stats: {
        totalCollected,
        totalPending,
        totalRecords: fees.length,
      },
    });
  } catch (err) {
    console.error('Fetch fees error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerAuthSession();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    await connectToDatabase();

    // 1. Record fee payment for a specific fee record
    if (action === 'record-payment') {
      const { feeId, paymentMethod, transactionId } = body;
      const fee = await Fee.findById(feeId);
      if (!fee) {
        return NextResponse.json({ error: 'Fee record not found' }, { status: 404 });
      }

      fee.status = 'paid';
      fee.paidDate = new Date();
      fee.paymentMethod = paymentMethod || 'Cash';
      fee.transactionId = transactionId || `TXN-${Date.now().toString().slice(-6)}`;
      await fee.save();

      return NextResponse.json({
        success: true,
        message: 'Fee payment recorded successfully!',
        fee,
      });
    }

    // 2. Generate monthly fee challans for an entire class or student
    if (action === 'generate-monthly-fees') {
      const { classId, month, amount, dueDate } = body;

      if (!month || !amount) {
        return NextResponse.json({ error: 'Month and Amount are required' }, { status: 400 });
      }

      const query = {};
      if (classId && classId !== 'all') {
        query.classId = classId;
      }

      const students = await Student.find(query);
      let createdCount = 0;

      for (const student of students) {
        const existing = await Fee.findOne({ studentId: student._id, month });
        if (!existing) {
          await Fee.create({
            studentId: student._id,
            month,
            amount: parseFloat(amount),
            status: 'pending',
            dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          });
          createdCount++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Generated ${createdCount} fee invoices for ${month}.`,
        createdCount,
      });
    }

    return NextResponse.json({ error: 'Invalid fee action' }, { status: 400 });
  } catch (err) {
    console.error('Fee action error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
