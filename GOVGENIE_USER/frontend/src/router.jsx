"use client"
import { useAuthStore } from "./store/authStore"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { useEffect } from "react"
import { useTheme } from "./context/ThemeContext"
import MainLayout from "./layouts/MainLayout"
import AuthLayout from "./layouts/AuthLayout"
import LandingPage from "./pages/LandingPage"

import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/SignUpPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import EmailVerificationPage from "./pages/EmailVerificationPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"

import Dashboard from "./pages/dashboard/Dashboard"
import DocumentsPage from "./pages/dashboard/DocumentsPage"
import OrdersPage from "./pages/dashboard/OrdersPage"
import OrderDetailPage from "./pages/dashboard/OrderDetailPage"
import ChatWithAgentPage from "./pages/dashboard/ChatWithAgentPage"
import ScheduleCallPage from "./pages/dashboard/ScheduleCallPage"
import ProfilePage from "./pages/dashboard/ProfilePage"
import RoomPage from "./pages/VideoCall"

import ServicesPage from "./pages/services/ServicesPage"
import ServiceDetailPage from "./pages/services/ServiceDetailPage"

import AgentsPage from "./pages/agents/AgentsPage"
import AgentDetailPage from "./pages/agents/AgentDetailPage"

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

const Router = () => {
  const { theme } = useTheme()

  useEffect(() => {
   
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: <LandingPage />,
        },
        {
          path: "services",
          element: <ServicesPage />,
        },
        {
          path: "services/:serviceId",
          element: <ServiceDetailPage />,
        },
        {
          path: "agents",
          element: <AgentsPage />,
        },
        {
          path: "agents/:agentId",
          element: <AgentDetailPage />,
        },
        {
          path: "dashboard",
          element: (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          ),
        },
        {
          path: "dashboard/documents",
          element: (
            <ProtectedRoute>
              <DocumentsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "dashboard/orders",
          element: (
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "dashboard/orders/:orderId",
          element: (
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "dashboard/orders/:orderId/chat",
          element: (
            <ProtectedRoute>
              <ChatWithAgentPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "dashboard/orders/:orderId/schedule-call",
          element: (
            <ProtectedRoute>
              <ScheduleCallPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "dashboard/profile",
          element: (
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [
        {
          path: "login",
          element: <LoginPage />,
        },
        {
          path: "register",
          element: <RegisterPage />,
        },
        {
          path: "forgot-password",
          element: <ForgotPasswordPage />,
        },
      ],
    },
  ])

  return <RouterProvider router={router} />
}

export default Router

