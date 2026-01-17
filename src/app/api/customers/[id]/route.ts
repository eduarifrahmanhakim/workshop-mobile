import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ✅ params sekarang Promise juga
  const API = process.env.NEXT_PUBLIC_API_BASE;

  // ✅ cookies() sekarang juga Promise
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const res = await fetch(`${API}/api/customers/${id}/vehicles`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Laravel API error:", res.status, text);
      return NextResponse.json({ message: "Failed to fetch vehicles" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("🔥 Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
