import { Shield, User, DollarSign, Users, Phone, Lock, HeadphonesIcon, Wrench, Utensils, HelpCircle } from 'lucide-react'

export interface RoleConfig {
  name: string
  color: string
  icon: any
  description: string
  userType: string // Maps to backend user type codes
  permissions: string[]
}

export const HOTEL_ROLES: RoleConfig[] = [
  {
    name: 'GOD Admin',
    color: 'bg-black text-white',
    icon: Shield,
    description: 'Full system access - create, edit, delete everything',
    userType: '1',
    permissions: ['*']
  },
  {
    name: 'Super Admin',
    color: 'bg-red-100 text-red-800',
    icon: Shield,
    description: 'Full access except delete operations',
    userType: '2',
    permissions: ['admin', 'manage', 'view']
  },
  {
    name: 'Hotel Admin',
    color: 'bg-purple-100 text-purple-800',
    icon: Shield,
    description: 'Hotel management, no system-level access',
    userType: '3',
    permissions: ['hotel.manage', 'staff.manage', 'bookings.manage']
  },
  {
    name: 'Manager',
    color: 'bg-blue-100 text-blue-800',
    icon: User,
    description: 'Department management and operations oversight',
    userType: '4',
    permissions: ['bookings.view', 'staff.view', 'reports.view']
  },
  {
    name: 'Finance Department',
    color: 'bg-green-100 text-green-800',
    icon: DollarSign,
    description: 'Financial reports and billing management',
    userType: '5',
    permissions: ['finance.view', 'reports.financial']
  },
  {
    name: 'Front Desk',
    color: 'bg-indigo-100 text-indigo-800',
    icon: Users,
    description: 'Check-in/out, reservations, guest services',
    userType: '6',
    permissions: ['checkin', 'checkout', 'bookings.view']
  },
  {
    name: 'Booking Agent',
    color: 'bg-cyan-100 text-cyan-800',
    icon: Phone,
    description: 'Reservation management and booking coordination',
    userType: '7',
    permissions: ['bookings.create', 'bookings.update']
  },
  {
    name: 'Gatekeeper',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Lock,
    description: 'Security and access control',
    userType: '8',
    permissions: ['security.access']
  },
  {
    name: 'Support',
    color: 'bg-pink-100 text-pink-800',
    icon: HelpCircle,
    description: 'Guest support and assistance',
    userType: '9',
    permissions: ['support.guest']
  },
  {
    name: 'Tech Support',
    color: 'bg-gray-100 text-gray-800',
    icon: HeadphonesIcon,
    description: 'Technical support and system maintenance',
    userType: '0',
    permissions: ['tech.support']
  },
  {
    name: 'Service Boy',
    color: 'bg-orange-100 text-orange-800',
    icon: User,
    description: 'Room service and guest assistance',
    userType: '1', // Reusing type 1 for different category
    permissions: ['service.room']
  },
  {
    name: 'Maintenance',
    color: 'bg-red-100 text-red-800',
    icon: Wrench,
    description: 'Facility maintenance and repairs',
    userType: '2', // Reusing type 2 for different category
    permissions: ['maintenance.room']
  },
  {
    name: 'Kitchen',
    color: 'bg-emerald-100 text-emerald-800',
    icon: Utensils,
    description: 'Kitchen operations and food service',
    userType: '3', // Reusing type 3 for different category
    permissions: ['kitchen.operations']
  }
]

export const ROLE_COLORS = HOTEL_ROLES.reduce((acc, role) => {
  acc[role.name] = role.color
  return acc
}, {} as Record<string, string>)

export const ROLE_ICONS = HOTEL_ROLES.reduce((acc, role) => {
  acc[role.name] = role.icon
  return acc
}, {} as Record<string, any>)

export const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
  suspended: 'bg-yellow-100 text-yellow-800'
}

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' }
]

export const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  ...HOTEL_ROLES.map(role => ({ value: role.name, label: role.name }))
]

// Helper functions
export function getRoleConfig(roleName: string): RoleConfig | undefined {
  return HOTEL_ROLES.find(role => role.name === roleName)
}

export function getRoleColor(roleName: string): string {
  return ROLE_COLORS[roleName] || 'bg-gray-100 text-gray-800'
}

export function getRoleIcon(roleName: string): any {
  return ROLE_ICONS[roleName] || User
}