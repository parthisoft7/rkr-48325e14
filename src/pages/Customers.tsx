import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast.error("Failed to load customers");
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editingId) {
        // Update existing customer
        const { error } = await supabase
          .from("customers")
          .update({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email || null,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Customer updated successfully");
        setEditingId(null);
      } else {
        // Add new customer
        const { error } = await supabase
          .from("customers")
          .insert({
            user_id: user.id,
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email || null,
          });

        if (error) throw error;
        toast.success("Customer added successfully");
      }

      setFormData({ name: "", address: "", phone: "", email: "" });
      loadCustomers();
    } catch (error: any) {
      toast.error(error.message || "Failed to save customer");
      console.error(error);
    } finally {
      setLoading(false);
    }
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Customer deleted successfully");
      loadCustomers();
    } catch (error: any) {
      toast.error("Failed to delete customer");
      console.error(error);
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
            <Button type="submit" className="gap-2" disabled={loading}>
              {editingId ? (
                <>
                  <Save className="h-4 w-4" />
                  {loading ? "Updating..." : "Update Customer"}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {loading ? "Adding..." : "Add Customer"}
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
