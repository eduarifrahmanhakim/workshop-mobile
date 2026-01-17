import {  NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    console.log('test');
  try {
    const API = process.env.NEXT_PUBLIC_API_BASE;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${API}/api/services`, {
      method: "GET",
      headers: {
       "Accept": "application/json",
        "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), 
        // kalau perlu auth token/cookie tambahin di sini
      },
       credentials: "include", // aktifin ini kalau pakai Sanctum cookie
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return NextResponse.json(
        { message: error.message || "Failed to fetch services" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("API /services error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}



// POST create
export async function POST(req: Request) {
   const API = process.env.NEXT_PUBLIC_API_BASE; // http://workshop-app.test
   const cookieStore = await cookies();
   const token = cookieStore.get("token")?.value;
  try {
    const formData = await req.formData();

    const res = await fetch(`${API}/api/services`, {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json",
        // "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Failed to create before" },
      { status: 500 }
    );
  }
}

