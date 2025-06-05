"use client";
import axios from "axios";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderById, addOrderMessage } from "../../services/ordersData";
import { getAgentById } from "../../services/agentsData";
import { useAuthStore } from "../../store/authStore";
import { useNotification } from "../../context/NotificationContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import Chatbot from "../Geniebot.jsx";
import { Paperclip } from "lucide-react";

const ChatWithAgentPage = () => {
  const { orderId } = useParams();
  const [agentId, setAgentId] = useState(null);
  const [order, setOrder] = useState([]);
  const [agent, setAgent] = useState(null);
  const [agentprofile, setAgentprofile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [file, setFile] = useState(null);
  //const [message, setMessage] = useState([]);
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const { user } = useAuthStore();
  const { addNotification } = useNotification();

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get(
          `http://localhost:5001/api/user/orders/${user._id}`
      );
            const matchingOrder = response.data.find(
              (order) => order._id === orderId
            );
      if (matchingOrder) {
        setAgent(matchingOrder.agentName); 
        setAgentprofile(matchingOrder.agentProfile);
      } else {
        console.error("No matching order found");
      }
      console.log("agent nameeee: ", agent);

      const resAgent = await axios.get(
        `http://localhost:5001/api/user/orderdata/${orderId}`
      );
      const fetch = resAgent.data.orders.agentId;
      const customer = resAgent.data.orders.customer;
      console.log("fetch agentId: ", fetch);
      console.log("fetch customer: ", customer);
      setOrder(resAgent.data.orders);
      setAgentId(fetch);

      if (!socketRef.current) {
        const newSocket = io("http://localhost:7000");
        setSocket(newSocket);
        socketRef.current = newSocket;

        if (customer && fetch) {
          newSocket.emit("join", { userId: customer, agentId: fetch });
        }


        newSocket.on("chatHistory", (messages) => {
          setChatHistory(messages.map((msg) => ({ ...msg, text: msg.text })));
        });

      
        newSocket.on("receiveMessage", (message) => {
          console.log("New message received:", message);
          setChatHistory((prev) => [...prev, message]); 
        });

      
        newSocket.on("userTyping", () => setIsTyping(true));
        newSocket.on("userStoppedTyping", () => setIsTyping(false));
      }
    } catch (error) {
      console.error("Error fetching chat data:", error);
    } 
  };

  fetchData();

  const intervalId = setInterval(() => {
    fetchData();
  }, 1000); 

  return () => {
 
    if (socketRef.current) {
      socketRef.current.off("chatHistory");
      socketRef.current.off("receiveMessage");
      socketRef.current.off("userTyping");
      socketRef.current.off("userStoppedTyping");
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    clearInterval(intervalId);
  };
}, []);

useEffect(() => {
  console.log("Chat history updated:", chatHistory);
}, [chatHistory]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const sendMessage = (e) => {
    e.preventDefault();
    

    const messageData = {
      senderId: user._id,
      receiverId: agentId,
      text: message,
      createdAt: new Date().toISOString(),
    };

    
    socket.emit("sendMessage", messageData);
    setMessage("");
  };



  const startVideoCall = () => {
    setShowVideoCall(true);
  };

  const endVideoCall = () => {
    setShowVideoCall(false);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid Date:", dateString);
      return "Invalid Date";
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const handleTyping = () => {
    socket.emit("userTyping", { senderId: user._id, receiverId: agentId });
  };

  const handleStopTyping = () => {
    socket.emit("userStoppedTyping", {
      senderId: user._id,
      receiverId: agentId,
    });
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error("Invalid Date:", dateString);
      return "Invalid Date";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };


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
      <Chatbot />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Chat with Agent
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Order: {order._id} - {order.service}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/dashboard/orders/${orderId}`}>
            <Button variant="outline">View Order Details</Button>
          </Link>
          <Link to={`/dashboard/room/${orderId}`}>
            <Button>Start Video Call</Button>
          </Link>
        </div>
      </div>

      {/* Video Call Modal */}
      {showVideoCall && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-xl w-full max-w-4xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Video Call with {agent?.name}
              </h2>
              <Button variant="outline" color="red" onClick={endVideoCall}>
                End Call
              </Button>
            </div>

            <div
              className="relative bg-gray-800 rounded-lg overflow-hidden"
              style={{ height: "60vh" }}
            >
              {/* Main video (agent) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">{agent?.name}</p>
                  <p className="text-sm text-gray-400">Connecting...</p>
                </div>
              </div>

              {/* Self view (small) */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-12 h-12 bg-gray-700 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <p className="text-xs">You</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-4 space-x-4">
              <button className="p-4 bg-gray-200 dark:bg-gray-700 rounded-full">
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
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414-7.072m-2.828 9.9a9 9 0 010-12.728"
                  />
                </svg>
              </button>
              <button className="p-4 bg-gray-200 dark:bg-gray-700 rounded-full">
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
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </button>
              <button className="p-4 bg-gray-200 dark:bg-gray-700 rounded-full">
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
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                className="p-4 bg-red-500 rounded-full text-white"
                onClick={endVideoCall}
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <div className="flex flex-col h-[calc(70vh-2rem)]">
       
          <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center mr-3">
              {agentprofile ? (
                <img
                  src={agentprofile || "/placeholder.svg"}
                  alt={agentprofile}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {agent}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {order.status === "completed" ? "Order Completed" : "Online"}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              <>
                {chatHistory.map((msg) => {
                  const isUser = msg.senderId === user._id;
           

                  return (
                    <div key={msg._id || msg.id}>
              
                      <div
                        className={`flex ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-4 py-2 ${
                            isUser
                              ? "bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300"
                              : "bg-gray-100 dark:bg-dark-200 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          <p className="text-xs text-white">{msg.text}</p>
                          <p className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center gap-2 ">
            <Button variant="outline" size="icon" className="shrink-0">
              <a
                href="https://fileqrkaro.onrender.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Paperclip className="h-4 w-4" />
                <span className="sr-only">Attach file</span>
              </a>
            </Button>
            <form onSubmit={sendMessage} className="flex gap-2 w-full">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            
                placeholder="Type your message..."
                className="input flex-1"
                disabled={order.status === "Completed" || sending}
              />
              <Button
                type="submit"
                disabled={
                  order.status === "Completed" || sending || !message.trim()
                }
            
              >
                Send
              </Button>
            </form>
            {order.status === "Completed" && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                This order is completed. You cannot send more messages.
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatWithAgentPage;
