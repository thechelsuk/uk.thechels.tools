import { $, copyText, downloadText, setStatus } from "/assets/js/toolkit.js";
import { apiUrls, issueToMarkdown } from "./issue.js";

const KEY = "githubToken";
const token = $("#token"), remember = $("#remember"), output = $("#output"), status = $("#status");
let filename = "issue.md";

try {
  const saved = localStorage.getItem(KEY);
  if (saved) { token.value = saved; remember.checked = true; }
} catch { /* storage blocked */ }

function storeToken() {
  try {
    if (remember.checked && token.value.trim()) localStorage.setItem(KEY, token.value.trim());
    else localStorage.removeItem(KEY);
  } catch { /* storage blocked */ }
}

const ERRORS = { 401: "GitHub didn't accept that token.", 403: "Rate limit reached. Add a token and try again.", 404: "Issue not found, or the repository is private." };

async function get(url) {
  const headers = { Accept: "application/vnd.github+json" };
  if (token.value.trim()) headers.Authorization = `Bearer ${token.value.trim()}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(ERRORS[res.status] || `GitHub returned an error (${res.status}).`);
  return res.json();
}

$("#form").addEventListener("submit", async (e) => {
  e.preventDefault();
  storeToken();
  output.value = "";
  try {
    const urls = apiUrls($("#url").value);
    setStatus(status, "Fetching…");
    $("#fetch").disabled = true;
    const [issue, comments] = await Promise.all([get(urls.issue), get(urls.comments)]);
    output.value = issueToMarkdown(issue, comments);
    filename = `${issue.number}-${issue.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50)}.md`;
    setStatus(status, `● ${comments.length} comments`, "ok");
  } catch (err) {
    setStatus(status, err.message, "error");
  } finally {
    $("#fetch").disabled = false;
  }
});
remember.addEventListener("change", storeToken);
$("#copy").addEventListener("click", async () => output.value && setStatus(status, (await copyText(output.value)) ? "Copied" : "Copy failed", "ok"));
$("#download").addEventListener("click", () => output.value && downloadText(filename, output.value, "text/markdown"));
