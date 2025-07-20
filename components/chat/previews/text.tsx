import React, { useState, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { InlineMath, BlockMath } from 'react-katex';
import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import 'katex/dist/katex.min.css';

declare module 'react-markdown' {
  interface ComponentPropsWithoutRef<T> {
    value?: string;
  }
}

interface BasicComponentProps {
  node?: any;
  children?: ReactNode;
  [key: string]: any;
}

type CustomComponents = Omit<Components, 'code'> & {
  code: React.ComponentType<{ inline?: boolean; className?: string; children?: ReactNode } & BasicComponentProps>;
  math: React.ComponentType<{ value: string }>;
  inlineMath: React.ComponentType<{ value: string }>;
};

const codeTheme = {
  ...coldarkDark,
  'pre[class*="language-"]': {
    ...coldarkDark['pre[class*="language-"]'],
    backgroundColor: 'hsl(var(--background))',
    borderRadius: '0 0 0.5rem 0.5rem',
  },
  'code[class*="language-"]': {
    ...coldarkDark['code[class*="language-"]'],
    backgroundColor: 'transparent',
  },
};

interface CodeBlockProps {
  language: string;
  value: string;
}

function CodeBlock({ language, value }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Card className={cn("w-full overflow-hidden p-0", isCollapsed ? "max-h-10" : "border-b")}>
      <div className={cn("flex items-center justify-between bg-background px-4 py-2", !isCollapsed && "border-b")}>
        <div className="flex items-center gap-2">
          <span className='h-full text-center text-sm'>{language}</span>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:text-primary h-full"
          >
            {isCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
          </button>
        </div>
        <button onClick={handleCopy} className="text-muted-foreground hover:text-primary">
          {isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </button>
      </div>
      <div className={cn("transition-all duration-200 ease-in-out", isCollapsed ? "max-h-0" : "max-h-fit")}>
        <ScrollArea className="relative w-full text-sm">
          <div className="min-w-full">
            <SyntaxHighlighter
              style={codeTheme}
              language={language}
              PreTag="div"
              customStyle={{
                margin: 0,
                background: 'transparent',
                minWidth: '100%',
                width: 'fit-content',
                whiteSpace: 'pre',
              }}
            >
              {value}
            </SyntaxHighlighter>
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
}

const cleanMarkdownContent = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/^(\s*[-*+][ \t]*|\s*\d+\.[ \t]*)$/gm, '')
    .replace(/\n{3,}/g, '\n\n');
};

const getTextFromChildren = (children: ReactNode): string => {
  if (children === undefined || children === null) return '';
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(getTextFromChildren).join('');
  if (React.isValidElement(children)) return getTextFromChildren((children.props as { children?: ReactNode }).children);
  return '';
};

interface MarkdownPreviewProps {
  content: string;
  currentWordIndex?: number;
}

export function MarkdownPreview({ content, currentWordIndex = -1 }: MarkdownPreviewProps) {
  const TextRenderer = ({ children }: { children: ReactNode }) => {
    const plainText = getTextFromChildren(children);
    const urlRegex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/g;
    const tokens: string[] = [];
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(plainText)) !== null) {
      const precedingText = plainText.slice(lastIndex, match.index);
      if (precedingText) {
        tokens.push(...(precedingText.match(/[a-zA-Z0-9']+|[^\s\w']+|\s+/g) || []));
      }
      tokens.push(match[0]);
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < plainText.length) {
      const remainingText = plainText.slice(lastIndex);
      tokens.push(...(remainingText.match(/[a-zA-Z0-9']+|[^\s\w']+|\s+/g) || []));
    }

    let wordCounter = 0;

    return (
      <>
        {tokens.map((token, index) => {
          const isWord = /[\w']+/.test(token);
          const isLink = urlRegex.test(token);
          const tokenIndex = isWord && !isLink ? wordCounter++ : -1;

          if (isLink) {
            return (
              <a
                key={index}
                href={token}
                className="text-primary underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {token}
              </a>
            );
          }

          return (
            <span
              key={index}
              className={isWord && tokenIndex === currentWordIndex ? "bg-primary/20 text-primary rounded px-1 font-medium" : ""}
            >
              {token}
            </span>
          );
        })}
      </>
    );
  };

  const markdownComponents: CustomComponents = {
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      if (!inline && match && children) {
        return (
          <CodeBlock
            language={match[1]}
            value={String(children).replace(/\n$/, '')}
          />
        );
      }
      return (
        <code className={cn("bg-muted/50 text-muted-foreground border rounded-md px-1 py-0.5 font-mono text-sm", className)} {...props}>
          {children}
        </code>
      );
    },
    p: ({ children, ...props }) => <p {...props}><TextRenderer>{children}</TextRenderer></p>,
    li: ({ children, ...props }) => {
      const textContent = getTextFromChildren(children);
      if (!textContent || /^\s*$/.test(textContent)) return null;
      return <li {...props}><TextRenderer>{children}</TextRenderer></li>;
    },
    h1: ({ children, ...props }) => <h1 className="text-4xl font-bold mt-2 mb-1" {...props}><TextRenderer>{children}</TextRenderer></h1>,
    h2: ({ children, ...props }) => <h2 className="text-xl font-bold mt-2 mb-1" {...props}><TextRenderer>{children}</TextRenderer></h2>,
    h3: ({ children, ...props }) => <h3 className="text-lg font-semibold mt-1 mb-0.5" {...props}><TextRenderer>{children}</TextRenderer></h3>,
    h4: ({ children, ...props }) => <h4 className="text-base font-semibold mt-1 mb-0.5" {...props}><TextRenderer>{children}</TextRenderer></h4>,
    h5: ({ children, ...props }) => <h5 className="text-sm font-semibold mt-1 mb-0.5" {...props}><TextRenderer>{children}</TextRenderer></h5>,
    h6: ({ children, ...props }) => <h6 className="text-xs font-semibold mt-1 mb-0.5" {...props}><TextRenderer>{children}</TextRenderer></h6>,
    a: ({ children, ...props }) => <a {...props} className="text-primary underline-offset-4 hover:underline"><TextRenderer>{children}</TextRenderer></a>,
    em: ({ children, ...props }) => <em {...props}><TextRenderer>{children}</TextRenderer></em>,
    strong: ({ children, ...props }) => <strong {...props}><TextRenderer>{children}</TextRenderer></strong>,
    hr: () => <hr className="my-2 border-t border-border" />,
    table: (props) => <div className="my-2 w-full overflow-x-auto rounded-lg border"><Table {...props} /></div>,
    thead: (props) => <TableHeader {...props} />,
    tbody: (props) => <TableBody {...props} />,
    tr: (props) => <TableRow {...props} />,
    th: (props) => <TableHead {...props} />,
    td: (props) => <TableCell {...props} />,
    blockquote: ({ children }) => <Alert className="my-2"><AlertDescription><TextRenderer>{children}</TextRenderer></AlertDescription></Alert>,
    math: ({ value }) => <Card className="my-2 overflow-x-auto p-4"><BlockMath math={value} /></Card>,
    inlineMath: ({ value }) => <InlineMath math={value} />,
  };

  const cleanedContent = cleanMarkdownContent(content);

  return (
    <div className={cn(
        "prose prose-sm dark:prose-invert min-w-full whitespace-pre-wrap break-words",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1",
        "[&_li]:my-0",
        "[&_li_p]:my-0",
        "[&_pre]:bg-transparent [&_pre]:p-0",
        "[&_p]:my-1",
        "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-1",
        "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-1",
        "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-1",
        "[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:my-1",
        "[&_hr]:my-2 [&_hr]:border-t [&_hr]:border-border"
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={markdownComponents}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  );
}