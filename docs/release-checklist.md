# Evernever release checklist

Current status: 22 October 2026. The new admin is tested on staging; the customer domain has not been switched.

## Verified

- Bridge 1.0.1 installed on the separate cms-stage WordPress and matches tested source.
- Protected Vercel Preview uses WordPress content and has contact enabled for delivery testing.
- User confirmed a published test work appears and the requested Gmail test email arrives.
- Contact recipient restored to hello@evernever.net.
- Build passed; 26 API, 36 local WordPress integration and 20 Bridge checks passed.
- Runtime dependency audit: zero findings. Five high findings remain in the development ESLint dependency chain; see dependency-review.md.
- Fresh staging Site Health: Good, no critical issues.

## Complete before launch

1. Sign into the protected Preview and the custom admin with the staging WordPress account.
2. Import the 28 existing local works using the import tab as drafts. Preserve the existing test work. Duplicate slugs are rejected; do not repeatedly import successful rows.
3. Compare title, categories, cover, gallery order, videos and text against the local source. The Loft Clinic must retain all 103 gallery images.
4. Review and publish approved works. Verify public list/detail pages and mobile/desktop/4K layout with the complete content set.
5. Confirm delivery at hello@evernever.net and inspect sending-domain SPF/DKIM/DMARC. Gmail receipt confirms that tested route, not every recipient.
6. Prepare production environment values and verify a deployment before assigning the customer domain. Persistent Preview variables currently differ from the tested deployment overrides; do not assume future deployments inherit them.
7. Check every proposed legacy redirect destination returns 200, then activate the reviewed mapping from content-cutover-review.md.
8. Review the exact apex/www DNS changes with the owner. First resolve mail SRV, FTP CNAME, SPF +a and Plesk-on-apex dependencies. Preserve billing and mail services; do not replace nameservers wholesale.
9. Record the prior DNS values for rollback. After cutover verify HTTPS, www canonical redirect, forms, admin and media. Keep the old website/database intact.

## Handover

- Give the client docs/admin-user-guide.md and the final /login URL.
- Explain which company fields are editable and which remain code-managed.
- User manages credential changes; do not place passwords or bridge secrets in handover documents.
- A new backup was explicitly deferred by the owner. Do not label a rollback as tested unless actually verified.
