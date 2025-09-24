"use client";
import Link from "next/link";

export default function VenueSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-green-700">Venue Created Successfully!</h1>
        <p className="mb-6 text-gray-700">Your new venue has been added to the archive.</p>
        <Link href="/admin/venues/new">
          <button className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-700 transition">Add Another Venue</button>
        </Link>
        <Link href="/admin">
          <button className="ml-4 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md shadow hover:bg-gray-300 transition">Go to Admin Dashboard</button>
        </Link>
      </div>
    </div>
  );
}
