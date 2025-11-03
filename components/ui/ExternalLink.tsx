// components/ui/ExternalLink.tsx
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

interface ExternalLinkProps {
    href: string;
    children: React.ReactNode;
}

export default function ExternalLink({ href, children }: ExternalLinkProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="link-external"
        >
            <span>{children}</span>
            <ExternalLinkIcon className="w-3 h-3" />
        </a >
    );
}