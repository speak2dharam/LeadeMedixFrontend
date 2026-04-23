import { PERM, type PermissionCode } from './permissions';

export type AppRole =
  | 'ADMIN'
  | 'COORDINATOR'
  | 'GROUNDSTAFF'
  | 'PARTNER'
  | 'MANAGER'
  | 'DIGITAL_MARKETING';

// Coordinator
const coordinatorPerms: PermissionCode[] = [
  PERM.DASHBOARD_VIEW,

  PERM.LEADS_VIEW,
  PERM.LEADS_CREATE,
  PERM.LEADS_DUPLICATES_VIEW,

  PERM.LEAD_REQUIREMENTS_VIEW,
  PERM.LEAD_HOSPITAL_REVIEWS_VIEW,
  PERM.LEAD_QUOTATIONS_VIEW,
  PERM.LEAD_VIL_VIEW,
  PERM.LEAD_ACTIVITIES_VIEW,

  PERM.HOSPITALS_VIEW,
  PERM.TREATMENTS_VIEW,
];

// Ground staff: workflow, view-only
const groundStaffPerms: PermissionCode[] = [
  PERM.DASHBOARD_VIEW,
  PERM.LEADS_VIEW,

  PERM.LEAD_REQUIREMENTS_VIEW,
  PERM.LEAD_HOSPITAL_REVIEWS_VIEW,
  PERM.LEAD_QUOTATIONS_VIEW,
  PERM.LEAD_VIL_VIEW,
  PERM.LEAD_ACTIVITIES_VIEW,

  PERM.HOSPITALS_VIEW,
  PERM.TREATMENTS_VIEW,
];

// Partner: limited view
const partnerPerms: PermissionCode[] = [
  PERM.DASHBOARD_VIEW,
  PERM.LEADS_VIEW,
  PERM.LEAD_HOSPITAL_REVIEWS_VIEW,
  PERM.LEAD_QUOTATIONS_VIEW,
  PERM.LEAD_VIL_VIEW,
  PERM.HOSPITALS_VIEW,
  PERM.TREATMENTS_VIEW,
];

// Digital Marketing: minimal
const digitalMarketingPerms: PermissionCode[] = [
  PERM.DASHBOARD_VIEW,
  PERM.LEADS_VIEW,
  PERM.LEAD_ACTIVITIES_VIEW,
];

// Manager (your decision #3): no Masters/Users/Reports
const managerPerms: PermissionCode[] = [
  ...coordinatorPerms,
  PERM.LEADS_MERGE,
];

// Admin: everything
const adminPerms: PermissionCode[] = [
  ...managerPerms,
  PERM.MASTERS_VIEW,
  PERM.USERS_VIEW,
  PERM.REPORTS_VIEW,
];

export const ROLE_PERMISSIONS: Record<AppRole, PermissionCode[]> = {
  ADMIN: adminPerms,
  MANAGER: managerPerms,
  COORDINATOR: coordinatorPerms,
  GROUNDSTAFF: groundStaffPerms,
  PARTNER: partnerPerms,
  DIGITAL_MARKETING: digitalMarketingPerms,
};

export function buildPermissionsFromRoles(roles: string[]): Set<string> {
  const set = new Set<string>();

  for (const r of roles) {
    const role = r as AppRole;
    const perms = ROLE_PERMISSIONS[role];
    if (!perms) continue;
    perms.forEach(p => set.add(p));
  }

  return set;
}