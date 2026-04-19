
import { useState, useEffect } from 'react';
import {api, getUserRole, serializeErrors} from '../api/client';
import { ToastContainer, toast } from 'react-toastify';

export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
}

export interface UserListResponse {
  users: User[];
  totalCount: number;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    surname: '',
    role: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [registerErrors, setRegisterErrors] = useState<string[]>([]);
  const userRole = getUserRole();

  const fetchUsers = async () => {
    const result = await api.get('/user/get-users');
    if (result.type == 'error') {
      setErrors(serializeErrors(result));
      return;
      console.log(result)
    }
    if (result.type == 'success') {
      setUsers(result.data.users);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await api.post('/auth/register', formData);

    if (result.type === 'error') {
      setRegisterErrors(serializeErrors(result));
      toast.error("Errors", { autoClose: 2000});
      return;
    }
    if (result.type === 'success') {
      setFormData({ email: '', password: '', name: '', surname: '', role: 0 });
      toast.success("User registered", { autoClose: 2000});
      fetchUsers();
    }
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID copied to clipboard!", { autoClose: 2000});
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Create New User</h2>
        {registerErrors && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{registerErrors}</div>}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              className="p-2 border rounded"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Surname"
              className="p-2 border rounded"
              value={formData.surname}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="email"
              placeholder="Email"
              className="p-2 border rounded"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="p-2 border rounded"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <select
            className="p-2 border rounded"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: parseInt(e.target.value) })}
            required
          >
            <option value={0}>Driver</option>
            {userRole === 2 && (
              <>
                <option value={1}>Manager</option>
                <option value={2}>Admin</option>
              </>
            )}
          </select>
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Create User
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Users List</h2>
        {errors && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{errors}</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Name</th>
                <th className="p-2">Surname</th>
                <th className="p-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr 
                  key={user.id} 
                  className="border-b cursor-pointer hover:bg-gray-50"
                  onClick={() => copyToClipboard(user.id)}
                  title="Click to copy GUID"
                >
                  <td className="p-2 font-medium">{user.name}</td>
                  <td className="p-2 font-medium">{user.surname}</td>
                  <td className="p-2">{user.email}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">No users found.</td>
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
