import type { PermissionCode } from '../core/models/permissions';

export type MenuNode = {
  label: string;
  icon?: string;
  route?: string;
  permission?: PermissionCode;
  children?: MenuNode[];
};