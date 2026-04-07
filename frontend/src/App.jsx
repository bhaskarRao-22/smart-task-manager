import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import socketService from './services/socketService'

// Layout
import DashboardLayout from './components/layout/DashboardLayout'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TasksPage from './pages/TasksPage'
import TaskDetailPage from './pages/TaskDetailPage'
import UsersPage from './pages/UsersPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

// ─── Protected Route ──────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

// ─── Admin Route ──────────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const user = useAuthStore((s) => s.user)
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

// ─── Guest Route (redirect if logged in) ─────────────────────
const GuestRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

// ─── App ──────────────────────────────────────────────────────
function App() {
  const { isAuthenticated, user } = useAuthStore()

  // Connect socket when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      socketService.connect(user.id)
    } else {
      socketService.disconnect()
    }

    return () => {
      if (!isAuthenticated) {
        socketService.disconnect()
      }
    }
  }, [isAuthenticated, user?.id])

  return (
    <Routes>
      {/* Guest Routes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="tasks/:id" element={<TaskDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Admin Only */}
        <Route
          path="users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App