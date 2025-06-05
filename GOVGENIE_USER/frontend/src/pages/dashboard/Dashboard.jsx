"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { getUserOrders } from "../../services/ordersData"
import { getUserDocuments } from "../../services/documentsData"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"
import Chatbot from "../Geniebot.jsx";
import axios from "axios";

const Dashboard = () => {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [torders, setTOrders] = useState([])
  const [documents, setDocuments] = useState([])
  const [tdocuments, setTdocument] = useState([]);
  const [loading, setLoading] = useState(true)
  const [fileSizes, setFileSizes] = useState({});

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/user/orders/${user._id}`
        );
        setTOrders(response.data);
        setOrders(response.data.slice(0, 3)) 
   
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }




  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const { data } = await axios.get("http://localhost:5001/api/doc/list", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setTdocument(data);
      setDocuments(data.slice(0, 3)); 
      console.log("fetch document data", data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };




    fetchOrder();
    fetchDocuments()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }


async function getFileSizeFromUrl(fileUrl) {
  try {
    const response = await fetch(fileUrl, { method: "HEAD" });
    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

    const contentLength = response.headers.get("content-length");
    return contentLength ? parseInt(contentLength, 10) : "Unknown size";
  } catch (error) {
    console.error("Error fetching file size:", error);
    return "Error fetching size";
  }
}

useEffect(() => {
  const fetchFileSizes = async () => {
    const sizes = {};
    for (const doc of documents) {
      sizes[doc._id] = await getFileSizeFromUrl(doc.url);
    }
    setFileSizes(sizes);
  };

  if (documents.length > 0) fetchFileSizes();
}, [documents]);
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  else return (bytes / 1024 / 1024).toFixed(2) + " MB";
};






  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome section */}
      <Chatbot />
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name || "User"}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Here's an overview of your recent activities and services.
        </p>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Orders
            </h3>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">
              {torders.length}
            </p>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Completed
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {
                torders.filter((order) => order.orderStatus === "Completed")
                  .length
              }
            </p>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              In Progress
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {
                orders.filter((order) => order.orderStatus === "In Progress")
                  .length
              }
            </p>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Documents
            </h3>
            <p className="text-3xl font-bold text-secondary-600 dark:text-secondary-400 mt-2">
              {tdocuments.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Recent orders section */}
      <Card
        title="Recent Orders"
        subtitle="Your latest service requests"
        footer={
          <Link to="/dashboard/orders">
            <Button variant="outline" fullWidth>
              View All Orders
            </Button>
          </Link>
        }
      >
        {orders.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">No orders found</p>
            <Link to="/services" className="mt-2 inline-block">
              <Button>Browse Services</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-dark-200">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Agent
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Service
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 dark:hover:bg-dark-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      <Link
                        to={`/dashboard/orders/${order._id}`}
                        className="hover:text-primary-600 dark:hover:text-primary-400"
                      >
                        {order.agentName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {order.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ₹{order.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Recent documents section */}
      <Card
        title="Recent Documents"
        subtitle="Your latest uploaded documents"
        footer={
          <Link to="/dashboard/documents">
            <Button variant="outline" fullWidth>
              View All Documents
            </Button>
          </Link>
        }
      >
        {documents.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">
              No documents found
            </p>
            <Link to="/dashboard/documents" className="mt-2 inline-block">
              <Button>Upload Documents</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documents.map((document) => (
              <div
                key={document._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden "
              >
                <div className="aspect-w-3 aspect-h-2 bg-gray-200 dark:bg-gray-700">
                  <img
                    src={document.url || "/placeholder.svg"}
                    alt={document.filename}
                    className="rounded-md object-cover h-32 w-full mb-4 blur-sm"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {document.filename}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(document.createdAt)}
                  </p>
                  <div className="mt-2 flex justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Size:{" "}
                      {formatFileSize(fileSizes[document._id]) || "Loading..."}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick actions section */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/services" className="block">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
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
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Browse Services
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Explore available services
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/agents" className="block">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Find Agents
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Connect with service agents
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/documents" className="block">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Upload Documents
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Add to your document vault
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/profile" className="block">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Update Profile
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Manage your account
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default Dashboard

