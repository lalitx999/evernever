# Evernever admin — implementation and rollout

## Status (21 October 2026)

Implemented locally. The customer WordPress/Plesk/DNS and production Vercel deployment have NOT been modified.

- `/login`: authenticates an existing WordPress Editor or Administrator.
- `/admin`: list/search/filter, create/edit, draft/publish/unpublish, order/featured selection, trash/restore, cover/gallery uploads and ordering, video links, preview, and company text.
- Import tab copies the 28 portfolio records already in `src/data/evernever.json` as drafts. This is a snapshot, not a live Elementor importer. The 31 published WordPress posts observed included three Credential posts; review this mapping before go-live.
- WordPress plugin stores new content as `en_project` posts and `_en_project` metadata in the existing database. Existing Elementor posts are not edited. Images upload to WordPress Media Library.
- Contact form goes through the server to WordPress `wp_mail`. Success means the mail transport accepted it; actual inbox delivery still needs testing on the customer's host.
- No permanent-delete operation, no public registration, no package/pricing features.

## Architecture

Browser → same-origin Next.js API → HTTPS WordPress `/wp-json/evernever/v1` → WordPress database/media.

The bridge key is server-only. User sessions are random 256-bit tokens, stored hashed in WordPress transients with an eight-hour lifetime. The browser receives only an HttpOnly SameSite=Strict cookie (Secure in production). Every admin API call validates the token and current user capabilities. Password changes and loss of required role invalidate access. Logout revokes the token. Writes require same-origin requests. Login/contact throttles persist on WordPress rather than Vercel process memory.

Use dedicated WordPress Editor accounts for portfolio staff; Administrator is required for company settings. User creation/reset remains in WordPress. There is no separate user-management UI or MFA flow in this version. If a production login security/MFA plugin is introduced, validate its authentication compatibility before enabling the custom login.

The plugin uses WordPress REST permissions: https://developer.wordpress.org/rest-api/extending-the-rest-api/routes-and-endpoints/

## Files

- `wordpress/evernever-bridge/evernever-bridge.php`: installable bridge plugin.
- `wordpress/evernever-bridge.zip`: packaged plugin.
- `.env.example`: safe configuration template.
- `src/lib/cms`: server transport, origin validation, types.
- `src/app/api/admin/[...path]/route.ts`: restricted proxy endpoints.
- `tests/bridge-test.php`: isolated PHP logic tests with WordPress stubs.
- `tests/wordpress-integration.mjs`: actual local WordPress API integration tests.
- `tests/admin-api-test.mjs`: Next proxy/publication integration tests.
- `tests/cms-fixture.mjs`: earlier UI fixture only; production code never imports it.

## Staging setup — requires access/setup approval before customer-host changes

1. Back up the customer WordPress files and database; verify a recoverable copy.
2. Prepare a staging WordPress copy with a SEPARATE database. Do not share the live WordPress database for initial integration tests. Check compatibility before upgrading the currently observed PHP 7.4.33.
3. Prepare a dedicated HTTPS CMS hostname. Do not change the public apex/www yet. An existing WordPress site must be migrated/cloned with correct `home`/`siteurl`, uploads, and Elementor URL handling; adding DNS alone is insufficient.
4. Upload and activate `evernever-bridge.zip` on staging.
5. Add to staging `wp-config.php`, above the WordPress bootstrap:

```php
define('EVERNEVER_BRIDGE_SECRET', '<cryptographically random secret of at least 32 characters>');
define('EVERNEVER_CONTACT_TO', '<approved recipient email>');
```

Generate a fresh secret in a password manager or secure terminal; do not reuse local fixture values or put it in source control/chat. The owner should enter secrets in the hosting/Vercel settings.

6. Configure Vercel Preview variables:

```text
WORDPRESS_API_URL=https://<staging-cms-host>/wp-json/evernever/v1
WORDPRESS_BRIDGE_SECRET=<same secret>
CONTENT_SOURCE=local
CONTACT_ENABLED=false
```

