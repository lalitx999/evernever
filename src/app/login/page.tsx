import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cmsConfigured, currentUser } from "@/lib/cms/server";
import { LoginForm } from "./LoginForm";
import styles from "../admin/admin.module.css";
export const metadata: Metadata = {
  title: "Team login",
  robots: { index: false, follow: false },
};
export default async function LoginPage() {
  if (await currentUser()) redirect("/admin");
  return (
    <section className={styles.login}>
      <span className={styles.eyebrow}>EVERNEVER / TEAM ACCESS</span>
      <h1>Welcome back.</h1>
      <p>พื้นที่จัดการผลงานของทีม evernever</p>
      <LoginForm configured={cmsConfigured()} />
      <Link href="/">← กลับหน้าเว็บไซต์</Link>
    </section>
  );
}
