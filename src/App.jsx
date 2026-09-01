import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './data/StoreContext'
import PublicSite from './routes/PublicSite'
import RequireAuth from './components/admin/RequireAuth'

// The admin portal (and the chart library it pulls in) is split out so visitors
// to the public site never download it.

const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminLogin = lazy(() => import('./routes/admin/AdminLogin'))
const AdminHome = lazy(() => import('./routes/admin/AdminHome'))
const AdminEnquiries = lazy(() => import('./routes/admin/AdminEnquiries'))
const AdminBookings = lazy(() => import('./routes/admin/AdminBookings'))
const AdminContent = lazy(() => import('./routes/admin/AdminContent'))
const AdminPricing = lazy(() => import('./routes/admin/AdminPricing'))
const AdminInvoices = lazy(() => import('./routes/admin/AdminInvoices'))
const AdminCloud = lazy(() => import('./routes/admin/AdminCloud'))
const AdminSecurity = lazy(() => import('./routes/admin/AdminSecurity'))

export default function App() {
  return (
    <StoreProvider>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<PublicSite />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="cloud" element={<AdminCloud />} />
            <Route path="security" element={<AdminSecurity />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </StoreProvider>
  )
}
