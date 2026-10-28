// Turn a GitHub issue (or pull request) and its comments into Markdown.

export function apiUrls(url) {
  const m = url.match(/github\.com\/([^/\s]+)\/([^/\s]+)\/(?:issues|pull)\/(\d+)/);
  if (!m) throw new Error("That doesn't look like a GitHub issue or pull request URL.");
  const base = `https://api.github.com/repos/${m[1]}/${m[2]}/issues/${m[3]}`;
  return { issue: base, comments: `${base}/comments?per_page=100` };
}

const when = (iso) => iso.slice(0, 16).replace("T", " ") + " UTC";

/** Lint-friendly Markdown: blank lines around headings and the list. */
export function issueToMarkdown(issue, comments = []) {
  const lines = [
    `# ${issue.title}`, "",
    `- **State:** ${issue.state}`,
    `- **Opened by:** ${issue.user.login}`,
    `- **Opened:** ${when(issue.created_at)}`,
    `- **Link:** ${issue.html_url}`, "",
    (issue.body || "_No description._").trim(), "",
  ];
  if (comments.length) {
    lines.push("## Comments", "");
    for (const c of comments) lines.push(`### ${c.user.login}, ${when(c.created_at)}`, "", (c.body || "").trim(), "");
  }
  return lines.join("\n");
}
