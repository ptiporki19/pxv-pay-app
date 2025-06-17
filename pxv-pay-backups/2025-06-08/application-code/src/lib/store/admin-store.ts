import { create } from 'zustand'

type FormType = 'country' | 'currency' | 'payment-method'
type ModalAction = 'create' | 'edit'

interface AdminState {
  // Modal state
  isModalOpen: boolean
  modalType: FormType | null
  modalAction: ModalAction | null
  currentItem: any

  // Actions
  openModal: (type: FormType, action: ModalAction, item?: any) => void
  closeModal: () => void
  setCurrentItem: (item: any) => void
  
  // Search state
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // Refresh flag
  refreshFlag: number
  setRefreshFlag: () => void
}

export const useAdminStore = create<AdminState>((set) => ({
  // Initial state
  isModalOpen: false,
  modalType: null,
  modalAction: null,
  currentItem: null,
  searchQuery: '',
  refreshFlag: 0,
  
  // Modal actions
  openModal: (type, action, item = null) => set({
    isModalOpen: true,
    modalType: type,
    modalAction: action,
    currentItem: item
  }),
  
  closeModal: () => set({
    isModalOpen: false,
    modalType: null,
    modalAction: null,
    currentItem: null
  }),
  
  setCurrentItem: (item) => set({ currentItem: item }),
  
  // Search actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Refresh action to trigger data refetching
  setRefreshFlag: () => set((state) => ({ refreshFlag: state.refreshFlag + 1 }))
})) 