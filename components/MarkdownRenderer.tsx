"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-black text-navy mt-8 mb-4 pb-2 border-b-2 border-gold/30">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-navy mt-6 mb-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-bold text-navy-light mt-5 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-text-main leading-relaxed mb-3">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-navy">{children}</strong>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse border border-gray-300 text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-navy/5">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 px-3 py-2 text-left font-bold text-navy">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 px-3 py-2">{children}</td>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gold bg-gold/5 pl-4 py-2 my-4 italic">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre className="bg-gray-100 rounded-lg p-4 my-4 overflow-x-auto text-sm">
          <code>{children}</code>
        </pre>
      );
    }
    return (
      <code className="bg-gray-100 text-navy px-1.5 py-0.5 rounded text-sm">
        {children}
      </code>
    );
  },
  ul: ({ children }) => (
    <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li className="text-text-main">{children}</li>,
  hr: () => <hr className="my-6 border-gray-200" />,
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose-custom">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