7. Log in via `/login`, import drafts, validate all content/media, test publishing and withdrawing. New data is stored even while `CONTENT_SOURCE=local`; the admin shows a banner explaining that the public website still uses the old imported content.
8. Set `CONTENT_SOURCE=wordpress` ONLY on the staging preview after required works are published. This switches entirely to managed WordPress records: local fallback projects are NOT merged back, so drafts/trashed records cannot reappear publicly. Requests use `no-store`; mutations also revalidate the Next layout.
9. Add the staging CMS hostname to Next `images.remotePatterns` before testing public uploaded images. Production `cms.evernever.net` is already listed. Arbitrary image hosts are not permitted by the public image optimizer.
10. If old uploaded media is retained under the CMS hostname, set `WORDPRESS_MEDIA_ORIGIN=https://cms.evernever.net`. This rewrites only old `evernever.net/wp-content/uploads/...` image URLs during public reads. Confirm the files exist there first. Local `/evernever/...` images remain served by Next.
11. Test email transport/inbox delivery using an approved test submission. Enable `CONTACT_ENABLED=true` only for the final tested configuration.

## Verification completed locally

- Final production build and ESLint passed (53 generated pages; no customer CMS credentials).
- PHP syntax checked using PHP 8.2.4; plugin source uses PHP 7.4-compatible syntax. Actual PHP 7.4 runtime is not available locally.
- 20 PHP logic checks (including editor/company permissions, subscriber rejection and revoked-role enforcement): auth key, session, password change, throttle, publish requirements, duplicate slugs, conflict detection, URL rejection, preventing edits to Elementor posts.
- Actual WordPress 7.1.3 with SQLite on loopback: 32 integration checks, including real media upload, Thai slugs, quotes/backslashes, draft visibility, publish, trash/restore, company settings and logout revocation.
- 20 Next API checks against that WordPress: authenticated cookies, CSRF, endpoint allowlist, image uploads, unsupported MIME rejection, draft 404, published page 200, removed page 404, expired logout.
- Local mail was intercepted with `pre_wp_mail`; NO external emails were sent. This does not prove customer SMTP/inbox delivery.
- SQLite test environment does not substitute for final MariaDB/Plesk integration verification.
- Desktop/mobile/4K UI checked separately; see `docs/previews/admin-oct21.png`.

## Customer acceptance before domain cutover

- Every expected work imported/reviewed; title, categories, gallery, videos, description and order checked.
- Editor can create → preview → publish → edit → unpublish → trash → restore.
- Unauthorized/expired sessions cannot read drafts or write.
- Large/unsupported images show an error; JPG/PNG/WebP ≤3 MB upload correctly.
- Validate a second editor cannot silently overwrite a stale version.
- Company fields update homepage/about/contact/footer, including applicable page metadata.
- Confirm contact inbox delivery, reply-to, spam behavior and sending-domain SPF/DKIM/DMARC.
- Check 390px, tablet, desktop and 3840px; no missing media or horizontal overflow.
- Make a mapping of legacy URL redirects, including any changed slugs. Redirect cutover is still pending.
- Preserve backup and test rollback by restoring original DNS/content mode.

## DNS dependencies found in read-only audit

Plesk showed `mail`, `webmail`, billing and billing-stage pointing directly at the old server. However mail SRV records and FTP CNAME reference the apex, and SPF includes `+a`. Also Plesk is accessed via the apex on port 8443. Confirm authoritative public DNS, prepare a secure independent Plesk URL, and separate these dependencies BEFORE changing apex/www to Vercel. Do not change nameservers wholesale.

## Known boundaries

- Company editor covers description/about/invitation/legal name/address/hours/email. Phone numbers, team roster, service copy and homepage layout remain code-managed.
- Preview in Admin renders entered content; it is not a pixel-identical public-page preview.
- Media removed from a project's gallery stays in WordPress Media Library. Cleanup is intentionally separate.
- Trash retention follows WordPress `EMPTY_TRASH_DAYS` (normally 30 days). If trash is disabled, the bridge refuses deletion to avoid accidental permanent deletion.
- Local import is manual per project, with duplicate-slug rejection. Existing Elementor designs are not editable through this admin.

## Preview progress — 21 October 2026

