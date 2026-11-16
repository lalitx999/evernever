# Evernever content import

Imported from the public evernever.net site on 2026-09-15.

## Sources

- Company introduction and 12 services: https://evernever.net/
- Company overview: https://evernever.net/about/
- Team names, roles and portraits: https://evernever.net/team/
- Client artwork: https://evernever.net/clients/
- Address, office hours, telephone numbers and email: https://evernever.net/contact/
- Portfolio: https://evernever.net/category/all/
- Public WordPress REST API: https://evernever.net/wp-json/wp/v2/

`src/data/evernever.json` contains 28 published portfolio entries belonging to
WordPress's All category. Every entry retains its original `sourceUrl`. Three
credential posts outside that category are excluded. Project titles, category
labels, descriptions and video links are taken from the source, not generated.
Publication dates are deliberately not presented as project completion years.
No invented client metrics, client names, project claims or stock imagery remain.

`src/data/evernever-assets.json` maps 55 local assets to their source URLs.
Downloaded covers, icons, portraits and brand artwork are in `public/evernever/`.
Gallery images and video embeds retain their original external source URLs.

## Source cleanup

- Omitted Metro Mall's lorem ipsum and its orphan template headings.
- Omitted the generic architects/engineers sentence on the Team page.
- Kept the music-video production write-up without reproducing the song quotation.
- Do not invent text for portfolio entries that only have an image or video.
- Preserve source categorization, even where it does not align with the proposed
  four-group navigation.

## Updating the import

`scripts/import-evernever.py` reads public WordPress API snapshots named
`posts.json`, `pages.json`, and `categories.json` from `/tmp/evernever-source`.
Posts and pages use `per_page=100&_embed=1`; categories use `per_page=100`.
It writes normalized data and downloads the listed assets. Review source edits
before importing again. Existing Sanity content can supplement or override
imported entries by matching their slug.

## Contact form

The real contact information is displayed, and the form now only requests name
and telephone as specified in the brief. Email delivery is not configured.
The endpoint returns an explicit unavailable response rather than reporting a
fictional success or logging customers' contact details. Configure and verify
email delivery before making the form operational.

## Navigation update

Header order and all 12 service category slugs follow the original homepage.
The Navbar uses the source site's LINE Seed Sans TH regular and bold WOFF assets
from https://evernever.net/wp-content/uploads/2024/03/ (stored in public/fonts).
Team and Clients now have dedicated local routes. Each service menu links to
its service description and portfolio entries carrying that source category;
empty categories show an explicit empty state rather than invented work.
