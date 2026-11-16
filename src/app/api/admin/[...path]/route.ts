import { sameOrigin } from "@/lib/cms/origin";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  cmsRequest,
  CmsError,
  SESSION_COOKIE,
  sessionToken,
} from "@/lib/cms/server";

export const runtime = "nodejs";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
async function handle(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const path = (await context.params).path.join("/");
    const method = request.method;
    const writable = method !== "GET";
    if (writable && !sameOrigin(request))
      return json({ message: "คำขอไม่ถูกต้อง กรุณาโหลดหน้าใหม่" }, 403);
    const routes: Record<string, string[]> = {
      login: ["POST"],
      logout: ["POST"],
      session: ["GET"],
      projects: ["GET", "POST"],
      media: ["POST"],
      company: ["GET", "POST"],
    };
    const allowed =
      routes[path] || (/^projects\/\d+$/.test(path) ? ["POST", "DELETE"] : []);
    if (!allowed.includes(method))
      return json({ message: "ไม่พบคำสั่งนี้" }, 404);
    const token = await sessionToken();
    if (path !== "login" && !token)
      return json({ message: "กรุณาเข้าสู่ระบบ" }, 401);
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 4 * 1024 * 1024)
      return json({ message: "ไฟล์ใหญ่เกิน 4 MB" }, 413);
    let body: BodyInit | undefined;
    if (writable && method !== "DELETE") {
      if (path === "media") {
        const form = await request.formData();
        const file = form.get("file");
        if (
          !(file instanceof File) ||
          file.size > 3 * 1024 * 1024 ||
          !["image/jpeg", "image/png", "image/webp"].includes(file.type)
        )
          return json(
            { message: "ใช้ JPG, PNG หรือ WebP ขนาดไม่เกิน 3 MB" },
            400,
          );
        body = form;
      } else {
        const text = await request.text();
        if (text.length > 200000)
          return json({ message: "ข้อมูลมีขนาดใหญ่เกินไป" }, 413);
        const parsed = JSON.parse(text || "{}");
        if (
          path === "login" &&
          (typeof parsed.username !== "string" ||
            typeof parsed.password !== "string" ||
            parsed.username.length > 254 ||
            parsed.password.length > 1024)
        )
          return json({ message: "กรุณากรอกข้อมูลเข้าสู่ระบบ" }, 400);
        body = JSON.stringify(parsed);
      }
    }
    if (path === "logout") {
      try {
        await cmsRequest("logout", { method: "POST", body: "{}" }, token);
      } catch (error) {
        if (!(error instanceof CmsError && [401, 403].includes(error.status)))
          throw error;
      }
      (await cookies()).delete(SESSION_COOKIE);
      return json({ success: true });
    }
    const data = await cmsRequest<Record<string, unknown>>(
      path,
      { method, body },
      token,
    );
    if (path === "login") {
      if (typeof data.token !== "string")
        throw new CmsError(502, "เข้าสู่ระบบไม่สำเร็จ");
      (await cookies()).set(SESSION_COOKIE, data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 8,
      });
      return json({ user: data.user });
    }
    if (writable && (path.startsWith("projects") || path === "company"))
      revalidatePath("/", "layout");
    return json(data);
  } catch (error) {
    if (error instanceof CmsError)
      return json({ message: error.message }, error.status);
    return json(
      { message: "ข้อมูลไม่ถูกต้องหรือระบบขัดข้อง กรุณาลองอีกครั้ง" },
      400,
    );
  }
}
export { handle as GET, handle as POST, handle as DELETE };
