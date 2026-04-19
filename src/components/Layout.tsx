
import { Link, useNavigate } from 'react-router-dom';
import { getUserRole } from '../api/client';
import {ToastContainer} from "react-toastify";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = getUserRole();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">TransSolutions</Link>
          <div className="space-x-4">
            {token ? (
              <>
                <Link to="/drivers" className="text-gray-700 hover:text-blue-600">Drivers</Link>
                <Link to="/vehicles" className="text-gray-700 hover:text-blue-600">Vehicles</Link>
                <Link to="/roadtrips" className="text-gray-700 hover:text-blue-600">Road Trips</Link>
                {/* Only Admin (2) and Manager (1) can see Register (User Management) */}
                {(userRole === 1 || userRole === 2) && (
                  <Link to="/register" className="text-gray-700 hover:text-blue-600">Manage Users</Link>
                )}
                <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  );
}
