"use client";

import type React from "react";
import { isValidElement, useEffect, useRef, useState } from "react";
import { highlight } from "sugar-high";
import { useElementScrollState } from "@/lib/hooks/use-element-scroll-state";

function getCodeString(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(getCodeString).join("");
  if (isValidElement<{ children?: React.ReactNode }>(children)) {
    return getCodeString(children.props.children);
  }
  return "";
}
function getCodeClassName(children: React.ReactNode): string | undefined {
  if (isValidElement<{ className?: string }>(children)) {
    return children.props.className;
  }
  return undefined;
}

export function CodeBlock({
  children,
  className: _className,
  tabIndex: _tabIndex,
  ...props
}: React.HTMLAttributes<HTMLPreElement>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [isReady, setIsReady] = useState(false);
  const { isScrollable, isAtStart, isAtEnd } = useElementScrollState(preRef);

  const codeString = getCodeString(children);
  const codeClassName = getCodeClassName(children);
  const highlightedCode = highlight(codeString);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const showLeftGradient = isScrollable && !isAtStart;
  const showRightGradient = isScrollable && !isAtEnd;
  return (
    <div
      className="code-block-wrapper"
      style={{
        opacity: isReady ? 1 : 0,
        transition: "opacity 50ms ease",
      }}
    >
      <div
        className="code-block-gradient-left"
        style={{ opacity: showLeftGradient ? 1 : 0 }}
      />
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: code blocks need tabIndex for keyboard scrolling */}
      <pre ref={preRef} tabIndex={0} suppressHydrationWarning {...props}>
        <code
          className={codeClassName}
          suppressHydrationWarning
          // biome-ignore lint/security/noDangerouslySetInnerHtml: sugar-high produces safe HTML
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
      <div
        className="code-block-gradient-right"
        style={{ opacity: showRightGradient ? 1 : 0 }}
      />
    </div>
  );
}
