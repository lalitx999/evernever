# Evernever WordPress Reverse Migration Handoff

## 1. Document purpose

- This document is the implementation handoff for rebuilding the Evernever website as a WordPress-native site.
- The requested outcome is to remove the production dependency on Vercel.
- The requested outcome is to stop using the separate Next.js `/login` and `/admin` interface.
- The requested outcome is to manage public website content from WordPress.
- The requested outcome is to preserve the current visual direction where it remains approved.
- The requested outcome is to preserve the customer’s existing mail, billing, and historical WordPress data.
- This document describes work to perform.
- This document does not authorize an unreviewed production DNS switch.
- This document does not authorize deletion of the current Vercel project.
- This document does not authorize deletion of the original WordPress files or database.
- This document should be read together with the existing `docs/` files.

## 2. Requested architecture after migration

- Public domain `evernever.net` serves WordPress from the customer’s existing hosting provider.
- Public domain `www.evernever.net` resolves to the public WordPress website.
- WordPress is the content management system and the page renderer.
- WordPress users authenticate through standard WordPress authentication.
- Portfolio items are managed in WordPress Admin.
- Company data is managed in WordPress Admin.
- Contact messages are sent through WordPress mail transport.
- `hello@evernever.net` is the contact-form recipient.
- Vercel is not on the public request path after acceptance.
- The staging hostname is used to review the rebuilt website before launch.
- Existing mail remains on the original hosting server.
- Existing billing remains on the original hosting server.
- Existing Plesk access remains on the original hosting server.

## 3. Current deployed architecture

- The production website currently runs as a Next.js application on Vercel.
- The Vercel project is named `ahency`.
- The production Vercel team is `thde-v`.
- The customer’s main domain is attached to the Vercel project.
- The current public web pages are rendered by Next.js.
- The current portfolio management flow uses a custom WordPress bridge API.
- The current custom bridge is called Evernever Portfolio Bridge.
- The current bridge plugin is version `1.0.1`.
- The current bridge plugin is installed on a separate staging WordPress installation.
- The current staging WordPress hostname is `cms-stage.evernever.net`.
- The current public application reads portfolio records over HTTPS from the bridge API.
- The current public application has a separate `/login` page.
- The current public application has a separate `/admin` page.
- The current public application stores its session as an HttpOnly cookie.
- The current public application does not use WordPress’s standard admin UI for portfolio editing.
- The reverse migration replaces this separation with WordPress-native management.

## 4. Current DNS state to understand

- The authoritative zone is currently hosted with the customer’s hosting provider.
- The domain is delegated to `ns1.evernever.net` and `ns2.evernever.net`.
- The nameservers resolve on the original hosting infrastructure.
- The root domain currently has Vercel apex A records.
- One current apex A record is `216.198.79.1`.
- One current apex A record is `64.29.17.1`.
- The `www` record currently uses Vercel’s generated CNAME target.
- The observed Vercel CNAME target was `e9b6e3d2f49b4baa.vercel-dns-017.com.`.
- The original hosting server IP is `27.254.134.27`.
- The old WordPress website was served from the original hosting server.
- The staging WordPress website is served from the original hosting server.
- Mail host records remain on the original hosting server.
- Billing host records remain on the original hosting server.
- DNS records for mail must remain intact during the website cutover.
- DNS records for billing must remain intact during the website cutover.
- Nameserver delegation must remain intact during the website cutover.
- Do not replace the nameservers with Vercel nameservers.

## 5. Existing WordPress installations

- The original production WordPress installation exists on `evernever.net` hosting.
- The original production document root was observed as `httpdocs`.
- The original production database was observed as `evernever_wp_wtvdk`.
- The original production database contains the customer’s historical WordPress data.
- The original production database contains 29 observed tables.
- The original production database uses a non-default table prefix.
- The original production WordPress had Elementor-related content.
- The original production WordPress should be preserved as a data source.
- The original production WordPress should not be overwritten during initial development.
- The staging WordPress installation is separate from the original production database.
- The staging WordPress database was observed as `evernever_wp_kwg4c`.
- The staging WordPress table prefix was observed as `BQ1KgYN_`.
- The staging WordPress uses PHP 8.4.27.
- The original production WordPress was observed on PHP 7.4.33.
- PHP version differences must be treated as a compatibility item.
- The staging WordPress has HTTPS enabled.
- The staging WordPress has a valid certificate.
- The staging WordPress should be the first implementation target.

## 6. Non-negotiable data protections

