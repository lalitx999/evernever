"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../admin/admin.module.css";
export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className={styles.form}
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError("");
        const form = new FormData(event.currentTarget);
        try {
          const response = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(form)),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message);
          router.replace("/admin");
          router.refresh();
        } catch (error) {
          setError(
            error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      {!configured && (
        <p className={styles.notice}>
          หลังบ้านพร้อมสำหรับตั้งค่า แต่ยังไม่ได้เชื่อมต่อ WordPress
          จึงยังเข้าสู่ระบบไม่ได้
        </p>
      )}
      <label>
        ชื่อผู้ใช้หรืออีเมล
        <input
          name="username"
          autoComplete="username"
          required
          maxLength={254}
        />
      </label>
      <label>
        รหัสผ่าน
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={1024}
        />
      </label>
      <p role="alert">{error}</p>
      <button disabled={!configured || busy}>
        {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ →"}
      </button>
    </form>
  );
}
