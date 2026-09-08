import Link from "next/link";

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080A0B] text-[#F5F5F3]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-[28px] border border-white/10 bg-[#111416] p-5">
          <Link href="/" className="text-xl font-semibold text-white">
            SAYARTY
          </Link>
          <p className="mt-2 text-sm text-[#A8AAA8]">Admin dashboard</p>
          <nav className="mt-8 space-y-2 text-sm text-[#A8AAA8]">
            <Link className="block rounded-2xl px-3 py-2 hover:bg-white/5" href="/admin">
              Overview
            </Link>
            <Link className="block rounded-2xl px-3 py-2 hover:bg-white/5" href="/admin/cars">
              Cars
            </Link>
            <Link className="block rounded-2xl px-3 py-2 hover:bg-white/5" href="/admin/leads">
              Leads
            </Link>
            <Link className="block rounded-2xl px-3 py-2 hover:bg-white/5" href="/admin/settings">
              Settings
            </Link>
          </nav>
        </aside>
        <div className="space-y-6">
          <header className="rounded-[28px] border border-white/10 bg-[#111416] p-6">
            <h1 className="text-3xl font-semibold text-white">{title}</h1>
            <p className="mt-2 text-sm text-[#A8AAA8]">{description}</p>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
