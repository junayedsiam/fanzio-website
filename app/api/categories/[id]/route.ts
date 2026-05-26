import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT /api/categories/[id] - update a category
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = await getDb();
    await db.collection('categories').updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('PUT /api/categories/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/categories/[id] - delete a category
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    await db.collection('categories').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/categories/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
