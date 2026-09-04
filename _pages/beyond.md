---
layout: page
title: Beyond
permalink: /beyond/
description:
nav: true
nav_order: 4
---

Outside of research, I enjoy traveling and taking photos along the way. I love pop music, and I also follow Formula 1 pretty closely. Charles Leclerc is my favorite F1 driver.

## Photographs

Here is a selection of photos I have taken.

<div class="gallery" data-gallery>
  {%- for photo in site.data.photos -%}
    {%- capture meta -%}
      {%- if photo.date -%}{{ photo.date }}{%- endif -%}
      {%- if photo.date and photo.place %} · {% endif -%}
      {%- if photo.place -%}{{ photo.place }}{%- endif -%}
      {%- if photo.emoji %} {{ photo.emoji }}{% endif -%}
    {%- endcapture -%}
    {%- assign meta = meta | strip -%}
    {%- assign size = site.data.photo_dimensions[photo.file] -%}
    {%- assign w = size[0] | default: 3 -%}
    {%- assign h = size[1] | default: 2 -%}
    {%- if w > h -%}
      {%- assign shape = "gallery-item--wide" -%}
    {%- else -%}
      {%- assign shape = "gallery-item--tall" -%}
    {%- endif -%}
    <div class="gallery-item {{ shape }}" data-gallery-item data-ratio="{{ w }}/{{ h }}" tabindex="0">
      <figure>
        <img
          src="{{ photo.file | prepend: '/assets/img/photos/' | relative_url }}"
          alt="{{ photo.alt | default: meta | escape }}"
          width="{{ w }}"
          height="{{ h }}"
          loading="lazy"
          decoding="async"
        >
        {%- if photo.alt or meta != '' %}
          <figcaption>
            {%- if photo.alt %}<span class="gallery-note">{{ photo.alt }}</span>{% endif -%}
            {%- if meta != '' %}<span class="gallery-meta">{{ meta }}</span>{% endif -%}
          </figcaption>
        {% endif -%}
      </figure>
    </div>
  {%- endfor -%}
</div>

<script defer src="{{ '/assets/js/gallery.js' | relative_url | bust_file_cache }}"></script>
