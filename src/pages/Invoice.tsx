import { useState, useRef, useEffect } from "react";
import { InvoiceForm, InvoiceData } from "@/components/InvoiceForm";
import { InvoicePreview } from "@/components/InvoicePreview";
import { Button } from "@/components/ui/button";
import { Download, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";

const Invoice = () => {
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
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

  const [showPreview, setShowPreview] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate next invoice number
    const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    const nextNumber = invoices.length + 1;
    setInvoiceData((prev) => ({
      ...prev,
      invoiceNo: `INV-${String(nextNumber).padStart(4, "0")}`,
    }));
  }, []);

  const handleSaveInvoice = () => {
    if (!invoiceData.invoiceNo || !invoiceData.customerName) {
      toast.error("Please fill in invoice number and customer name");
      return;
    }

    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
    const total =
      subtotal + parseFloat(invoiceData.oldBalance || "0") - parseFloat(invoiceData.advance || "0");

    const invoiceToSave = {
      ...invoiceData,
      total,
      createdAt: new Date().toISOString(),
    };

    const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    invoices.push(invoiceToSave);
    localStorage.setItem("invoices", JSON.stringify(invoices));

    toast.success("Invoice saved successfully");
    setTimeout(() => navigate("/"), 1500);
  };

  const handleDownloadPDF = async () => {
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
      pdf.save(`Invoice_${invoiceData.invoiceNo || "Draft"}.pdf`);

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
          <h1 className="text-3xl font-bold text-foreground">Create Invoice</h1>
          <p className="text-muted-foreground mt-1">Generate professional invoices</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span className="hidden sm:inline">Hide Preview</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Show Preview</span>
              </>
            )}
          </Button>
          <Button onClick={handleSaveInvoice} variant="secondary" className="gap-2">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save Invoice</span>
          </Button>
          <Button onClick={handleDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto lg:pr-2">
          <InvoiceForm onDataChange={setInvoiceData} />
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-180px)]">
            <div className="bg-muted rounded-lg p-4 overflow-auto max-h-[calc(100vh-200px)]">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Invoice Preview</h2>
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <InvoicePreview ref={previewRef} data={invoiceData} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoice;
