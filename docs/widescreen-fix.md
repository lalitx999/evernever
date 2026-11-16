# Widescreen layout correction — 2026-10-10

The homepage intro combined viewport-derived page gutters with a 1440px
section max-width. At a 3840px viewport, the horizontal padding consumed the
entire content box: the intro body measured 0px wide.

Removed the section's second width constraint. It now shares the full-width
section and page gutter pattern used elsewhere. The intro body measures
1305px with a 15px scrollbar at 3840px; its paragraph remains capped at 630px.

Bound the hero's decorative image layer to 1760px and centered it so images
stay near the heading on wide screens. Existing mobile image layout remains.

Browser geometry checks: 390, 768, 1280, 1440, 1920, 2560, 3840px; no document
horizontal overflow. Visually checked mobile and 3840 × 2160.
Screenshot: previews/widescreen-fix-4k.png.

## Fluid layout revision — 2026-10-13

Confirmed the production alias serves the October 10 intro fix; it still has
fixed 1320px content gutters. The customer's current URL/symptom has been
requested, so a separate stale-page report remains unconfirmed.

Public CSS now uses --layout-unit: 1px through 1440px, increasing continuously
with viewport width, capped at 2.6667px at 3840px. Design dimensions, typography,
spacing, form controls and vector icons grow together. Breakpoints and thin
borders remain in CSS pixels. No CSS zoom or transform scaling is used.
Section gutters are 6% of available width; nested width/padding constraints no
longer combine to consume the content box. Root font size and CMS styles are
not rescaled.

Measured homepage intro widths / main type:
390: 330 / 36px; 768: 663 / 49px; 1440: 1254 / 72px;
1920: 1676 / 96px; 2560: 2240 / 128px; 3840: 3366 / 192px.
No document horizontal overflow at these sizes. About, Services, Works, Team,
Clients and Contact checked at 390px and 3840px with no horizontal overflow.
Mobile and desktop screenshots visually inspected. ESLint and production
build pass (51 pages). Preview: previews/fluid-layout-4k.png.
Raster images remain limited by source resolution; SVGs and text scale cleanly.
This revision has not been deployed.
