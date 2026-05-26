import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT /api/products/[id] - update a product
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = await getDb();
    await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('PUT /api/products/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/products/[id] - delete a product
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    await db.collection('products').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/products/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
