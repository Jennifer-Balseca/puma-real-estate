import { Navigate, Route, Routes } from 'react-router-dom';
import PlaceholderPage from './components/PlaceholderPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import AgentLayout from './layouts/AgentLayout';
import PublicLayout from './layouts/PublicLayout';
import { useAuth } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminAgentes from './pages/AdminAgentes';
import AgentDashboard from './pages/AgentDashboard';
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
        <Route
          path="/inicio"
          element={
            <PlaceholderPage
              subtitle="Inicio"
              title="Bienvenido a Puma Real Estate"
              description="Portal público de la inmobiliaria, pensado para mostrar propiedades, servicios y acceso al panel de gestión."
            />
          }
        />
        <Route
          path="/nosotros"
          element={
            <PlaceholderPage
              subtitle="Nosotros"
              title="Historia, valores y visión"
              description="Sección informativa para presentar la marca, el enfoque premium y la propuesta de valor de Puma Real Estate."
            />
          }
        />
        <Route
          path="/contacto"
          element={
            <PlaceholderPage
              subtitle="Contacto"
              title="Comunicación directa"
              description="Zona para los datos de contacto, botones rápidos y futuros canales de atención al cliente."
            />
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/agentes" element={<AdminAgentes />} />
          <Route
            path="/admin/propiedades"
            element={
              <PlaceholderPage
                subtitle="Propiedades"
                title="Inventario administrativo"
                description="Vista base para supervisar el inventario general y su estado dentro del sistema."
              />
            }
          />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Agente']} />}>
        <Route path="/agente" element={<AgentDashboard />} />
        <Route element={<AgentLayout />}>
          <Route
            path="/agente/inventario"
            element={
              <PlaceholderPage
                subtitle="Inventario"
                title="Inventario asignado"
                description="Sección base para listar, crear y editar las propiedades del agente."
              />
            }
          />
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
          <Route
            path="/agente/nueva-propiedad"
            element={
              <PlaceholderPage
                subtitle="Registrar Propiedad"
                title="Alta de propiedades"
                description="Formulario base para dar de alta nuevas propiedades asignadas al agente."
              />
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
};

export default App;