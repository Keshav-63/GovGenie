

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Search, PlusCircle, Pencil, X } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Tabs, TabsContent } from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { formatCurrency } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";

const API_BASE_URL = "http://localhost:5000/api"; 
function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const { agentId } = useAuthStore();

  useEffect(() => {
    fetchAgentServices();
  }, [agentId]);

  const fetchAgentServices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/services/${agentId}`);
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setDialogOpen(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;
    try {
      await axios.delete(`${API_BASE_URL}/services/${agentId}/${serviceId}`);
      fetchAgentServices();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const handleSaveService = async (e) => {
    e.preventDefault();

    const formData = {
      name: e.target.name.value,
      category: e.target.category.value,
      price: e.target.price.value,
      completion: e.target.completion.value,
      active: e.target.active.checked,
      popular: e.target.popular.checked,
    };


    try {
      if (editingService) {
        await axios.put(
          `${API_BASE_URL}/services/${agentId}/${editingService._id}`,
          formData
        );
      } else {
        await axios.post(`${API_BASE_URL}/services/${agentId}`, formData);
      }
      fetchAgentServices();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleToggleService = async (serviceId) => {
    try {
      const service = services.find((s) => s._id === serviceId);
      await axios.put(`${API_BASE_URL}/services/${agentId}/${serviceId}`, {
        active: !service.active,
      });
      fetchAgentServices();
    } catch (error) {
      console.error("Error toggling service status:", error);
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    console.log("Services:", services);
  }, [services]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Service Management
          </h2>
          <p className="text-muted-foreground">
            Manage the services you offer to your customers.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Service
        </Button>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search services..."
          className="w-full pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="active">
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Services</CardTitle>
              <CardDescription>
                These services are currently visible to customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Your Price</TableHead>
                    <TableHead className="text-center">
                      Completion Time
                    </TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <TableRow key={service._id}>
                  
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {service.name}
                            {service.popular && (
                              <Badge variant="default" className="ml-2">
                                Popular
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{service.category}</TableCell>
                        <TableCell className="text-center">
                          {formatCurrency(service.price)}
                        </TableCell>
                        <TableCell className="text-center">
                          {service.completion}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`${
                              service.active
                                ? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-green-50 text-red-700 dark:bg-red-900 dark:text-green-300"
                            }`}
                          >
                            {service.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditService(service)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                    
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteService(service._id)}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No active services found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveService}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingService?.name || ""}
                  placeholder="Enter service name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={editingService?.category || ""}
                  placeholder="Enter service category"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Your Price (₹)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    defaultValue={editingService?.price || ""}
                    placeholder="Enter your price"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="completion">Completion Time</Label>
                <Input
                  id="completion"
                  name="completion"
                  defaultValue={editingService?.completion || ""}
                  placeholder="e.g. 2-3 days"
                  required
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="active"
                  name="active"
                  defaultChecked={editingService?.active ?? true}
                />
                <Label htmlFor="active">Active Service</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="popular"
                  name="popular"
                  defaultChecked={editingService?.popular ?? false}
                />
                <Label htmlFor="popular">Mark as Popular</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingService ? "Update Service" : "Add Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ServiceManagement;
