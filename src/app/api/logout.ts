// pages/api/logout.ts
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set({
    name: "token",
    value: "",
    path: "/",
    httpOnly: true,
    expires: new Date(0), // set expiration di masa lalu
  });
  return res;
}
