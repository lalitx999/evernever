// Run against an ISOLATED WordPress only. Never run against the customer site.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const base =
  process.env.TEST_WP_URL || "http://127.0.0.1:4311/wp-json/evernever/v1";
assert(
  ["127.0.0.1", "localhost"].includes(new URL(base).hostname),
  "Tests must use loopback",
);
const secret = "local-fixture-secret-not-for-production-00000000";
let token;
let passed = 0;
async function request(path, method = "GET", body, authenticated = true) {
  const response = await fetch(`${base}/${path}`, {
    method,
    headers: {
      "X-Evernever-Key": secret,
      ...(authenticated && token ? { "X-Evernever-Session": token } : {}),
      ...(body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
    },
    body:
      body instanceof FormData
        ? body
        : body === undefined
          ? undefined
          : JSON.stringify(body),
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON ${response.status}: ${text.slice(0, 500)}`);
  }
  return { status: response.status, data };
}
function ok(condition, label) {
  assert(condition, label);
  console.log(`PASS ${label}`);
  passed++;
}
let r = await request("projects");
ok(r.status === 401, "Unauthenticated list denied");
r = await request("login", "POST", {
  username: "test-editor",
  password: "wrong",
});
ok(r.status === 401, "Incorrect password denied");
r = await request("login", "POST", {
  username: "test-editor",
  password: "test-password",
});
ok(r.status === 200 && r.data.token, "WordPress login succeeds");
token = r.data.token;
r = await request("session");
ok(r.data.canManageSettings, "User capabilities returned");
let project = {
  title: 'ทดสอบภาษาไทย "quotes" \\ slash',
  slug: { current: `ทดสอบ-${Date.now()}` },
  status: "draft",
  order: 10,
  coverImage: "",
  categories: ["music-video"],
  categoryLabels: ["Music Video"],
  description: "รายละเอียด",
  gallery: [],
  videoUrls: [],
  featured: true,
};
r = await request("projects", "POST", project);
ok(r.status === 200, `Draft created (${JSON.stringify(r.data)})`);
project = r.data;
ok(project.slug.current.startsWith("ทดสอบ-"), "Thai slug round-trips decoded");
ok(
  project.title === 'ทดสอบภาษาไทย "quotes" \\ slash',
  "Quotes and backslash preserved",
);
r = await request("public/projects");
ok(!r.data.some((p) => p.id === project.id), "Draft not public");
r = await request(`projects/${project.id}`, "POST", {
  ...project,
  status: "publish",
});
ok(r.status === 400, "Publishing without cover denied");
const png = await readFile("public/evernever/about.png");
const form = new FormData();
form.set("file", new Blob([png], { type: "image/png" }), "test-cover.png");
r = await request("media", "POST", form);
ok(r.status === 200 && r.data.url, "Real WordPress media upload succeeds");
const cover = r.data.url;
r = await request(`projects/${project.id}`, "POST", {
  ...project,
  coverImage: cover,
  status: "publish",
});
ok(r.status === 200 && r.data.status === "publish", "Publish succeeds");
project = r.data;
r = await request("public/projects");
ok(
  r.data.some((p) => p.id === project.id),
  "Published project is public",
);
// Round-trip editing and gallery ordering must survive a new public read.
r = await request(`projects/${project.id}`, "POST", {
  ...project, title: "Edited portfolio", gallery: [cover, "/evernever/about.png"],
  videoUrls: ["https://www.youtube.com/watch?v=test"], order: 3, featured: false,
});
ok(r.status === 200, "Published project edited");
project = r.data;
r = await request("public/projects");
let visible = r.data.find((p) => p.id === project.id);
ok(visible.title === "Edited portfolio" && visible.order === 3 && !visible.featured,
  "Public title, order and featured selection updated");
ok(visible.gallery[0] === cover && visible.gallery[1] === "/evernever/about.png",
  "Gallery order preserved");
ok(visible.videoUrls.length === 1, "Video links preserved");
r = await request(`projects/${project.id}`, "POST", { ...project, status: "draft" });
ok(r.status === 200, "Unpublish succeeds");
project = r.data;
r = await request("public/projects");
ok(!r.data.some((p) => p.id === project.id), "Unpublished project disappears publicly");
r = await request(`projects/${project.id}`, "POST", { ...project, status: "publish" });
ok(r.status === 200, "Republish succeeds");
project = r.data;
r = await request(`projects/${project.id}`, "POST", {
  ...project,
  modified: "old",
});
ok(r.status === 409, "Stale update rejected");
r = await request(`projects/${project.id}`, "DELETE");
ok(r.status === 200, "Move to trash succeeds");
r = await request("public/projects");
ok(!r.data.some((p) => p.id === project.id), "Trashed project not public");
r = await request("projects");
project = r.data.find((p) => p.id === project.id);
ok(
  project.status === "trash" && !project.slug.current.endsWith("__trashed"),
  "Original slug retained in trash",
);
r = await request(`projects/${project.id}`, "POST", {
  ...project,
  status: "draft",
});
ok(r.status === 200 && r.data.status === "draft", "Restore to draft succeeds");
project = r.data;
r = await request("projects", "POST", {
  ...project,
  id: undefined,
  modified: undefined,
});
ok(r.status === 409, "Duplicate slug rejected");
r = await request(`projects/${project.id}`, "POST", {
  ...project,
  gallery: ["javascript:alert(1)"],
});
ok(r.status === 400, "Unsafe URL rejected");
r = await request("company", "POST", { email: "not-email" });
ok(r.status === 400, "Invalid company email rejected");
r = await request("company", "POST", {
  email: "test@example.invalid",
  thaiDescription: "Local test only",
});
ok(r.status === 200, "Company saved");
r = await request("public/company");
ok(r.data.thaiDescription === "Local test only", "Company public data updated");
r = await request("contact", "POST", {
  fullName: "Local test",
  phone: "0800000000",
  email: "test@example.invalid",
  clientKey: "local",
});
ok(r.status === 200, "Contact accepted by local mail sink (no external email)");
const imported = JSON.parse(await readFile("src/data/evernever.json", "utf8")).projects.find(p => p.slug.current === "the-loft-clinic");
r = await request("projects", "POST", { ...imported, slug: { current: `loft-import-test-${Date.now()}` }, status: "draft" });
ok(r.status === 200, "Largest existing gallery imports as draft");
const importedDraft = r.data;
ok(JSON.stringify(importedDraft.gallery) === JSON.stringify(imported.gallery), "All 103 existing gallery images preserved in order");
r = await request(`projects/${importedDraft.id}`, "POST", { ...importedDraft, gallery: Array(201).fill("/evernever/about.png") });
ok(r.status === 400, "Oversized gallery rejected without truncation");
r = await request(`projects/${importedDraft.id}`, "DELETE");
ok(r.status === 200, "Local import fixture moved to trash");
r = await request("logout", "POST", {});
ok(r.status === 200, "Logout revokes token");
r = await request("session");
ok(r.status === 401, "Revoked session denied");
console.log(
  `${passed} integration checks passed (local SQLite WordPress; not production MariaDB)`,
);
