import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { AdminUser, ManagedProject, CompanySettings } from "./types";
import { COMPANY } from "@/data/projects";

export const SESSION_COOKIE = "evernever_session";
export const cmsConfigured = () =>
  Boolean(process.env.WORDPRESS_API_URL && process.env.WORDPRESS_BRIDGE_SECRET);
export class CmsError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function cmsRequest<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  await connection();
  if (!cmsConfigured())
    throw new CmsError(503, "ยังไม่ได้เชื่อม WordPress กรุณาติดต่อผู้ดูแลระบบ");
  const base = new URL(process.env.WORDPRESS_API_URL!);
  if (
    base.protocol !== "https:" &&
    !(
      process.env.NODE_ENV !== "production" &&
      ["localhost", "127.0.0.1"].includes(base.hostname)
    )
  )
    throw new CmsError(503, "WordPress ต้องเชื่อมต่อผ่าน HTTPS");
  const headers = new Headers(init.headers);
  headers.set("X-Evernever-Key", process.env.WORDPRESS_BRIDGE_SECRET!);
  if (token) headers.set("X-Evernever-Session", token);
  if (init.body && !(init.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(`${base.href.replace(/\/$/, "")}/${path}`, {
      ...init,
      headers,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new CmsError(503, "เชื่อมต่อ WordPress ไม่สำเร็จ กรุณาลองใหม่");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new CmsError(
      response.status,
      data?.message || "ไม่สามารถดำเนินการได้",
    );
  if (data === null) throw new CmsError(502, "WordPress ส่งข้อมูลไม่ถูกต้อง");
  return data as T;
}
export async function sessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}
export async function currentUser(): Promise<AdminUser | null> {
  const token = await sessionToken();
  if (!token) return null;
  try {
    return await cmsRequest<AdminUser>("session", {}, token);
  } catch (error) {
    if (error instanceof CmsError && [401, 403].includes(error.status))
      return null;
    throw error;
  }
}
export const wordpressProjects = cache(async () => {
  const projects = await cmsRequest<ManagedProject[]>("public/projects");
  const mediaOrigin = process.env.WORDPRESS_MEDIA_ORIGIN;
  const media = (value: string) => {
    if (!mediaOrigin) return value;
    try {
      const old = new URL(value);
      const target = new URL(mediaOrigin);
      if (target.protocol !== "https:")
        throw new Error("Media origin must use HTTPS");
      if (
        old.hostname === "evernever.net" &&
        old.pathname.startsWith("/wp-content/uploads/")
      )
        return new URL(old.pathname + old.search, target.origin).href;
    } catch {
      return value;
    }
    return value;
  };
  return projects.map((p) => ({
    ...p,
    coverImage: media(p.coverImage),
    gallery: p.gallery?.map(media),
  }));
});
export const fetchCompany = cache(async () => {
  if (process.env.CONTENT_SOURCE !== "wordpress") return COMPANY;
  try {
    return {
      ...COMPANY,
      ...(await cmsRequest<CompanySettings>("public/company")),
    };
  } catch {
    // Company fallback must not prevent access to /login during a CMS outage.
    // Portfolio content intentionally has no fallback that could resurrect withdrawn work.
    return COMPANY;
  }
});
