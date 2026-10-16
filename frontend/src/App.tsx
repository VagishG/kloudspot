import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { ToastProvider } from './components/ui'
import { AuthProvider } from './context/AuthProvider'
import { AdminsPage } from './pages/AdminsPage'
import { DepartmentsPage } from './pages/DepartmentsPage'
import { EmployeeDetailsPage } from './pages/EmployeeDetailsPage'
import { EmployeeEditPage } from './pages/EmployeeEditPage'
import { EmployeeNewPage } from './pages/EmployeeNewPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/employees" replace />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/employees/new" element={<EmployeeNewPage />} />
              <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
              <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/admins" element={<AdminsPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
