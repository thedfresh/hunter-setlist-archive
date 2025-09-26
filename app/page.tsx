export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Hunter Setlist Archive
        </h1>
        <p className="text-center text-lg">
          Robert Hunter performance database - v2.0 rebuild in progress, featuring...
        </p>
          <ul className="flex flex-col items-center justify-center">
            <li>New user interface</li>
            <li>Hundreds of updates and corrections</li>
            <li>Annotated and searchable setlists</li>
            <li>and much more!</li>
          </ul>
        <p className="text-center text-lg mt-8">
          Email <a href="mailto:dfresh@gmail.com">dfresh@gmail.com</a> with inquiries or updates!
        </p>
      </div>
    </main>
  )
}
