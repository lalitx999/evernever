# Domain cutover preparation — 25 October 2026

User accepted the detail-page fix and chose to keep the three-card Sulwhasoo mockup for launch. Do not switch to the full CMS list without that choice changing.

## Media

328 legacy gallery images (42,856,834 bytes) copied into public/evernever/gallery. All file signatures validated. src/data/legacy-media.json maps exact original URLs to local files; the public content loader applies it to local/mockup and WordPress data without editing customer records. Unknown URLs are unchanged. Uploaded staging images remain on cms-stage.evernever.net.

## Vercel

Existing sensitive WORDPRESS_API_URL and WORDPRESS_BRIDGE_SECRET targets extended from Preview to Preview + Production through the official API, without reading or changing their values. Production CONTENT_SOURCE=wordpress, PORTFOLIO_MOCKUP=sulwhasoo, CONTACT_ENABLED=true added. No APP_ORIGIN until the final domain is selected. Only ahency-rosy.vercel.app was attached before this deployment.

## Public DNS observed (not modified)

| Record | Current value |
|---|---|
| evernever.net A | 27.254.134.27 |
| www CNAME | evernever.net |
| NS | ns1.evernever.net, ns2.evernever.net |
| ns1 / ns2 A | 27.254.134.27 |
| MX | 10 mail.evernever.net |
| mail / webmail A | 27.254.134.27 |
| billing / billing-stage / cms-stage A | 27.254.134.27 |
| ftp CNAME | evernever.net |
| _imaps._tcp SRV | 0 0 993 evernever.net |
| _pop3s._tcp SRV | 0 0 995 evernever.net |
| _smtps._tcp SRV | 0 0 465 evernever.net |
| SPF | v=spf1 +a +mx +a:thsv86.hostatom.com -all |
| DMARC | v=DMARC1; p=quarantine; adkim=s; aspf=s |

default._domainkey TXT is present. Presence of records is not proof of message authentication or delivery to hello@evernever.net.

## Before apex changes

1. Inspect authoritative DNS settings including AAAA and any additional mail/autodiscover records. Do not replace nameservers.
2. Establish a valid HTTPS Plesk management address independent of the apex (provider hostname or dedicated host) and verify login.
3. Point FTP directly at the old server; point mail SRV services to a hostname on that server with a matching mail certificate. Verify certificate compatibility before changing SRV targets. Mail clients manually configured with evernever.net also need their server hostname changed.
4. Review SPF +a, which otherwise follows the new website address. Preserve the actual sending hosts and existing MX, DKIM and DMARC.
5. Add apex/www to the Vercel project, use the exact DNS values it recommends, and select the canonical redirect. Change only the reviewed records.
6. Verify website HTTPS, login, published detail, local images, contact, email clients and billing. Compare DNS against the recorded prior values; rollback website records if required.

Original website, database, mail and billing have not been changed. A new backup was deferred at the owner's request. Legacy URL redirects remain pending until approved CMS destinations exist; do not redirect all 28 works to unverified pages.

## Production deployment completed

https://ahency-rosy.vercel.app now points to dpl_H7FocfF2G2Y48EnuJsipv7nVhKxr (https://ahency-iiv25o5ny-thde-v.vercel.app). Initial upload failed with EPIPE; retry succeeded. Vercel build/TypeScript and targeted ESLint passed. HTTP checks passed for /works (exactly 3 mockup cards), Sulwhasoo detail (no original-domain upload URLs), the reported user-created test detail, /login, and a preserved image. No contact message was sent this turn. DNS/custom-domain cutover remains pending; user requested help finding Plesk DNS Settings.

## 1 November — Admin controls visibility

Owner requested removing the forced three-card mockup so admins can choose visible work. Removed the PORTFOLIO_MOCKUP override from the public loader; production now follows the CMS published list. Existing draft/publish controls determine visibility without redeployment. Admin labels clarify shown/hidden states. No customer posts or database records changed, no plugin change required. Detail-page implementation left unchanged as owner confirmed it works.

Loader checks passed with the old mockup environment still set: published CMS work is returned, drafts/unknown slugs stay absent, featured uses published work, and an empty CMS list stays empty instead of resurrecting mockups.
