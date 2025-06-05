import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import AgentRegister from "./pages/AgentRegisterForm";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyAgent from "./pages/VerifyAgent";
import LoadingSpinner from "./components/LoadingSpinner";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";


//pages/agent
import Dashboard from "./pages/agent/Dashboard";
import ServiceManagement from "./pages/agent/ServiceManagement";
import OrderManagement from "./pages/agent/OrderManagement";
import Ratings from "./pages/agent/Ratings";
import Transactions from "./pages/agent/Transactions";
import Communication from "./pages/agent/Communication";
import Subscriptions from "./pages/agent/Subscriptions";
import Layout from "./components/Layout";
import NotFound from "./pages/agent/NotFound";
import RoomPage from "./pages/agent/VideoCall";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	if (!user.isVerified) {
    return <Navigate to='/verify-email' replace />;
    
  }


	return children;
};


// redirect authenticated users to the home page
import PropTypes from 'prop-types';

const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();
  console.log("Authenticated User Debugging:", user); // Debugging
  if (isAuthenticated && user.isAccountVerified === false) {
    return <Navigate to="/register" replace/>;
  }

  if (isAuthenticated && user.isVerified) {
      return <Navigate to="/" replace />;
  }
	return children;
};

  RedirectAuthenticatedUser.propTypes = {
    children: PropTypes.node.isRequired,
  };

function App() {
	const { isCheckingAuth, checkAuth } = useAuthStore();
	useEffect(() => {
		checkAuth();
	}, [checkAuth]);
	if (isCheckingAuth) return <LoadingSpinner />;
	return (
    <div
      className="min-h-screen items-center justify-center
      relative overflow-hidden"
    >
      <Routes>
        {/* ✅ Ensure unverified agents go to the registration page */}
        <Route
          path="/register"
          element={

              <AgentRegister />

          }
        />
        <Route
          path="/verifyipv"
          element={
            
              <VerifyAgent />
            
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectAuthenticatedUser>
              <SignUpPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <LoginPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route
          path="/forgot-password"
          element={
            <RedirectAuthenticatedUser>
              <ForgotPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
        {/* agent routes */}
        <Route path="/" element={
            <ProtectedRoute>
              <Layout /> 
            </ProtectedRoute>
        }>
          <Route index element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="services" element={
            <ProtectedRoute>
              <ServiceManagement />
            </ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute>
              <OrderManagement />
            </ProtectedRoute>
          } />
          <Route path="transactions" element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          } />
          <Route path="ratings" element={
            <ProtectedRoute>
              <Ratings />
            </ProtectedRoute>
          } />
          <Route path="communication/:orderId" element={
            <ProtectedRoute>
              <Communication />
            </ProtectedRoute>
          } />
          <Route path="communication/room/:orderId" element={
            <ProtectedRoute>
              <RoomPage />
            </ProtectedRoute>
          } />
          <Route path="subscriptions" element={
            <ProtectedRoute>
              <Subscriptions />
            </ProtectedRoute>
          } />
          <Route path="*" element={
            <ProtectedRoute>
              <NotFound />
            </ProtectedRoute>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
    
  );

};

export default App;


