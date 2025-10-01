import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, IndianRupee, TrendingUp, Plus, Eye, Edit, Trash2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { InvoicePreview } from "@/components/InvoicePreview";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [deleteInvoiceNo, setDeleteInvoiceNo] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const loadStats = () => {
    const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");

    const totalRevenue = invoices.reduce(
      (sum: number, inv: any) => sum + (inv.total || 0),
      0
    );

    const recentInvoices = invoices
      .slice(-10)
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
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleViewInvoice = (invoiceNo: string) => {
    const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    const invoice = invoices.find((inv: any) => inv.invoiceNo === invoiceNo);
    if (invoice) {
      setViewInvoice(invoice);
    }
  };

  const handleEditInvoice = (invoiceNo: string) => {
    navigate(`/invoice?edit=${invoiceNo}`);
  };

  const handleDeleteInvoice = (invoiceNo: string) => {
    setDeleteInvoiceNo(invoiceNo);
  };

  const confirmDelete = () => {
    if (!deleteInvoiceNo) return;
    
    const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    const updatedInvoices = invoices.filter((inv: any) => inv.invoiceNo !== deleteInvoiceNo);
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
    
    toast.success("Invoice deleted successfully");
    setDeleteInvoiceNo(null);
    loadStats();
  };

  const handleDownloadPDF = async (invoice: any) => {
    if (!previewRef.current) return;

    try {
      toast.loading("Generating PDF...");

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice_${invoice.invoiceNo || "Draft"}.pdf`);

      toast.dismiss();
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate PDF. Please try again.");
      console.error("PDF generation error:", error);
    }
  };

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
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Actions
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
                    <td className="py-3 px-4 text-sm text-right font-medium text-foreground">
                      <div className="flex items-center justify-end gap-1">
                        <IndianRupee className="h-4 w-4" />
                        {invoice.amount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewInvoice(invoice.invoiceNo)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditInvoice(invoice.invoiceNo)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteInvoice(invoice.invoiceNo)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* View Invoice Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Invoice Preview
              {viewInvoice && (
                <Button
                  onClick={() => handleDownloadPDF(viewInvoice)}
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {viewInvoice && (
            <div className="bg-white rounded-lg">
              <InvoicePreview ref={previewRef} data={viewInvoice} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteInvoiceNo} onOpenChange={() => setDeleteInvoiceNo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {deleteInvoiceNo}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
