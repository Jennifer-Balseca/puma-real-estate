export const formatLocalDate = (dateVal) => {
  if (!dateVal) return '-';
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
};
