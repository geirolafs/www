/** Helpers shared by the portfolio asset scripts. */

export type FrameResult = { ok: true; buffer: Buffer } | { ok: false; stderr: string };

/**
 * Grabs a single decoded frame from a remote video as PNG, without
 * downloading the whole file — ffmpeg reads the URL over HTTP range requests.
 * With `seekSeconds`, `-ss` goes before `-i` (input seeking, the fast path);
 * without it, this is exactly frame zero.
 */
export async function grabVideoFrame(
  url: string,
  seekSeconds?: number
): Promise<FrameResult> {
  const seek = seekSeconds === undefined ? [] : ["-ss", String(seekSeconds)];
  const proc = Bun.spawn(
    [
      "ffmpeg",
      "-y",
      "-loglevel",
      "error",
      ...seek,
      "-i",
      url,
      "-frames:v",
      "1",
      "-an",
      "-f",
      "image2pipe",
      "-vcodec",
      "png",
      "pipe:1",
    ],
    { stdin: "ignore", stdout: "pipe", stderr: "pipe" }
  );

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).arrayBuffer(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  const buffer = Buffer.from(stdout);
  if (exitCode !== 0 || buffer.length === 0) {
    return { ok: false, stderr: stderr.trim() || `ffmpeg exited with code ${exitCode}` };
  }
  return { ok: true, buffer };
}

/**
 * Runs `task` over `items` with at most `concurrency` in flight at once. A
 * plain chunked loop rather than a queue library — the lists are a few dozen
 * items at most.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  task: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let start = 0; start < items.length; start += concurrency) {
    const chunk = items.slice(start, start + concurrency);
    results.push(...(await Promise.all(chunk.map(task))));
  }
  return results;
}
