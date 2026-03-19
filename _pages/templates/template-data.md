---

layout: page
title: Template - Data
seo: Data
permalink: /templates/data
---

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
