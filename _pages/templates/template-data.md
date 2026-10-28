---
layout: doc
title: "Data Post Template"
seo: Data
permalink: /templates/data
category: templates
summary: "Markdown front matter for a data post."
group: posts
---

{% raw %}

```html
{% include header.html %}
{{ page.title }}

{{ content }}


<ul>
 <li>{{ site.data.itemtype | size }}</b> item count.</li>
</ul>

 assign sorted = site.data.itemtype | sort: 'title' %}
<ul>
    {% for item in sorted %}
    <li>{{item.title}}</li>
    {% endfor %}
</ul>

{% endfor %}
{% include footer.html %}
```

{% endraw %}
