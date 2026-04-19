
import { useEffect, useState } from 'react';
import {api, serializeErrors, getUserRole} from '../api/client';
import {toast, ToastContainer} from "react-toastify";

interface RoadTripItem {
  id: string;
  driverId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  distance: number;
  averageFuelConsumption: number;
}

interface Vehicle {
  id: string;
  name: string;
  registrationPlateNumber: string;
}

interface Driver {
  id: string;
  name: string;
  surname: string;
}

export default function RoadTripsPage() {
  const [roadTrips, setRoadTrips] = useState<RoadTripItem[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const userRole = getUserRole(); // 0: Driver, 1: Manager, 2: Admin
  
  const [formData, setFormData] = useState({
    carId: '',
    deviceId: '',
    startDate: '',
    endDate: '',
    distance: 0,
    averageFuelConsumption: 0
  });
  const [errors, setErrors] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const rtData = await api.get('/road-trip/get-road-trips');
      if(rtData.type === "error"){
        setErrors(serializeErrors(rtData));
      }
      if(rtData.type === "success"){
        setRoadTrips(rtData.data.roadTrips || []);
      }

      const vData = await api.get('/vehicle/get-vehicles');
      if(vData.type === "error"){
        setErrors(serializeErrors(vData));
      }
      if(vData.type === "success"){
        setVehicles(vData.data.vehicles || []);
      }

      // Fetch drivers only for displaying names in the list
      const dData = await api.get('/driver/get-drivers');
      if(dData.type === "error"){
        setErrors(serializeErrors(dData));
      }
      if(dData.type === "success"){
        setDrivers(dData.data.drivers || []);
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        carId: formData.carId,
        deviceId: formData.deviceId,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        distance: formData.distance,
        averageFuelConsumption: formData.averageFuelConsumption
      };

      const response = await api.post('/road-trip/create', payload);
      if(response.type === "error"){
        setErrors(serializeErrors(response));
        toast.error("Failed to add road trip", {autoClose: 2000});
      }
      if(response.type === "success"){
        setFormData({ 
          carId: '', 
          deviceId: '', 
          startDate: '', 
          endDate: '', 
          distance: 0, 
          averageFuelConsumption: 0 
        });
        toast.success("Road trip added successfully!", {autoClose: 2000});
        fetchData();
      }
    } catch (err: any) {
      setErrors([err.message || 'Failed to add road trip']);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const result = await api.delete('/road-trip/delete', { id });
      if (result.type === 'success') {
        toast.success("Road trip deleted successfully!", {autoClose: 2000});
        fetchData();
      } else {
        toast.error("Delete failed", {autoClose: 2000});
      }
    } catch (err: any) {
      toast.error(err.message || 'Delete failed', {autoClose: 2000});
    }
  };

  const getVehicleName = (id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.name} (${v.registrationPlateNumber})` : id;
  };

  const getDriverName = (id: string) => {
    const d = drivers.find(d => d.id === id);
    return d ? `${d.name} ${d.surname}` : id;
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Add New Road Trip</h2>
        {errors && errors.length > 0 && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {errors.map((error, idx) => <div key={idx}>{error}</div>)}
          </div>
        )}
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="p-2 border rounded"
            value={formData.carId}
            onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
            required
          >
            <option value="">Select Vehicle</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.name} ({v.registrationPlateNumber})</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Device ID (GUID)"
            className="p-2 border rounded"
            value={formData.deviceId}
            onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
            required
          />

          <input
            type="datetime-local"
            className="p-2 border rounded"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
          <input
            type="datetime-local"
            className="p-2 border rounded"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Distance (km)"
            className="p-2 border rounded"
            value={formData.distance}
            onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) })}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Avg Fuel Consumption"
            className="p-2 border rounded"
            value={formData.averageFuelConsumption}
            onChange={(e) => setFormData({ ...formData, averageFuelConsumption: parseFloat(e.target.value) })}
            required
          />
          <button type="submit" className="md:col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Add Road Trip
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Road Trips List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Vehicle</th>
                <th className="p-2">Driver</th>
                <th className="p-2">Start</th>
                <th className="p-2">End</th>
                <th className="p-2">Distance</th>
                <th className="p-2">Fuel</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roadTrips.map(rt => (
                <tr key={rt.id} className="border-b">
                  <td className="p-2">{getVehicleName(rt.vehicleId)}</td>
                  <td className="p-2">{getDriverName(rt.driverId)}</td>
                  <td className="p-2">{new Date(rt.startDate).toLocaleString()}</td>
                  <td className="p-2">{new Date(rt.endDate).toLocaleString()}</td>
                  <td className="p-2">{rt.distance} km</td>
                  <td className="p-2">{rt.averageFuelConsumption} L/100km</td>
                  <td className="p-2">
                    <button onClick={() => handleDelete(rt.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {roadTrips.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">No road trips found.</td>
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
