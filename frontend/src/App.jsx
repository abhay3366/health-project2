import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import AdminDashboard from "./pages/AdminDashboard";
// import CoachDashboard from "./pages/CoachDashboard";
// import UserDashboard from "./pages/UserDashboard";
import "./index.css";
import AdminLayout from "./layouts/AdminLayouts";
import CoachLayout from "./layouts/CoachLayouts";
import UserLayout from "./layouts/UserLayout";

const queryClient = new QueryClient();
function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "coach") return <Navigate to="/coach" replace />;
  return <Navigate to="/user" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                {/* <AdminDashboard /> */}
                <AdminLayout/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach/*"
            element={
              <ProtectedRoute allowedRoles={["coach"]}>
                {/* <CoachDashboard /> */}
                <CoachLayout/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/*"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
               <UserLayout/>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  );
}
