import { pool } from '../lib/db';

export default async function Home() {
  const client = await pool.connect();
  const result = await client.query('SELECT COUNT(*) FROM shows');
  client.release();
  
  const showCount = result.rows[0].count;

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">stillunsung.com: The Robert Hunter Setlist Archive</h1>
      <p>
        Total shows: <a href="/shows" className="text-blue-600 underline">{showCount}</a>
      </p>
    </main>
  );
}