- Do not delete the original WordPress database.
- Do not delete the original `httpdocs` files.
- Do not run a database import over the original production database without a verified rollback copy.
- Do not change live mail credentials.
- Do not change MX records.
- Do not change DKIM records.
- Do not change DMARC records.
- Do not remove the `mail` host record.
- Do not remove the `webmail` host record.
- Do not remove the billing subdomains.
- Do not remove the Plesk provider hostname.
- Do not delete Vercel until the WordPress version is accepted on the public domain.
- Do not delete the Next.js repository.
- Do not expose secret values in source control.
- Do not copy secrets into issues, tickets, or public handoff notes.
- Do not modify WordPress core files.
- Do not implement business logic by editing WordPress core files.
- Use a custom theme, child theme, or dedicated plugin for custom functionality.
- Keep migration changes reversible until production acceptance.

## 7. Scope that is being reversed

- Remove the Next.js application as the public website renderer.
- Remove Vercel from the public website’s DNS destination.
- Replace the Next.js page templates with WordPress page templates.
- Replace Next.js data reads with WordPress queries and WordPress template rendering.
- Replace the custom Next.js admin interface with WordPress Admin.
- Replace the custom Next.js login interface with WordPress login.
- Replace the Vercel server contact proxy with a WordPress contact handler.
- Retire the custom bridge API after the WordPress-native website is accepted.
- Preserve the design language, content hierarchy, and mobile behavior from the existing website.
- Preserve the customer’s ability to publish and hide works.
- Preserve the customer’s ability to upload work images.
- Preserve the customer’s ability to edit company content.

## 8. Scope that is not automatically included

- Do not assume legacy Elementor page content is approved for the new visual design.
- Do not assume all 28 historical portfolio records should be published.
- Do not assume all historical media must be migrated into the new page layout.
- Do not assume old URLs have approved replacement slugs.
- Do not assume the current WordPress theme is usable for the new visual design.
- Do not assume Elementor must remain the page builder for the new theme.
- Do not assume a plugin can replace all custom template work.
- Do not assume the customer wants public WordPress author archives.
- Do not assume the customer wants public WordPress comments.
- Do not assume the customer wants public account registration.
- Do not assume the customer wants pricing or package pages.
- Do not assume the customer wants a separate staging domain exposed to search engines.

## 9. Product requirements to retain

- The website is a portfolio for a creative agency.
- The website should present creative and marketing strategy capability.
- The website should present production capability.
- The website should present event capability.
- The website should present TikTok and Reels capability.
- The website should avoid looking only like a production house.
- The website should feel creative, modern, and premium.
- The website should remain easy to navigate.
- The website should prioritize strong portfolio imagery.
- The website should work well on mobile.
- The website should retain visual consistency across sections.
- Typography, imagery, and spacing should form the primary visual language.
- Animation may be used where it supports the design.
- Animation should not obstruct reading or navigation.
- The website must include company introduction content.
- The website must include service content.
- The website must include portfolio content.
- The website must include contact content.
- The website must include a contact form.
- The website must not add public membership features unless requested.

## 10. Approved visual direction to preserve

- Use the Evernever wordmark as the main brand mark.
- The canonical source wordmark is `public/brand/evernever-wordmark.svg`.
- A JPG export exists at `public/brand/evernever-wordmark.jpg`.
- Preserve the light visual direction.
- Preserve the blue accent used in the current website.
- Preserve a spacious editorial layout.
- Preserve large display typography where the existing design uses it.
- Preserve strong type scale contrast.
- Preserve a clear main statement on important pages.
- Preserve smaller metadata and labels.
- Preserve image-led work cards.
- Preserve rounded image treatment where it is currently used.
- Preserve clear primary and secondary calls to action.
- Preserve mobile navigation behavior.
- Rebuild the visual system in WordPress CSS and templates.

## 11. Current page inventory

- Home page route is `/`.
- Works index route is `/works`.
- Work detail route is `/works/[slug]`.
- Services index route is `/services`.
- Service detail route is `/services/[slug]`.
- About route is `/about`.
- Team route is `/team`.
- Clients route is `/clients`.
- Contact route is `/contact`.
- Current login route is `/login`.
- Current management route is `/admin`.
- WordPress implementation should preserve public URL patterns where practical.
- WordPress login should use `/wp-admin` or a configured secure login route.
- WordPress admin should use `/wp-admin`.
- Public routing should avoid old Vercel-only implementation assumptions.

## 12. Page implementation requirements for Home

