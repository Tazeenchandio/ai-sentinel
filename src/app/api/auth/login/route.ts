import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comparePassword, setSessionCookie } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

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
