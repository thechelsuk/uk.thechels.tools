import { fitWidth } from "../image-to-jpeg/size.js";

/** Width used by the "resize for the web" toggle. */
export const WEB_WIDTH = 832;

/** Output size: 832px wide (never enlarged) when resizing, otherwise the original. */
export function targetSize(width, height, resize) {
  return fitWidth(width, height, resize ? WEB_WIDTH : 0);
}

/** Download name: the original name as .webp, with the width added if it was resized. */
export function webpName(fileName, resized) {
  const base = (fileName || "").replace(/\.[^.]+$/, "") || "image";
  return resized ? `${base}-${resized.width}w.webp` : `${base}.webp`;
}
