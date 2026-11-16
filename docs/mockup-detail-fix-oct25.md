# Sulwhasoo showcase and published-detail fix — 25 October 2026

- Customer requested one Sulwhasoo work repeated as three mockup cards. `PORTFOLIO_MOCKUP=sulwhasoo` enables this on public listings; clear it to return to normal content. Admin and WordPress records are not modified.
- Detail lookup still resolves real published WordPress works, including links from Admin. Mockup cards all open the original Sulwhasoo detail, with no self-referencing next-work link.
- Vercel logs on the previous deployment showed `DYNAMIC_SERVER_USAGE` for the reported test-work URL. Removed the empty `generateStaticParams` strategy and explicitly wait for a request in the detail page and metadata, so newly published slugs render dynamically.
- New protected Preview: https://ahency-de5ax8num-thde-v.vercel.app
- Vercel production build and TypeScript passed; targeted ESLint passed. HTTP checks: reported test-work detail 200 with its actual heading, works 200 with exactly three Sulwhasoo card links, Sulwhasoo detail 200. No error-boundary text or dynamic-server digest in these responses.
- Local browser inspection was blocked by the browser URL policy; visual QA not completed this turn. The local build stalled; the successful Vercel build is the build verification used above.
- Preview overrides enable the mockup and WordPress content for this deployment only. The old deployment URL is immutable and still contains the old code. Production domain/DNS untouched.
