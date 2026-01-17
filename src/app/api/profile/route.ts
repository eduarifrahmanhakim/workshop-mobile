import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const API = process.env.NEXT_PUBLIC_API_BASE;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${API}/api/profile`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ message: "Unauthorized" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error profile:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
