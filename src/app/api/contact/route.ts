import { sameOrigin } from "@/lib/cms/origin";
import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { cmsConfigured, cmsRequest, CmsError } from "@/lib/cms/server";
export async function POST(request: Request) {
  try {
    if (!sameOrigin(request))
      return NextResponse.json(
        { success: false, message: "คำขอไม่ถูกต้อง" },
        { status: 403 },
      );
    const raw = await request.text();
    if (raw.length > 5000)
      return NextResponse.json(
        { success: false, message: "ข้อมูลยาวเกินไป" },
        { status: 413 },
      );
    const { fullName, phone, email, company, website } = JSON.parse(raw);
    if (website)
      return NextResponse.json(
        { success: false, message: "ส่งข้อมูลไม่สำเร็จ" },
        { status: 400 },
      );
    if (
      typeof fullName !== "string" ||
      !fullName.trim() ||
      fullName.length > 121 ||
      typeof phone !== "string" ||
      !/^\+?[\d ()-]{8,30}$/.test(phone) ||
      phone.replace(/\D/g, "").length < 8
    )
      return NextResponse.json(
        { success: false, message: "กรุณากรอกชื่อและเบอร์โทรศัพท์ให้ครบถ้วน" },
        { status: 400 },
      );
    if (
      email !== undefined &&
      (typeof email !== "string" ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    )
      return NextResponse.json(
        { success: false, message: "กรุณากรอกอีเมลให้ถูกต้อง" },
        { status: 400 },
      );
    if (
      company !== undefined &&
      (typeof company !== "string" || company.length > 160)
    )
      return NextResponse.json(
        { success: false, message: "กรุณาตรวจสอบชื่อบริษัท" },
        { status: 400 },
      );
    if (!cmsConfigured() || process.env.CONTACT_ENABLED !== "true")
      return NextResponse.json(
        {
          success: false,
          message:
            "ขณะนี้ยังส่งผ่านฟอร์มไม่ได้ กรุณาติดต่อทางอีเมลหรือโทรศัพท์",
        },
        { status: 503 },
      );
    const clientKey = createHmac("sha256", process.env.WORDPRESS_BRIDGE_SECRET!)
      .update(
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
          "unknown",
      )
      .digest("hex");
    await cmsRequest("contact", {
      method: "POST",
      body: JSON.stringify({ fullName, phone, email, company, clientKey }),
    });
    return NextResponse.json({
      success: true,
      message: "ส่งคำขอติดต่อแล้ว ทีมงานจะติดต่อกลับครับ",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof CmsError
            ? error.message
            : "ข้อมูลไม่ถูกต้อง กรุณาลองอีกครั้ง",
      },
      { status: error instanceof CmsError ? error.status : 400 },
    );
  }
}
