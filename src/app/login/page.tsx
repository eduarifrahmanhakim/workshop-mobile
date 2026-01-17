"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try { 
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json" 
        },
        credentials: "include", // penting untuk cookie
        body: JSON.stringify({ email, password }),
      });
  
      // Cek status dulu sebelum parse json
      const data = await res.json().catch(() => ({}));
  
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }
  
      // Kalau sukses, token sudah di-set di cookie oleh API route
      console.log("Login success:", data);
     // router.push("/"); // redirect ke dashboard/home

      window.location.href = '/services';


     
  
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
  <div className="w-full max-w-sm bg-white shadow rounded-lg p-6">
       {/* Logo */}
      <div className="flex justify-center mb-4">
        <Image src="/logo.jpeg"    
        width={200}    
        height={200} alt="Logo" className="w-24 h-24 object-contain" />
      </div>
      <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Email"
          className="w-full px-3 py-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
    </div>
  );
}
