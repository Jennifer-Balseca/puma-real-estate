import RoleGuard from '../components/RoleGuard';
import PropertyCatalog from '../components/PropertyCatalog';

const AgentInventory = () => {
  return (
    <RoleGuard allowedRoles={['Agente']}>
      <PropertyCatalog mode="agent" />
    </RoleGuard>
  );
};

export default AgentInventory;