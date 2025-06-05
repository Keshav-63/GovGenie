"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { getAllAgents, getAgentsByService } from "../../services/agentsData"
import { getAllServices } from "../../services/servicesData"
import { useNotification } from "../../contexts/NotificationContext"
import Card from "../../components/common/Card"
import Button from "../../components/common/Button"

const AgentListingPage = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const initialServiceId = queryParams.get("service")

  const [agents, setAgents] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterService, setFilterService] = useState(initialServiceId || "all")
  const [filterLocation, setFilterLocation] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const { addNotification } = useNotification()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [servicesData, agentsData] = await Promise.all([
          getAllServices(),
          initialServiceId ? getAgentsByService(initialServiceId) : getAllAgents(),
        ])
        setServices(servicesData)
        setAgents(agentsData)
      } catch (error) {
        console.error("Error fetching agents:", error)
        addNotification({
          type: "error",
          message: "Failed to load agents. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [initialServiceId, addNotification])

  const handleServiceChange = async (serviceId) => {
    setFilterService(serviceId)
    setLoading(true)

    try {
      const agentsData = serviceId === "all" ? await getAllAgents() : await getAgentsByService(serviceId)
      setAgents(agentsData)
    } catch (error) {
      console.error("Error fetching agents:", error)
      addNotification({
        type: "error",
        message: "Failed to load agents. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLocation = !filterLocation || agent.location.toLowerCase().includes(filterLocation.toLowerCase())

    return matchesSearch && matchesLocation
  })

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "experience":
        return Number.parseInt(b.experience) - Number.parseInt(a.experience)
      case "price-low":
        return (
          (a.pricing[filterService] || Math.min(...Object.values(a.pricing))) -
          (b.pricing[filterService] || Math.min(...Object.values(b.pricing)))
        )
      case "price-high":
        return (
          (b.pricing[filterService] || Math.max(...Object.values(b.pricing))) -
          (a.pricing[filterService] || Math.max(...Object.values(a.pricing)))
        )
      default:
        return 0
    }
  })

  return (
    <div className="space-y-6 animate-fade-in">
   
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find an Agent</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-300">
          Connect with experienced agents to process your government services
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Agents
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                className="input pl-10"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6.5 6.5 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Service
            </label>
            <select
              id="service"
              className="select"
              value={filterService}
              onChange={(e) => handleServiceChange(e.target.value)}
            >
              <option value="all">All Services</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Location
            </label>
            <input
              type="text"
              id="location"
              className="input"
              placeholder="Enter city or state..."
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select id="sort" className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="rating">Highest Rating</option>
              <option value="experience">Most Experience</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"></div>
        </div>
      ) : sortedAgents.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-500 dark:text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No agents found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Try changing your search or filter criteria</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setFilterLocation("")
                setFilterService("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAgents.map((agent) => (
            <Card key={agent.id}>
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 mr-4">
                    <img
                      src={agent.avatar || "/placeholder.svg?height=64&width=64"}
                      alt={agent.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
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
                        {agent.rating} ({agent.reviews} reviews)
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{agent.location}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span className="font-medium">Experience:</span> {agent.experience}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{agent.bio}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {agent.services.map((serviceId) => {
                      const service = services.find((s) => s.id === serviceId)
                      return service ? (
                        <span
                          key={serviceId}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300"
                        >
                          {service.name}
                        </span>
                      ) : null
                    })}
                  </div>
                </div>
                <div className="mt-auto">
                  <Link to={`/agents/${agent.id}`}>
                    <Button fullWidth>View Profile</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default AgentListingPage

