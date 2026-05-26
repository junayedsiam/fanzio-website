import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env.local as MONGODB_URI');
}

if (process.env.NODE_ENV === 'development') {
  // In development, reuse the client across hot reloads to avoid exhausting connections
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;

/** Helper to get the fanzio database */
export async function getDb() {
  const client = await clientPromise;
  return client.db('fanzio');
}
