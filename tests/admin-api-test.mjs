// Integration test of the Next.js proxy against local WordPress. No production URLs allowed.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const base = process.env.TEST_APP_URL || "http://127.0.0.1:3101";
assert(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
let cookie = "";
let checks = 0;
async function req(path, method = "GET", body, origin = base) {
  const r = await fetch(`${base}/api/${path}`, {
    method,
    headers: {
      Origin: origin,
      Cookie: cookie,
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
  const data = await r.json();
  return { r, data };
}
function ok(v, label) {
  assert(v, label);
  console.log(`PASS ${label}`);
  checks++;
}
let result = await req("admin/projects");
ok(result.r.status === 401, "Proxy requires session");
result = await req(
  "admin/login",
  "POST",
  { username: "test-editor", password: "test-password" },
  "https://other.invalid",
);
ok(result.r.status === 403, "Cross-origin login blocked");
result = await req("admin/login", "POST", {
  username: "test-editor",
  password: "test-password",
});
ok(result.r.status === 200, "Login through Next proxy");
const setCookie = result.r.headers.get("set-cookie");
ok(
  setCookie?.includes("HttpOnly") && setCookie?.includes("SameSite=strict"),
  "HttpOnly SameSite session cookie",
);
cookie = setCookie.split(";")[0];
ok(!("token" in result.data), "Session token excluded from JSON");
result = await req("admin/projects");
ok(result.r.status === 200 && Array.isArray(result.data), "Authenticated list");
result = await req("admin/unsupported", "POST", {});
ok(result.r.status === 404, "Proxy path allowlist");
result = await req("admin/projects", "POST", {}, "https://other.invalid");
ok(result.r.status === 403, "Cross-origin write blocked");
const image = new FormData();
image.set(
  "file",
  new Blob([await readFile("public/evernever/about.png")], {
    type: "image/png",
  }),
  "proxy-test.png",
);
result = await req("admin/media", "POST", image);
ok(
  result.r.status === 200 && result.data.url,
  "Image uploads through Next proxy to WordPress",
);
const invalid = new FormData();
invalid.set("file", new Blob(["<svg/>"], { type: "image/svg+xml" }), "bad.svg");
result = await req("admin/media", "POST", invalid);
ok(result.r.status === 400, "SVG upload denied");
const project = {
  title: "Proxy test",
  slug: { current: `proxy-test-${Date.now()}` },
  status: "draft",
  coverImage: "/evernever/about.png",
  categories: ["music-video"],
  categoryLabels: ["Music Video"],
  description: "integration test",
  order: 1,
};
result = await req("admin/projects", "POST", project);
ok(result.r.status === 200, "Proxy creates draft");
const saved = result.data;
const hidden = await fetch(`${base}/works/${saved.slug.current}`);
ok(hidden.status === 404, "Draft detail is not public");
result = await req(`admin/projects/${saved.id}`, "POST", {
  ...saved,
  status: "publish",
});
ok(result.r.status === 200, "Proxy publishes");
const publicPage = await fetch(`${base}/works/${saved.slug.current}`);
ok(
  publicPage.status === 200 && (await publicPage.text()).includes("Proxy test"),
  "Published detail immediately available",
);
result = await req(`admin/projects/${saved.id}`, "DELETE");
ok(result.r.status === 200, "Proxy trashes");
const removed = await fetch(`${base}/works/${saved.slug.current}`);
ok(removed.status === 404, "Withdrawn detail no longer public");
result = await req("contact", "POST", {
  fullName: "Test",
  phone: "bad",
  email: "test@example.invalid",
});
ok(result.r.status === 400, "Invalid contact rejected");
result = await req("contact", "POST", { fullName: "Test", phone: "0800000000" }, "https://other.invalid");
ok(result.r.status === 403, "Cross-origin contact blocked");
result = await req("contact", "POST", { fullName: "Test", phone: "0800000000", website: "spam" });
ok(result.r.status === 400, "Contact honeypot rejected");
result = await req("contact", "POST", { fullName: "   ", phone: "0800000000" });
ok(result.r.status === 400, "Blank contact name rejected");
result = await req("contact", "POST", { fullName: "Test", phone: "0800000000", email: "bad" });
ok(result.r.status === 400, "Invalid reply email rejected");
result = await req("contact", "POST", { fullName: "Test", phone: "0800000000", company: "x".repeat(6000) });
ok(result.r.status === 413, "Oversized contact rejected");
const malformed = await fetch(`${base}/api/contact`, { method: "POST", headers: { Origin: base, "Content-Type": "application/json" }, body: "{" });
ok(malformed.status === 400, "Malformed contact JSON rejected");
result = await req("admin/logout", "POST", {});
ok(result.r.status === 200, "Logout succeeds");
result = await req("admin/projects");
ok(result.r.status === 401, "Old session cannot be reused");
result = await req("admin/logout", "POST", {});
ok(result.r.status === 200, "Expired session can still clear cookie");
console.log(`${checks} Next proxy checks passed`);
