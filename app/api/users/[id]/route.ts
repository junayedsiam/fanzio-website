import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET /api/users/[id] - get a user by Firebase UID
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const user = await db.collection('users').findOne({ uid: id });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { _id, ...rest } = user;
    return NextResponse.json({ user: rest });
  } catch (err: any) {
    console.error('GET /api/users/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/users/[id] - create or update a user by Firebase UID
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = await getDb();

    await db.collection('users').updateOne(
      { uid: id },
      { $set: { uid: id, ...body } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('POST /api/users/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/users/[id] - update user fields
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = await getDb();

    await db.collection('users').updateOne(
      { uid: id },
      { $set: body }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('PUT /api/users/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
