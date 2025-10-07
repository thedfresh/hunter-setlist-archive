import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/title.png"
            alt="Hunter Performance Archive Logo"
            width={200}
            height={184}
            priority
            className="border border-red-900"
          />
        </div>
        <p className="text-center text-lg">
          Robert Hunter Performance Archive v2.0 coming soon, featuring...
        </p>
          <ul className="flex flex-col items-center justify-center">
            <li>New user interface</li>
            <li>Hundreds of updates and corrections</li>
            <li>Newly annotated setlists</li>
            <li>Search and filter functionality</li>
          </ul>
        <p className="text-center text-lg mt-8">
          Email <a href="mailto:dfresh@gmail.com">dfresh@gmail.com</a> with inquiries or updates
        </p>
      </div>
    </main>
  )
}
