
import React, { useState } from "react";

const BeforeCreate: React.FC = () => {
  const [jenis, setJenis] = useState("seino");
  const [customer, setCustomer] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [kerusakan, setKerusakan] = useState<string[]>([""]);
  const [file, setFile] = useState<File | null>(null);

  const handleKerusakanChange = (index: number, value: string) => {
    const newKerusakan = [...kerusakan];
    newKerusakan[index] = value;
    setKerusakan(newKerusakan);
  };

  const addKerusakan = () => {
    if (kerusakan.length < 10) {
      setKerusakan([...kerusakan, ""]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      jenis,
      customer,
      plateNumber,
      kerusakan,
      file,
    });
    // TODO: panggil API simpan data
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Create Before</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
              />{" "}
              Seino
            </label>
            <label>
              <input
                type="radio"
                value="non-seino"
                checked={jenis === "non-seino"}
                onChange={() => setJenis("non-seino")}
              />{" "}
              Non Seino
            </label>
          </div>
        </div>

        {/* Customer */}
        <div>
          <label className="block font-medium mb-1">Customer</label>
          <select
            className="w-full border rounded-lg p-2"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          >
            <option value="">-- Select Customer --</option>
            <option value="cust1">Customer 1</option>
            <option value="cust2">Customer 2</option>
          </select>
        </div>

        {/* Plate Number */}
        <div>
          <label className="block font-medium mb-1">Plate Number</label>
          <input
            type="text"
            className="w-full border rounded-lg p-2"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            placeholder="Enter plate number"
          />
        </div>

        {/* Kerusakan Dinamis */}
        <div>
          <label className="block font-medium mb-1">Kerusakan</label>
          {kerusakan.map((k, index) => (
            <input
              key={index}
              type="text"
              value={k}
              onChange={(e) => handleKerusakanChange(index, e.target.value)}
              className="w-full border rounded-lg p-2 mb-2"
              placeholder={`Kerusakan ${index + 1}`}
            />
          ))}
          {kerusakan.length < 10 && (
            <button
              type="button"
              onClick={addKerusakan}
              className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              + Add Kerusakan
            </button>
          )}
        </div>

        {/* Upload File */}
        <div>
          <label className="block font-medium mb-1">Upload Foto</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default BeforeCreate;
