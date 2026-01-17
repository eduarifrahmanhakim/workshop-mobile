"use client";
import { use,useState } from "react"; // ✅ penting untuk unwrapping params
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";



export default function SPKDetail({ params }) {
  // contoh data dummy, nanti ganti sama hasil fetch by params.id
  const router = useRouter();
  const { id } = use(params); 
  const [notes, setNotes] = useState([""]); // mulai dari 1 notes
  const [photos, setPhotos] = useState([]);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPhotos((prev) => [...prev, ...previews]);
  };



   // Tambah notes baru (maksimal 10)
  const addNote = () => {
    if (notes.length < 10) {
      setNotes([...notes, ""]);
    }
  };
    // Update isi notes
  const updateNote = (index, value) => {
    const updated = [...notes];
    updated[index] = value;
    setNotes(updated);
  };
   // Hapus notes tertentu
  const removeNote = (index) => {
    if (notes.length > 1) {
      setNotes(notes.filter((_, i) => i !== index));
    }
  };

  
  const detail = {
    id,
    customer: "PT Mitra Toyotaka",
    serviceType: "Maintenance AC",
    technician: "Budi Setiawan",
    date: "2025-08-30",
    status: "In Progress",
    notes: [
    "Perlu pengecekan tambahan di unit outdoor.",
    "Unit indoor bocor di pipa pembuangan.",
    "Tekanan freon rendah, kemungkinan ada kebocoran."
    ],
  };

  return (
    <main className="pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-blue-600 p-3 text-center text-white shadow">
        <button  onClick={() => router.back()} className="absolute left-3 px-2 py-1 rounded hover:bg-blue-500">
          ←
        </button>
        <h1 className="text-lg font-bold">Services</h1>
        <p className="text-xs opacity-90">Upload Photo After</p>
      </header>

      {/* Content */}
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold">Detail SPK #{detail.id}</h1>

        {/* Card Detail */}
        <div className="bg-white shadow rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Customer</p>
              <p className="font-medium">{detail.customer}</p>
            </div>
            <div>
              <p className="text-gray-500">Service Type</p>
              <p className="font-medium">{detail.serviceType}</p>
            </div>
            <div>
              <p className="text-gray-500">Technician</p>
              <p className="font-medium">{detail.technician}</p>
            </div>
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-medium">{detail.date}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  detail.status === "Completed"
                    ? "bg-green-100 text-green-600"
                    : detail.status === "In Progress"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {detail.status}
              </span>
            </div>
          </div>

          {/* Notes */}
          {detail.notes && (
            <div>
              <p className="text-gray-500 mb-1">Kerusakan</p>
               <ul className="list-disc list-inside text-gray-700">
              {detail.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
              </ul>
            
            </div>
          )}
        </div>

        {/* Section buat Upload Foto */}
    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-400 rounded-xl cursor-pointer hover:bg-blue-50 transition">
        <span className="text-blue-600 font-medium">+ Upload Foto</span>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </label>
       {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {photos.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`preview-${idx}`}
              className="w-full h-24 object-cover rounded-lg shadow"
            />
          ))}
        </div>
      )}
      </div>
          <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Catatan Kerusakan</h2>

      {notes.map((note, index) => (
        <div key={index} className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={note}
            onChange={(e) => updateNote(index, e.target.value)}
            placeholder={`Kerusakan ${index + 1}`}
            className="flex-1 border rounded p-2"
          />
          {notes.length > 1 && (
            <button
              onClick={() => removeNote(index)}
              className="px-2 py-1 bg-red-500 text-white rounded"
            >
              Hapus
            </button>
          )}
        </div>
      ))}

      {notes.length < 10 && (
        <button
          onClick={addNote}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          + Tambah Kerusakan
        </button>
      )}

      <pre className="mt-4 p-2 bg-gray-100 rounded">
        {JSON.stringify(notes, null, 2)}
      </pre>
    </div>
    </main>
  );
}
