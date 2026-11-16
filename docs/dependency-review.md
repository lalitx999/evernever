# Dependency review — 21 October 2026

Next.js and eslint-config-next updated from 16.3.5 to 16.4.2. React and React DOM aligned to 19.3.1 for the updated editor peer requirement. Compatible npm audit fixes applied without --force. Local build and TypeScript passed.

Audit changed from 30 findings (1 critical) to 21 (0 critical, 11 high, 10 moderate). This is not a clean security audit. Remaining findings propagate through Sanity tooling and ESLint dependencies; no claim is made that all are unreachable in production.

Do not follow the suggested forced downgrades to Next ESLint 14 / Sanity 5 without compatibility review. Review retained Sanity support before removing it; the project still contains an optional Sanity client and /studio.

| Package | Severity |
|---|---|
| @next/eslint-plugin-next | high |
| @sanity/cli | high |
| @sanity/cli-build | moderate |
| @sanity/codegen | high |
| @sanity/runtime-cli | moderate |
| @sanity/vision | moderate |
| @vercel/frameworks | moderate |
| argparse | moderate |
| braces | high |
| chokidar | high |
| eslint-config-next | high |
| fast-glob | high |
| globby | high |
| js-yaml | high |
| micromatch | high |
| next-sanity | moderate |
| sanity | moderate |
| smol-toml | high |
| sprintf-js | moderate |
| typeid-js | moderate |
| uuid | moderate |

Primary Next image-optimization advisory: https://github.com/vercel/next.js/security/advisories/GHSA-cjq9-62q9-8jv4

## Final WordPress-only review — 22 October 2026

Vercel env listing confirmed no configured Sanity project. Removed the unused Sanity client/studio dependencies (915 packages); archived original source in legacy-sanity-source.zip. Public content now uses WordPress when CONTENT_SOURCE=wordpress, otherwise the existing local snapshot. /studio redirects to /admin.

- Runtime audit (`npm audit --omit=dev`): 0 findings.
- Full audit: 5 high findings, all in the ESLint development chain (@next/eslint-plugin-next → fast-glob → micromatch → braces, plus eslint-config-next). npm registry currently reports braces 3.0.3 as latest, which remains affected. Do not force-downgrade the Next ESLint integration. These are not runtime dependencies; keep lint inputs trusted and revisit upstream updates.
- Local build/TypeScript and targeted ESLint passed.
