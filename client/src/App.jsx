import { Navigate, Route, Routes } from 'react-router-dom';
import PlaceholderPage from './components/PlaceholderPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import AgentLayout from './layouts/AgentLayout';
import PublicLayout from './layouts/PublicLayout';
import { useAuth } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminAgentes from './pages/AdminAgentes';
import AdminProperties from './pages/AdminProperties';
import AgentDashboard from './pages/AgentDashboard';
import AgentInventory from './pages/AgentInventory';
import AgentNewProperty from './pages/AgentNewProperty';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

const App = () => {
  const { initializing, isAuthenticated, role } = useAuth();

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
        <Route
          path="/nosotros"
          element={
            <PlaceholderPage
              subtitle="Nosotros"
              title="Historia, valores y visión"
              
            />
          }
        />
        <Route
          path="/contacto"
          element={
            <PlaceholderPage
              subtitle="Contacto"
              title="Comunicación directa"
              
            />
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/agentes" element={<AdminAgentes />} />
          <Route path="/admin/propiedades" element={<AdminProperties />} />
          <Route path="/admin/nueva-propiedad" element={<AgentNewProperty />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Agente']} />}>
        <Route path="/agente" element={<AgentDashboard />} />
        <Route element={<AgentLayout />}>
          <Route path="/agente/inventario" element={<AgentInventory />} />
          <Route
            path="/agente/solicitudes"
            element={
              <PlaceholderPage
                subtitle="Solicitudes Disponibles"
                title="Cola de solicitudes"
                description="Vista base para revisar y priorizar las solicitudes que esperan atención."
              />
            }
          />
          <Route
            path="/agente/agenda"
            element={
              <PlaceholderPage
                subtitle="Mi Agenda"
                title="Agenda operativa"
                description="Vista base para controlar visitas programadas, pendientes y completadas."
              />
            }
          />
          <Route path="/agente/nueva-propiedad" element={<AgentNewProperty />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
};

export default App;