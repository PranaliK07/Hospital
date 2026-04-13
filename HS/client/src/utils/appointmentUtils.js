export const normalizeStatus = (status) => {
  if (!status) return '';
  const value = String(status).trim().toLowerCase();
  if (value === 'cancelled') return 'canceled';
  if (value === 'scheduled') return 'scheduled';
  if (value === 'ongoing') return 'ongoing';
  if (value === 'admitted') return 'admitted';
  if (value === 'completed') return 'completed';
  if (value === 'discharged') return 'discharged';
  if (value === 'canceled') return 'canceled';
  return value;
};

export const statusLabel = (status) => {
  const value = normalizeStatus(status);
  const labels = {
    scheduled: 'Scheduled',
    ongoing: 'Ongoing',
    admitted: 'Admitted',
    completed: 'Completed',
    discharged: 'Discharged',
    canceled: 'Canceled',
  };
  return labels[value] || status || '';
};

export const statusVariant = (status) => {
  const value = normalizeStatus(status);
  if (value === 'completed' || value === 'discharged') return 'success';
  if (value === 'canceled') return 'danger';
  return 'warning';
};

export const normalizeVisitType = (visitType) => {
  if (!visitType) return 'OPD';
  const value = String(visitType).trim().toLowerCase();
  if (value === 'opd') return 'OPD';
  if (value === 'ipd') return 'IPD';
  if (value === 'emergency') return 'Emergency';
  return visitType;
};

export const visitTypeLabel = (visitType) => normalizeVisitType(visitType);
