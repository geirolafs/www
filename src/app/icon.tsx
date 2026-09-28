import { ImageResponse } from "next/og";
import { LOGO_MARK_PATH, LOGO_MARK_VIEW_BOX } from "@/lib/logo-mark";

const ICON_SCALE_FACTOR = 1.1;

// Generate image metadata for multiple sizes
export function generateImageMetadata() {
  return [
    {
      id: "small",
      size: { width: 32, height: 32 },
      contentType: "image/png",
    },
    {
      id: "medium",
      size: { width: 192, height: 192 },
      contentType: "image/png",
    },
    {
      id: "large",
      size: { width: 512, height: 512 },
      contentType: "image/png",
    },
  ];
}

// Image generation
export default async function Icon({ id }: { id?: Promise<string> }) {
  const resolvedId = id ? await id : undefined;
  // Map id to size
  const sizes = { small: 32, medium: 192, large: 512 };
  const iconSize = sizes[(resolvedId as keyof typeof sizes) || "small"];

  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: `${iconSize}px`,
        backgroundColor: "white",
        overflow: "hidden",
      }}
    >
      <svg
        aria-label="favicon"
        fill="black"
        height={iconSize * ICON_SCALE_FACTOR}
        role="img"
        viewBox={LOGO_MARK_VIEW_BOX}
        width={iconSize * ICON_SCALE_FACTOR}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={LOGO_MARK_PATH} />
      </svg>
    </div>,

    // ImageResponse options
    {
      width: iconSize,
      height: iconSize,
    }
  );
}
