"use client";

import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { getAgentById } from "../../services/agentsData";
import { getAllServices } from "../../services/servicesData";
import { useAuthStore } from "../../store/authStore";
import { useNotification } from "../../context/NotificationContext";
import { createOrder } from "../../services/ordersData";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";

const AgentProfilePage = () => {
  const { agentId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialServiceId = queryParams.get("service");

  const [agent, setAgent] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(
    initialServiceId || ""
  );
  const [isBooking, setIsBooking] = useState(false);

  const { user } = useAuthStore();
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [agentData, servicesData] = await Promise.all([
          getAgentById(agentId),
          getAllServices(),
        ]);
        setAgent(agentData);
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching agent details:", error);
        addNotification({
          type: "error",
          message: "Failed to load agent details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [agentId, addNotification]);

  const handleBookService = async () => {
    if (!user) {
      addNotification({
        type: "error",
        message: "Please log in to book a service.",
      });
      return;
    }

    if (!selectedService) {
      addNotification({
        type: "error",
        message: "Please select a service to continue.",
      });
      return;
    }

    setIsBooking(true);

    try {
      const selectedServiceObj = services.find((s) => s.id === selectedService);

      const newOrder = await createOrder({
        serviceId: selectedService,
        serviceName: selectedServiceObj.name,
        agentId: agent.id,
        agentName: agent.name,
        amount: agent.pricing[selectedService],
      });

      addNotification({
        type: "success",
        message: "Service booked successfully!",
      });

      window.location.href = `/dashboard/orders/${newOrder.id}`;
    } catch (error) {
      console.error("Error booking service:", error);
      addNotification({
        type: "error",
        message: "Failed to book service. Please try again.",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const getServiceById = (id) => {
    return services.find((service) => service.id === id);
  };

  const formatAvailability = (availability) => {
    if (!availability) return "Unavailable";
    return `${availability.start} - ${availability.end}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Agent not found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The agent you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/agents">
            <Button>Browse Agents</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
 
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {agent.name}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            {agent.location}
          </p>
        </div>
        <Link to="/agents">
          <Button variant="outline">Back to Agents</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    
        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="sm:w-1/3">
                <img
                  src={agent.avatar || "/placeholder.svg?height=200&width=200"}
                  alt={agent.name}
                  className="w-full h-auto rounded-lg object-cover"
                />
              </div>
              <div className="sm:w-2/3">
                <div className="flex items-center mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mr-2">
                    {agent.name}
                  </h2>
                  <div className="flex items-center text-yellow-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 text-sm">
                      {agent.rating} ({agent.reviews} reviews)
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {agent.bio}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Location
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {agent.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Experience
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {agent.experience}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Services Offered
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {agent.services.map((serviceId) => {
                      const service = getServiceById(serviceId);
                      return service ? (
                        <span
                          key={serviceId}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300"
                        >
                          {service.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Availability">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-dark-200 rounded-md">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Monday
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatAvailability(agent.availability.monday)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-dark-200 rounded-md">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Tuesday
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatAvailability(agent.availability.tuesday)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-dark-200 rounded-md">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Wednesday
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatAvailability(agent.availability.wednesday)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-dark-200 rounded-md">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Thursday
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatAvailability(agent.availability.thursday)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-dark-200 rounded-md">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Friday
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatAvailability(agent.availability.friday)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-dark-200 rounded-md">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Saturday
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatAvailability(agent.availability.saturday)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-dark-200 rounded-md">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Sunday
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatAvailability(agent.availability.sunday)}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Reviews">
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400">
                Reviews coming soon
              </p>
            </div>
          </Card>
        </div>

        {/* Right Column - Booking */}
        <div>
          <Card title="Book a Service">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="service"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Select Service
                </label>
                <select
                  id="service"
                  className="select"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  <option value="">Select a service</option>
                  {agent.services.map((serviceId) => {
                    const service = getServiceById(serviceId);
                    return service ? (
                      <option key={serviceId} value={serviceId}>
                        {service.name} - ₹{agent.pricing[serviceId]}
                      </option>
                    ) : null;
                  })}
                </select>
              </div>

              {selectedService && (
                <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Service Fee
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ₹{agent.pricing[selectedService]}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Platform Fee
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ₹{Math.round(agent.pricing[selectedService] * 0.05)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ₹
                      {agent.pricing[selectedService] +
                        Math.round(agent.pricing[selectedService] * 0.05)}
                    </span>
                  </div>
                </div>
              )}

              <Button
                fullWidth
                onClick={handleBookService}
                disabled={!selectedService || isBooking}
                isLoading={isBooking}
              >
                Book Now
              </Button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By booking, you agree to our{" "}
                <Link
                  to="/terms"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </Card>

          <div className="mt-4">
            <Card>
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
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Secure Booking
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your payment is protected by our secure payment system
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentProfilePage;
