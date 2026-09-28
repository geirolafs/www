"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

type PostViewTrackerProps = {
  slug: string;
  title: string;
  readingTime: number;
};

export function PostViewTracker({ slug, title, readingTime }: PostViewTrackerProps) {
  useEffect(() => {
    posthog.capture("blog_post_viewed", {
      slug,
      title,
      reading_time_minutes: readingTime,
    });
  }, [slug, title, readingTime]);

  return null;
}
