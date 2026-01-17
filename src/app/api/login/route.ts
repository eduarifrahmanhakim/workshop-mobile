import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const API = process.env.NEXT_PUBLIC_API_BASE;

    // Forward ke backend API
    const res = await fetch(`${API}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "include", // tambahin kalau backend butuh session cookie

    });

    const data = await res.json();

    console.log("Backend status:", res.status); //ini gak keluar 
        console.log("Backend response:", data); //ini gak keluar 


    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Login failed" },
        { status: res.status }
      );
    }
    //console.log('kesini');
    const response = NextResponse.json({ message: "Login success", user: data.user,status: 200 });
   // console.log('kesiniedu'); //ini gak keluar 
     // Set cookie token, misal 7 hari
  response.cookies.set("token", data.token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    sameSite: "lax", // bisa diubah strict/none sesuai kebutuhan
    secure: process.env.NODE_ENV === "production", // wajib true kalau HTTPS prod
  });
  console.log(response);
    return response;
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
