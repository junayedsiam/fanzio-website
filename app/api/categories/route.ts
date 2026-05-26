import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

function serializeDoc(doc: any) {
  const { _id, ...rest } = doc;
  return { id: _id.toString(), ...rest };
}

// GET /api/categories - list all categories
export async function GET() {
  try {
    const db = await getDb();
    const docs = await db.collection('categories').find({}).toArray();
    return NextResponse.json({ categories: docs.map(serializeDoc) });
  } catch (err: any) {
    console.error('GET /api/categories error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/categories - create a category
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getDb();
    const result = await db.collection('categories').insertOne(body);
    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/categories error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
