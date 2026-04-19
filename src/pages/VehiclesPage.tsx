
import { useEffect, useState } from 'react';
import {api, serializeErrors} from '../api/client';

interface VehicleItem {
  id: string;
  name: string;
  registrationPlateNumber: string;
  vehicleType: number;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [formData, setFormData] = useState({ name: '', registrationPlateNumber: '', vehicleType: 0 });
  const [errors, setErrors] = useState<string[]>([]);

  const fetchVehicles = async () => {
    try {
      const data = await api.get('/vehicle/get-vehicles');
      if(data.type === "error"){
        setErrors(serializeErrors(data));
      }
      if(data.type === "success") {
        setVehicles(data.data.vehicles || []);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await api.post('/vehicle/create-vehicle', formData);
      if(result.type === "error"){
        setErrors(serializeErrors(result));
      }
      if(result.type === "success"){
        setFormData({ name: '', registrationPlateNumber: '', vehicleType: 0 });
        fetchVehicles();
      }
    } catch (err: any) {
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete('/vehicle/delete-vehicle', { id });
      fetchVehicles();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Add New Vehicle</h2>
        {errors && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{errors}</div>}
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Vehicle Name"
            className="p-2 border rounded"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Registration Plate"
            className="p-2 border rounded"
            value={formData.registrationPlateNumber}
            onChange={(e) => setFormData({ ...formData, registrationPlateNumber: e.target.value })}
            required
          />
          <select
            className="p-2 border rounded"
            value={formData.vehicleType}
            onChange={(e) => setFormData({ ...formData, vehicleType: parseInt(e.target.value) })}
          >
            <option value={0}>Car</option>
            <option value={1}>Truck</option>
            <option value={2}>Motorcycle</option>
            <option value={3}>Bus</option>
          </select>
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Add Vehicle
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Vehicles List</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Plate</th>
              <th className="p-2">Type</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id} className="border-b">
                <td className="p-2">{v.name}</td>
                <td className="p-2">{v.registrationPlateNumber}</td>
                <td className="p-2">{['Car', 'Truck', 'Motorcycle', 'Bus'][v.vehicleType]}</td>
                <td className="p-2">
                  <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">No vehicles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
