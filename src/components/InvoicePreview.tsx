import { forwardRef } from "react";
import { format } from "date-fns";
import { InvoiceData } from "./InvoiceForm";
import companyHeader from "@/assets/company-header.png";
import signature from "@/assets/signature.png";

interface InvoicePreviewProps {
  data: InvoiceData;
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ data }, ref) => {
    const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0);
    const oldBalance = parseFloat(data.oldBalance) || 0;
    const advance = parseFloat(data.advance) || 0;
    const total = subtotal + oldBalance - advance;

    return (
      <div ref={ref} className="bg-white p-8 shadow-lg" style={{ minHeight: "297mm" }}>
        {/* Company Header */}
        <div className="mb-6 border-b-2 border-gray-300 pb-4 flex justify-center">
          <img
            src={companyHeader}
            alt="R.K.R. Transport & Travels"
            className="w-full h-auto object-contain"
            style={{ maxHeight: "120px" }}
          />
        </div>

        {/* Customer and Invoice Details */}
        <div className="flex justify-between items-start mb-6">
          {/* Customer Details - Left */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Bill To:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium">{data.customerName || "N/A"}</p>
              <p>{data.customerAddress || "N/A"}</p>
              <p>{data.customerPhone || "N/A"}</p>
            </div>
          </div>

          {/* Invoice Details - Right */}
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">INVOICE</h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-semibold">Invoice No:</span> {data.invoiceNo || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Invoice Date:</span>{" "}
                {data.invoiceDate
                  ? format(new Date(data.invoiceDate), "dd-MM-yyyy")
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border border-gray-400 px-2 py-2 text-left text-sm font-semibold w-12">
                  S.No
                </th>
                <th className="border border-gray-400 px-2 py-2 text-left text-sm font-semibold w-24">
                  Date
                </th>
                <th className="border border-gray-400 px-2 py-2 text-left text-sm font-semibold w-28">
                  Vehicle No
                </th>
                <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">
                  Description
                </th>
                <th className="border border-gray-400 px-2 py-2 text-right text-sm font-semibold w-20">
                  Qty/Km
                </th>
                <th className="border border-gray-400 px-2 py-2 text-right text-sm font-semibold w-24">
                  Rate (₹)
                </th>
                <th className="border border-gray-400 px-2 py-2 text-right text-sm font-semibold w-28">
                  Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-2 py-2 text-sm text-gray-700">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-sm text-gray-700">
                    {item.date ? format(new Date(item.date), "dd-MM-yyyy") : "N/A"}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-sm text-gray-700">
                    {item.vehicleNo || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-gray-700">
                    {item.description || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-sm text-gray-700 text-right">
                    {item.qtyKm || "0"}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-sm text-gray-700 text-right">
                    {parseFloat(item.rate || "0").toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-sm text-gray-700 text-right font-medium">
                    {item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-xs">
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-300">
                <span className="font-semibold text-gray-700">Subtotal:</span>
                <span className="font-semibold text-gray-800">₹ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-300">
                <span className="font-semibold text-gray-700">Old Balance:</span>
                <span className="font-semibold text-gray-800">₹ {oldBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-300">
                <span className="font-semibold text-gray-700">Advance:</span>
                <span className="font-semibold text-gray-800">- ₹ {advance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 bg-gray-100 px-3 rounded">
                <span className="font-bold text-gray-800 text-lg">Total:</span>
                <span className="font-bold text-gray-900 text-lg">₹ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="border-t-2 border-gray-300 pt-6 mb-8">
          <h3 className="font-bold text-gray-800 mb-3">Bank/Payment Details:</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              <span className="font-semibold">Bank Name:</span> Union Bank of India
            </p>
            <p>
              <span className="font-semibold">Branch Name:</span> Chamiers Road
            </p>
            <p>
              <span className="font-semibold">Account No:</span> 332301010050547
            </p>
            <p>
              <span className="font-semibold">IFSC Code:</span> UBIN0533238
            </p>
            <p>
              <span className="font-semibold">Google Pay:</span> 89399-15816
            </p>
          </div>
        </div>

        {/* Signature */}
        <div className="flex justify-end mt-12">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800 mb-3">For RKR TRANSPORT AND TRAVELS</p>
            <img
              src={signature}
              alt="Authorized Signature"
              className="h-16 mb-2"
              style={{ maxWidth: "150px" }}
            />
            <p className="text-sm font-semibold text-gray-800">Authorized Signatory</p>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";
