"use client";
import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { compressImages, isValidImageFormat, formatFileSize } from "../../utils/imageCompressor";



export default function SPKDetail({ params }) {
  // contoh data dummy, nanti ganti sama hasil fetch by params.id
  const router = useRouter();
  const { id } = use(params); 
  const [photos, setPhotos] = useState([]);
  const [afterNotes, setAfterNotes] = useState(""); // catatan after

  const [loading, setLoading] = useState(true);
  const [data, setDetail] = useState(null);
  const [damages, setDamages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [selectedDamages, setSelectedDamages] = useState([]); // data after yang ditambahkan user
  const [existingBeforePhotos, setExistingBeforePhotos] = useState([]);
  const [afterDamages, setAfterDamages] = useState([]); // list after damages dari API
  const [deletedAfterDamageIds, setDeletedAfterDamageIds] = useState([]); // Track deleted damage IDs

  const [existingAfterPhotos, setExistingAfterPhotos] = useState([]);
  const [deletedAfterPhotoIds, setDeletedAfterPhotoIds] = useState([]); // Track deleted photo IDs
  const [newAfterPhotos, setNewAfterPhotos] = useState([]); // buat upload baru
  const [selectedDamage, setSelectedDamage] = useState(null);
  
  // New states for image handling
  const [uploadError, setUploadError] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [offerNumber, setOfferNumber] = useState("");
    
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
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

    // Check total file count (existing + new)
    const totalPhotos = existingAfterPhotos.length + photos.length + files.length;
    if (totalPhotos > 10) {
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

    // Fetch detail by ID
    useEffect(() => {
      const fetchDetail = async () => {
        try {
          const res = await fetch(`/api/services/${id}`, { cache: "no-store" });
          if (!res.ok) throw new Error("Gagal ambil data service");
          const data = await res.json();
          setDetail(data.data);
          // set offer number for display
          setOfferNumber(data.data?.offer_number || "");
          // set notes_after into textarea
          setAfterNotes(data.data?.notes_after || "");

          if (data.data?.before_photos) {
            // console.log('kesini');
            // console.log(data.before_photos);
            setExistingBeforePhotos(data.data.before_photos); // misal [{id: 1, url: "..."}]
          }
          if (data.data?.after_photos) {
            setExistingAfterPhotos(data.data.after_photos);
          }
          if (data.data?.afterdamages) {
            setAfterDamages(data.data.afterdamages);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }, [id]);

    useEffect(() => {
      fetch("/api/damages")
        .then((res) => res.json())
        .then((data) => setDamages(data))
        .catch((err) => console.error("Failed to fetch damages:", err));
      
    }, []);

      // const options = damages.map((dmg: any) => ({
      //   value: dmg.id,
      //   label: dmg.name,
      // }));
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
        </div>
      );
    }
  
    if (!detail) {
      return (
        <div className="p-4 text-center text-red-500">
          Data service tidak ditemukan.
        </div>
      );
    }
    const handleSaveAfter = async () => {
      setSaving(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("notes_after", afterNotes);
    
      // append file baru
      selectedFiles.forEach((file) => {
        console.log('kesini');
        formData.append("after_photos[]", file);
      });

      // append deleted photo IDs to inform backend
      if (deletedAfterPhotoIds.length > 0) {
        deletedAfterPhotoIds.forEach((photoId) => {
          formData.append("deleted_photo_ids[]", photoId);
        });
      }

      // append deleted after damage IDs to inform backend
      if (deletedAfterDamageIds.length > 0) {
        deletedAfterDamageIds.forEach((damageId) => {
          formData.append("deleted_after_damage_ids[]", damageId);
        });
      }

      // append kerusakan after
      selectedDamages.forEach((dmg, i) => {
        if (dmg) {
          formData.append(`after_damages[${i}][damage_id]`, dmg.value);
          formData.append(`after_damages[${i}][damage_name]`, dmg.label);
        }
      });

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

    
      try {
        const res = await fetch(`/api/services/${id}`, {
          method: "POST", // atau PUT sesuai API lo
          body: formData,
        });
    
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Gagal menyimpan data after");
        }
        const data = await res.json();
      //  console.log("Save berhasil:", data);
        router.push("/services"); // redirect balik

    
        // reset atau update state sesuai respons
        setAfterNotes("");
        setSelectedFiles([]);
        setDeletedAfterPhotoIds([]);
        setDeletedAfterDamageIds([]);
        setExistingAfterPhotos(data.after_photos || []);
        setAfterDamages(data.after_damages || []);
      } catch (err) {
        console.error(err);
        setUploadError(err.message || 'Gagal menyimpan. Silakan coba lagi.');
      } finally {
        setSaving(false);
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

  const options = damages.map((dmg) => ({
    value: dmg.id,
    label: dmg.name,
  }));

  const addDamage = () => {
    setSelectedDamages((prev) => [...prev, null]);
  };
  const removeDamage = (index) => {
    console.log("Remove index:", index);
    setSelectedDamages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      console.log("Updated damages:", updated);
      return [...updated]; // <– bikin array baru biar React detect change
    });
  };
  

  const handleDamageChange = (index, selectedOption) => {
    const matchedOption = options.find(opt => opt.value === selectedOption?.value) || null;
    const updated = [...selectedDamages];
    updated[index] = matchedOption;
    console.log(updated[index]); // ini value nya bener sih
    setSelectedDamages(updated); //ini buat apa bro> biar ke selected pas milih gitu?
  };


  // Handle remove existing after photo - marks for deletion and removes from UI
  const handleRemoveExistingAfter = (photoId) => {
    // Add to deleted IDs list (will be sent to backend on save)
    setDeletedAfterPhotoIds((prev) => [...prev, photoId]);
    // Remove from UI immediately
    setExistingAfterPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // Handle remove existing after damage - marks for deletion and removes from UI
  const handleRemoveAfterDamage = (damageId) => {
    setDeletedAfterDamageIds((prev) => [...prev, damageId]);
    setAfterDamages((prev) => prev.filter((d) => d.id !== damageId));
  };

  // Handle remove new photo preview (not yet saved)
  const handleRemovePhoto = (index) => {
    // Cleanup the object URL to prevent memory leaks
    URL.revokeObjectURL(photos[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotos((prev) => prev.filter((_, i) => i !== index));
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
              <p className="text-gray-500">Work Order Number</p>
              <p className="font-medium">{data.work_order_number}</p>
            </div>
            <div>
              <p className="text-gray-500">Customer</p>
              <p className="font-medium">{data.customer.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Offer Number</p>
              <p className="font-medium">{offerNumber || data.offer_number || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Vehicle</p>
              <p className="font-medium">{data.vehicle.license_plate} | {data.vehicle.type} | {data.vehicle.brand}</p>
            </div>
            <div>
              <p className="text-gray-500">Technician</p>
              <p className="font-medium">{data.assign_to.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Created At</p>
              <p className="font-medium">
                {new Date(data.created_at).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                }).replace(".", ":")}
              </p>

            </div>
            <div>
              <p className="text-gray-500">Service Start Date (expected)</p>
              <p className="font-medium">
                {new Date(data.service_start_date).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                }).replace(".", ":")}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Service Due Date (expected)</p>
              <p className="font-medium">
                {new Date(data.service_due_date).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                }).replace(".", ":")}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  data.status === "Completed"
                    ? "bg-green-100 text-green-600"
                    : data.status === "In Progress"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {data.status}
              </span>
            </div>
          </div>

          {/* Notes */}
          {data?.beforedamages && data.beforedamages.length > 0 && (
            <div>
              <p className="text-gray-500 mb-1">Kerusakan (Before)</p>
              <ul className="list-disc list-inside text-gray-700">
                {data.beforedamages.map((item, index) => (
                  <li key={index}>{item.damage?.name || '-'}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* List Kerusakan After dari API */}
          {afterDamages && afterDamages.length > 0 && (
            <div>
              <p className="text-gray-500 mb-1">Kerusakan (After)</p>
              <div className="space-y-2">
                {afterDamages.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-200">
                    <span className="text-gray-700">{item.damage?.name || item.damage_name || '-'}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAfterDamage(item.id)}
                      className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-red-600"
                      title="Hapus kerusakan"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <label className="block font-medium mb-1">Foto Kerusakan (Before)</label>

      {/* Foto lama */}
      <div className="grid grid-cols-3 gap-2 mb-3">
      {existingBeforePhotos?.map((photo) => (
          <div key={photo.id} className="relative">
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${photo.file_path}`}
              width={200}    // kasih ukuran default
              height={200}
              alt="Foto"
              className="w-full h-24 object-cover rounded"
            />
           
          </div>
        ))}
      </div>

      <label className="block font-medium mb-1">Foto Kerusakan (After)</label>

    {/* Foto after - existing */}
    {existingAfterPhotos && existingAfterPhotos.length > 0 ? (
      <div className="grid grid-cols-3 gap-2 mb-3">
        {existingAfterPhotos.map((photo) => (
          <div key={photo.id} className="relative">
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${photo.file_path}`}
              alt="Foto"
              className="w-full h-24 object-cover rounded"
            />
            <button
              type="button"
              onClick={() => handleRemoveExistingAfter(photo.id)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-red-600"
              title="Hapus foto"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 italic mb-3">Foto After belum di upload.</p>
    )}

        {/* Error message */}
        {uploadError && (
          <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            <span className="font-medium">Error:</span> {uploadError}
          </div>
        )}

        {/* Section buat Upload Foto */}
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
            <span className="text-blue-600 font-medium">+ Upload Foto After</span>
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
          <img
            src={src}
            alt={`preview-${idx}`}
            className="w-full h-24 object-cover rounded-lg shadow"
          />
          {/* Tombol hapus */}
          <button
            type="button"
            onClick={() => handleRemovePhoto(idx)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg hover:bg-red-600"
            title="Hapus foto"
          >
            ✕
          </button>
        </div>
      ))}
        </div>
      )}
      </div>
      <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Catatan Kerusakan (After)</h2>
      <p className="mb-4 text-gray-600">Tambahkan catatan kerusakan pada saat service.</p>

      {selectedDamages.map((selected, index) => (
        <div key={index} className="flex items-center gap-2 mb-2">
          <Select
            isClearable
            isSearchable
            options={options}
            value={selectedDamages[index] || null}  // <--- penting banget ini
            onChange={(opt) => handleDamageChange(index, opt)}
            placeholder="-- Pilih Kerusakan --"
            className="flex-1"
          />

          <button
            type="button"
            onClick={() => removeDamage(index)}
            className="px-2 py-1 bg-red-500 text-white rounded"
          >
            Hapus
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addDamage}
        className="px-4 py-2 bg-blue-600 text-white rounded mt-2"
      >
        Tambah Kerusakan
      </button>

      <label className="block font-medium mb-1 mt-4">Kerusakan (After)</label>
<textarea
  value={afterNotes}
  onChange={(e) => setAfterNotes(e.target.value)}
  placeholder="Masukkan catatan kerusakan"
  className="w-full p-2 border border-gray-300 rounded mb-3"
/>

{/* Tombol Save */}
<button
  type="button"
  onClick={handleSaveAfter}
  disabled={saving || compressing}
  className={`w-full py-2 rounded-lg text-white transition ${
    saving || compressing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
  }`}
>
  {saving ? (
    <div className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      Menyimpan...
    </div>
  ) : (
    "Save"
  )}
</button>
     
    </div>
    </main>
  );
}
