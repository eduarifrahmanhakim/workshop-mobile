import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    const API = process.env.NEXT_PUBLIC_API_BASE;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${API}/api/customers`, {
        headers: {
        "Accept": "application/json",
            "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }), 
            // kalau perlu auth token/cookie tambahin di sini
        },
        credentials: "include", 
        cache: "no-store",
    });

  const data = await res.json();
  return NextResponse.json(data);
}
