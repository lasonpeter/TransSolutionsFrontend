
import { useEffect, useState } from 'react';
import {api, serializeErrors} from '../api/client';

interface DriverItem {
  id: string;
  name: string;
  surname: string;
  drivingLicenseCategories: number[];
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [formData, setFormData] = useState({ userId: '', categories: [] as number[] });
  const [errors, setErrors] = useState<string[]>([]);

  const fetchDrivers = async () => {
    try {
      const data = await api.get('/driver/get-drivers');
      if (data.type === 'success') {
        // TypeScript narrows result to SuccessResponse
        setDrivers(data.data.drivers || []);

      }
      if(data.type === "error"){
        setErrors(serializeErrors(data));
      }} catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/driver/create-driver', {
        userId: formData.userId, 
        drivingLicenseCategories: formData.categories 
      });
      if(response.type === "error"){
        setErrors(serializeErrors(response));
      }
      if(response.type === "success"){
        setFormData({ userId: '', categories: [] });
        fetchDrivers();
      }
    } catch (err: any) {
      setErrors(err.message || 'Failed to add driver');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete('/driver/delete-driver', { id });
      fetchDrivers();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const toggleCategory = (cat: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) 
        ? prev.categories.filter(c => c !== cat) 
        : [...prev.categories, cat]
    }));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Add New Driver</h2>
        {errors && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{errors}</div>}
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="User ID (GUID)"
            className="p-2 border rounded"
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            required
          />
          <div className="flex gap-4">
            {[0, 1, 2, 3].map(cat => (
              <label key={cat} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.categories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
                {['A', 'B', 'C', 'D'][cat]}
              </label>
            ))}
          </div>
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Add Driver
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Drivers List</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Surname</th>
              <th className="p-2">Categories</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.id} className="border-b">
                <td className="p-2">{d.name}</td>
                <td className="p-2">{d.surname}</td>
                <td className="p-2">
                  {d.drivingLicenseCategories?.map(c => ['A', 'B', 'C', 'D'][c]).join(', ') || 'None'}
                </td>
                <td className="p-2">
                  <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">No drivers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
