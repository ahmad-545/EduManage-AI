import OpenAI from 'openai';

let openaiClient = null;

function getOpenAIClient() {
  if (!openaiClient && process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('placeholder')) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Generate an escalating tone WhatsApp fee reminder using OpenAI (or robust fallback)
 */
export async function generateFeeReminderAI({
  studentName,
  month,
  amount,
  overdueDays = 0,
  reminderCount = 1,
  schoolName = process.env.SCHOOL_NAME || 'EduManage AI Academy',
}) {
  const client = getOpenAIClient();

  // Define escalation rules
  let toneGuidance = 'polite, gentle, courteous reminder for day 1 or recent overdue';
  if (reminderCount === 2 || (overdueDays > 7 && overdueDays <= 15)) {
    toneGuidance = 'firm but polite follow-up reminder noting that payment is now overdue';
  } else if (reminderCount >= 3 || overdueDays > 15) {
    toneGuidance = 'urgent, authoritative, and direct final notice requesting immediate settlement to avoid academic portal suspension';
  }

  const prompt = `You are the automated fee recovery assistant for "${schoolName}", a school in Pakistan.
Draft a concise, professional WhatsApp fee reminder message in English (with courteous South Asian academy etiquette).
Parameters:
- Student Name: ${studentName}
- Fee Month: ${month}
- Overdue Amount: PKR ${amount.toLocaleString()}
- Overdue by: ${overdueDays} days
- Reminder Sequence: Reminder #${reminderCount}
- Tone Required: ${toneGuidance}

Instructions:
- Keep it under 100 words.
- Format with WhatsApp markdown (*bold*, _italic_).
- Include payment deadline and school bank/cash counter contact.
- Do not include greetings placeholder; write the final ready-to-send text.`;

  if (client) {
    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 250,
      });

      const message = response.choices[0]?.message?.content?.trim();
      if (message) {
        return { message, generatedBy: 'gpt-4o-mini' };
      }
    } catch (err) {
      console.warn('[OpenAI Fee Reminder Error, using contextual fallback]:', err.message);
    }
  }

  // High quality contextual fallback template when OpenAI API is not keyed
  let fallbackMessage = '';
  if (reminderCount === 1 || overdueDays <= 5) {
    fallbackMessage = `Assalamu Alaikum / Greetings!\n\nThis is a gentle reminder from *${schoolName}* that the tuition fee for *${studentName}* for the month of *${month}* (*PKR ${amount.toLocaleString()}*) is due.\n\nPlease ensure payment at your earliest convenience via the school accounts office or online transfer.\n\nThank you for your continuous cooperation.\n_Accounts Department, ${schoolName}_`;
  } else if (reminderCount === 2 || overdueDays <= 15) {
    fallbackMessage = `Assalamu Alaikum.\n\nThis is a 2nd reminder regarding the pending tuition fee for *${studentName}* (*${month}*). The outstanding amount of *PKR ${amount.toLocaleString()}* is now overdue by ${overdueDays} days.\n\nKindly clear this dues within the next 48 hours to maintain uninterrupted educational records.\n\n_Administration & Finance, ${schoolName}_`;
  } else {
    fallbackMessage = `*FINAL NOTICE — URGENT*\n\nDear Parent/Guardian of *${studentName}*,\nThe fee for *${month}* (*PKR ${amount.toLocaleString()}*) is significantly overdue by ${overdueDays} days (Reminder #${reminderCount}).\n\nPlease visit the accounts office immediately to settle the outstanding balance to prevent administrative hold on student reports and portal access.\n\n_Office of the Principal, ${schoolName}_`;
  }

  return { message: fallbackMessage, generatedBy: 'contextual-fallback' };
}

/**
 * Generate academic performance insights using OpenAI
 */
export async function generatePerformanceInsightsAI({
  contextName = 'School Wide',
  totalStudents = 0,
  attendanceAverage = 0,
  lowAttendanceStudents = [],
  lowGradingStudents = [],
  topPerformers = [],
}) {
  const client = getOpenAIClient();

  const prompt = `You are EduManage AI, an expert academic analytics advisor for schools and academies.
Analyze this academic summary for "${contextName}":
- Total Active Students: ${totalStudents}
- Overall Attendance Rate: ${attendanceAverage}%
- Students with Low Attendance (<75%): ${JSON.stringify(lowAttendanceStudents)}
- Students with Low Exam Marks (<50%): ${JSON.stringify(lowGradingStudents)}
- Top Performing Students (>85%): ${JSON.stringify(topPerformers)}

Provide an insightful, executive summary structured into 3 concise sections:
1. 📊 Executive Snapshot: 2 sentences summarizing health.
2. ⚠️ Critical Attention Areas: specific alerts for students with attendance or grade drops.
3. 💡 Recommended Action Steps: actionable interventions for teachers and administration.

Keep the total response under 200 words, formatted in clean Markdown.`;

  if (client) {
    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 350,
      });

      const insights = response.choices[0]?.message?.content?.trim();
      if (insights) {
        return { insights, generatedBy: 'gpt-4o-mini' };
      }
    } catch (err) {
      console.warn('[OpenAI Insights Error, using contextual fallback]:', err.message);
    }
  }

  // High quality contextual fallback
  const lowAttCount = lowAttendanceStudents.length;
  const lowGradeCount = lowGradingStudents.length;
  const topCount = topPerformers.length;

  const fallback = `### 📊 Executive Snapshot
Academic metrics for **${contextName}** indicate an average attendance rate of **${attendanceAverage}%** across **${totalStudents}** registered students. Overall engagement remains steady, though targeted interventions are needed for students lagging in core assessments.

### ⚠️ Critical Attention Areas
- **Attendance Watchlist:** ${lowAttCount > 0 ? `${lowAttCount} student(s) currently below the mandatory 75% attendance threshold.` : 'Attendance is healthy across all cohorts.'}
- **Academic Recovery:** ${lowGradeCount > 0 ? `${lowGradeCount} student(s) require remedial support in recent exams.` : 'No critical grade warnings recorded.'}

### 💡 Recommended Action Steps
1. **Parent Outreach:** Schedule brief phone conferences with guardians of students flagging low attendance.
2. **Remedial Sessions:** Conduct 30-minute after-class doubt clarification workshops for students scoring below 60%.
3. **Recognition:** Acknowledge top scorers (${topCount > 0 ? topPerformers.map(s => s.name || s).join(', ') : 'Honor roll candidates'}) during morning assembly to boost morale.`;

  return { insights: fallback, generatedBy: 'contextual-fallback' };
}
