import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Customer, "id">>({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    const saved = localStorage.getItem("customers");
    if (saved) {
      setCustomers(JSON.parse(saved));
    }
  };

  const saveCustomers = (updatedCustomers: Customer[]) => {
    localStorage.setItem("customers", JSON.stringify(updatedCustomers));
    setCustomers(updatedCustomers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingId) {
      // Update existing customer
      const updated = customers.map((c) =>
        c.id === editingId ? { ...formData, id: editingId } : c
      );
      saveCustomers(updated);
      toast.success("Customer updated successfully");
      setEditingId(null);
    } else {
      // Add new customer
      const newCustomer: Customer = {
        ...formData,
        id: Date.now().toString(),
      };
      saveCustomers([...customers, newCustomer]);
      toast.success("Customer added successfully");
    }

    setFormData({ name: "", address: "", phone: "", email: "" });
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      address: customer.address,
      phone: customer.phone,
      email: customer.email || "",
    });
    setEditingId(customer.id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      const updated = customers.filter((c) => c.id !== id);
      saveCustomers(updated);
      toast.success("Customer deleted successfully");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "", address: "", phone: "", email: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
        <p className="text-muted-foreground mt-1">Add and manage customer information</p>
      </div>

      {/* Customer Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">
          {editingId ? "Edit Customer" : "Add New Customer"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">
                Customer Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">
              Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter customer address"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="gap-2">
              {editingId ? (
                <>
                  <Save className="h-4 w-4" />
                  Update Customer
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Customer
                </>
              )}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={handleCancel} className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Customer List */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Customer List</h2>
        {customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Phone
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Address
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Email
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      {customer.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">{customer.phone}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{customer.address}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {customer.email || "—"}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(customer)}
                          className="gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(customer.id)}
                          className="gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No customers added yet</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Customers;
