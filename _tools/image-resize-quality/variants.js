/** Every combination of scale and JPEG quality to try, largest first. */
export function variants(width, height, { qualities = [1, 0.9, 0.7, 0.5, 0.3], scales = [1, 0.5] } = {}) {
  return scales.flatMap((scale) => qualities.map((quality) => ({
    width: Math.round(width * scale), height: Math.round(height * scale), quality, scale,
  })));
}