- Build the home page as a custom WordPress front-page template.
- Add the Evernever logo in the site header.
- Add the main navigation in the site header.
- Add the mobile navigation trigger.
- Add the approved hero copy.
- Add the hero supporting copy.
- Add the primary hero action.
- Add the secondary hero action.
- Add approved decorative work imagery only where licensed.
- Add the client trust section.
- Add the service overview section.
- Add the featured works section.
- Add the contact invitation section.
- Add the global footer.
- Make featured works selectable from WordPress.
- Make hero content editable from WordPress.
- Make contact copy editable from WordPress.
- Preserve responsive behavior at phone, tablet, desktop, and large desktop widths.

## 13. Page implementation requirements for Works

- Build a portfolio archive template.
- Query only published portfolio records.
- Provide category filters when categories are available.
- Keep filters accessible by keyboard.
- Use semantic buttons or links for filters.
- Display an empty state when no works are published.
- Render each work as a clickable image-led card.
- Use the work cover image on each card.
- Display category labels where available.
- Display the work title.
- Preserve card order managed from WordPress.
- Preserve featured status for home-page selection.
- Avoid duplicate cards for the same portfolio record.
- Do not hard-code a three-card mockup after migration.
- Do not use Vercel environment variables to choose which works appear.
- Use WordPress post status to determine public visibility.

## 14. Page implementation requirements for Work Detail

- Build a single portfolio template.
- Use the portfolio slug for the URL.
- Render the work title.
- Render work category labels.
- Render the cover image.
- Render the short summary.
- Render the longer story or description.
- Render gallery images in managed order.
- Render video embeds only from validated providers.
- Support YouTube embeds.
- Support Vimeo embeds.
- Support Google Drive preview URLs where required.
- Offer a safe external video link where embedding is unavailable.
- Include a back link to the work archive.
- Include a next-work link when there is another published item.
- Never expose draft or trashed work by direct URL.
- Return a normal WordPress 404 for an unpublished work URL.

## 15. Page implementation requirements for Services

- Build the services archive as a custom page template.
- Use service categories or a dedicated service post type.
- Preserve the current service labels.
- Preserve service descriptions.
- Link each service to matching works where appropriate.
- Ensure service pages remain editable.
- Use reusable WordPress template parts for repeated service cards.
- Avoid duplicating service copy across templates.
- Make service order controllable from WordPress.
- Avoid exposing empty service detail pages.

## 16. Page implementation requirements for About

- Build an About page template.
- Render the approved company statement.
- Render company history or positioning where supplied.
- Render supporting image content where supplied.
- Render a selected portfolio section if approved.
- Render a contact call to action.
- Keep company text editable by administrators.
- Preserve the visual emphasis on the agency’s strategic role.
- Do not rely on Next.js server-side data fetches.

## 17. Page implementation requirements for Team

- Build a team page template.
- Choose either a Team custom post type or repeatable structured fields.
- Make team members editable in WordPress.
- Make team member role editable in WordPress.
- Make team member image editable in WordPress.
- Make team order editable in WordPress.
- Hide empty team member cards.
- Avoid adding personal contact information unless approved.
- Preserve responsive grid behavior.

## 18. Page implementation requirements for Clients

- Build a clients page template.
- Use a Client custom post type or structured settings.
- Make logos editable in WordPress.
- Store client logo images in the WordPress Media Library.
- Make client display order editable.
- Include optional client website links only when approved.
- Add meaningful image alt text.
- Preserve the home-page client trust row if used.
- Avoid publishing unapproved client names.

## 19. Page implementation requirements for Contact

- Build a contact page template.
- Display `hello@evernever.net` as the public contact email unless changed by the owner.
- Display approved phone numbers.
- Display approved address details.
- Display approved opening hours.
- Include a contact form.
- Require a contact name.
- Require a contact phone number when the approved brief requires it.
- Allow contact email when available.
- Allow company name when available.
- Validate and sanitize all submitted fields.
- Send contact messages through WordPress mail transport.
- Set the reply-to header from a valid submitted email field.
- Add spam protection appropriate for the customer’s WordPress setup.
- Show a clear success message after successful submission.
- Show a clear failure message if mail submission fails.
- Test real inbox receipt at `hello@evernever.net` before launch.

## 20. WordPress content model recommendation

