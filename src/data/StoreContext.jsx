import { createContext, useContext, useEffect, useSyncExternalStore } from 'react'
import { subscribe, getSnapshot, syncFromCloud } from './store'

const StoreContext = createContext(null)

/**
 * Subscribes the tree to the localStorage-backed document. `store.js` swaps the
 * snapshot object on every mutation, so `useSyncExternalStore` re-renders every
 * consumer without each component poking at localStorage itself.
 */
export function StoreProvider({ children }) {
  const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  // Pull the cloud copy once per page load. It is a no-op without Supabase
  // credentials, and never blocks the first paint — localStorage already has
  // everything the page needs to render.
  useEffect(() => {
    syncFromCloud()
  }, [])

  return <StoreContext.Provider value={data}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

export const useServices = () => useStore().services
export const useBrands = () => useStore().brands
export const useAmcPlans = () => useStore().amcPlans
export const useEnquiries = () => useStore().enquiries
export const useBookings = () => useStore().bookings
export const useAnalytics = () => useStore().analytics
export const useReviews = () => useStore().reviews
export const useSync = () => useStore().sync
