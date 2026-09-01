import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, setSessionCookie } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        name: name || email.split('@')[0],
        role: 'USER',
        isDemo: false,
        preferences: {
          create: {
            emailAlerts: true,
            minNotificationLevel: 'MEDIUM',
            digestFrequency: 'DAILY',
          },
        },
      },
    });

    const session = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      isDemo: user.isDemo,
    };

    await setSessionCookie(session);
    return NextResponse.json({ user: session });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
