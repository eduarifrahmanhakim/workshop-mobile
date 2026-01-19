// app/api/service-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Untuk App Router, gunakan runtime config (BUKAN export const config)
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic'; // Disable caching for this route

// GET list
export async function GET() {
  const API = process.env.NEXT_PUBLIC_API_BASE;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  try {
    const res = await fetch(`${API}/api/service-requests`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: "no-store",
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
export async function POST(req: NextRequest) {
  console.log("POST /api/service-requests started");
  const API = process.env.NEXT_PUBLIC_API_BASE;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  // Log untuk debugging production
  console.log("API Base:", API);
  console.log("Token exists:", !!token);
  
  try {
    const formData = await req.formData();

    // Log form data untuk debugging
    console.log('Processing form data...');
    for (const [key, value] of formData.entries()) {
      // Check if value is a Blob/File using duck typing (compatible with Node.js)
      if (value && typeof value === 'object' && 'name' in value && 'size' in value) {
        const file = value as { name: string; size: number };
        console.log(`${key}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    const res = await fetch(`${API}/api/service-requests`, {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
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

    console.log("Service request created successfully");
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("API Error:", error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    
    // Handle specific errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        { message: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { message: "Gagal membuat service request. Silakan coba lagi.", error: error instanceof Error ? error.message : 'Unknown error' },
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