- Create a custom post type named `portfolio` or `en_project`.
- Use a singular public label of `ผลงาน` or `Portfolio`.
- Enable title support.
- Enable featured image support.
- Enable revisions.
- Enable page attributes or menu order support.
- Keep the portfolio post type publicly queryable.
- Keep the portfolio archive slug as `works`.
- Keep the single slug as `works/%postname%` if possible.
- Register a `service` taxonomy or use a dedicated taxonomy name.
- Register a `client` taxonomy only if it is useful to editors.
- Use WordPress post status `publish` for visible works.
- Use WordPress post status `draft` for hidden works.
- Use WordPress trash for removed works.
- Do not invent a custom published flag when post status already meets the requirement.
- Use `menu_order` for manual ordering.
- Use post meta only for structured fields that do not belong in the main editor.

## 21. Portfolio custom fields

- Add a short summary field.
- Add a long description field.
- Add a gallery field with ordered image IDs.
- Add a video URL repeatable field.
- Add a featured-on-home boolean field.
- Add a service-category relationship field.
- Add a client field when approved.
- Add an external campaign URL when approved.
- Add optional date or year when supplied.
- Add optional credits fields when supplied.
- Use media IDs instead of saving raw uploads URLs where possible.
- Validate external URLs before saving.
- Only allow HTTPS external URLs.
- Preserve Thai and English titles.
- Generate slugs with WordPress’s normal sanitization.
- Prevent duplicate slugs when creating records.
- Ensure changing a slug is a deliberate editor action.

## 22. Theme implementation recommendation

- Build a dedicated custom theme for the new Evernever website.
- Use a child theme only when a stable parent theme is deliberately selected.
- Do not build the design by modifying a third-party theme directly.
- Keep theme templates version-controlled.
- Keep theme CSS version-controlled.
- Keep theme JavaScript minimal.
- Use WordPress enqueue APIs for styles and scripts.
- Use `wp_enqueue_style` for stylesheets.
- Use `wp_enqueue_script` for scripts.
- Use `wp_head` and `wp_footer` correctly.
- Use WordPress template hierarchy for archive and single templates.
- Use `front-page.php` for the home page where appropriate.
- Use `archive-portfolio.php` for the works archive.
- Use `single-portfolio.php` for the work detail.
- Use reusable template parts for cards and sections.
- Use WordPress navigation menus for the header and footer.
- Use WordPress Custom Logo support for the logo.
- Use featured image APIs for work covers.
- Use responsive image APIs for media output.

## 23. WordPress editing experience

- Give editors a clear Portfolio menu in WordPress Admin.
- Use labels that explain draft and publish behavior.
- Explain that Draft hides a work from the public website.
- Explain that Publish shows a work on the public website.
- Provide an easy way to set the cover image.
- Provide an easy way to order gallery images.
- Provide an easy way to mark a work as featured.
- Provide an easy way to assign services.
- Keep fields grouped logically.
- Keep administrative labels in the language agreed with the customer.
- Avoid exposing implementation-only fields to normal editors.
- Avoid requiring editors to enter raw HTML for regular portfolio content.
- Preserve revisions for content recovery.
- Provide one short admin guide after implementation.

## 24. User role policy

- Administrators manage site configuration.
- Administrators manage users.
- Administrators manage global company settings.
- Administrators manage menus.
- Administrators manage plugins and themes.
- Editors manage portfolio records.
- Editors manage portfolio media.
- Editors manage portfolio categories.
- Editors publish and unpublish portfolio records.
- Editors should not manage plugins.
- Editors should not manage theme files.
- Editors should not manage DNS.
- Do not grant Administrator to a content editor without a business reason.
- Use individual accounts instead of shared passwords.
- Use strong WordPress passwords.
- Use WordPress password reset flows where possible.

## 25. Existing bridge plugin disposition

- The existing bridge plugin is `wordpress/evernever-bridge/evernever-bridge.php`.
- The existing bridge plugin exists to support the Next.js application.
- The existing bridge plugin provides private REST endpoints.
- The existing bridge plugin implements custom session tokens.
- The existing bridge plugin implements custom portfolio storage.
- The existing bridge plugin implements contact sending.
- The existing bridge plugin should remain installed during rebuild if it is needed to inspect existing staging content.
- The existing bridge plugin should not be the long-term public content dependency after WordPress-native launch.
- Do not deactivate the bridge plugin before confirming no current process depends on it.
- After cutover, review the bridge plugin for retirement.
- Retire the bridge plugin only after Vercel has been detached from the public domain.
- Record whether any customer content exists only in its `en_project` records.
- Migrate required `en_project` content to the final portfolio model before retiring the bridge.
- Do not delete bridge-created records during the review.
- Do not delete media uploaded through the bridge.

## 26. Next.js repository disposition

