import { NextResponse } from 'next/server';

export async function GET(req) {
  // Meta Cloud API Webhook Verification Challenge
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token) {
    return new Response(challenge || 'verified', { status: 200 });
  }

  return NextResponse.json({ status: 'EduManage AI WhatsApp Webhook active' });
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log('[WhatsApp Webhook Received Event]:', JSON.stringify(body, null, 2));

    return NextResponse.json({ success: true, received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
