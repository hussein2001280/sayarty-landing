import { NextResponse } from "next/server";

import { createSession, verifyLogin } from "@/lib/server/auth";
import { loginSchema } from "@/lib/server/schemas";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const user = await verifyLogin(parsed.data.email, parsed.data.password);

  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createSession(user.id);

  return NextResponse.json({ success: true });
}
