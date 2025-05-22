import { create } from 'zustand'

// Define User type
type User = {
  id: string
  email: string
  role: 'super_admin' | 'registered_user' | 'subscriber' | 'free_user'
  active: boolean
}

// Define AuthStore state and actions
interface AuthStore {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

// Create AuthStore
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ isLoading: loading }),
}))

// Define AdminUIStore for navigation state
interface AdminUIStore {
  activePath: string
  setActivePath: (path: string) => void
}

// Create AdminUIStore
export const useAdminUIStore = create<AdminUIStore>((set) => ({
  activePath: '',
  setActivePath: (path) => set({ activePath: path }),
}))

// Define MerchantUIStore for merchant dashboard navigation
interface MerchantUIStore {
  activeNav: string
  sidebarCollapsed: boolean
  setActiveNav: (nav: string) => void
  toggleSidebar: () => void
}

// Create MerchantUIStore
export const useMerchantUIStore = create<MerchantUIStore>((set) => ({
  activeNav: 'countries',
  sidebarCollapsed: false,
  setActiveNav: (nav) => set({ activeNav: nav }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
})) 