/**
 * Plain helpers shared by the server page and the client `MediaCard`. They
 * live outside the card's `"use client"` module so the page can call them
 * while rendering on the server.
 */

export type PortfolioFile = {
  name: string;
  key: string;
  url: string;
  size: number;
};

export function isVideo(filename: string) {
  return filename.toLowerCase().endsWith(".mp4");
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
