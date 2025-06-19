export type UserRole = 'super_admin' | 'registered_user' | 'subscriber' | 'free_user'

// Define permission checks for different roles and features
const PERMISSIONS = {
  // Super Admin can do everything
  'super_admin': {
    userManagement: true,
    blogManagement: true,
    countryManagement: true,
    currencyManagement: true,
    paymentMethodManagement: true,
    linkingMatrix: true,
    analytics: true,
    auditLogs: true,
    themeCustomization: true,
    contentManagement: true,
  },
  // Registered User can do most things except user management and audit logs in MVP
  'registered_user': {
    userManagement: false,
    blogManagement: false,
    countryManagement: true,
    currencyManagement: true,
    paymentMethodManagement: true,
    linkingMatrix: true,
    analytics: true,
    auditLogs: false,
    themeCustomization: false,
    contentManagement: false,
  },
  // Subscriber (future role)
  'subscriber': {
    userManagement: false,
    blogManagement: false,
    countryManagement: true,
    currencyManagement: true,
    paymentMethodManagement: true,
    linkingMatrix: true,
    analytics: true,
    auditLogs: false,
    themeCustomization: true,
    contentManagement: true,
  },
  // Free User (future role)
  'free_user': {
    userManagement: false,
    blogManagement: false,
    countryManagement: false,
    currencyManagement: false,
    paymentMethodManagement: false,
    linkingMatrix: false,
    analytics: false,
    auditLogs: false,
    themeCustomization: false,
    contentManagement: false,
  },
}

// Type for available permissions
export type Permission = keyof typeof PERMISSIONS['super_admin']

// Check if a user has a specific permission
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return PERMISSIONS[role]?.[permission] || false
}

// Get all permissions for a role
export const getRolePermissions = (role: UserRole) => {
  return PERMISSIONS[role] || {}
} 