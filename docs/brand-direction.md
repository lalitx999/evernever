# Evernever website brand direction

Source: the supplied `evernever_manual guide.pdf`. The website uses its brand identity, not the placeholder copy in its presentation templates.

## Identity

- Nova Blue: `#5566ff`
- Dark Purple: `#0e101e` (primarily text)
- Light Gray: `#e2e0df`
- Pure White: `#fefefe` (primary background)
- The header and footer wordmark is extracted as vector artwork from the supplied manual.
- DB Heavent and Clone Rounded Latin are named in the manual. Their font files are not available in the project; local LINE Seed Sans TH is the current fallback. Supply appropriately licensed webfont files to match the CI typography exactly.

## Layout

Updated for Canva feedback dated 7 October 2026 (slides 6–12), implemented 10 October 2026. CI governs color, logo and typeface, not page templates.

Journey remains Hero → clients → company → services → selected work → contact.

- Typography tokens: 72px statements, 32px section titles, 18px descriptions, 12px metadata. Mobile scales to 48/28/16/12. The introductory statement is a 52px intermediate editorial level.
- Shared content gutter, 96px desktop / 64px mobile section spacing, 6px image corners and 4px controls.
- Centered hero with the original tagline and real project photography on its edges; decorative badges, gradients and heavy card shadows removed.
- Client logos move slowly with pause/play, pause on hover and a static reduced-motion alternative.
- Company introduction describes creative/strategy/content with the original company description.
- Desktop services pair scrolling descriptions with a sticky image that changes at each service. Mobile places each image directly with its description. All twelve source service links remain available.
- Homepage shows three featured projects in a compact composition; mobile uses native horizontal scroll and scroll snap. Full work listing remains available.
- Contact form is on the homepage and contact page with first/last name, phone, email and optional company. The server validates the new fields. Email delivery remains unconfigured and returns an honest unavailable message; no fake success or contact-data logging.
- Footer and internal pages use the same typography and spacing tokens.

Feedback source: https://canva.link/xr66mwv4gzsrin5.

## Content and scope

Company copy, contact details, project entries, service descriptions, and client artwork remain sourced from Evernever; see `content-sources.md`. No invented statistics or client claims were added. This pass changes the visual layout, not email delivery or CMS configuration.
