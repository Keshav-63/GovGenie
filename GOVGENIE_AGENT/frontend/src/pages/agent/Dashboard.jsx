import {
  BarChart3,
  TrendingUp,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  ExternalLink,
  ArrowRight,
  ListOrderedIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { formatCurrency, formatNumber } from "../../lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import axios from "axios";
import { useState, useEffect } from "react";
const API_BASE_URL = "http://localhost:5000/api";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const { agentId } = useAuthStore();
  const [services, setServices] = useState([]);
  const [agentInfo, setAgentInfo] = useState([]);
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [earningsData, setEarningsData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("day"); // Default to "day"

  useEffect(() => {
    fetchAgentServices();
  }, [agentId]);

  useEffect(() => {
    if (agentId) {
     
      axios
        .get(`http://localhost:5000/api/agentinfo-schema/${agentId}`)
        .then((response) => {
          setAgentInfo(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [agentId]);
  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/earnings/${agentInfo._id}?period=${selectedPeriod}`
        );
        console.log("Earnings data response:", response.data);
        setEarningsData(response.data);
      } catch (error) {
        console.error("Error fetching earnings data:", error);
      }
    };

    if (agentId) {
      fetchEarningsData();
    }
  }, [agentInfo._id, selectedPeriod]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        console.log("userssid ", user);
        const response = await axios.get(
          `http://localhost:5000/api/orders/${user._id}`
        );
        setOrders(response.data);
        console.log("fetch all orders: ", response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
   
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const [uniqueCustomers, setUniqueCustomers] = useState(0);

  useEffect(() => {

    const uniqueAgents = new Set(orders.map((order) => order.userName));
    setUniqueCustomers(uniqueAgents.size);
  }, [orders]);

  useEffect(() => {
    console.log(" Agent infooo", agentInfo);
  }, [agentInfo]);

  const fetchAgentServices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/services/${agentId}`);
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };
  const totalServices = services.length;
  console.log("agent fetch ", services);
  const chartData = {
    labels: earningsData.map((entry) => entry._id), // Dates or periods
    datasets: [
      {
        label: "Total Earnings",
        data: earningsData.map((entry) => entry.totalEarnings), // Earnings
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Earnings (${
          selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)
        })`,
      },
    },
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your agent activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/orders">View All Orders</Link>
          </Button>
          <Button asChild>
            <Link to="/services">Manage Services</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">
              {formatCurrency(agentInfo.total_earning)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Services
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">{totalServices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ListOrderedIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Customers Served
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">{uniqueCustomers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
       
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Latest service requests from customers
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center gap-4">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      order.orderStatus === "Completed"
                        ? "bg-green-100 dark:bg-green-900"
                        : order.orderStatus === "In Progress"
                        ? "bg-blue-100 dark:bg-blue-900"
                        : "bg-amber-100 dark:bg-amber-900"
                    }`}
                  >
                    {order.orderStatus === "Completed" ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : order.orderStatus === "In Progress" ? (
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{order.service}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {order.userName}
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(order.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button size="sm" className="w-full" asChild>
              <Link to="/orders">
                <span>Manage Orders</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>
                View your total earnings by day, week, or month.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={selectedPeriod === "day" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("day")}
              >
                Day
              </Button>
              <Button
                size="sm"
                variant={selectedPeriod === "week" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("week")}
              >
                Week
              </Button>
              <Button
                size="sm"
                variant={selectedPeriod === "month" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("month")}
              >
                Month
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add a container with a defined height */}
            <div className="h-[400px] w-full">
              <Line data={chartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
