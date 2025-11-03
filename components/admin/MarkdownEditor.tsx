'use client';

import { useState } from 'react';
import Markdown from '@/components/ui/Markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}

type TabType = 'edit' | 'preview';

export default function MarkdownEditor({
    value,
    onChange,
    placeholder = 'Enter markdown text...',
    label
}: MarkdownEditorProps) {
    const [activeTab, setActiveTab] = useState<TabType>('edit');

    return (
        <div className="space-y-3">
            {label && (
                <label className="form-label">{label}</label>
            )}

            {/* Tab Navigation */}
            <div className="tabs">
                <button
                    type="button"
                    className={`tab ${activeTab === 'edit' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('edit')}
                >
                    Edit
                </button>
                <button
                    type="button"
                    className={`tab ${activeTab === 'preview' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                >
                    Preview
                </button>
            </div>

            {/* Content Area */}
            <div className="border border-gray-300 rounded-md">
                {activeTab === 'edit' ? (
                    <textarea
                        className="textarea border-none rounded-md w-full focus:ring-2 focus:ring-[#b8913d]/20 focus:border-[#b8913d]"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={6}
                        style={{ minHeight: '150px', maxHeight: '500px' }}
                    />
                ) : (
                    <div className="p-4 min-h-[150px] prose prose-sm max-w-none">
                        {value ? (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    // Customize heading styles
                                    h1: ({ children }) => (
                                        <h1 className="text-2xl font-semibold text-gray-900 mb-4">{children}</h1>
                                    ),
                                    h2: ({ children }) => (
                                        <h2 className="text-xl font-semibold text-gray-900 mb-3">{children}</h2>
                                    ),
                                    h3: ({ children }) => (
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{children}</h3>
                                    ),
                                    h4: ({ children }) => (
                                        <h4 className="text-base font-semibold text-gray-900 mb-2">{children}</h4>
                                    ),
                                    h5: ({ children }) => (
                                        <h5 className="text-sm font-semibold text-gray-900 mb-2">{children}</h5>
                                    ),
                                    h6: ({ children }) => (
                                        <h6 className="text-xs font-semibold text-gray-900 mb-2">{children}</h6>
                                    ),
                                    // Customize paragraph spacing
                                    p: ({ children }) => (
                                        <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>
                                    ),
                                    // Customize lists
                                    ul: ({ children }) => (
                                        <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
                                    ),
                                    li: ({ children }) => (
                                        <li className="text-gray-700">{children}</li>
                                    ),
                                    // Customize links
                                    a: ({ href, children }) => (
                                        <a
                                            href={href}
                                            className="text-blue-600 underline hover:text-blue-800 transition-colors"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {children}
                                        </a>
                                    ),
                                    // Customize inline code
                                    code: ({ children, className }) => {
                                        // Check if it's a code block (has className) or inline code
                                        if (className) {
                                            return (
                                                <code className="block bg-gray-100 rounded px-3 py-2 text-sm font-mono overflow-x-auto">
                                                    {children}
                                                </code>
                                            );
                                        }
                                        return (
                                            <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono">
                                                {children}
                                            </code>
                                        );
                                    },
                                    // Customize code blocks
                                    pre: ({ children }) => (
                                        <pre className="bg-gray-100 rounded-md p-4 mb-4 overflow-x-auto">
                                            {children}
                                        </pre>
                                    ),
                                    // Customize blockquotes
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">
                                            {children}
                                        </blockquote>
                                    ),
                                    // Customize tables
                                    table: ({ children }) => (
                                        <div className="overflow-x-auto mb-4">
                                            <table className="min-w-full border-collapse border border-gray-300">
                                                {children}
                                            </table>
                                        </div>
                                    ),
                                    th: ({ children }) => (
                                        <th className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold text-left">
                                            {children}
                                        </th>
                                    ),
                                    td: ({ children }) => (
                                        <td className="border border-gray-300 px-3 py-2">{children}</td>
                                    ),
                                    // Customize horizontal rules
                                    hr: () => <hr className="my-6 border-gray-300" />,
                                }}
                            >
                                {value}
                            </ReactMarkdown>
                        ) : (
                            <div className="text-gray-500 italic">No content to preview...</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}