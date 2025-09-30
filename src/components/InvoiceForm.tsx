import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface InvoiceItem {
  id: string;
  date: string;
  vehicleNo: string;
  description: string;
  qtyKm: string;
  rate: string;
  amount: number;
}

export interface InvoiceData {
  invoiceNo: string;
  invoiceDate: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  items: InvoiceItem[];
  oldBalance: string;
  advance: string;
}

interface InvoiceFormProps {
  onDataChange: (data: InvoiceData) => void;
}

export const InvoiceForm = ({ onDataChange }: InvoiceFormProps) => {
  const [customers, setCustomers] = useState<
    Array<{ id: string; name: string; address: string; phone: string }>
  >([]);
  const [formData, setFormData] = useState<InvoiceData>({
    invoiceNo: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    customerName: "",
    customerAddress: "",
    customerPhone: "",
    items: [
      {
        id: "1",
        date: new Date().toISOString().split("T")[0],
        vehicleNo: "",
        description: "",
        qtyKm: "",
        rate: "",
        amount: 0,
      },
    ],
    oldBalance: "0",
    advance: "0",
  });

  useEffect(() => {
    // Load customers from localStorage
    const saved = localStorage.getItem("customers");
    if (saved) {
      setCustomers(JSON.parse(saved));
    }
  }, []);

  const updateFormData = (updates: Partial<InvoiceData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onDataChange(newData);
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      updateFormData({
        customerName: customer.name,
        customerAddress: customer.address,
        customerPhone: customer.phone,
      });
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      vehicleNo: "",
      description: "",
      qtyKm: "",
      rate: "",
      amount: 0,
    };
    updateFormData({ items: [...formData.items, newItem] });
  };

  const removeItem = (id: string) => {
    updateFormData({ items: formData.items.filter((item) => item.id !== id) });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string) => {
    const updatedItems = formData.items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === "qtyKm" || field === "rate") {
          const qty = parseFloat(field === "qtyKm" ? value : item.qtyKm) || 0;
          const rate = parseFloat(field === "rate" ? value : item.rate) || 0;
          updatedItem.amount = qty * rate;
        }
        return updatedItem;
      }
      return item;
    });
    updateFormData({ items: updatedItems });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Invoice Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="invoiceNo">Invoice Number</Label>
            <Input
              id="invoiceNo"
              value={formData.invoiceNo}
              onChange={(e) => updateFormData({ invoiceNo: e.target.value })}
              placeholder="INV-001"
            />
          </div>
          <div>
            <Label htmlFor="invoiceDate">Invoice Date</Label>
            <Input
              id="invoiceDate"
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => updateFormData({ invoiceDate: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Customer Details</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerSelect">Select Existing Customer</Label>
            <Select onValueChange={handleCustomerSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a customer or enter manually" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => updateFormData({ customerName: e.target.value })}
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <Label htmlFor="customerAddress">Customer Address</Label>
            <Input
              id="customerAddress"
              value={formData.customerAddress}
              onChange={(e) => updateFormData({ customerAddress: e.target.value })}
              placeholder="Enter customer address"
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Phone Number</Label>
            <Input
              id="customerPhone"
              value={formData.customerPhone}
              onChange={(e) => updateFormData({ customerPhone: e.target.value })}
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Invoice Items</h2>
          <Button onClick={addItem} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={item.id} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Item {index + 1}
                </span>
                {formData.items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={item.date}
                    onChange={(e) => updateItem(item.id, "date", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Vehicle No</Label>
                  <Input
                    value={item.vehicleNo}
                    onChange={(e) => updateItem(item.id, "vehicleNo", e.target.value)}
                    placeholder="TN 01 AB 1234"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="Service description"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Qty/Km</Label>
                  <Input
                    type="number"
                    value={item.qtyKm}
                    onChange={(e) => updateItem(item.id, "qtyKm", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Rate (₹)</Label>
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, "rate", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Amount (₹)</Label>
                  <Input value={item.amount.toFixed(2)} disabled className="bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Payment Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="oldBalance">Old Balance (₹)</Label>
            <Input
              id="oldBalance"
              type="number"
              value={formData.oldBalance}
              onChange={(e) => updateFormData({ oldBalance: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="advance">Advance (₹)</Label>
            <Input
              id="advance"
              type="number"
              value={formData.advance}
              onChange={(e) => updateFormData({ advance: e.target.value })}
              placeholder="0.00"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
