---
layout: doc
title: "Data Post Template"
seo: Data
permalink: /templates/data
category: templates
summary: "Markdown front matter for a data post."
description: "A free Jekyll layout template for a data post: show a count of the items in a data file and list them sorted by title. Copy it into your site's layouts."
group: posts
---

A data post is a page built from a data file rather than written by hand, such as a list of books, films or podcasts kept in a YAML file in your site's `_data` folder. When the file changes, the page updates the next time the site builds.

This is the Jekyll layout I use for them. Copy it into your site, then replace `itemtype` with the name of your data file.

## What goes in each part

- **Header and footer:** your site's own `header.html` and `footer.html` includes, so the page matches the rest of the site.
- **Title and content:** the post's title, then anything you write in the post itself.
- **Item count:** how many entries are in the data file, using Liquid's `size` filter.
- **Sorted list:** every entry in the file, sorted by its `title` field, one per line.

## The template

{% raw %}

```html
{% include header.html %}
{{ page.title }}

{{ content }}


<ul>
  <li><b>{{ site.data.itemtype | size }}</b> item count.</li>
</ul>

{% assign sorted = site.data.itemtype | sort: 'title' %}
<ul>
  {% for item in sorted %}
  <li>{{ item.title }}</li>
  {% endfor %}
</ul>

{% include footer.html %}
```

{% endraw %}
