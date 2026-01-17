"use client";
import { useState,useEffect } from "react"; // ✅ penting untuk unwrapping params
import { useRouter } from "next/navigation";
import Select from "react-select";
import Image from "next/image";
import React from "react";


interface Customer {
  id: number; 
  name: string;
}

interface Vehicle {
  id: number;
  license_plate: string;
  model?: string;
  brand?: string;
  [key: string]: unknown; // disini bro kayaanya errornya
}

interface Photo {
  id: number;
  url: string;
  file_path: string;
}

interface DamageOption {
  label: string;
  value: string;
}


interface Damage {
  id: number;
  name?: string;
}
interface Option {
  value: number;
  label: string;
}
export default function EditServiceRequest({ params }: { params: Promise<{ id: string }> }) {
  // contoh data dummy, nanti ganti sama hasil fetch by params.id
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;

  // const { id } = use(params); 
  const [notes, setNotes] = useState<string>("");


  const [jenis, setJenis] = useState("");

  const [selectedCustomer, setSelectedCustomer] = useState<Option | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Option | null>(null);
  
  const [kerusakan, setKerusakan] = useState<string[]>([]);
  const [options, setOptions] = useState<DamageOption[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [existingPhotos, setExistingPhotos] = useState<Photo[]>([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<number[]>([]);
  const [inspectionDate, setInspectionDate] = useState(""); // ✅ baru ditambah

  const customerOptions = customers.map((cust) => ({
    value: cust.id,
    label: cust.name,
  }));
  

  // const [newPhotos, setNewPhotos] = useState<File[]>([]); // baru diupload user
  // 🔹 1. Fetch damages, customers, vehicles
  useEffect(() => {
  //  fetch("/api/damages").then((res) => res.json()).then(setDamages);
    fetch("/api/customers").then((res) => res.json()).then(setCustomers);
  }, []);

  useEffect(() => {
    // fetch semua pilihan kerusakan
    fetch("/api/damages")
    .then((res) => res.json())
    .then((resData: Damage[]) => {
      setOptions(
        resData
          .filter((d) => d.name)
          .map((d: Damage) => ({
            label: d.name!,
            value: d.id.toString(),
          }))
      );
      
    });
  }, []);
  


  useEffect(() => {
    if (!id) return;

    fetch(`/api/service-requests/${id}`)
      .then((res) => res.json())
      .then((resData) => {
        const data = resData.data;
        //console.log(data.customer_id);
        setJenis(data.customer_id === 1 ? "seino" : "non-seino");
        
        // ✅ set selected customer dari customerOptions
    // Langsung set object ke react-select (tanpa nunggu customerOptions)
  

        setSelectedCustomer(
          data.customer_id
            ? { value: data.customer_id, label: data.customer?.name || "" }
            : null
        );
    
        setSelectedVehicle(
          data.vehicle_id
            ? { value: data.vehicle_id, label: data.vehicle?.license_plate || "" }
            : null
        );
        
        setNotes(data.notes || "");
    //    setInspectionDate(data.inspection_date || ""); // ✅ set tanggal
    if (data.inspection_date) {
      const date = new Date(data.inspection_date);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0"); // +1 karena month 0-indexed
      const dd = String(date.getDate()).padStart(2, "0");
      setInspectionDate(`${yyyy}-${mm}-${dd}`);
    } else {
      setInspectionDate("");
    }
        

        if (data.damages) {
          setKerusakan(
            (data.damages as { id: number }[]).map((d) => d.id.toString())
          );
        }
        if (data?.photos) {
          setExistingPhotos(data.photos); // misal [{id: 1, url: "..."}]
        }
      })
      .catch((err) => console.error("Error fetch detail:", err))
      .finally(() => setLoading(false));
  }, [id]);

    // 🔹 3. Fetch vehicles tiap kali customer ganti
    useEffect(() => {
      if (!selectedCustomer) return;
      const customerId =
      typeof selectedCustomer === "object"
        ? selectedCustomer.value
        : selectedCustomer; // jaga-jaga kalau nanti isinya string
      console.log(selectedCustomer);
      fetch(`/api/customers/${customerId}/vehicles`)
        .then((res) => res.json())
        .then(setVehicles);
    }, [selectedCustomer]);

    const handleKerusakanChange = (index: number, value: string) => {
      const newKerusakan = [...kerusakan];
      newKerusakan[index] = value;
      setKerusakan(newKerusakan);
    };


    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
  
      const previews = files.map((file) => URL.createObjectURL(file));
       console.log("files dari input:", files);
  
      setSelectedFiles(files);
      
      setPhotos((prev) => [...prev, ...previews]);
    };

    // const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    //   if (e.target.files) {
    //     setNewPhotos([...newPhotos, ...Array.from(e.target.files)]);
    //   }
    // };

    // hapus foto lama (yang dari server)
    const handleRemoveExisting = (id: number) => {
      setExistingPhotos(existingPhotos.filter((p) => p.id !== id));
      setDeletedPhotoIds(prev => [...prev, id]);

      // optionally simpen id yg mau dihapus untuk dikirim ke backend
    };

    // hapus foto baru (belum keupload)
    // const handleRemoveNew = (index: number) => {
    //   const updated = [...newPhotos];
    //   updated.splice(index, 1);
    //   setNewPhotos(updated);
    // };

    

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      const formData = new FormData();
      formData.append("jenis", jenis);
      formData.append("customer_id", selectedCustomer?.value?.toString() || "");
      formData.append("vehicle_id", selectedVehicle?.value?.toString() || "");
      formData.append("inspection_date", inspectionDate); // ✅ kirim inspection_date

      kerusakan.forEach((k) => formData.append("kerusakan[]", k));
      selectedFiles.forEach((file) => formData.append("photos[]", file));
      const noteString = Array.isArray(notes) ? notes.join("\n") : notes;
      formData.append("notes", noteString);
      
      deletedPhotoIds.forEach(id => formData.append("deleted_photos[]", id.toString()));

     // console.log(formData.entries())
  //    for (let [key, value] of formData.entries()) {
  //     console.log(key, value);
  //   }
  //     // Debug isi formData
  // for (let pair of formData.entries()) {
  //   console.log(pair[0], pair[1]);
  // }
    
      try {
        const res = await fetch(`/api/service-requests/${id}`, {
          method: "POST", // kalau Laravel lo pake method spoofing `_method=PUT`
          body: formData,
        });
     //   console.log('kesini');
        const data = await res.json(); 
        // console.log("CLIENT RECEIVED:", data); //kesini keluar validasi nya

        if (!res.ok) throw new Error(data.message || "Failed to update");
        //return false;
        router.push("/before"); // redirect balik
      } catch (err) {
        console.error("Update failed:", err);
      }
    };
  
    if (loading) return <p>Loading...</p>;
  
    // const options = damages.map((d: any) => ({
    //   value: d.id,
    //   label: d.name,
    // }));

  // tambah field kosong
  const handleAddKerusakan = () => {
    setKerusakan([...kerusakan, ""]);
  };

  // hapus field tertentu
const handleRemoveKerusakan = (index: number) => {
  const newKerusakan = [...kerusakan];
  newKerusakan.splice(index, 1);
  setKerusakan(newKerusakan);
};
const handleRemovePhoto = (index: number) => {
  setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  setPhotos((prev) => prev.filter((_, i) => i !== index));
};



  

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
    <h1 className="text-xl font-bold mb-4">Edit Service Request</h1>

    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Jenis */}
      <div>
        <label className="block font-medium mb-1">Jenis</label>
        <div className="flex gap-4">
          <label>
            <input
              type="radio"
              value="seino"
              checked={jenis === "seino"}
              onChange={() => setJenis("seino")}
            />
            Seino
          </label>
          <label>
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

      {/* Vehicle */}
      <div>
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

    {/* Kerusakan */}
<div>
  <label className="block font-medium mb-1">Kerusakan</label>
  {kerusakan.map((k, idx) => (
    <div key={idx} className="flex items-center gap-2 mb-2">
      <Select
        options={options}
        value={options.find((opt) => opt.value === k) || null}
        onChange={(selected) =>
          handleKerusakanChange(idx, selected ? selected.value : "")
        }
        isClearable
        isSearchable
        placeholder="-- Pilih Kerusakan --"
        className="flex-1"
      />
      <button
        type="button"
        onClick={() => handleRemoveKerusakan(idx)}
        className="px-2 py-1 bg-red-500 text-white rounded"
      >
        Hapus
      </button>
    </div>
  ))}

<div>
          <label className="block font-medium mb-1">Inspection Date</label>
          <input
            type="date"
            value={inspectionDate}
            onChange={(e) => setInspectionDate(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

  <button
    type="button"
    onClick={handleAddKerusakan}
    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
  >
    + Tambah Kerusakan
  </button>
</div>

<div>
  <label className="block font-medium mb-1">Foto Kerusakan</label>

  {/* Foto lama */}
  <div className="grid grid-cols-3 gap-2 mb-3">
    {existingPhotos.map((photo) => (
      <div key={photo.id} className="relative">
        <Image
          src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${photo.file_path}`}
          width={200}    // kasih ukuran default
          height={200}
          alt="Foto"
          className="w-full h-24 object-cover rounded"
        />
        <button
          type="button"
          onClick={() => handleRemoveExisting(photo.id)}
          className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs"
        >
          Hapus
        </button>
      </div>
    ))}
  </div>

  {/* Foto baru */}
    {/* Upload File */}
    <div>
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
        <div key={idx} className="relative">
          <Image
            src={src}
            alt={`preview-${idx}`}
            width={200}    // kasih ukuran default
            height={200}
            
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
</div>
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


      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Update
      </button>
    </form>
  </div>
);
}
