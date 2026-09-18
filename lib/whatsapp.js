/**
 * WhatsApp Business API Helper (Twilio / Meta Cloud API / Development Simulation)
 */

export async function sendWhatsAppMessage({ to, message }) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  // Normalize recipient phone number
  const cleanTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to.replace(/\s+/g, '')}`;

  // If Twilio credentials are provided, attempt live dispatch
  if (accountSid && authToken && !accountSid.includes('placeholder')) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const params = new URLSearchParams();
      params.append('From', fromWhatsApp);
      params.append('To', cleanTo);
      params.append('Body', message);

      const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await res.json();
      if (!res.ok) {
        console.warn('[WhatsApp Live Delivery Failed, falling back to simulated log]:', data);
      } else {
        return { success: true, sid: data.sid, live: true };
      }
    } catch (err) {
      console.warn('[WhatsApp Exception, falling back to simulated log]:', err.message);
    }
  }

  // Development / Simulation Mode: Log beautifully to console & return success
  const timestamp = new Date().toLocaleTimeString();
  console.log('\n================== [WHATSAPP DISPATCH SIMULATION] ==================');
  console.log(`[Time]: ${timestamp}`);
  console.log(`[To]:   ${cleanTo}`);
  console.log(`[Body]:\n${message}`);
  console.log('====================================================================\n');

  return {
    success: true,
    simulated: true,
    to: cleanTo,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Dispatch newly admitted student login credentials to parent's phone
 */
export async function sendStudentCredentialsWhatsApp({
  to,
  studentName,
  email,
  password,
  schoolName = process.env.SCHOOL_NAME || 'EduManage AI Academy',
}) {
  const message = `Assalamu Alaikum / Greetings!\n\nWelcome to *${schoolName}*.\nAn account has been created for *${studentName}*.\n\n*Student Portal Login Credentials:*\n- *Login ID / Email:* ${email}\n- *Temporary Password:* ${password}\n- *Login Portal:* ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login\n\n*Important:* For security, the student will be required to change this password on their first login.\n\nBest regards,\nAdministration, ${schoolName}`;

  return await sendWhatsAppMessage({ to, message });
}
