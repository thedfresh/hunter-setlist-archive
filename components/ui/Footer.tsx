export default function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-gray-50 text-gray-700">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Row 1: Navigation Links */}
                <nav className="flex justify-center gap-6 mb-4 text-sm">
                    <a href="/about" className="hover:text-hunter-gold">About</a>
                    <span className="text-gray-300">|</span>
                    <a href="/credits" className="hover:text-hunter-gold">Credits</a>
                    <span className="text-gray-300">|</span>
                    <a href="/rss.xml" className="hover:text-hunter-gold">RSS Feed</a>
                    <span className="text-gray-300">|</span>
                    <a href="mailto:contact@stillunsung.com" className="hover:text-hunter-gold">Contact</a>
                </nav>

                {/* Row 2: Newsletter - Single Line */}
                {/* Row 2: Newsletter - Responsive Layout */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
                    <span className="text-gray-600 text-center md:text-left">Get notified when new shows are added:</span>
                    <form
                        action="https://buttondown.com/api/emails/embed-subscribe/hunter-archives"
                        method="post"
                        target="popupwindow"
                        onSubmit={() => window.open('https://buttondown.com/hunter-archives', 'popupwindow')}
                        className="flex gap-2 w-full md:w-auto"
                    >
                        <input
                            type="email"
                            name="email"
                            id="bd-email"
                            placeholder="your@email.com"
                            className="input input-small flex-1 md:w-64"
                            required
                        />
                        <button type="submit" className="btn btn-primary btn-small">
                            Subscribe
                        </button>
                    </form>

                    <a href="https://buttondown.com/refer/hunter-archives"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-hunter-gold"
                    >
                        Powered by Buttondown
                    </a>
                </div>
            </div>
        </footer>
    );
}