- The current Next.js repository is valuable as a visual and content reference.
- The current homepage is implemented in `src/app/page.tsx`.
- Current works templates are implemented under `src/app/works/`.
- Current service templates are implemented under `src/app/services/`.
- Current About template is implemented under `src/app/about/`.
- Current Team template is implemented under `src/app/team/`.
- Current Clients template is implemented under `src/app/clients/`.
- Current Contact template is implemented under `src/app/contact/`.
- Current shared components live in `src/components/`.
- Current navigation data lives in `src/data/navigation.ts`.
- Current local portfolio reference data lives in `src/data/`.
- Current fonts and public assets live in `public/`.
- Reuse copy and assets only after checking their approval status.
- Do not copy Next.js runtime code into WordPress templates without adapting it.
- Do not retain Vercel-specific environment variable dependencies in the WordPress theme.
- Preserve the repository as an archive until the WordPress site is accepted.

## 27. Media migration requirements

- The repository contains preserved legacy gallery media.
- The preserved legacy gallery directory is `public/evernever/gallery/`.
- The preserved legacy gallery collection contains 328 files.
- The preserved legacy gallery collection is approximately 43 MB.
- The URL mapping file is `src/data/legacy-media.json`.
- The mapping file maps old media URLs to local asset paths.
- The WordPress-native site should use WordPress Media Library attachment IDs for future media.
- Decide whether legacy media remains in WordPress uploads or a managed archive.
- Import only media that is used in approved portfolio records.
- Preserve alt text where known.
- Add descriptive alt text for new uploads.
- Avoid hotlinking to old `evernever.net/wp-content/uploads` paths after the theme switch.
- Confirm every public work cover loads from the final WordPress origin.
- Confirm every public gallery image loads from the final WordPress origin.
- Use generated responsive image sizes.
- Regenerate thumbnails if the new theme requires new image crops.

## 28. SEO and URL requirements

- Preserve the root domain `evernever.net`.
- Preserve `www.evernever.net` behavior.
- Select one canonical host and redirect the other host to it.
- Preserve `/works` as the portfolio archive if possible.
- Preserve existing published work slugs when possible.
- Create a redirect map for changed work URLs.
- Use permanent redirects only after confirming the destination.
- Do not redirect every legacy URL to the home page.
- Use WordPress permalinks compatible with the desired URL structure.
- Set the public site title and description.
- Set individual portfolio titles and descriptions.
- Add Open Graph image behavior.
- Add canonical URLs.
- Keep staging blocked from indexing.
- Disable WordPress search-engine visibility only on staging.
- Enable search engine indexing only on the final public site when approved.
- Generate a sitemap.
- Verify sitemap URLs after cutover.
- Verify robots.txt after cutover.

## 29. Email and form requirements

- The destination inbox is `hello@evernever.net`.
- The existing email service remains on the old hosting infrastructure.
- The existing MX points to `mail.evernever.net`.
- The existing mail host resolves to `27.254.134.27`.
- The existing webmail host resolves to `27.254.134.27`.
- The existing DKIM record must remain valid.
- The existing DMARC record must remain valid.
- The existing SPF policy was adjusted to preserve the old sending server.
- The WordPress contact form needs a final delivery test.
- Test the inbox.
- Test the spam folder.
- Test the reply-to address.
- Test a Thai message.
- Test a message with a phone number.
- Test a message with no email field if the form allows it.
- Use an SMTP solution if PHP mail delivery is unreliable.
- Store SMTP credentials outside theme source code.
- Use a WordPress configuration constant or a secure settings mechanism for SMTP credentials.

## 30. Security requirements

- Keep WordPress core current within hosting compatibility constraints.
- Review PHP compatibility before changing the root site’s PHP version.
- Use HTTPS for the public site.
- Use HTTPS for WordPress Admin.
- Keep the current Let’s Encrypt certificate active.
- Confirm certificate coverage for `evernever.net`.
- Confirm certificate coverage for `www.evernever.net`.
- Confirm certificate coverage for `mail.evernever.net` before changing mail clients.
- Use role-based access control.
- Disable public registration unless required.
- Disable comments unless required.
- Protect login attempts with an approved security solution.
- Keep plugins to a minimal, maintained set.
- Review plugin update compatibility on staging.
- Do not expose debug output in production.
- Set `WP_DEBUG` false in production.
- Record plugin versions at launch.
- Record the active theme version at launch.
- Set secure file permissions according to host guidance.

## 31. Performance requirements

