---
layout: doc
title: "Music Post Template"
seo: Music
permalink: /templates/music
category: templates
summary: "Markdown front matter for a music post."
description: "A free Markdown template for a monthly mixtape post: front matter, cover image and a numbered track list, with a link to listen along on Apple Music."
group: posts
---

A monthly mixtape post shares what you've been listening to that month: a cover image, the tracks in order and a link to the playlist so readers can listen along.

This is the Markdown template I start each one from. Copy it into a new post, then fill in each part.

## What goes in each part

- **Front matter:** the post layout, the date, a `music` tag, the title with the month and year, and `type: mixtape` so the site can group mixtapes together.
- **Intro:** a line about what you've been listening to.
- **Cover image:** the month's mixtape artwork, named by year and month.
- **Track list:** a numbered list of songs and artists, in playlist order.
- **Listen along:** a link to the playlists on Apple Music.

## The template

```markdown
---

layout: post
date: YYYY-MM-DD
tags : [music]
title: Monthly Mixtape - mmm YYYY
type: mixtape

---

What I've been listening to this month.

![Monthly Mixtape YYYY-MM](/images/mixtapes/YYYY-MM.png)

1. song - artist
2. song - artist
3. song - artist
4. ...

You can listen along on [Apple Music here](https://music.apple.com/profile/thechelsuk)
```
