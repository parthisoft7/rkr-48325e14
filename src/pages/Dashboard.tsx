import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, IndianRupee, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  totalCustomers: number;
  recentInvoices: Array<{
    invoiceNo: string;
    customerName: string;
    amount: number;
    date: string;
  }>;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    recentInvoices: [],
  });

  useEffect(() => {
    // Load data from localStorage
    const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");

    const totalRevenue = invoices.reduce(
      (sum: number, inv: any) => sum + (inv.total || 0),
      0
    );

    const recentInvoices = invoices
      .slice(-5)
      .reverse()
      .map((inv: any) => ({
        invoiceNo: inv.invoiceNo,
        customerName: inv.customerName,
        amount: inv.total,
        date: inv.invoiceDate,
      }));

    setStats({
      totalInvoices: invoices.length,
      totalRevenue,
      totalCustomers: customers.length,
      recentInvoices,
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to R.K.R. Transport & Travels Invoice Manager
          </p>
        </div>
        <Button onClick={() => navigate("/invoice")} className="gap-2">
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
              <h3 className="text-3xl font-bold text-foreground mt-2">
                {stats.totalInvoices}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-3xl font-bold text-foreground mt-2 flex items-center gap-1">
                <IndianRupee className="h-6 w-6" />
                {stats.totalRevenue.toLocaleString("en-IN")}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
              <h3 className="text-3xl font-bold text-foreground mt-2">
                {stats.totalCustomers}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-accent" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Invoices</h2>
        {stats.recentInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Invoice No
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentInvoices.map((invoice, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      {invoice.invoiceNo || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {invoice.customerName || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {invoice.date
                        ? new Date(invoice.date).toLocaleDateString("en-IN")
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-foreground flex items-center justify-end gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {invoice.amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No invoices created yet</p>
            <Button onClick={() => navigate("/invoice")} className="mt-4" variant="outline">
              Create Your First Invoice
            </Button>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/customers")}>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Manage Customers</h3>
              <p className="text-sm text-muted-foreground">Add and manage customer details</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/invoice")}>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Create Invoice</h3>
              <p className="text-sm text-muted-foreground">Generate new invoice for customers</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
