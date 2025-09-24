// Songs admin success page, following unified pattern
import Link from "next/link";

export default function SongSuccessPage() {
  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Success!</h1>
      <p className="mb-6">The song was saved successfully.</p>
      <div className="flex gap-4">
        <Link href="/admin/songs" className="btn btn-primary">Back to Songs</Link>
        <Link href="/admin" className="btn">Admin Home</Link>
      </div>
    </div>
  );
}
