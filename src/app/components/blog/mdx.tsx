import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type React from "react";
import { CodeBlock } from "@/components/blog/code-block";

type TableData = {
  headers: string[];
  rows: string[][];
};

function Table({ data }: { data: TableData }) {
  const headers = data.headers.map(header => (
    <th
      className="px-sm py-2xs text-left font-medium text-label"
      key={`header-${header}`}
    >
      {header}
    </th>
  ));
  const rows = data.rows.map((row, rowIndex) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: static MDX table, rows never reorder and have no id
    <tr className="border-border border-t" key={`row-${row.join("-")}-${rowIndex}`}>
      {row.map((cell, cellIndex) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static MDX table, cells never reorder and may repeat
        <td className="px-sm py-2xs" key={`cell-${rowIndex}-${cellIndex}`}>
          {cell}
        </td>
      ))}
    </tr>
  ));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-border border-b">{headers}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

type CustomLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: React.ReactNode;
};

function CustomLink(props: CustomLinkProps) {
  const { href, ...restProps } = props;

  if (href.startsWith("/")) {
    return (
      <Link href={href} {...restProps}>
        {props.children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return <a {...restProps} href={href} />;
  }

  return <a {...restProps} href={href} rel="noopener noreferrer" target="_blank" />;
}

type BlogImageProps = {
  src: string;
  alt: string;
  aspectRatio?: string; // e.g., "16/9", "4/3", "1/1"
};

function BlogImage({ src, alt, aspectRatio = "16/9" }: BlogImageProps) {
  return (
    <div className="relative my-md w-full overflow-hidden" style={{ aspectRatio }}>
      <Image
        alt={alt}
        className="object-cover"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
        src={src}
      />
    </div>
  );
}

type YouTubeProps = {
  id: string;
  title?: string;
};

function YouTube({ id, title = "YouTube video" }: YouTubeProps) {
  return (
    <div
      className="relative my-md w-full overflow-hidden"
      style={{ aspectRatio: "16/9" }}
    >
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
      />
    </div>
  );
}

const components = {
  Image: BlogImage,
  a: CustomLink,
  YouTube,
  pre: CodeBlock,
  Table,
};

type CustomMDXProps = {
  source: string;
  components?: Record<string, React.ComponentType>;
};

export function CustomMDX(props: CustomMDXProps) {
  return (
    <MDXRemote {...props} components={{ ...components, ...(props.components || {}) }} />
  );
}
