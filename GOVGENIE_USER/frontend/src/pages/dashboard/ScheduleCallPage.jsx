"use client";

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getOrderById } from "../../services/ordersData";
import { getAgentById } from "../../services/agentsData";
import { useNotification } from "../../context/NotificationContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";

const ScheduleCallPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [callType, setCallType] = useState("video");
  const [scheduling, setScheduling] = useState(false);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const orderData = await getOrderById(orderId);
        setOrder(orderData);

        const agentData = await getAgentById(orderData.agentId);
        setAgent(agentData);

    
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().split("T")[0]);
      } catch (error) {
        console.error("Error fetching order data:", error);
        addNotification({
          type: "error",
          message: "Failed to load order data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, addNotification]);

  const getAvailableTimeSlots = () => {
    if (!agent || !selectedDate) return [];

    const date = new Date(selectedDate);
    const dayOfWeek = date.toLocaleDateString("en-US", {
      weekday: "lowercase",
    });

    const availability = agent.availability[dayOfWeek];
    if (!availability) return [];

    const slots = [];
    const start = Number.parseInt(availability.start.split(":")[0]);
    const end = Number.parseInt(availability.end.split(":")[0]);

    for (let hour = start; hour < end; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }

    return slots;
  };

  const handleScheduleCall = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      addNotification({
        type: "error",
        message: "Please select a date and time for your call.",
      });
      return;
    }

    setScheduling(true);

    try {
   
      await new Promise((resolve) => setTimeout(resolve, 1000));

      addNotification({
        type: "success",
        message: `Your ${callType} call has been scheduled for ${selectedDate} at ${selectedTime}.`,
      });

      navigate(`/dashboard/orders/${orderId}`);
    } catch (error) {
      console.error("Error scheduling call:", error);
      addNotification({
        type: "error",
        message: "Failed to schedule call. Please try again.",
      });
    } finally {
      setScheduling(false);
    }
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

  const availableTimeSlots = getAvailableTimeSlots();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Schedule a Call
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Order: {order.id} - {order.serviceName}
          </p>
        </div>
        <Link to={`/dashboard/orders/${orderId}`}>
          <Button variant="outline">Back to Order Details</Button>
        </Link>
      </div>

      {/* Schedule Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <form onSubmit={handleScheduleCall} className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Schedule a call with {agent?.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Select a date and time that works for you to discuss your{" "}
                  {order.serviceName} order.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="callType"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Call Type
                  </label>
                  <select
                    id="callType"
                    value={callType}
                    onChange={(e) => setCallType(e.target.value)}
                    className="select"
                  >
                    <option value="video">Video Call</option>
                    <option value="audio">Audio Call</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime(""); // Reset time when date changes
                    }}
                    min={new Date().toISOString().split("T")[0]} // Can't select past dates
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Available Time Slots
                </label>
                {availableTimeSlots.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 py-2">
                    {selectedDate
                      ? "No available time slots on this date. Please select another date."
                      : "Please select a date to see available time slots."}
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {availableTimeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        className={`py-2 px-3 rounded-md text-sm font-medium ${
                          selectedTime === time
                            ? "bg-primary-500 text-white"
                            : "bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-300"
                        }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="submit"
                  fullWidth
                  isLoading={scheduling}
                  disabled={!selectedDate || !selectedTime || scheduling}
                >
                  Schedule {callType === "video" ? "Video" : "Audio"} Call
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div>
          <Card>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Agent Details
              </h3>

              <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 mr-4">
                  {agent?.avatar ? (
                    <img
                      src={agent.avatar || "/placeholder.svg"}
                      alt={agent.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {agent?.name}
                  </h4>
                  <div className="flex items-center text-yellow-400 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1">
                      {agent?.rating} ({agent?.reviews} reviews)
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {agent?.location}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Availability
                </h4>
                <div className="space-y-2 text-sm">
                  {agent &&
                    Object.entries(agent.availability).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize">{day}</span>
                        <span>
                          {hours
                            ? `${hours.start} - ${hours.end}`
                            : "Unavailable"}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Need immediate assistance?
                </h4>
                <Link to={`/dashboard/orders/${orderId}/chat`}>
                  <Button variant="outline" fullWidth>
                    Chat with Agent
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCallPage;
