"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { compressImages, isValidImageFormat, formatFileSize } from "../../utils/imageCompressor";


interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

interface Vehicle {
  id: number;
  license_plate: string;
  model?: string;
  brand?: string;
  [key: string]: unknown; // disini bro kayaanya errornya
}

interface Damage {
  id: number;
  name: string;
  description?: string;
}
interface Option {
  value: number;
  label: string;
}
export default function BeforeCreate() {
const [jenis, setJenis] = useState(""); // kosong dulu, bukan "seino"
const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [notes, setNotes] = useState("");
  const [inspectionDate, setInspectionDate] = useState(""); // 🟢 New state


  // const [plateNumber, setPlateNumber] = useState("");
  const [kerusakan, setKerusakan] = useState<(string | number)[]>([]);
  

  const [damages, setDamages] = useState<Damage[]>([]);

  // const [file, setFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Option | null>(null);

  // const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Option | null>(null);
  const [loading, setLoading] = useState(true);
  const [popupOpen, setPopupOpen] = useState(false);
  const [srNumber, setSrNumber] = useState("");
  const [toast, setToast] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
 


  const customerOptions = customers.map((cust) => ({
    value: cust.id,
    label: cust.name,
  }));


  

  useEffect(() => {
    if (jenis === "seino") {
      const seinoCustomer = customerOptions.find((c) =>
        c.label.toLowerCase().includes("seino")
      );
      setSelectedCustomer(seinoCustomer || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [jenis, customers]);




  const router = useRouter();

    useEffect(() => {
      fetch("/api/damages")
        .then((res) => res.json())
        .then((data) => setDamages(data));
    }, []);
    const damageOptions = damages.map((dmg) => ({
      value: dmg.id.toString(), 
      label: dmg.name,
    }));
    
  const handleKerusakanChange = (index: number, value: number | string) => {
   
      const newKerusakan = [...kerusakan];
      newKerusakan[index] = value.toString(); 
      setKerusakan(newKerusakan);
      };
      useEffect(() => {
      const fetchCustomers = async () => {
        try {
          const res = await fetch("/api/customers", { cache: "no-store" });
          const data = await res.json();
          setCustomers(data);
        } catch (err) {
          console.error("Failed to fetch customers:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchCustomers();
    }, []);
       // Ambil vehicle berdasarkan customer yang dipilih
      useEffect(() => {
        if (!selectedCustomer) return;
        const customerId =
        typeof selectedCustomer === "object"
          ? selectedCustomer.value
          : selectedCustomer; // jaga-jaga kalau nanti isinya string
        console.log(selectedCustomer);
        fetch(`/api/customers/${customerId}/vehicles`)
          .then((res) => res.json())
          .then((data) => setVehicles(data))
          .catch((err) => console.error("Failed fetch vehicles:", err));
      }, [selectedCustomer]);

      

  const addKerusakan = () => {
    if (kerusakan.length < 10) {
      setKerusakan([...kerusakan, ""]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setSubmitError(null); // Reset error state


     const formData = new FormData();
    formData.append("jenis", jenis);
    // formData.append("customer", customer);
    formData.append("customer_id", selectedCustomer?.value?.toString() || "");
    formData.append("vehicle_id", selectedVehicle?.value?.toString() || "");
    formData.append("inspection_date", inspectionDate); 
    console.log(selectedVehicle?.value?.toString());
  //  return false;

   // kerusakan.forEach((k) => formData.append("kerusakan", k));
    kerusakan.forEach((k) => {
      formData.append("kerusakan[]", String(k));
    });

    // kirim semua file
    selectedFiles.forEach((file) => {
      formData.append("photos[]", file);
    });
    // for (const [key, value] of formData.entries()) {
    //   console.log(key, value);
    // }
    formData.append("notes", notes); // <--- ini untuk textarea


  try {
      const res = await fetch("/api/service-requests", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();
      
      // Check if response is not ok
      if (!res.ok) {
        console.error("Server error:", data);
        setSubmitError(data.message || data.error || `Error ${res.status}: Gagal membuat service request`);
        return;
      }
      
      setSrNumber(data.sr_number);
      setPopupOpen(true);
     // console.log("Response:", data);
    } catch (err) {
      console.error("Error submit:", err);
      setSubmitError(err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.");
    }finally {
      setLoadingSubmit(false);
    }
    // TODO: panggil API simpan data
  };
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Reset error state
    setUploadError(null);

    // Validate file formats
    const acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFiles = files.filter(file => !isValidImageFormat(file, acceptedFormats));
    
    if (invalidFiles.length > 0) {
      setUploadError(`Format file tidak valid: ${invalidFiles.map(f => f.name).join(', ')}. Gunakan format JPG, PNG, WEBP, atau GIF.`);
      return;
    }

    // Check total file count
    if (photos.length + files.length > 10) {
      setUploadError('Maksimal 10 foto yang dapat diupload.');
      return;
    }

    setCompressing(true);

    try {
      // Compress images (max 1MB, max 1920px)
      const compressedResults = await compressImages(files, {
        maxWidth: 1920,
        maxHeight: 1920,
        maxSizeMB: 1,
        quality: 0.8
      });

      // Get compressed files
      const compressedFiles = compressedResults.map(r => r.file);
      
      // Log compression stats
      compressedResults.forEach(r => {
        console.log(`Compressed ${r.file.name}: ${formatFileSize(r.originalSize)} → ${formatFileSize(r.compressedSize)}`);
      });

      // Create preview URLs
      const previews = compressedFiles.map((file) => URL.createObjectURL(file));

      setSelectedFiles((prev) => [...prev, ...compressedFiles]);
      setPhotos((prev) => [...prev, ...previews]);
      
    } catch (error) {
      console.error("Error compressing images:", error);
      setUploadError(error instanceof Error ? error.message : 'Gagal memproses gambar. Silakan coba lagi.');
    } finally {
      setCompressing(false);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(srNumber);
    setToast(true);
    setTimeout(() => setToast(false), 2000); // auto hilang 2 detik
  };


  // Delete handler
  const handleRemovePhoto = (index: number) => {
    // Cleanup the object URL to prevent memory leaks
    URL.revokeObjectURL(photos[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow flex flex-col">
      <h1 className="text-xl font-bold mb-4">Create Before</h1>

      {/* Submit Error Message */}
      {submitError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center">
            <span className="font-medium mr-2">❌ Error:</span>
            <span>{submitError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="mt-2 text-sm text-red-600 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Jenis */}
        <div>
          <label className="block font-medium mb-1">Jenis</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="seino"
                checked={jenis === "seino"}
                onChange={() => {
                  setJenis("seino");
                  setSelectedCustomer({ value: 1, label: "PT SEINO INDOMOBIL LOGISTIK" });
                }}
              />
              Seino
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="non-seino"
                checked={jenis === "non-seino"}
                onChange={() => setJenis("non-seino")}
              />
              Non Seino
            </label>
          </div>
        </div>

        {/* Customer */}
        <div>
          <label className="block font-medium mb-1">Customer</label>
          <Select
        options={customerOptions}
        value={selectedCustomer}
        onChange={(option) => setSelectedCustomer(option)}
        isDisabled={jenis === "seino"}
        placeholder="Choose or search customer..."
        isSearchable
        className="w-full"
      />
        </div>

        {/* Plate Number */}
        {/* Select Vehicle */}
        {selectedCustomer && (
  <div className="mt-3">
    <label className="block font-medium mb-1">Plate Number</label>
    <Select
  options={vehicles.map((veh) => ({
    value: veh.id,
    label: veh.license_plate,
  }))}
  value={
    vehicles
      .map((veh) => ({
        value: veh.id,
        label: veh.license_plate,
      }))
      .find((option) => option.value === selectedVehicle?.value) || null
  }
  onChange={(option) => setSelectedVehicle(option || null)}
  placeholder="Choose or search plate number..."
  isSearchable
  className="w-full"
/>

  </div>
)}

        <div>
          <label className="block font-medium mb-1">Tanggal Inspeksi</label>
          <input
            type="date"
            value={inspectionDate}
            onChange={(e) => setInspectionDate(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Kerusakan Dinamis */}
          <div>
      <label className="block font-medium mb-1">Kerusakan</label>
      {kerusakan.map((k, index) => (
  <div key={index} className="mb-2">
    <Select
      isClearable
      isSearchable
      options={damageOptions}
      value={damageOptions.find((opt) => opt.value === k) || null}
      onChange={(selected) =>
        handleKerusakanChange(index, selected?.value ?? "")
      }
      placeholder="-- Pilih Kerusakan --"
    />
  </div>
))}



      {kerusakan.length < 10 && (
        <button
          type="button"
          onClick={addKerusakan}
          className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          + Tambah Kerusakan
        </button>
      )}
    </div>


        {/* Upload File */}
        <div>
          {/* Error message */}
          {uploadError && (
            <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              <span className="font-medium">Error:</span> {uploadError}
            </div>
          )}
          
          <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition ${compressing ? 'border-gray-300 bg-gray-50' : 'border-blue-400 hover:bg-blue-50'}`}>
        {compressing ? (
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-gray-500 text-sm">Mengompres foto...</span>
          </div>
        ) : (
          <>
            <span className="text-blue-600 font-medium">+ Upload Foto</span>
            <span className="text-gray-400 text-xs mt-1">JPG, PNG, WEBP (Max 10 foto)</span>
          </>
        )}
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleUpload}
          className="hidden"
          disabled={compressing}
        />
      </label>
      {photos.length > 0 && (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {photos.map((src, idx) => (
        <div key={idx} className="relative">
          <Image
            src={src}
            width={200}    // kasih ukuran default
            height={200}
            alt={`preview-${idx}`}

            className="w-full h-24 object-cover rounded-lg shadow"
          />
          {/* Tombol hapus */}
          <button
            type="button"
            onClick={() => handleRemovePhoto(idx)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}
        </div>
{/* Tambahin Notes */}
      <div>
          <label className="block font-medium mb-1">Notes</label>
          <textarea
           value={notes}
           onChange={e => setNotes(e.target.value)}
            name="notes"
            rows={4}
            className="w-full border px-3 py-2 rounded"
            placeholder="Tambahin catatan di sini..."
          />
        </div>
        {/* Submit */}
        <div className="sticky bottom-0 bg-white p-4 shadow-md flex justify-end">
        <button
          type="submit"
          disabled={loadingSubmit}
          className={`w-full py-2 rounded-lg text-white transition
            ${loadingSubmit ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
          `}
        >
          {loadingSubmit ? (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Saving...
            </div>
          ) : (
            "Save"
          )}
        </button>

        </div>
      </form>
{/* Modal */}
        {popupOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm">
              <h2 className="text-lg font-bold mb-2">✅ Service Request Created</h2>
              <p className="mb-4 text-gray-700">
                SR Number:{" "}
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {srNumber}
                </span>
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleCopy}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                >
                  Copy
                </button>
                <button
                  onClick={() => {
                    setPopupOpen(false);
                    router.push('/before'); // redirect ke /before
                  }}
                  className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-5 right-5 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-fade-in">
            ✅ Copied to clipboard!
          </div>
        )}
    </div>

    
  );
}
