// components/ui/Markdown.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

interface MarkdownProps {
    children: string;
    className?: string;
}

export default function Markdown({ children, className = '' }: MarkdownProps) {
    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({ node, href, children, ...props }) => {
                        const isExternal = href?.startsWith('http');

                        if (isExternal) {
                            return (
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link-external"
                                    {...props}
                                >
                                    <span>{children}</span>
                                    <ExternalLinkIcon size={14} />
                                </a>
                            );
                        }

                        return (
                            <a href={href} className="link-internal" {...props}>
                                {children}
                            </a>
                        );
                    }
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}