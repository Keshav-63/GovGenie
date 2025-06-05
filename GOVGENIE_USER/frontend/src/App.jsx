import { Navigate, Route, Routes } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LoadingScreen from "./components/common/LoadingScreen";
import { useTheme } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Pages
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/dashboard/Dashboard"
import DocumentsPage from "./pages/dashboard/DocumentsPage";
import OrdersPage from "./pages/dashboard/OrdersPage";
import OrderDetailPage from "./pages/dashboard/OrderDetailPage";
import ChatWithAgentPage from "./pages/dashboard/ChatWithAgentPage";
import ScheduleCallPage from "./pages/dashboard/ScheduleCallPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import ServicesPage from "./pages/services/ServicesPage";
import ServiceDetailPage from "./pages/services/ServiceDetailPage";
import AgentsPage from "./pages/agents/AgentsPage";
import AgentDetailPage from "./pages/agents/AgentDetailPage";
import NotFoundPage from "./pages/NotFoundPage";
import RoomPage from "./pages/VideoCall.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/auth/verify-email" replace />;
  }

  return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { isCheckingAuth, checkAuth, user } = useAuthStore();
  const { theme } = useTheme();
	
	

  useEffect(() => {

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-black items-center justify-center relative overflow-hidden">
      <Routes>
       
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          
        </Route>


        <Route path="/auth" element={<AuthLayout />}>
          <Route
            path="signup"
            element={
              <RedirectAuthenticatedUser>
                <SignUpPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="login"
            element={
              <RedirectAuthenticatedUser>
                <LoginPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route path="verify-email" element={<EmailVerificationPage />} />
          <Route
            path="forgot-password"
            element={
              <RedirectAuthenticatedUser>
                <ForgotPasswordPage />
              </RedirectAuthenticatedUser>
            }
          />

          <Route
            path="reset-password/:token"
            element={
              <RedirectAuthenticatedUser>
                <ResetPasswordPage />
              </RedirectAuthenticatedUser>
            }
          />
        </Route>

     
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          
          <Route path="/dashboard/room/:orderId" element={<RoomPage />} />
          <Route index element={<Dashboard />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="orders/:orderId/chat" element={<ChatWithAgentPage />} />
          <Route
            path="orders/:orderId/schedule-call"
            element={<ScheduleCallPage />}
          />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/services" element={<MainLayout />}>
          <Route index element={<ServicesPage />} />
          <Route path=":serviceId" element={<ServiceDetailPage />} />
        </Route>

        <Route path="/agents" element={<MainLayout />}>
          <Route index element={<AgentsPage />} />
          <Route path=":agentId" element={<AgentDetailPage />} />
        </Route>

     
        <Route
          path="/auth/*"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
