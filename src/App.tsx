
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DriversPage from './pages/DriversPage';
import VehiclesPage from './pages/VehiclesPage';
import RoadTripsPage from './pages/RoadTripsPage';
import MainPage from './pages/MainPage';

import { api, getUserRole } from './api/client';

function PrivateRoute({ children, roles }: { children: React.ReactNode, roles?: number[] }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  
  if (roles) {
    const userRole = getUserRole();
    if (userRole === null || !roles.includes(userRole)) {
      return <Navigate to="/" />;
    }
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/register" 
            element={
              <PrivateRoute roles={[1, 2]}>
                <RegisterPage />
              </PrivateRoute>
            } 
          />
          <Route path="/drivers" element={<PrivateRoute><DriversPage /></PrivateRoute>} />
          <Route path="/vehicles" element={<PrivateRoute><VehiclesPage /></PrivateRoute>} />
          <Route path="/roadtrips" element={<PrivateRoute><RoadTripsPage /></PrivateRoute>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
