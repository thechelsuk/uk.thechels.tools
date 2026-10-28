const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const UNESCAPES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&#x27;": "'", "&apos;": "'" };

/** Replace & < > " ' with HTML entities. */
export const escapeHtml = (text) => text.replace(/[&<>"']/g, (c) => ESCAPES[c]);

/** Turn those entities back into characters, one level deep. */
export const unescapeHtml = (text) => text.replace(/&(?:amp|lt|gt|quot|apos|#39|#x27);/g, (e) => UNESCAPES[e]);
