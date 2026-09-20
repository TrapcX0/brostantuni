import Link from "next/link";
import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Yönetim paneli</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Hoş geldiniz</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Menü bilgilerinizi yönetmek için yönetici hesabınızla giriş yapın.
        </p>
        <div className="mt-7">
          <AdminLoginForm />
        </div>
        <Link className="mt-6 block text-center text-sm font-bold text-zinc-500 hover:text-brand" href="/menu">
          Menüye dön
        </Link>
      </section>
    </main>
  );
}