- Use WordPress image sizes for responsive images.
- Avoid uploading unnecessarily large source images.
- Use WebP when appropriate.
- Use browser caching for static assets.
- Use page caching only after checking dynamic form behavior.
- Test cache invalidation when publishing a work.
- Test cache invalidation when editing a work.
- Avoid heavy page-builder payload when a template can achieve the design.
- Avoid unnecessary animation libraries.
- Minimize third-party scripts.
- Use lazy loading for below-the-fold images.
- Do not lazy load the main LCP image.
- Check mobile performance on a realistic network.
- Check layout shift caused by images.
- Set explicit image dimensions where possible.
- Test the works archive with many portfolio items.

## 32. Staging setup tasks

- Confirm Plesk access to `cms-stage.evernever.net`.
- Confirm WordPress Admin access to `cms-stage.evernever.net/wp-admin`.
- Confirm staging database access only if required.
- Confirm staging PHP version.
- Confirm staging certificate validity.
- Confirm staging is blocked from search engine indexing.
- Confirm staging contact form messages are clearly labeled as staging during development.
- Confirm staging uses a safe recipient for contact testing.
- Confirm staging has sufficient disk storage for media.
- Confirm staging can create thumbnails.
- Confirm staging can send WordPress mail.
- Confirm staging has a separate database from original production.
- Confirm staging does not share active production plugin files unintentionally.
- Confirm staging site URL is set to the staging hostname.
- Confirm WordPress Home URL is set to the staging hostname.
- Confirm no staging asset URL incorrectly points at Vercel.

## 33. Theme build tasks

- Create the custom theme directory in staging WordPress.
- Add `style.css` with theme metadata.
- Add `functions.php` with enqueue and setup hooks.
- Add custom logo support.
- Add title tag support.
- Add featured image support.
- Register navigation menus.
- Register widget areas only if they are needed.
- Register custom image sizes if the designs need them.
- Add front-page template.
- Add works archive template.
- Add work single template.
- Add service templates.
- Add page templates for About, Team, Clients, and Contact.
- Add header template part.
- Add footer template part.
- Add portfolio card template part.
- Add contact form template part.
- Add accessible mobile menu behavior.
- Add responsive CSS matching the approved layout.

## 34. Content migration tasks

- Audit original production posts and pages.
- Audit original production Elementor content.
- Audit current staging `en_project` records.
- List every portfolio item available in each source.
- Identify which works are approved for public display.
- Identify which works should remain drafts.
- Identify which works should be archived.
- Choose one final source of truth for each work.
- Create or migrate final portfolio records.
- Set titles.
- Set slugs.
- Set cover images.
- Set galleries.
- Set category labels.
- Set descriptions.
- Set service assignments.
- Set feature flags.
- Set manual order.
- Verify each public work URL.
- Verify each public cover image.
- Verify each public gallery.

## 35. Content ownership decision needed

- Confirm whether the original WordPress portfolio records are the primary source.
- Confirm whether staging bridge records are the primary source.
- Confirm whether the current test works should remain.
- Confirm whether the DIOR draft should be retained.
- Confirm whether the Sulwhasoo draft should be retained.
- Confirm whether the test work titled `ทดสอบระบบ` should be removed from public output.
- Confirm whether historical Elementor works should be imported.
- Confirm which client logos are approved.
- Confirm which team members are approved.
- Confirm final telephone numbers.
- Confirm final address.
- Confirm final hours.
- Confirm final service list.
- Confirm final About copy.
- Confirm final English and Thai copy.

## 36. Current content observations

- The staging bridge portfolio list included a user-created published test work.
- The published test work title was `ทดสอบระบบ`.
- The published test work used a coffee cover image.
- The staging bridge portfolio list included a DIOR draft.
- The staging bridge portfolio list included a Sulwhasoo draft.
- The current public website once showed a three-card Sulwhasoo mockup.
- The three-card mockup was later removed from the public loader.
- The current public website should use published CMS work rather than forced mockups.
- The WordPress-native rebuild should not reintroduce mockup-only behavior.
- Review all draft records before final launch.

## 37. DNS cutover tasks

