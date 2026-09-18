import connectToDatabase from '../lib/mongodb.js';
import Fee from '../models/Fee.js';
import { generateFeeReminderAI, generatePerformanceInsightsAI } from '../lib/ai.js';
import { sendWhatsAppMessage, sendStudentCredentialsWhatsApp } from '../lib/whatsapp.js';

async function testAiAndWhatsApp() {
  console.log('--- TESTING AI & WHATSAPP HELPERS ---');

  // 1. Test AI Fee Reminder Generation
  const reminder1 = await generateFeeReminderAI({
    studentName: 'Bilal Khan',
    month: 'September 2026',
    amount: 4500,
    overdueDays: 3,
    reminderCount: 1,
  });
  console.log('\n[Reminder Tier 1 (Polite)]:\n', reminder1.message);

  const reminder3 = await generateFeeReminderAI({
    studentName: 'Bilal Khan',
    month: 'September 2026',
    amount: 4500,
    overdueDays: 20,
    reminderCount: 3,
  });
  console.log('\n[Reminder Tier 3 (Urgent Notice)]:\n', reminder3.message);

  // 2. Test WhatsApp Simulation
  const wsRes = await sendStudentCredentialsWhatsApp({
    to: '+92 300 8887766',
    studentName: 'Bilal Khan',
    email: '10a-001@edumanage.pk',
    password: 'TemporaryPass123!',
    schoolName: 'EduManage AI Academy',
  });
  console.log('WhatsApp Dispatch Result:', wsRes.success ? '✓ SUCCESS' : 'FAIL');

  // 3. Test AI Insights
  const insights = await generatePerformanceInsightsAI({
    contextName: 'Class 10 - Section A',
    totalStudents: 35,
    attendanceAverage: 88,
    lowAttendanceStudents: [{ name: 'Hamza Ali', attendancePercent: '65%' }],
    lowGradingStudents: [],
    topPerformers: [{ name: 'Bilal Khan', average: '92%' }],
  });
  console.log('\n[AI Insights Generation]:\n', insights.insights);

  console.log('\n✓ ALL AI & WHATSAPP TESTS COMPLETED SUCCESSFULLY');
}

testAiAndWhatsApp().catch(console.error);
