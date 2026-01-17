"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserProfile {
  name: string;
  email: string;
  role?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/profile`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include", // penting biar cookie httpOnly dikirim
        });

        if (!res.ok) {
          if (res.status === 401) {
            // kalau unauthorized, redirect ke login
            router.push("/login");
            return;
          }
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Error ${res.status}`);
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };
  
  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10 text-red-500">User not found</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow mt-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="space-y-2">
        <p><span className="font-semibold">Name:</span> {user.name}</p>
        <p><span className="font-semibold">Email:</span> {user.email}</p>
        {user.role && <p><span className="font-semibold">Role:</span> {user.role}</p>}
      </div>
      <button
        onClick={handleLogout}
        className="mt-6 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
      >
        Logout
      </button>
    </div>
  );
}
