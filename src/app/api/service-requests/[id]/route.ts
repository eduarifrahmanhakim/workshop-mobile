// app/api/service-requests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Runtime config untuk App Router
export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const API = process.env.NEXT_PUBLIC_API_BASE;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const { id } = await context.params;

  try {
    const res = await fetch(`${API}/api/service-requests/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("API DELETE /service-requests error:", error.message);
    } else {
      console.error("API DELETE /service-requests error:", error);
    }

    return NextResponse.json(
      { message: "Failed to delete service request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const API = process.env.NEXT_PUBLIC_API_BASE; // http://workshop-app.test
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const { id } = await context.params;
    try {
        // const { searchParams } = new URL(req.url);
        // const { id } = params;
      const res = await fetch(`${API}/api/service-requests/${id}`, {
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
    console.log("PUT route jalan"); 
    const API = process.env.NEXT_PUBLIC_API_BASE; // http://workshop-app.test
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
   try {
    // const { searchParams } = new URL(req.url);
    const { id } = await context.params; // ✅ HARUS pakai await!
    const formData = await req.formData();
     for (const [key, value] of formData.entries()) {
        console.log("API ROUTE RECEIVED:", key, value);
      }
    console.log('edu ganteng'); //ini aja gak keluar
     const res = await fetch(`${API}/api/service-requests/${id}`, {
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
