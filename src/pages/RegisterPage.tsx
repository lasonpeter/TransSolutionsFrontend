
import { useState } from 'react';
import {api, getUserRole, serializeErrors} from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    surname: '',
    role: 0 // Driver by default
  });
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  const userRole = getUserRole(); // Current logged-in user role
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

      const response =  await api.post('/auth/register', formData);
      if (response.type === "success") {
        setFormData({ email: '', password: '', name: '', surname: '', role: 0 });
        alert('User created successfully');
      }
      if(response.type === "error"){
        setErrors(serializeErrors(response));

      }

  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New User</h2>
      {errors && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{errors}</div>}
      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded mt-1"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Surname</label>
          <input
            type="text"
            className="w-full p-2 border rounded mt-1"
            value={formData.surname}
            onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded mt-1"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded mt-1"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Role</label>
          <select
            className="w-full p-2 border rounded mt-1"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: parseInt(e.target.value) })}
          >
            <option value={0}>Driver</option>
            {userRole === 2 && (
              <>
                <option value={1}>Manager</option>
                <option value={2}>Admin</option>
              </>
            )}
          </select>
        </div>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Create User
        </button>
      </form>
    </div>
  );
}
