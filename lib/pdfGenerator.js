import jsPDF from 'jspdf';

/**
 * Generate a professional branded Fee Payment Receipt PDF
 */
export function generateFeeReceiptPDF({
  student,
  fee,
  schoolName = 'EduManage AI Academy',
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // Compact receipt size
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(30, 27, 75); // Deep Indigo
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Academy Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(schoolName, pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL FEE PAYMENT RECEIPT', pageWidth / 2, 20, { align: 'center' });

  // Receipt Meta
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const receiptNo = fee.transactionId || `REC-${fee._id.toString().slice(-6).toUpperCase()}`;
  doc.text(`Receipt #: ${receiptNo}`, 14, 38);
  doc.setFont('helvetica', 'normal');
  const dateStr = fee.paidDate
    ? new Date(fee.paidDate).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB');
  doc.text(`Date Issued: ${dateStr}`, pageWidth - 14, 38, { align: 'right' });

  // Separator Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 42, pageWidth - 14, 42);

  // Student Information Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 46, pageWidth - 28, 30, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Details:', 18, 52);

  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${student?.name || 'N/A'}`, 18, 59);
  const className = student?.classId?.className
    ? `${student.classId.className} - Section ${student.classId.section || student.section}`
    : `Section ${student?.section || 'A'}`;
  doc.text(`Class: ${className}`, 18, 65);
  doc.text(`Roll Number: #${student?.rollNumber || 'N/A'}`, 18, 71);

  doc.text(`Student ID: ${student?.email || 'N/A'}`, pageWidth / 2 + 5, 59);
  doc.text(`Parent Contact: ${student?.parentPhone || 'N/A'}`, pageWidth / 2 + 5, 65);
  doc.text(`Payment Mode: ${fee.paymentMethod || 'Cash'}`, pageWidth / 2 + 5, 71);

  // Payment Breakdown Table
  let y = 86;
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Description / Fee Period', 18, y + 5.5);
  doc.text('Status', pageWidth / 2 + 10, y + 5.5);
  doc.text('Amount (PKR)', pageWidth - 18, y + 5.5, { align: 'right' });

  y += 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(14, y, pageWidth - 28, 12, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, pageWidth - 28, 12, 'S');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tuition & Academy Fee (${fee.month})`, 18, y + 7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129); // Green for PAID
  doc.text(fee.status ? fee.status.toUpperCase() : 'PAID', pageWidth / 2 + 10, y + 7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`PKR ${(fee.amount || 0).toLocaleString()}`, pageWidth - 18, y + 7.5, { align: 'right' });

  // Total Row
  y += 12;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount Settled:', 18, y + 6.5);
  doc.setTextColor(79, 70, 229);
  doc.text(`PKR ${(fee.amount || 0).toLocaleString()}`, pageWidth - 18, y + 6.5, { align: 'right' });

  // Stamp & Verification
  y += 24;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer-generated official receipt verified by EduManage AI.', 14, y);
  doc.text('No physical signature required.', 14, y + 5);

  // Save/Download
  const filename = `Fee-Receipt-${fee.month.replace(/\s+/g, '-')}-${student?.rollNumber || '001'}.pdf`;
  doc.save(filename);
}

/**
 * Generate a comprehensive Student Academic Result Card PDF
 */
export function generateResultCardPDF({
  student,
  gradeBook = [],
  schoolName = 'EduManage AI Academy',
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(schoolName, pageWidth / 2, 16, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('STUDENT ACADEMIC PERFORMANCE & RESULT CARD', pageWidth / 2, 26, { align: 'center' });

  // Student Profile Card
  let y = 44;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, pageWidth - 30, 28, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, y, pageWidth - 30, 28, 3, 3, 'S');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Profile', 20, y + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student Name: ${student?.name || 'N/A'}`, 20, y + 14);
  const className = student?.classId?.className
    ? `${student.classId.className} - Section ${student.classId.section || student.section}`
    : `Section ${student?.section || 'A'}`;
  doc.text(`Class & Section: ${className}`, 20, y + 21);

  doc.text(`Roll Number: #${student?.rollNumber || 'N/A'}`, pageWidth / 2 + 10, y + 14);
  doc.text(`Login ID: ${student?.email || 'N/A'}`, pageWidth / 2 + 10, y + 21);

  // Table Header
  y = 82;
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(15, y, pageWidth - 30, 9, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Subject', 20, y + 6);
  doc.text('Attendance %', 75, y + 6);
  doc.text('Quiz Average', 115, y + 6);
  doc.text('Exam Score', 150, y + 6);
  doc.text('Grade', pageWidth - 25, y + 6, { align: 'center' });

  // Rows
  y += 9;
  gradeBook.forEach((row, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(15, y, pageWidth - 30, 10, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, y, pageWidth - 30, 10, 'S');

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(row.subjectName, 20, y + 6.5);

    doc.text(`${row.attendancePercent}%`, 75, y + 6.5);

    const qAvg = typeof row.quizAverage === 'number' ? `${row.quizAverage}%` : row.quizAverage;
    doc.text(String(qAvg), 115, y + 6.5);

    const examScore = row.overallPercent !== null ? `${row.overallPercent}%` : 'N/A';
    doc.text(examScore, 150, y + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(row.finalGrade || 'Pending', pageWidth - 25, y + 6.5, { align: 'center' });

    y += 10;
  });

  // Footer & Seal
  y += 25;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Certified by the Academic Examination Board of EduManage AI.', 15, y);
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB')}`, 15, y + 5);

  const filename = `Result-Card-${student?.name?.replace(/\s+/g, '-') || 'Student'}.pdf`;
  doc.save(filename);
}
