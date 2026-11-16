import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/cms/server";
import { AdminWorkspace } from "./workspace";
export const metadata: Metadata = {
  title: "Portfolio manager",
  robots: { index: false, follow: false },
};
export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return (
    <AdminWorkspace
      user={user}
      liveContent={process.env.CONTENT_SOURCE === "wordpress"}
    />
  );
}
