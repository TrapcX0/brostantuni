import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export async function requireAdmin() {
  let session;
  try {
    session = await getSession();
  } catch (error) {
    console.error("Admin session validation failed:", error);
    redirect("/admin/login?error=configuration");
  }

  if (!session) redirect("/admin/login");
  return session;
}
