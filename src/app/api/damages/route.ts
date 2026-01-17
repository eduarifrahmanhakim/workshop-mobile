// app/api/damages/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";



export async function GET() {
  try {
    const API = process.env.NEXT_PUBLIC_API_BASE; // http://workshop-app.test
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const res = await fetch(`${API}/api/damages`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Laravel API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("API /damages error:", error.message);
    } else {
      console.error("API /damages error:", error);
    }
  
    return NextResponse.json(
      { message: "Failed to fetch damages" },
      { status: 500 }
    );
  }
}
