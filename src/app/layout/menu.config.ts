import { PERM } from '../core/models/permissions';
import { MenuNode } from './menu.model';


export const SIDEBAR_MENU: MenuNode[] = [
  {
    label: 'Dashboard',
    route: '/dashboard',
    permission: PERM.DASHBOARD_VIEW,
    icon: 'assets/img/sidebar-icons/dashboard.svg',
  },

  {
    label: 'Leads',
    permission: PERM.LEADS_VIEW,
    icon: 'assets/img/sidebar-icons/leads.svg',
    children: [
      { label: 'All Leads', route: '/leads', permission: PERM.LEADS_VIEW },
      { label: 'Create Lead', route: '/leads/new', permission: PERM.LEADS_CREATE },
      { label: 'Duplicate Leads', route: '/leads/duplicates', permission: PERM.LEADS_DUPLICATES_VIEW },

      { label: 'Requirements', route: '/leads/requirements', permission: PERM.LEAD_REQUIREMENTS_VIEW },
      { label: 'Hospital Reviews', route: '/leads/hospital-reviews', permission: PERM.LEAD_HOSPITAL_REVIEWS_VIEW },
      { label: 'Quotations', route: '/leads/quotations', permission: PERM.LEAD_QUOTATIONS_VIEW },
      { label: 'VIL', route: '/leads/vil', permission: PERM.LEAD_VIL_VIEW },
      { label: 'Activities', route: '/leads/activities', permission: PERM.LEAD_ACTIVITIES_VIEW },

      { label: 'Merge Leads', route: '/leads/merge', permission: PERM.LEADS_MERGE },
    ],
  },

  {
    label: 'Hospitals',
    route: '/hospitals',
    permission: PERM.HOSPITALS_VIEW,
    icon: 'assets/img/sidebar-icons/hospitals.svg',
  },

  {
    label: 'Treatments',
    permission: PERM.TREATMENTS_VIEW,
    icon: 'assets/img/sidebar-icons/treatments.svg',
    children: [
      { label: 'Categories', route: '/treatments/categories', permission: PERM.TREATMENTS_VIEW },
      { label: 'Treatments', route: '/treatments', permission: PERM.TREATMENTS_VIEW },
    ],
  },

  {
    label: 'Masters',
    route: '/masters',
    permission: PERM.MASTERS_VIEW,
    icon: 'assets/img/sidebar-icons/masters.svg',
  },
  {
    label: 'Users',
    route: '/users',
    permission: PERM.USERS_VIEW,
    icon: 'assets/img/sidebar-icons/users.svg',
  },
  {
    label: 'Reports',
    route: '/reports',
    permission: PERM.REPORTS_VIEW,
    icon: 'assets/img/sidebar-icons/reports.svg',
  },
];
