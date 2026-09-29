import Image from "next/image";
import { IMAGE_QUALITIES } from "@/lib/config/image";
import { AmbilightFilter } from "./ambilight-filter";
import { AMBILIGHT_CANVAS, AMBILIGHT_LAYER_CLASS, ambilightStyle } from "./config";

/**
 * v1's `AmbientImage`: the image at its own 960 × 1357, over a blurred copy of
 * itself fetched at the blur quality and v1's 480px. The copy is smeared by
 * 42px, so detail is wasted on it. No JavaScript.
 */
export function AmbilightImage({ id, src }: { id: string; src: string }) {
  return (
    <div className="relative">
      <Image
        alt=""
        className="relative z-10 block w-full"
        height={1357}
        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 100vw"
        src={src}
        width={960}
      />
      <AmbilightFilter id={id} />
      <Image
        alt=""
        aria-hidden="true"
        className={AMBILIGHT_LAYER_CLASS}
        height={1357}
        quality={IMAGE_QUALITIES.blur}
        sizes={`${AMBILIGHT_CANVAS.width}px`}
        src={src}
        style={ambilightStyle(id)}
        width={960}
      />
    </div>
  );
}
