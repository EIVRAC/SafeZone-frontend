import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import RoleDashboard from './pages/RoleDashboard'
import AllReports from './pages/AllReports'
import CreateReport from './pages/CreateReport'
import MyReports from './pages/MyReports'
import ReportDetail from './pages/ReportDetail'
import EditReport from './pages/EditReport'
import Categories from './pages/Categories'
import Locations from './pages/Locations'
import Agencies from './pages/Agencies'
import UsersPage from './pages/UsersPage'
import StaffsPage from './pages/StaffsPage'
import MapsHeatmap from './pages/MapsHeatmap'
import ExportData from './pages/ExportData'
import AuditLogs from './pages/AuditLogs'
import Settings from './pages/Settings'
import HelpSupport from './pages/HelpSupport'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/"
          element={<RoleDashboard />}
        />

        <Route
          path="/reports"
          element={<AllReports />}
        />

        <Route
          path="/reports/new"
          element={<CreateReport />}
        />

        <Route
          path="/reports/mine"
          element={<MyReports />}
        />

        <Route
          path="/reports/:id/edit"
          element={<EditReport />}
        />

        <Route
          path="/reports/:id"
          element={<ReportDetail />}
        />

        <Route
          path="/categories"
          element={<Categories />}
        />

        <Route
          path="/locations"
          element={<Locations />}
        />

        <Route
          path="/agencies"
          element={<Agencies />}
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute adminOnly>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute adminOnly>
              <StaffsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/maps"
          element={<MapsHeatmap />}
        />

        <Route
          path="/export"
          element={<ExportData />}
        />

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute adminOnly>
              <AuditLogs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

        <Route
          path="/help"
          element={<HelpSupport />}
        />
      </Route>

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  )
}

export default App