import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080A0B] px-4">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#111416] p-8 text-[#F5F5F3]">
        <p className="text-sm uppercase tracking-[0.3em] text-[#C9A07F]">Sayarty Admin</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Secure Login</h1>
        <p className="mt-3 text-sm text-[#A8AAA8]">
          Default local credentials are pre-filled. Change them in environment variables before production.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
