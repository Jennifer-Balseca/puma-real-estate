import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PlaceholderPage from './components/PlaceholderPage';
import Nosotros from './pages/Nosotros';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import AgentLayout from './layouts/AgentLayout';
import PublicLayout from './layouts/PublicLayout';
import { useAuth } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminVisitRequests from './pages/AdminVisitRequests';
import AdminAgentes from './pages/AdminAgentes';
import AdminProperties from './pages/AdminProperties';
import AgentDashboard from './pages/AgentDashboard';
import AgentInventory from './pages/AgentInventory';
import AgentRequests from './pages/AgentRequests';
import AgentAgenda from './pages/AgentAgenda';
import AgentNewProperty from './pages/AgentNewProperty';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Propiedades from './pages/Propiedades';
import PropertyDetail from './pages/PropertyDetail';
import Contacto from './pages/Contacto';
import socket from './socket';

const App = () => {
  const { initializing, isAuthenticated, role, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      socket.emit('auth:join', { userId: user._id, role: role || user.role || user.rol });
      console.log('Socket emitted auth:join for user:', user._id);
    }
  }, [isAuthenticated, user, role]);

  if (initializing) {
    return null;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={role === 'Admin' ? '/admin' : '/agente'} replace />
          ) : (
            <Navigate to="/inicio" replace />
          )
        }
      />

      <Route element={<PublicLayout />}>
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/propiedades" element={<Propiedades />} />
        <Route path="/propiedades/:id" element={<PropertyDetail />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/visitas" element={<AdminVisitRequests />} />
          <Route path="/admin/agentes" element={<AdminAgentes />} />
          <Route path="/admin/propiedades" element={<AdminProperties />} />
          <Route path="/admin/nueva-propiedad" element={<AgentNewProperty />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Agente']} />}>
        <Route path="/agente" element={<AgentDashboard />} />
        <Route element={<AgentLayout />}>
          <Route path="/agente/inventario" element={<AgentInventory />} />
          <Route path="/agente/solicitudes" element={<AgentRequests />} />
          <Route path="/agente/agenda" element={<AgentAgenda />} />
          <Route path="/agente/nueva-propiedad" element={<AgentNewProperty />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
};

export default App;