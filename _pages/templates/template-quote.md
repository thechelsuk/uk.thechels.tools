---
layout: doc
title: "Quote Post Template"
seo: Quote
permalink: /templates/quote
category: templates
summary: "Markdown front matter for a quote post."
description: "A free Markdown template for a quote or link post: front matter with the source link and name, your comment, and the quote itself as a blockquote."
group: posts
---

A quote post, sometimes called a linked post, shares something worth reading from elsewhere: a short quote, your comment on it, and a link back to the source.

This is the Markdown template I start each one from. Copy it into a new post, then fill in each part.

## What goes in each part

- **Front matter:** the post layout, the date, the `link` to the original, the title, `type: linked` and the name of the source it's `cited` from.
- **Comment:** what you think about it, or why it's worth reading.
- **Quote:** the passage itself, as a blockquote.

## The template

```markdown
---

layout: post
date: YYYY-MM-DD
link: url
title: post title
type: linked
cited: source name

---

my comment

> quote
```
