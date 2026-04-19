
import { useEffect, useState } from 'react';
import {api, serializeErrors} from '../api/client';
import {toast, ToastContainer} from "react-toastify";

interface VehicleItem {
  id: string;
  name: string;
  registrationPlateNumber: string;
  vehicleType: number;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [formData, setFormData] = useState({ name: '', registrationPlateNumber: '', vehicleType: 0 });
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const fetchVehicles = async () => {
    try {
      const data = await api.get('/vehicle/get-vehicles');
      if(data.type === "error"){
        setErrors(serializeErrors(data));
        toast.error("Failed to fetch vehicles", {autoClose: 2000});
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
        toast.error("Failed to add vehicle", {autoClose: 2000});
      }
      if(result.type === "success"){
        setFormData({ name: '', registrationPlateNumber: '', vehicleType: 0 });
        toast.success("Vehicle added successfully!", {autoClose: 2000});
        fetchVehicles();
      }
    } catch (err: any) {
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    
    const payload = {
      id: editingVehicle.id,
      name: formData.name,
      registrationPlateNumber: formData.registrationPlateNumber,
      vehicleType: formData.vehicleType
    };
    
    console.log('Updating vehicle with payload:', payload);

    try {
      const result = await api.post('/vehicle/update-vehicle', payload);
      if(result.type === "error"){
        setErrors(serializeErrors(result));
        toast.error("Failed to update vehicle", {autoClose: 2000});
      }
      if(result.type === "success"){
        setFormData({ name: '', registrationPlateNumber: '', vehicleType: 0 });
        setEditingVehicle(null);
        toast.success("Vehicle updated successfully!", {autoClose: 2000});
        fetchVehicles();
      }
    } catch (err: any) {
      console.error('Update error:', err);
    }
  };

  const startEditing = (vehicle: VehicleItem) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      registrationPlateNumber: vehicle.registrationPlateNumber,
      vehicleType: vehicle.vehicleType
    });
    setErrors([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingVehicle(null);
    setFormData({ name: '', registrationPlateNumber: '', vehicleType: 0 });
    setErrors([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete('/vehicle/delete-vehicle', { id });
      fetchVehicles();
      toast.success("Vehicle deleted successfully!", {autoClose: 2000});
    } catch (err: any) {
      toast.error("Failed to delete vehicle", {autoClose: 2000});
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">
          {editingVehicle ? 'Update Vehicle' : 'Add New Vehicle'}
        </h2>
        {errors && errors.length > 0 && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {errors.map((error, idx) => <div key={idx}>{error}</div>)}
          </div>
        )}
        <form onSubmit={editingVehicle ? handleUpdate : handleAdd} className="flex flex-col gap-4">
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
          <div className="flex gap-2">
            <button 
              type="submit" 
              className={`flex-1 ${editingVehicle ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white p-2 rounded`}
            >
              {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
            {editingVehicle && (
              <button 
                type="button" 
                onClick={cancelEditing}
                className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Vehicles List</h2>
        <div className="overflow-x-auto">
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
                <tr 
                  key={v.id} 
                  className={`border-b hover:bg-gray-50 cursor-pointer ${editingVehicle?.id === v.id ? 'bg-blue-50' : ''}`}
                  onClick={() => startEditing(v)}
                >
                  <td className="p-2">{v.name}</td>
                  <td className="p-2">{v.registrationPlateNumber}</td>
                  <td className="p-2">{['Car', 'Truck', 'Motorcycle', 'Bus'][v.vehicleType]}</td>
                  <td className="p-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEditing(v)} 
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(v.id)} 
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
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
      <ToastContainer />
    </div>
  );
}
