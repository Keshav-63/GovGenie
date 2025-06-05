"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getServiceById } from "../../services/servicesData";
import { getAgentsByService } from "../../services/agentsData";
import { useNotification } from "../../context/NotificationContext";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";

const ServiceDetailPage = () => {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [serviceData, agentsData] = await Promise.all([
          getServiceById(serviceId),
          getAgentsByService(serviceId),
        ]);
        setService(serviceData);
        setAgents(agentsData);
      } catch (error) {
        console.error("Error fetching service details:", error);
        addNotification({
          type: "error",
          message: "Failed to load service details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId, addNotification]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <Card>
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Service not found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The service you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/services">
            <Button>Browse Services</Button>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {service.name}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            {service.description}
          </p>
        </div>
        <Link to="/services">
          <Button variant="outline">Back to Services</Button>
        </Link>
      </div>

      {/* Service Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Service Info */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Service Overview">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Description
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {service.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Category
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {service.category}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Processing Time
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    {service.processingTime}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Price Range
                  </h3>
                  <p className="text-gray-900 dark:text-white">
                    ₹{service.price.min} - ₹{service.price.max}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Required Documents">
            <ul className="space-y-2">
              {service.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-primary-500 mr-2 mt-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    {requirement}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Process Steps">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-3.5 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>

              <div className="space-y-6 relative">
                {service.steps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Available Agents */}
        <div>
          <Card title={`Available Agents (${agents.length})`}>
            {agents.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">
                  No agents available for this service
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center mb-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 mr-3">
                        <img
                          src={agent.avatar || "/placeholder.svg"}
                          alt={agent.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {agent.name}
                        </h3>
                        <div className="flex items-center text-yellow-400 text-xs">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1">
                            {agent.rating} ({agent.reviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="bg-gray-50 dark:bg-dark-200 p-2 rounded-md">
                        <p className="text-gray-500 dark:text-gray-400">
                          Experience
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {agent.experience}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-dark-200 p-2 rounded-md">
                        <p className="text-gray-500 dark:text-gray-400">
                          Price
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          ₹{agent.pricing[serviceId]}
                        </p>
                      </div>
                    </div>
                    <Link to={`/agents/${agent.id}?service=${serviceId}`}>
                      <Button variant="outline" size="sm" fullWidth>
                        View Profile
                      </Button>
                    </Link>
                  </div>
                ))}
                <Link to={`/agents?service=${serviceId}`}>
                  <Button variant="ghost" size="sm" fullWidth>
                    View All Agents
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <Card className="bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Ready to get started?
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connect with an agent to process your {service.name} application
            </p>
          </div>
          <Link to={`/agents?service=${serviceId}`}>
            <Button size="lg">Find an Agent</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ServiceDetailPage;
