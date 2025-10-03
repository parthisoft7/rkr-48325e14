import { useState, useRef, useEffect } from "react";
import { InvoiceForm, InvoiceData } from "@/components/InvoiceForm";
import { InvoicePreview } from "@/components/InvoicePreview";
import { Button } from "@/components/ui/button";
import { Download, Eye, EyeOff, Save, Share2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate, useSearchParams } from "react-router-dom";

const Invoice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editInvoiceNo = searchParams.get("edit");
  
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
    if (editInvoiceNo) {
      // Load existing invoice for editing
      const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
      const invoice = invoices.find((inv: any) => inv.invoiceNo === editInvoiceNo);
      if (invoice) {
        setInvoiceData(invoice);
      } else {
        toast.error("Invoice not found");
        navigate("/invoice");
      }
    } else {
      // Generate next invoice number for new invoice
      const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
      const nextNumber = invoices.length + 1;
      setInvoiceData((prev) => ({
        ...prev,
        invoiceNo: `INV-${String(nextNumber).padStart(4, "0")}`,
      }));
    }
  }, [editInvoiceNo, navigate]);

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
      createdAt: editInvoiceNo ? invoiceData.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    
    if (editInvoiceNo) {
      // Update existing invoice
      const index = invoices.findIndex((inv: any) => inv.invoiceNo === editInvoiceNo);
      if (index !== -1) {
        invoices[index] = invoiceToSave;
        toast.success("Invoice updated successfully");
      }
    } else {
      // Create new invoice
      invoices.push(invoiceToSave);
      toast.success("Invoice saved successfully");
    }
    
    localStorage.setItem("invoices", JSON.stringify(invoices));
    setTimeout(() => navigate("/"), 1500);
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    try {
      toast.loading("Generating PDF...");

      // Clone the element and render it off-screen at desktop width
      const originalElement = previewRef.current;
      const clonedElement = originalElement.cloneNode(true) as HTMLElement;
      
      // Create a wrapper with fixed desktop dimensions
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.style.width = '1240px';
      wrapper.style.minWidth = '1240px';
      wrapper.style.maxWidth = '1240px';
      
      // Style the clone for desktop capture
      clonedElement.style.width = '100%';
      clonedElement.style.minWidth = '100%';
      clonedElement.style.maxWidth = '100%';
      clonedElement.style.height = 'auto';
      clonedElement.style.overflow = 'visible';
      clonedElement.style.transform = 'scale(1)';
      
      // Append to wrapper and then to body
      wrapper.appendChild(clonedElement);
      document.body.appendChild(wrapper);
      
      // Wait for rendering and layout
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Capture the cloned element at desktop width
      const canvas = await html2canvas(clonedElement, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: 1240,
        windowWidth: 1240,
      });

      // Remove the wrapper and cloned element
      document.body.removeChild(wrapper);

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      // Calculate image dimensions to fit A4
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add pages if content is longer than one A4 page
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Invoice_${invoiceData.invoiceNo || "Draft"}.pdf`);

      toast.dismiss();
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate PDF. Please try again.");
      console.error("PDF generation error:", error);
    }
  };

  const handleShareInvoice = async () => {
    if (!invoiceData.invoiceNo || !invoiceData.customerName) {
      toast.error("Please save the invoice before sharing");
      return;
    }

    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
    const total = subtotal + parseFloat(invoiceData.oldBalance || "0") - parseFloat(invoiceData.advance || "0");
    
    const shareText = `*Invoice ${invoiceData.invoiceNo}*\n\nCustomer: ${invoiceData.customerName}\nDate: ${invoiceData.invoiceDate}\nTotal Amount: ₹${total.toFixed(2)}\n\nView invoice: ${window.location.origin}/invoice?edit=${invoiceData.invoiceNo}`;
    
    const whatsappUrl = `https://wa.me/919500375066?text=${encodeURIComponent(shareText)}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success("Opening WhatsApp...");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {editInvoiceNo ? "Edit Invoice" : "Create Invoice"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {editInvoiceNo ? "Update invoice details" : "Generate professional invoices"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2 flex-1 sm:flex-none"
          >
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span>Hide Preview</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Show Preview</span>
              </>
            )}
          </Button>
          <Button onClick={handleSaveInvoice} variant="secondary" className="gap-2 flex-1 sm:flex-none">
            <Save className="h-4 w-4" />
            <span>{editInvoiceNo ? "Update" : "Save"}</span>
          </Button>
          <Button onClick={handleShareInvoice} variant="outline" className="gap-2 flex-1 sm:flex-none">
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
          <Button onClick={handleDownloadPDF} className="gap-2 flex-1 sm:flex-none">
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto lg:pr-2">
          <InvoiceForm onDataChange={setInvoiceData} initialData={invoiceData} />
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
