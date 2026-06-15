import { useEffect, useState } from 'react';
import { onPropertiesRefresh } from '../utils/propertyEvents';

const usePropertiesRefresh = () => {
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => onPropertiesRefresh(() => setRefreshTick((currentValue) => currentValue + 1)), []);

  return refreshTick;
};

export default usePropertiesRefresh;