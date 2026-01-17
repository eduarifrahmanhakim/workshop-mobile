
"use client";
// eslint-disable-next-line @typescript-eslint/no-explicit-any

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { toast } from "react-hot-toast";

interface ServiceRequest {
  id: number;           // id service request
  sr_number: string;    // nomor service request
  customer_name?: string; // opsional
  vehicle_name?: string;  // opsional
  [key: string]: string | number | undefined; // ✔ tipe lebih spesifik
}

// Icon components - tambahkan di bagian atas file
const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function BeforePage() {
  const router = useRouter();
  const [before, setBefore] = useState<ServiceRequest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Yakin mau hapus Service Request ini?");
    if (!confirmDelete) return;

    try {
      // kalau ada API delete
      const res = await fetch(`/api/service-requests/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          credentials: "include",
        },
      });
      const data = await res.json();
      //console.log(data);
      if (!res.ok || data.success === false) {
        // tampilkan error dari Laravel
        console.log(data.message);

        toast.error(data.message || "Failed to delete service request"); 
        return;
      } 
      toast.success("Service Request berhasil dihapus");
      setBefore((prev) => prev.filter((item) => item.id !== id)); //disini merah bro
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus Service Request");
    }
  };


  useEffect(() => {
    async function fetchBefore() {
      try {
        const res = await fetch("/api/service-requests", {
          method: "GET",
          headers: { "Accept": "application/json" },
          credentials: "include", // kalo pake cookie auth
        });

        if (!res.ok) throw new Error("Failed to fetch before data");

        const data = await res.json();
  
        // asumsi backend return { data: [...] }
        setBefore(data);

      } catch (err) {
        console.error("Error fetching before:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBefore();
  }, []);

const filteredBefore = before.filter((item) =>
    item.sr_number.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="p-4">Loading...</p>;


  return (
    <main className="h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-blue-600 p-3 text-center text-white shadow">
        <h1 className="text-lg font-bold">Before</h1>
        <p className="text-xs opacity-90">Daftar service requests kendaraan</p>
      </header>


     <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push("/before/create")}
          className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-md hover:bg-blue-700 active:scale-95 transition"
        >
          ➕ Create
        </button>
      </div>
      <section className="flex-1 overflow-y-auto p-4 space-y-3">
        <h2 className="text-base font-semibold">Before List</h2>

        {/* Search */}
   <div className="relative w-full max-w-md mx-auto mb-4">
  <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
 
  </span>
    <input
        type="text"
        placeholder="Cari nomor Service Request (Before)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition"
    />
    </div>


      {/* List SPK */}
<div className="space-y-4">
  {filteredBefore.length > 0 ? (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filteredBefore.map((item: any, index) => (
      <div
        key={item.id}
        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
      >
        {/* Header dengan nomor urut dan SR Number */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-sm shadow-sm">
              {index + 1}
            </span>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{item.sr_number}</h3>
              <p className="text-sm text-gray-600 mt-0.5">Service Request</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              Active
            </span>
          </div>
        </div>

        {/* Informasi Detail */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Info Customer */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <UserIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Customer</p>
                  <p className="text-sm text-gray-800 font-medium">
                    {item.customer?.name || "-"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CarIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500">License Plate</p>
                  <p className="text-sm text-gray-800 font-medium">
                    {item.vehicle?.license_plate || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Tanggal */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Inspection Date</p>
                  <p className="text-sm text-gray-800 font-medium">
                    {new Date(item.inspection_date).toLocaleString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).replace(".", ":")}
                  </p>
                </div>
              </div>
              
              {/* Tambahan info lain jika ada */}
              {item.vehicle?.model && (
                <div className="flex items-start gap-2">
                  <InfoIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500">Vehicle Model</p>
                    <p className="text-sm text-gray-800 font-medium">
                      {item.vehicle.model}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={() => router.push(`/service-requests/${item.id}`)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors duration-200 shadow-sm"
            >
              <EditIcon className="w-4 h-4" />
              Update
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors duration-200 shadow-sm"
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <SearchIcon className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-500 font-medium">No Service Requests Found</p>
      <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
    </div>
  )}
</div>

      </section>
    </main>
  );
}