- Complete staging acceptance before DNS changes.
- Confirm `evernever.net` and `www.evernever.net` are attached to Vercel before removing them.
- Prepare the root WordPress site on the original hosting server.
- Confirm the root WordPress site serves correctly through a temporary preview method.
- Confirm the root WordPress site has a valid certificate.
- Update the root A record from Vercel addresses to `27.254.134.27`.
- Remove `216.198.79.1` only during final Vercel detachment.
- Remove `64.29.17.1` only during final Vercel detachment.
- Change the `www` CNAME from Vercel’s CNAME to the selected WordPress host configuration.
- Use `www` CNAME to `evernever.net` if the hosting configuration supports it.
- Preserve all non-web DNS records.
- Preserve MX.
- Preserve SPF.
- Preserve DKIM.
- Preserve DMARC.
- Preserve mail A records.
- Preserve webmail A records.
- Preserve billing A records.
- Preserve cms-stage A record.
- Preserve nameserver records.
- Verify DNS propagation from external resolvers.

## 38. Vercel shutdown tasks

- Do not begin Vercel shutdown before public WordPress verification.
- Confirm public website HTML comes from the original hosting server.
- Confirm public images come from the WordPress origin.
- Confirm contact form works on the public WordPress site.
- Confirm WordPress Admin works on the public site.
- Confirm all public works resolve.
- Confirm the Vercel domain aliases are no longer required.
- Remove `evernever.net` from the Vercel project only after DNS has propagated.
- Remove `www.evernever.net` from the Vercel project only after DNS has propagated.
- Retain Vercel deployment history for an agreed retention period.
- Export or document environment variable names before project deletion.
- Retain the source repository.
- Retain the local media archive.
- Remove the Vercel project only after the owner agrees it is no longer needed.
- Cancel or downgrade Vercel billing only after project review.

## 39. Production acceptance checklist

- Open `https://evernever.net`.
- Open `https://www.evernever.net`.
- Confirm canonical redirect behavior.
- Confirm a valid HTTPS certificate.
- Confirm no browser security warning.
- Confirm the home page loads.
- Confirm the navigation loads.
- Confirm the mobile menu works.
- Confirm the Services page loads.
- Confirm the Works page loads.
- Confirm work category filters work.
- Confirm a published work detail page loads.
- Confirm a draft work URL is not public.
- Confirm gallery images load.
- Confirm video links work.
- Confirm About page loads.
- Confirm Team page loads.
- Confirm Clients page loads.
- Confirm Contact page loads.
- Submit the contact form.
- Confirm receipt at `hello@evernever.net`.
- Confirm reply-to behavior.
- Confirm email is not marked as spam.
- Confirm WordPress Editor can create a draft.
- Confirm WordPress Editor can publish a work.
- Confirm WordPress Editor can hide a work.
- Confirm WordPress Administrator can edit company settings.
- Confirm WordPress Administrator can add a user.
- Confirm desktop layout at 1440 pixels.
- Confirm large display layout at 3840 pixels.
- Confirm mobile layout at 390 pixels.
- Confirm no horizontal overflow.

## 40. Rollback plan

- Keep the Vercel project intact until production acceptance is complete.
- Record existing Vercel DNS values before the DNS switch.
- Record original hosting DNS values before the DNS switch.
- Record WordPress Home and Site URL settings before root migration.
- Keep a recoverable copy of the original WordPress files.
- Keep a recoverable export of the original WordPress database.
- If the new root WordPress site fails, restore the root and `www` records to Vercel values.
- If a WordPress theme issue occurs, activate a known working fallback theme on staging first.
- If contact delivery fails, preserve submitted data if a form log is used and diagnose mail transport.
- If media paths fail, restore only the broken attachment URLs or media imports.
- Do not use a wholesale database restore for a single content error.
- Communicate rollback steps before the DNS cutover window.

## 41. Files that matter in the current repository

- `src/app/page.tsx` contains the current home page reference.
- `src/app/works/page.tsx` contains the current works archive reference.
- `src/app/works/[slug]/page.tsx` contains the current work detail reference.
- `src/app/services/` contains current service references.
- `src/app/about/` contains the current About reference.
- `src/app/team/` contains the current Team reference.
- `src/app/clients/` contains the current Clients reference.
- `src/app/contact/` contains the current Contact reference.
- `src/components/` contains reusable UI reference components.
- `src/data/projects.ts` contains local reference project data.
- `src/data/evernever.json` contains an older portfolio data snapshot.
- `src/data/legacy-media.json` contains legacy media URL mappings.
- `public/brand/evernever-wordmark.svg` is the source logo.
- `public/brand/evernever-wordmark.jpg` is the generated JPG logo.
- `public/evernever/gallery/` contains preserved media.
- `wordpress/evernever-bridge/` contains the Vercel bridge plugin.
- `docs/admin-user-guide.md` describes the previous custom admin.
- `docs/domain-cutover-oct25.md` documents earlier Vercel DNS work.
- `docs/content-cutover-review.md` contains historical content review notes.

