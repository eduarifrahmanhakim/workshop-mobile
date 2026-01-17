/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


interface Service {
  id: number;
  offer_number: string;
  customer_name?: string;
  [key: string]: unknown; // opsional untuk properti lainnya
}

export default function ServicePage() {
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
      const [search, setSearch] = useState("");

      useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services"); // 👈 manggil route.ts
       // const data = await res.json();
      //  setServices(data);
       const json = await res.json();
          setServices(Array.isArray(json.data) ? json.data : []);

      } catch (error) {
          console.error("Failed to fetch services:", error);
          setServices([]); // fallback biar gak null
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const filteredServices = services.filter((item) => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return true; // kalau search kosong, return semua
  
    // ambil kandidat string dari beberapa kemungkinan property
    const offerNumber = (item.offer_number || "").toString().toLowerCase();
    const customerName =
    (
      item.customer_name ||
      (item.customer as any)?.name ||
      (item.customer as any)?.full_name ||
      ""
    ).toString().toLowerCase();
  
  
  
    const plateNumber =
      (item.plate_number ||
        (item.vehicle as any)?.license_plate ||
        (item.vehicle as any)?.plate ||
        ""
      ).toString().toLowerCase();
  
    const matches =
      offerNumber.includes(q) ||
      customerName.includes(q) ||
      plateNumber.includes(q);
  
    // debug: kalau lo mau lihat kenapa item tertentu gak ke-match, un-comment log ini:
    // if (!matches) console.log('no match', item.id, { offerNumber, customerName, plateNumber });
  
    return matches;
  });
  
  
  

  if (loading) return <p>Loading...</p>;



  return (
    <main className="pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-blue-600 p-3 text-center text-white shadow">
        <h1 className="text-lg font-bold">Services</h1>
        <p className="text-xs opacity-90">Daftar Service Kendaraan</p>
      </header>

      <section className="p-4 space-y-3">
        <h2 className="text-base font-semibold">Service List</h2>

        {/* Search */}
   <div className="relative w-full max-w-md mx-auto mb-4">
  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
 
  </span>
    <input
        type="text"
        placeholder="Cari Services..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition"
    />
    </div>


        {/* List SPK */}
        <ul className="space-y-3">
  {filteredServices.length > 0 ? (
    filteredServices.map((item: any, index) => (
      <li
        key={item.id}
        className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-200"
      >
        <div className="flex items-start gap-3">
          {/* Nomor urut */}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
            {index + 1}
          </span>

          {/* Info utama */}
          <div>
            <p className="font-semibold text-gray-800">{item.offer_number}</p>

            <div className="text-sm text-gray-600 space-y-0.5 mt-1">
              <p>
                <span className="font-medium text-gray-700">Customer:</span>{" "}
                {item.customer?.name || "-"}
              </p>
              <p>
                <span className="font-medium text-gray-700">Plate:</span>{" "}
                {item.vehicle?.license_plate || "-"}
              </p>
              <p>
                <span className="font-medium text-gray-700">Service Due Date:</span>{" "}
                {new Date(item.service_due_date).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                }).replace(".", ":")}
              </p>
            </div>
          </div>
        </div>

        {/* Tombol aksi */}
        <button
          onClick={() => router.push(`/services/${item.id}`)}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-blue-700 transition"
        >
          Foto After
        </button>
      </li>
    ))
  ) : (
    <p className="text-sm text-gray-500">SPK tidak ditemukan</p>
  )}
</ul>


      </section>
    </main>
  );
}
