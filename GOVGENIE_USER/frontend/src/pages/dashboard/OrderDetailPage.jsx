"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById } from "../../services/ordersData";
import { useNotification } from "../../context/NotificationContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
   
      } catch (error) {
        console.error("Error fetching order:", error);
        addNotification({
          type: "error",
          message: "Failed to load order details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, addNotification]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Order not found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The order you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <Link to="/dashboard/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {order.serviceName}
            </h1>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                order.status
              )}`}
            >
              {order.status.replace("_", " ")}
            </span>
          </div>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Order ID: {order.id}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/dashboard/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
          {order.status !== "completed" && (
            <>
              <Link to={`/dashboard/orders/${order.id}/chat`}>
                <Button>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Chat with Agent
                </Button>
              </Link>
              <Link to={`/dashboard/orders/${order.id}/schedule-call`}>
                <Button variant="outline">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Schedule Call
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Order Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Service
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.serviceName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Agent
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.agentName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Created On
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Last Updated
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(order.updatedAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Amount
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  ₹{order.amount}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Payment Status
                </p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {order.paymentStatus}
                </p>
              </div>
            </div>
          </Card>

          {/* Documents */}
          <Card title="Documents">
            {order.documents.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">
                  No documents uploaded yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {order.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-200 rounded-md"
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {doc.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Uploaded on {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        doc.status === "approved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Messages */}
          <Card title="Messages">
            {order.messages.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">
                  No messages yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {order.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderType === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.senderType === "user"
                          ? "bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300"
                          : "bg-gray-100 dark:bg-dark-200 text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                        {formatDate(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {order.status !== "completed" && (
              <div className="mt-4 text-center">
                <Link to={`/dashboard/orders/${order.id}/chat`}>
                  <Button variant="outline">Open Chat</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Timeline */}
        <div>
          <Card title="Order Timeline">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3.5 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>

              <div className="space-y-6 relative">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div
                      className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${
                        index === 0
                          ? "bg-primary-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {index === 0 ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {event.status.replace("_", " ")}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(event.timestamp)}
                      </p>
                      {event.note && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {event.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Communication Options */}
          {order.status !== "completed" && (
            <Card title="Communication Options" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Chat with Agent
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Send messages to your agent
                    </p>
                  </div>
                </div>
                <Link to={`/dashboard/orders/${order.id}/chat`}>
                  <Button variant="outline" fullWidth>
                    Open Chat
                  </Button>
                </Link>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Schedule a Call
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Book a video or audio call
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/dashboard/orders/${order.id}/schedule-call`}
                    className="mt-2 block"
                  >
                    <Button variant="outline" fullWidth>
                      Schedule Call
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