## 42. Environment variables to retire from public runtime

- `WORDPRESS_API_URL` is used by Next.js to reach the bridge API.
- `WORDPRESS_BRIDGE_SECRET` is used by Next.js to authenticate bridge requests.
- `CONTENT_SOURCE` is used by Next.js to choose project data source.
- `PORTFOLIO_MOCKUP` was used for mockup behavior.
- `CONTACT_ENABLED` is used by Next.js contact behavior.
- These variables are not needed by a WordPress-native public theme.
- Do not expose the bridge secret in a WordPress page or JavaScript file.
- Do not reuse the bridge secret as a WordPress password.
- Document the names before retiring Vercel.
- Remove unused secrets from Vercel only after project decommission approval.

## 43. Existing documentation that needs revision

- `docs/admin-user-guide.md` describes the old Next.js admin workflow.
- Replace that guide with WordPress Admin instructions after the rebuild.
- `docs/wordpress-admin.md` describes the bridge rollout history.
- Retain it as historical context.
- `docs/domain-cutover-oct25.md` describes Vercel DNS cutover.
- Add a WordPress reverse-cutover record after launch.
- `docs/release-checklist.md` describes the previous Vercel rollout.
- Replace or supplement it with a WordPress release checklist.
- `reverse.md` is the implementation source for the reverse migration.
- Keep all historical documents until handoff is complete.

## 44. Suggested implementation order

- Confirm final content source decision.
- Audit staging WordPress.
- Audit original production WordPress.
- Define final WordPress content model.
- Build the custom theme on staging.
- Build custom post types and fields on staging.
- Migrate approved content on staging.
- Configure WordPress menus.
- Configure company settings.
- Configure contact form.
- Test editor workflows.
- Test public pages.
- Test mobile layout.
- Test email delivery.
- Prepare redirect mapping.
- Prepare root production WordPress copy.
- Schedule DNS cutover.
- Switch root and `www` website DNS.
- Verify public WordPress website.
- Detach Vercel domains.
- Publish the new WordPress user guide.

## 45. Deliverables expected from the next agent

- A staging WordPress custom theme.
- A documented WordPress content model.
- A Portfolio custom post type or an approved equivalent.
- Structured portfolio fields.
- WordPress templates for all public pages.
- Responsive CSS matching the approved design.
- WordPress-managed navigation.
- WordPress-managed featured works.
- WordPress-managed company details.
- A WordPress contact form connected to `hello@evernever.net`.
- A list of installed or created plugins.
- A staging acceptance checklist.
- A production cutover checklist.
- A rollback checklist.
- A concise WordPress user guide.
- A record of DNS changes made during cutover.

## 46. Completion definition

- The public Evernever website runs from WordPress hosting.
- The public Evernever website does not rely on Vercel for HTML rendering.
- The public Evernever website does not rely on the Next.js bridge API.
- Portfolio records are managed in WordPress Admin.
- Editors can publish and hide works.
- Administrators can manage company content and users.
- Contact form messages arrive at `hello@evernever.net`.
- The approved desktop design is represented in WordPress templates.
- The approved mobile design is represented in WordPress templates.
- Existing mail and billing continue to operate.
- DNS points root and `www` to the original hosting server.
- Vercel remains detached only after public acceptance.
- The customer receives an updated WordPress user guide.

## 47. Questions the next agent must resolve before production changes

- Which WordPress dataset is the final portfolio source of truth?
- Which historical works are approved for public display?
- Which existing Elementor content must remain available?
- Is Elementor part of the final editing workflow?
- Which canonical host should be used, root or `www`?
- Which phone numbers and address are final?
- Which client logos are approved?
- Which team members are approved?
- Which service categories are final?
- Are legacy URL redirects required at launch?
- Which account will own the final WordPress administrative access?
- Which account will own the hosting billing?
- Is an SMTP service required for reliable contact delivery?
- Is there an approved maintenance process for WordPress core, theme, and plugin updates?
- When is the approved DNS cutover window?

## 48. Final instruction to the next agent

- Start with staging.
- Preserve the original WordPress installation.
- Keep Vercel live until staging passes acceptance.
- Build WordPress-native management instead of recreating the Next.js admin.
- Make content status in WordPress control public visibility.
- Use the existing visual design as a reference.
- Verify every public feature on staging.
- Perform DNS changes only after the owner approves the final staging site.
- Document all final hosting and WordPress changes.
- Hand over the final WordPress user guide with the production website.
