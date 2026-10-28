/** Size for a target width, keeping the aspect ratio. 0 or a larger width keeps the original. */
export function fitWidth(width, height, target) {
  if (!target || target >= width) return { width, height };
  return { width: Math.round(target), height: Math.round((height * target) / width) };
}

/** True if any pixel in RGBA data is not fully opaque. */
export function hasTransparency(rgba) {
  for (let i = 3; i < rgba.length; i += 4) if (rgba[i] < 255) return true;
  return false;
}
