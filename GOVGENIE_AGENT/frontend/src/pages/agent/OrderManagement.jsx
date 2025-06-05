"use client";
import axios from "axios";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/authStore.js";
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
  CheckCircle,
  XCircle,
  MessageCircle,
  Phone,
  VideoIcon,
  Upload,
  Calendar,
  Clock,
  Send,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { formatCurrency, formatDate } from "../../lib/utils";




function OrderCard({ order }) {


  const [viewDetails, setViewDetails] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);

  const handleMarkAsCompleted = async (orderId) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to mark this order as completed?"
      );
      if (!confirm) return;

     
      const response = await axios.put(
        `http://localhost:5001/api/ordercomplete/complete/${orderId}`
      );

      if (response.status === 200) {
        alert("Order marked as completed successfully!");

      }
    } catch (error) {
      console.error("Error marking order as completed:", error);
      alert("Failed to mark the order as completed. Please try again.");
    }
  };
  const handleSendPaymentRequest = async (orderId, customer, service, advance, agentId) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to send a final payment request to the customer?"
      );
      if (!confirm) return;

      const response = await axios.post(
        `http://localhost:5001/api/notifications/payment-request`,
        {
          orderId,
          customer,
          service,
          advance,
          agentId,
        }
      );

      if (response.status === 200) {
        alert("Payment request sent successfully!");
      }
    } catch (error) {
      console.error("Error sending payment request:", error);
      alert("Failed to send payment request. Please try again.");
    }
  };



  const statusColor = {
    Pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    "In Progress":
      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    Completed:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    Rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{order.service}</CardTitle>
                <Badge className={statusColor[order.orderStatus] || ""}>
                  {order.orderStatus}
                </Badge>
              </div>
              <CardDescription>{order._id.substring(0, 9)}...</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ChevronDown className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setViewDetails(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View Details</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link to={`/communication/${order._id}`}>
                  <DropdownMenuItem>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>Send Message</span>
                  </DropdownMenuItem>
                </Link>
                <Link to={`/communication/room/${order._id}`}>
                  <DropdownMenuItem>
                    <VideoIcon className="mr-2 h-4 w-4" />
                    <span>Video Call</span>
                  </DropdownMenuItem>
                </Link>
                  <DropdownMenuItem
                    onClick={() =>
                      handleSendPaymentRequest(order._id, order.customer, order.service, order.advance, order.agentId )
                    }
                  >
                    <Send className="mr-2 h-4 w-4" />
                    <span>Send Final Payment Request</span>
                  </DropdownMenuItem>
                <DropdownMenuSeparator />
                {order.orderStatus === "In Progress" && (
                  <DropdownMenuItem>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span>Mark as Completed</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 pb-3">
            <Avatar>
              <AvatarImage
                src={order.userName.charAt(0)}
                alt={order.userName.charAt(0)}
              />
              <AvatarFallback>{order.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{order.userName}</div>
              <div className="text-sm text-muted-foreground">
                Ordered on {formatDate(order.orderDate)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Amount</div>
              <div className="font-medium">{formatCurrency(order.amount)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Advance Paid</div>
              <div className="font-medium">{formatCurrency(order.advance)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Due Date</div>
              <div className="font-medium">{formatDate(order.dueDate)}</div>
            </div>
            {order.orderStatus === "Completed" && (
              <div>
                <div className="text-muted-foreground">Completed Date</div>
                <div className="font-medium">
                  {formatDate(order.completedDate)}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setViewDetails(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              <span>View Details</span>
            </Button>
            <Link to={`/communication/${order._id}`}>
              <Button variant="outline" size="sm" className="w-full">
                <MessageCircle className="mr-2 h-4 w-4" />
                <span>Message</span>
              </Button>
            </Link>
            <Link to={`/communication/room/${order._id}`}>
              <Button variant="outline" size="sm" className="w-full">
                <VideoIcon className="mr-2 h-4 w-4" />
                <span>Video Call</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Dialog open={viewDetails} onOpenChange={setViewDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {order._id.substring(0, 9)}... - {order.service}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={order.userName?.charAt(0) || "U"}
                  alt={order.userName?.charAt(0) || "U"}
                />
                <AvatarFallback>
                  {order.userName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{order.userName}</h3>
                <p className="text-sm text-muted-foreground">Customer</p>
              </div>
              <div className="ml-auto">
                <Badge className={statusColor[order.orderStatus] || ""}>
                  {order.orderStatus}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/50 p-4">
              <div>
                <div className="text-sm text-muted-foreground">Order Date</div>
                <div className="font-medium">{formatDate(order.orderDate)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Due Date</div>
                <div className="font-medium">{formatDate(order.dueDate)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Total Amount
                </div>
                <div className="font-medium">
                  {formatCurrency(order.amount)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Advance Paid (50%)
                </div>
                <div className="font-medium">
                  {formatCurrency(order.advance)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Balance Due</div>
                <div className="font-medium">
                  {formatCurrency(order.amount - order.advance)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Payment Status
                </div>
                <div className="font-medium">Advance Paid</div>
              </div>
            </div>

            

            <div>
              <h3 className="mb-2 font-medium">Order Timeline</h3>
              <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Order Placed</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(order.orderDate)}
                    </div>
                  </div>
                </div>
                {order.orderStatus !== "Pending" && (
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Order Accepted</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(order.orderDate)}
                      </div>
                    </div>
                  </div>
                )}
                {order.orderStatus === "Completed" && (
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Order Completed</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(order.completedDate)}
                      </div>
                    </div>
                  </div>
                )}
                {order.orderStatus === "Rejected" && (
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                      <XCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Order Rejected</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(order.orderDate)} at 4:20 PM
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
       
            {order.orderStatus === "Pending" && (
              <Button className="flex-1">
                <CheckCircle className="mr-2 h-4 w-4" />
                <span>Accept Order</span>
              </Button>
            )}
            {order.orderStatus === "In Progress" && (
              <Button
                className="flex-1"
                onClick={() => handleMarkAsCompleted(order._id)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                <span>Mark as Completed</span>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this order.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Select defaultValue="unavailable">
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unavailable">
                    Service Unavailable
                  </SelectItem>
                  <SelectItem value="documents">
                    Incomplete Documents
                  </SelectItem>
                  <SelectItem value="pricing">Pricing Issue</SelectItem>
                  <SelectItem value="timeline">Timeline Constraints</SelectItem>
                  <SelectItem value="other">Other Reason</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Textarea
                placeholder="Additional details..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setRejectDialog(false)}
            >
              Reject Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function OrderManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  // const { addNotification } = useNotification();
  const { user } = useAuthStore();
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

  console.log(" orderssss", orders);

  const inProgressOrders = orders.filter(
    (orders) => orders.orderStatus === "In Progress"
  );
  const completedOrders = orders.filter(
    (orders) => orders.orderStatus === "Completed"
  );


  const filteredInProgressOrders = inProgressOrders.filter(
    (orders) =>
      orders._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orders.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orders.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompletedOrders = completedOrders.filter(
    (orders) =>
      orders._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orders.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orders.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Order Management
          </h2>
          <p className="text-muted-foreground">
            View and manage customer orders.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 md:flex-row">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
      </div>

      <Tabs defaultValue="in-progress" className="w-full">
        <TabsList>
     
          <TabsTrigger value="in-progress">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>In Progress ({inProgressOrders.length})</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="completed">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Completed ({completedOrders.length})</span>
            </div>
          </TabsTrigger>
        </TabsList>

    

        <TabsContent value="in-progress">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInProgressOrders.length > 0 ? (
              filteredInProgressOrders.map((orders) => (
                <OrderCard key={orders._id} order={orders} />
              ))
            ) : (
              <div className="col-span-full rounded-lg border bg-muted/50 p-8 text-center">
                <h3 className="mb-2 text-lg font-medium">
                  No in-progress orders found
                </h3>
                <p className="text-muted-foreground">
                  There are no in-progress orders matching your search criteria.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCompletedOrders.length > 0 ? (
              filteredCompletedOrders.map((orders) => (
                <OrderCard key={orders._id} order={orders} />
              ))
            ) : (
              <div className="col-span-full rounded-lg border bg-muted/50 p-8 text-center">
                <h3 className="mb-2 text-lg font-medium">
                  No completed orders found
                </h3>
                <p className="text-muted-foreground">
                  There are no completed orders matching your search criteria.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default OrderManagement;
