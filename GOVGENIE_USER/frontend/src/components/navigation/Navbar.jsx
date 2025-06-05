"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";
import Logo from "../common/Logo";
import ThemeToggle from "../common/ThemeToggle";
import Button from "../common/Button";
import { useNotification } from "../../context/NotificationContext";

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { addNotification } = useNotification();
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
  
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); 
    };
  }, []);


useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/notifications/${user._id}`
      );

      
      const filteredNotifications = response.data.notifications.filter(
        (notification) => notification.PaymentRequest === true
      );

      setNotifications(filteredNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  fetchNotifications();
}, []);




const handlePayment = async (notification) => {
  if (isBooking) {
    addNotification({
      type: "info",
      message: "Payment is already in progress. Please wait.",
    });
    return;
  }

  setIsBooking(true);

  try {
    const { orderId, amount, agentId } = notification;

   
    const orderResponse = await fetch(
      "http://localhost:5001/api/orders/create-payment-order",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount,
        }),
      }
    );

    const orderData = await orderResponse.json();
    if (!orderResponse.ok) throw new Error(orderData.message);

    const { razorpayOrderId, currency } = orderData;

   
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY, 
      amount: amount * 100, 
      currency: currency,
      name: "GovGenie",
      description: `Final Payment for Order ${orderId}`,
      order_id: razorpayOrderId,
      handler: async function (response) {
        console.log("Payment Successful:", response);

      
        console.log("Razorpay Payment ID:", response.razorpay_payment_id);
        console.log("Razorpay Order ID:", response.razorpay_order_id);
        console.log("Razorpay Signature:", response.razorpay_signature);

        
        const verifyResponse = await fetch(
          "http://localhost:5001/api/orders/notification/verify-payment",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: response.razorpay_order_id, 
              order_Id: orderId, 
              paymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature, 
              agentId,
              customer: user._id,
              amount,
            }),
          }
        );

        const verifyData = await verifyResponse.json();
        if (!verifyResponse.ok) throw new Error(verifyData.message);

        addNotification({
          type: "success",
          message: "Payment successful! Final payment completed.",
        });
      },
      prefill: {
        name: user.name || "GovGenie User",
        email: user.email || "govgenie.info@gmail.com",
        contact: user.contact || "0000000000",
      },
      theme: {
        color: "#3399cc",
      },
    };

    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please check your internet connection.");
      return;
    }

    const rzp = new Razorpay(options);
    rzp.open();

    rzp.on("payment.failed", function (response) {
      console.error("Payment Failed:", response.error);
      addNotification({
        type: "error",
        message: "Payment failed. Please try again.",
      });
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    addNotification({
      type: "error",
      message: error.message || "Failed to process payment. Please try again.",
    });
  } finally {
    setIsBooking(false);
  }
};
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white  dark:bg-dark-100 border-b border-gray-200 dark:border-gray-700 shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center justify-between h-16">
      
          <div className="flex items-center">
            {user && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
                aria-label="Open sidebar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}

            <div className="flex-shrink-0">
              <Logo />
            </div>

          
            <nav className="hidden md:ml-6 md:flex md:space-x-4">
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-500 dark:hover:text-primary-400"
              >
                Home
              </Link>
              <Link
                to="/services"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-500 dark:hover:text-primary-400"
              >
                Services
              </Link>
              <Link
                to="/agents"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary-500 dark:hover:text-primary-400"
              >
                Find Agents
              </Link>
            </nav>
          </div>

         
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {user ? (
              <>
          
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="View notifications"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>

             
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-dark-100"></span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-dark-100 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                      >
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            Notifications
                          </h3>
                        </div>

                        <div className="max-h-60 overflow-y-auto">
                          {notifications.map((notification) => (
                            <button
                              key={notification._id}
                              onClick={() => handlePayment(notification)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-200"
                            >
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Open user menu"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user.name || "User"}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-dark-100 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                      >
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-200"
                          role="menuitem"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-200"
                          role="menuitem"
                        >
                          Profile
                        </Link>
                        <Link
                          to="/dashboard/documents"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-200"
                          role="menuitem"
                        >
                          Documents
                        </Link>
                        <Link
                          to="/dashboard/orders"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-200"
                          role="menuitem"
                        >
                          Orders
                        </Link>
                        <div className="border-t border-gray-200 dark:border-gray-700"></div>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-200"
                          role="menuitem"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth/login">
                  <Button variant="outline" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
