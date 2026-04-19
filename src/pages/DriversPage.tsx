
import { useEffect, useState } from 'react';
import {api, serializeErrors, getUserRole} from '../api/client';
import {toast, ToastContainer} from "react-toastify";

interface DriverItem {
  id: string;
  name: string;
  surname: string;
  drivingLicenseCategories: number[];
}

interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({ userId: '', categories: [] as number[] });
  const [editingDriver, setEditingDriver] = useState<DriverItem | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const userRole = getUserRole(); // 0: Driver, 1: Manager, 2: Admin

  const fetchDrivers = async () => {
    try {
      const driverData = await api.get('/driver/get-drivers');
      if (driverData.type === 'success') {
        setDrivers(driverData.data.drivers || []);
      }
      if(driverData.type === "error"){
        setErrors(serializeErrors(driverData));
      }

      const userData = await api.get('/user/get-users');
      if (userData.type === 'success') {
        setUsers(userData.data.users || []);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId) {
      toast.error("Please select a user");
      return;
    }
    try {
      const response = await api.post('/driver/create-driver', {
        userId: formData.userId, 
        drivingLicenseCategories: formData.categories 
      });
      if(response.type === "error"){
        setErrors(serializeErrors(response));
        toast.error("Failed to add driver", {autoClose: 2000});
      }
      if(response.type === "success"){
        toast.success("Driver added successfully!", {autoClose: 2000});
        setFormData({ userId: '', categories: [] });
        fetchDrivers();
      }
    } catch (err: any) {
      setErrors([err.message || 'Failed to add driver']);
      toast.error("Failed to add driver", {autoClose: 2000});
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    try {
      const response = await api.put('/driver/update-driver', {
        id: editingDriver.id,
        drivingLicenseCategories: formData.categories
      });

      if (response.type === 'error') {
        setErrors(serializeErrors(response));
        toast.error("Failed to update driver", { autoClose: 2000 });
      } else {
        toast.success("Driver updated successfully!", { autoClose: 2000 });
        setEditingDriver(null);
        setFormData({ userId: '', categories: [] });
        fetchDrivers();
      }
    } catch (err: any) {
      setErrors([err.message || 'Failed to update driver']);
    }
  };

  const startEditing = (driver: DriverItem) => {
    setEditingDriver(driver);
    setFormData({
      userId: '', // Not needed for update
      categories: driver.drivingLicenseCategories || []
    });
    setErrors([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingDriver(null);
    setFormData({ userId: '', categories: [] });
    setErrors([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete('/driver/delete-driver', { id });
      fetchDrivers();
      toast.success("Driver deleted successfully!", {autoClose: 2000});
    } catch (err: any) {
      toast.error(err.message || "Failed to delete driver", {autoClose: 2000});
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

  // Only Admin (2) and Manager (1) can see the form
  const canManage = userRole === 1 || userRole === 2;

  return (
    <div className="space-y-8">
      {canManage && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">
            {editingDriver ? `Edit Driver: ${editingDriver.name} ${editingDriver.surname}` : 'Add New Driver'}
          </h2>
          {errors && errors.length > 0 && (
            <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
              {errors.map((err, idx) => <div key={idx}>{err}</div>)}
            </div>
          )}
          <form onSubmit={editingDriver ? handleUpdate : handleAdd} className="flex flex-col gap-4">
            {!editingDriver && (
              <select
                className="p-2 border rounded bg-white"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                required
              >
                <option value="">Select User</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.surname} ({u.email})
                  </option>
                ))}
              </select>
            )}
            <div className="flex flex-wrap gap-4">
              <span className="font-medium text-gray-700">Categories:</span>
              {[0, 1, 2, 3].map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm font-bold">
                    {['A', 'B', 'C', 'D'][cat]}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <button 
                type="submit" 
                className={`flex-1 ${editingDriver ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white p-2 rounded transition-colors`}
              >
                {editingDriver ? 'Update Driver Categories' : 'Add Driver'}
              </button>
              {editingDriver && (
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
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Drivers List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Surname</th>
                <th className="p-2">Categories</th>
                {canManage && <th className="p-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => (
                <tr 
                  key={d.id} 
                  className={`border-b hover:bg-gray-50 ${editingDriver?.id === d.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="p-2 font-medium">{d.name}</td>
                  <td className="p-2 font-medium">{d.surname}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      {d.drivingLicenseCategories?.map(c => (
                        <span key={c} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                          {['A', 'B', 'C', 'D'][c]}
                        </span>
                      )) || <span className="text-gray-400">None</span>}
                    </div>
                  </td>
                  {canManage && (
                    <td className="p-2">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => startEditing(d)} 
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(d.id)} 
                          className="text-red-600 hover:underline font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 4 : 3} className="p-4 text-center text-gray-500">No drivers found.</td>
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
