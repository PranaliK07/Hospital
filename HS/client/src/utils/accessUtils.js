export const reportCategoryRoutes = [
  '/patient-reports',
  '/doctor-reports',
  '/billing-reports',
  '/appointment-reports',
  '/staff-reports',
];

export const expandAllowedRoutes = (routes = []) => {
  const expanded = new Set(routes || []);

  if (expanded.has('/reports')) {
    reportCategoryRoutes.forEach((route) => expanded.add(route));
  }

  return Array.from(expanded);
};

export const getSidebarRoutes = (routes = []) => {
  const sidebarRoutes = new Set(routes || []);
  const hasReportAccess =
    sidebarRoutes.has('/reports') ||
    reportCategoryRoutes.some((route) => sidebarRoutes.has(route));

  reportCategoryRoutes.forEach((route) => sidebarRoutes.delete(route));

  if (hasReportAccess) {
    sidebarRoutes.add('/reports');
  }

  return Array.from(sidebarRoutes);
};
