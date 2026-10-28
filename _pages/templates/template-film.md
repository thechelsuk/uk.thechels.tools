---
layout: doc
title: "Film Post Template"
seo: Film
permalink: /templates/film
category: templates
summary: "Markdown front matter for a film post."
description: "A free Markdown template for a film post: the film's title, the date you watched it, its IMDb code and your rating. Copy it into a new post and fill it in."
group: posts
---

A film post is a short entry in a log of the films you've watched. Kept up over time, it becomes a searchable record of what you've seen and what you thought of it.

This is the template I start each one from. Copy it into a new post, then fill in each part.

## What goes in each part

- **Film:** the film's title, where `<|search>` sits.
- **Date:** the day you watched it, filled in by the `[[date]]` placeholder.
- **IMDb:** the film's IMDb code, such as `tt0111161`, so the entry links to the right film.
- **Rating:** your score for the film.

## The template

```markdown
# FilmEntry

<|search>
Date: [[date]]
IMDB: <|IMDbCode>
Rating: <|rating>
```
