const PROPERTY_REFRESH_EVENT = 'puma:properties-changed';

const emitPropertiesRefresh = () => {
  window.dispatchEvent(new CustomEvent(PROPERTY_REFRESH_EVENT));
};

const onPropertiesRefresh = (handler) => {
  window.addEventListener(PROPERTY_REFRESH_EVENT, handler);

  return () => window.removeEventListener(PROPERTY_REFRESH_EVENT, handler);
};

export { PROPERTY_REFRESH_EVENT, emitPropertiesRefresh, onPropertiesRefresh };