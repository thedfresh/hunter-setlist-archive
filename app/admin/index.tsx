import Link from 'next/link';

export default function AdminIndex() {
  const entities = [
    { name: 'Events', path: '/admin/events' },
    { name: 'Venues', path: '/admin/venues' },
    { name: 'Musicians', path: '/admin/musicians' },
    { name: 'Contributors', path: '/admin/contributors' },
    { name: 'Tags', path: '/admin/tags' },
    { name: 'Albums', path: '/admin/albums' },
    { name: 'Songs', path: '/admin/songs' },
    { name: 'External Links', path: '/admin/external-links' },
  ].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="max-w-xl mx-auto py-12 px-4">
      <div className="mb-4 text-center">
  <Link href="/admin" className="text-blue-600 hover:underline font-semibold">Home</Link>
      </div>
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <ul className="space-y-4">
        {entities.map((entity) => (
          <li key={entity.name}>
            <Link
              href={entity.path}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded shadow text-center transition"
            >
              Manage {entity.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
