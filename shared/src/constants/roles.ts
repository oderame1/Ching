import { UserRole } from '../types/user';

export const ROLES = {
  BUYER: UserRole.BUYER,
  SELLER: UserRole.SELLER,
  ADMIN: UserRole.ADMIN,
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.BUYER]: ['create_escrow', 'pay_escrow', 'confirm_received'],
  [UserRole.SELLER]: ['create_escrow', 'mark_delivered'],
  [UserRole.ADMIN]: [
    'view_all_escrows',
    'release_funds',
    'refund_funds',
    'cancel_escrow',
    'view_users',
    'view_audit_logs',
  ],
};