- Staging WordPress is installed separately at cms-stage.evernever.net; the old production database is not the test target.
- User confirmed a published work appears on the WordPress-backed Vercel Preview.
- Admin now links published works directly to the public detail page and explicitly confirms withdrawal from publication.
- Local lifecycle tests also cover editing published metadata, gallery order, videos, unpublishing and republishing. Total: 72 checks across three suites.
- These checks do not certify remote role accounts, external email delivery or production readiness. Content review/import, credential rotation, legacy redirects and domain cutover remain pending.

## Follow-up — dependency and import preparation

- Bridge 1.0.1 supports up to 200 gallery images (videos remain capped at 100). This fixes the 103-image Loft Clinic import without dropping content.
- Bridge 1.0.1 is packaged locally; staging still requires this plugin update before that import. No customer records have been changed.
- WordPress integration suite now has 36 checks; Next API suite has 26, including contact validation and cross-origin rejection.
- See content-cutover-review.md for the 28-work inventory and proposed legacy URL mappings. Redirects are not activated.
- Contact recipient and actual inbox delivery are still pending. CONTACT_ENABLED remains disabled on Preview.

## Confirmed contact recipient — 22 October 2026

User confirmed hello@evernever.net for contact submissions. On the staging WordPress only, configure before the stop-editing line in wp-config.php:

```php
define('EVERNEVER_CONTACT_TO', 'hello@evernever.net');
```

This value is prepared, not confirmed installed remotely. Do not change the WordPress site administrator email or mail DNS. Test one clearly labelled enquiry and confirm inbox receipt before enabling CONTACT_ENABLED for public use.

Remote configuration attempt on 22 October: Plesk's staging wp-config.php editor failed with ChunkLoadError; after one reload browser control could not attach. No config was saved and no real email was sent. Reopen a working Plesk session to complete the recipient configuration and Bridge 1.0.1 update.

## Remote progress — 22 October 2026

- Added EVERNEVER_CONTACT_TO=hello@evernever.net in staging wp-config.php; reread and verified the only change was that constant.
- Deployed WordPress-only protected Preview https://ahency-4c8ljzk4k-thde-v.vercel.app with CONTACT_ENABLED=true for this deployment only; persistent Preview setting remains false.
- Sent one clearly labelled SYSTEM TEST contact through that Preview. WordPress returned success / HTTP 200. Recipient inbox confirmation remains pending; success is not proof of delivery.
- Bridge 1.0.1 remote update is still pending. Production DNS, old database and billing untouched.

## Bridge staging update completed — 22 October 2026

User approved the staging update. Saved Bridge 1.0.1 through Plesk, reopened the saved file and verified it exactly matches the locally tested source. Only the version and gallery-limit validation changed. The WordPress-backed Preview /works returned HTTP 200 afterward. No customer posts were changed in this update. Evidence: previews/bridge-101-saved.png.

Inbox confirmation for the earlier SYSTEM TEST remains pending; do not treat wp_mail success as confirmed delivery.

## Gmail delivery test — 22 October 2026

At user request, temporarily set staging recipient to thingkingaboutyou67@gmail.com, reread and verified the saved configuration, submitted one SYSTEM TEST — Evernever Gmail delivery enquiry through the protected Preview, and received success / HTTP 200. Restored hello@evernever.net, reloaded from the server and verified the entire configuration exactly matches its pre-test contents. Inbox delivery remains subject to recipient confirmation.

## Current handover status — 22 October 2026

- User confirmed the Gmail delivery test arrived normally. Final staging recipient remains hello@evernever.net. Receipt at that mailbox and sender-domain authentication have not been independently confirmed.
- Remote Portfolio list contains one published user-created test work and no imported legacy drafts. Preserve that record; 28 legacy works still need importing and review.
- A fresh WordPress Site Health run completed with Good and no critical issues. Four recommendations concern inactive plugins/themes, intentional staging noindex and page caching; no cleanup/deletion performed.
- Preview admin browser access currently redirects to Vercel login. User login is needed to continue the existing import workflow.
- Production cutover is not complete. See release-checklist.md for remaining gates.
