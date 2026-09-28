import { ImageResponse } from "next/og";
import { LOGO_MARK_PATH, LOGO_MARK_VIEW_BOX } from "@/lib/logo-mark";

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

const ICON_SCALE_FACTOR = 0.7;

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
      }}
    >
      <svg
        aria-label="apple touch icon"
        fill="black"
        height={size.height * ICON_SCALE_FACTOR}
        role="img"
        viewBox={LOGO_MARK_VIEW_BOX}
        width={size.width * ICON_SCALE_FACTOR}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={LOGO_MARK_PATH} />
      </svg>
    </div>,
    // ImageResponse options
    {
      width: size.width,
      height: size.height,
    }
  );
}
