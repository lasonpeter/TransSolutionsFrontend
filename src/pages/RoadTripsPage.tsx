
import { useEffect, useState } from 'react';
import {api, serializeErrors} from '../api/client';

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
  const [formData, setFormData] = useState({
    carId: '',
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
      const response = await api.post('/road-trip/create', {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      });
      if(response.type === "error"){
        setErrors(serializeErrors(response));
      }
      if(response.type === "success"){
        setFormData({ carId: '', startDate: '', endDate: '', distance: 0, averageFuelConsumption: 0 });
        fetchData();
      }
    } catch (err: unknown) {
      setErrors(err.message || 'Failed to add road trip');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete('/road-trip/delete', { id });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
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
        {errors && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{errors}</div>}
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
            placeholder="Distance (km)"
            className="p-2 border rounded"
            value={formData.distance}
            onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) })}
            required
          />
          <input
            type="number"
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
    </div>
  );
}
