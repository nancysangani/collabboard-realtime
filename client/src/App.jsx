import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ErrorBoundary from "./components/ErrorBoundary";
import AppLayout from "./components/Layout/AppLayout";
import ProtectedRoute from "./components/UI/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Dashboard from "./pages/Dashboard";
import ProjectView from "./pages/ProjectView";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "var(--bg3)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontSize: 13,
                },
                success: {
                  iconTheme: { primary: "#22c55e", secondary: "var(--bg3)" },
                },
                error: {
                  iconTheme: { primary: "#ef4444", secondary: "var(--bg3)" },
                },
              }}
            />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/settings/password" element={<ProtectedRoute><ResetPasswordPage /></ProtectedRoute>} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Dashboard />} />
                <Route path="/projects/:id" element={<ProjectView />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
