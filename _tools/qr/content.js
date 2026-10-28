// Decide how to present what a QR code contains. Only http(s) addresses are
// ever turned into links; everything else is shown as plain text.

export function describeContent(text) {
  const wifi = text.match(/^WIFI:.*?S:((?:\\.|[^;])*)/i);
  if (wifi) return { kind: "wifi", network: wifi[1].replace(/\\(.)/g, "$1") };
  const mail = text.match(/^mailto:([^?\s]+)/i);
  if (mail) return { kind: "email", address: mail[1] };
  try {
    const url = new URL(text);
    if (url.protocol === "http:" || url.protocol === "https:") return { kind: "url", href: url.href };
  } catch { /* not a URL */ }
  return { kind: "text" };
}
