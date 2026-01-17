// app/api/before/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Config untuk meningkatkan batas ukuran body (10MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// Untuk App Router, gunakan runtime config
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

// GET list
export async function GET() {
  try {
    const API = process.env.NEXT_PUBLIC_API_BASE; // http://workshop-app.test
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const res = await fetch(`${API}/api/service-requests`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
            "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }), 
            // kalau perlu auth token/cookie tambahin di sini
        },
        credentials: "include", // aktifin ini kalau pakai Sanctum cookie
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch before data" },
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

    // Log form data untuk debugging
    console.log('Uploading files...');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: ${value.name} (${(value.size / 1024 / 1024).toFixed(2)} MB)`);
      }
    }

    const res = await fetch(`${API}/api/service-requests`, {
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
    
    // Return error response with proper message
    if (!res.ok) {
      console.error('Backend error:', data);
      return NextResponse.json(
        { message: data.message || 'Gagal menyimpan data', errors: data.errors },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("API Error:", error);
    
    // Handle specific errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { message: "Gagal membuat service request. Silakan coba lagi." },
      { status: 500 }
    );
  }
}

// export async function DELETE(req: Request) {
//   const API = process.env.NEXT_PUBLIC_API_BASE; // http://workshop-app.test
//   const token = cookies().get("token")?.value;

//   try {
//     // ambil ID dari query string
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json({ message: "ID is required" }, { status: 400 });
//     }

//     const res = await fetch(`${API}/api/service-requests/${id}`, {
//       method: "DELETE",
//       headers: {
//         Accept: "application/json",
//         ...(token && { Authorization: `Bearer ${token}` }),
//       },
//       credentials: "include",
//     });

//     if (!res.ok) {
//       const errorData = await res.json();
//       return NextResponse.json(errorData, { status: res.status });
//     }

//     return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
//   } catch (error) {
//     console.error("API Error:", error);
//     return NextResponse.json(
//       { message: "Failed to delete service request" },
//       { status: 500 }
//     );
//   }
// }
