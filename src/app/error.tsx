"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section
      style={{ maxWidth: 720, margin: "auto", padding: "160px 24px 100px" }}
    >
      <h1 style={{ fontSize: 36 }}>โหลดข้อมูลไม่สำเร็จชั่วคราว</h1>
      <p style={{ margin: "24px 0" }}>
        กรุณาลองอีกครั้ง หากยังไม่สำเร็จ ติดต่อทีม evernever
        ได้ทางอีเมลหรือโทรศัพท์
      </p>
      <button
        onClick={reset}
        style={{
          background: "#5566ff",
          color: "#fff",
          padding: "12px 24px",
          borderRadius: 8,
        }}
      >
        ลองอีกครั้ง
      </button>
    </section>
  );
}
