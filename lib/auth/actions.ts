"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { createSession, destroySession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";

export type LoginState = {
  error: string | null;
};

export async function login(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "E-posta ve şifre alanlarını doldurun." };
  }

  try {
    const user = await prisma.adminUser.findUnique({ where: { email } });
    const valid = user?.isActive ? await verifyPassword(password, user.passwordHash) : false;
    if (!valid || !user) {
      return { error: "E-posta veya şifre hatalı." };
    }

    await createSession(user.id);
  } catch (error) {
    console.error("Admin login failed:", error);
    return { error: "Giriş şu anda tamamlanamadı. Lütfen tekrar deneyin." };
  }

  redirect("/admin");
}

export async function logout() {
  try {
    await destroySession();
  } catch (error) {
    console.error("Admin logout failed:", error);
  }
  redirect("/admin/login");
}
