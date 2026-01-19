// app/api/services/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
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

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const API = process.env.NEXT_PUBLIC_API_BASE; // http://workshop-app.test
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    // ambil ID dari query string
    // const { searchParams } = new URL(req.url);
    const { id } = await context.params; 


    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const res = await fetch(`${API}/api/service-requests/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(errorData, { status: res.status });
    }

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { message: "Failed to delete service request" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {

    const API = process.env.NEXT_PUBLIC_API_BASE; // http://workshop-app.test
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
  
    try {
        // const { searchParams } = new URL(req.url);
        const { id } = await context.params; // ✅ HARUS pakai await!
        const res = await fetch(`${API}/api/services/${id}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
      });
  
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch (error) {
      console.error("Error fetch detail:", error);
      return NextResponse.json(
        { message: "Failed to fetch service request detail" },
        { status: 500 }
      );
    }
  }

  export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    console.log("POST route for services/[id] started");
    const API = process.env.NEXT_PUBLIC_API_BASE; // http://workshop-app.test
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
   try {
    const { id } = await context.params;
    const formData = await req.formData();
    
    // Log form data untuk debugging
    console.log(`Updating service ${id}...`);
    for (const [key, value] of formData.entries()) {
      // Check if value is a Blob/File using duck typing (compatible with Node.js)
      if (value && typeof value === 'object' && 'name' in value && 'size' in value) {
        const file = value as { name: string; size: number };
        console.log(`${key}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    const res = await fetch(`${API}/api/services/${id}`, {
       method: "POST",
       body: formData,
       headers: {
         "Accept": "application/json",
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
       { message: "Gagal menyimpan. Silakan coba lagi." },
       { status: 500 }
     );
   }
 }
