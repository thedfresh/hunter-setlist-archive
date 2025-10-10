import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-100 text-gray-600 py-4 w-full">
            <div className="container mx-auto flex flex-wrap justify-center items-center gap-2 text-sm">
                <span>© 2025 Robert Hunter Performance Archive</span>
                <span className="mx-2">|</span>
                <span><a
                    href="mailto:dfresh@gmail.com"
                    className="hover:text-hunter-gold transition-colors"
                >
                    Douglas Aldridge
                </a>, Webmaster</span>
                <span className="mx-2">|</span>
                <Link href="/about" className="hover:text-hunter-gold transition-colors">
                    About This Project
                </Link>
            </div>
        </footer>
    );
};

export default Footer;
