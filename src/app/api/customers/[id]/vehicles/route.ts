import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  // ✅ Wajib pakai await karena Next 15 kirim params sebagai Promise
  const { id } = await context.params;

  const API = process.env.NEXT_PUBLIC_API_BASE;
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
      const errorText = await res.text();
      console.error("Laravel API error:", res.status, errorText);
      return NextResponse.json({ message: "Failed to fetch vehicles" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error("Server error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
