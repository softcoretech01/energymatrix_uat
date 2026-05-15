import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/services/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

// ─────────────────────────────────────────────────
// Helpers (Subset of PDF ones)
// ─────────────────────────────────────────────────
function formatAmount(n: number): string {
    return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
}

function formatDate(dateStr: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("en-IN", { month: "short" });
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
}

// ─────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────
export default function ClientInvoiceEdit() {
    const { invoice_id } = useParams<{ invoice_id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [invoice, setInvoice] = useState<any>(null);
    const [details, setDetails] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, [invoice_id]);

    const fetchData = async () => {
        try {
            const [infoRes, detailsRes] = await Promise.all([
                api.get(`/invoices/${invoice_id}/print-data`),
                api.get(`/invoices/${invoice_id}/details`)
            ]);
            setInvoice(infoRes.data.data);
            setDetails(detailsRes.data.data);
        } catch (err: any) {
            console.error("Error fetching data:", err);
            const errMsg = err?.response?.data?.message || err?.response?.data?.detail || "Failed to load invoice data";
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleAmountChange = (fieldName: string, value: string) => {
        setDetails(prev => prev.map(d =>
            d.field_name === fieldName ? { ...d, amount: value } : d
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                details,
                delivery_note: invoice.delivery_note,
                mode_terms_of_payment: invoice.mode_terms_of_payment,
                reference_no_date: invoice.reference_no_date,
                other_references: invoice.other_references,
                buyers_order_no: invoice.buyers_order_no,
                buyers_order_date: invoice.buyers_order_date,
                dispatch_doc_no: invoice.dispatch_doc_no,
                delivery_note_date: invoice.delivery_note_date,
                dispatched_through: invoice.dispatched_through,
                destination: invoice.destination,
                terms_of_delivery: invoice.terms_of_delivery
            };
            await api.put(`/invoices/${invoice_id}/details`, payload);
            toast.success("Invoice updated successfully!");
            navigate(`/windmill/client-invoice/pdf/${invoice_id}`);
        } catch (err: any) {
            console.error("Error saving invoice:", err);
            const errMsg = err?.response?.data?.message || err?.response?.data?.detail || "Failed to update invoice";
            toast.error(errMsg);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!invoice) return <div className="p-8 text-center text-red-500">Invoice not found.</div>;

    // Mapping for UI
    const dMap: Record<string, { amount: number, calculation?: string }> = {};
    details.forEach(d => {
        dMap[d.field_name] = {
            amount: Number(d.amount),
            calculation: d.calculation
        };
    });

    const units = dMap["Units"]?.amount || 0;
    const rate = dMap["Rate"]?.amount || 0;
    const energyAmount = units * rate;

    const chargesKeys = [
        "Meter", "O&M Charges", "Transmsn Chrgs", "Sys Opr Chrgs",
        "RkvAh", "Import Chrgs", "Scheduling chrgs", "DSM Charges",
        "Wheeling", "Other Charges", "Self Generation Tax"
    ];
    const totalCharges = chargesKeys.reduce((sum, key) => sum + (dMap[key]?.amount || 0), 0);
    const finalTotal = energyAmount - totalCharges;

    return (
        <div className="min-h-screen bg-slate-50 p-6 pb-20">
            {/* Header / Action Bar */}
            <div className="flex items-center justify-between mb-6 max-w-[210mm] mx-auto">
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => navigate(-1)} className="bg-white">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-xl font-bold text-slate-800">Edit Invoice Amounts</h1>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            {/* ─── A4 Preview / Edit Container ─── */}
            <div className="bg-white mx-auto shadow-xl max-w-[210mm] min-h-[297mm] text-[11px] font-sans border border-gray-300 overflow-hidden">

                {/* Header Section (Non-editable info) */}
                <div className="flex border-b border-gray-400 bg-slate-50/50">
                    <div className="w-1/2 border-r border-gray-400 p-4">
                        <p className="font-bold text-indigo-700 mb-1 uppercase text-[9px]">Buyer (Bill to)</p>
                        <p className="font-bold text-sm">{invoice.customer_name}</p>
                        <p className="text-slate-600 mt-1">{invoice.customer_address}</p>
                        <p className="text-slate-600">{invoice.customer_city}</p>
                    </div>
                    <div className="w-1/2 p-4 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold">Invoice No.</p>
                            <p className="font-bold">{invoice.invoice_number}</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold">Dated</p>
                            <p className="font-bold">{formatDate(invoice.invoice_date)}</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold">Service No.</p>
                            <p className="font-bold">{invoice.service_number}</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold">Period</p>
                            <p className="font-bold">{invoice.month} {invoice.year}</p>
                        </div>
                    </div>
                </div>

                {/* Delivery and Terms Section (New Fields) */}
                <div className="grid grid-cols-2 border-b border-gray-400">
                    <div className="border-r border-gray-400 p-2 space-y-2">
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Delivery Note</label>
                            <Input
                                value={invoice.delivery_note || ""}
                                onChange={(e) => setInvoice({ ...invoice, delivery_note: e.target.value })}
                                className="h-7 text-[10px] border-slate-200"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Reference No. & Date.</label>
                            <Input
                                value={invoice.reference_no_date || ""}
                                onChange={(e) => setInvoice({ ...invoice, reference_no_date: e.target.value })}
                                className="h-7 text-[10px] border-slate-200"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Buyer's Order No.</label>
                            <Input
                                value={invoice.buyers_order_no || ""}
                                onChange={(e) => setInvoice({ ...invoice, buyers_order_no: e.target.value })}
                                className="h-7 text-[10px] border-slate-200"
                            />
                        </div>
                    </div>
                    <div className="p-2 space-y-2">
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Mode/Terms of Payment</label>
                            <Input
                                value={invoice.mode_terms_of_payment || ""}
                                onChange={(e) => setInvoice({ ...invoice, mode_terms_of_payment: e.target.value })}
                                className="h-7 text-[10px] border-slate-200"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Other References</label>
                            <Input
                                value={invoice.other_references || ""}
                                onChange={(e) => setInvoice({ ...invoice, other_references: e.target.value })}
                                className="h-7 text-[10px] border-slate-200"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Dated</label>
                            <Input
                                type="date"
                                value={invoice.buyers_order_date || ""}
                                onChange={(e) => setInvoice({ ...invoice, buyers_order_date: e.target.value })}
                                className="h-7 text-[10px] border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 border-b border-gray-400">
                    <div className="border-r border-gray-400 p-2 space-y-2">
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Dispatch Doc No.</label>
                            <Input
                                value={invoice.dispatch_doc_no || ""}
                                onChange={(e) => setInvoice({ ...invoice, dispatch_doc_no: e.target.value })}
                                className="h-7 text-[10px] border-slate-200"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Dispatched through</label>
                            <Input
                                value={invoice.dispatched_through || ""}
                                onChange={(e) => setInvoice({ ...invoice, dispatched_through: e.target.value })}
                                className="h-7 text-[10px] border-slate-200"
                            />
                        </div>
                    </div>
                    <div className="p-2 space-y-2">
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Delivery Note Date</label>
                            <Input
                                type="date"
                                value={invoice.delivery_note_date || ""}
                                onChange={(e) => setInvoice({ ...invoice, delivery_note_date: e.target.value })}
                                className="h-7 text-[10px] border-slate-200"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Destination</label>
                            <Input
                                value={invoice.destination || ""}
                                onChange={(e) => setInvoice({ ...invoice, destination: e.target.value })}
                                className="h-7 text-[10px] border-slate-200"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-2 border-b border-gray-400">
                    <div className="flex flex-col">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Terms of Delivery</label>
                        <Input
                            value={invoice.terms_of_delivery || ""}
                            onChange={(e) => setInvoice({ ...invoice, terms_of_delivery: e.target.value })}
                            className="h-7 text-[10px] border-slate-200"
                        />
                    </div>
                </div>

                {/* Editable Fields Table */}
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-slate-800 text-white">
                            <th className="p-3 text-left w-2/3 border-r border-slate-700">Description of Goods / Charges</th>
                            <th className="p-3 text-right w-1/3">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Generation Section */}
                        <tr className="bg-indigo-50/30 border-b border-slate-200">
                            <td className="p-3 border-r border-slate-200">
                                <p className="font-bold text-indigo-900 mb-2">Electrical Energy Generation</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase">Generated Units</label>
                                        <Input
                                            type="number"
                                            value={dMap["Units"]?.amount}
                                            onChange={(e) => handleAmountChange("Units", e.target.value)}
                                            className="h-8 text-xs border-slate-300 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase">Rate per Unit (₹)</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={dMap["Rate"]?.amount}
                                            onChange={(e) => handleAmountChange("Rate", e.target.value)}
                                            className="h-8 text-xs border-slate-300 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                <p className="mt-3 text-[10px] text-indigo-600 font-medium italic">
                                    Energy Amount: {units.toLocaleString()} x ₹{rate.toFixed(2)} = ₹{energyAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </td>
                            <td className="p-3 align-bottom text-right font-bold text-indigo-900 text-sm">
                                {formatAmount(energyAmount)}
                            </td>
                        </tr>

                        {/* Charges Section */}
                        {chargesKeys.map((key, idx) => (
                            <tr key={key} title={dMap[key]?.calculation} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                <td className="p-3 border-r border-slate-200 flex items-center justify-between cursor-help">
                                    <span className="font-medium text-slate-700">{key}</span>
                                    <span className="text-slate-400 text-[9px] font-bold">DEDUCTION (-)</span>
                                </td>
                                <td className="p-2">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={dMap[key]?.amount}
                                        onChange={(e) => handleAmountChange(key, e.target.value)}
                                        className="h-8 text-xs border-slate-300 text-right font-semibold text-red-600 focus:ring-red-500"
                                    />
                                </td>
                            </tr>
                        ))}

                        {/* Summary Section */}
                        <tr className="bg-slate-100 border-b border-slate-200">
                            <td className="p-3 border-r border-slate-200 text-right text-slate-600 font-semibold uppercase text-[10px]">
                                Net Units Value
                            </td>
                            <td className="p-3 text-right font-bold text-slate-700">
                                ₹ {formatAmount(energyAmount)}
                            </td>
                        </tr>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <td className="p-3 border-r border-slate-200 text-right text-slate-600 font-semibold uppercase text-[10px]">
                                Total Deductions
                            </td>
                            <td className="p-3 text-right font-bold text-red-600">
                                (-) ₹ {formatAmount(totalCharges)}
                            </td>
                        </tr>
                        <tr className="bg-slate-900 text-white">
                            <td className="p-4 border-r border-slate-700 text-right font-bold text-sm uppercase tracking-wider">
                                Final Amount (Net Units - Total)
                            </td>
                            <td className="p-4 text-right font-bold text-lg">
                                ₹ {formatAmount(finalTotal)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer Decor */}
                <div className="p-8 mt-auto flex justify-between items-end">
                    <div className="w-1/2">
                        <p className="font-bold underline mb-4 text-slate-400">Declaration</p>
                        <div className="h-1 bg-slate-100 w-full mb-2"></div>
                        <div className="h-1 bg-slate-100 w-3/4 mb-2"></div>
                        <div className="h-1 bg-slate-100 w-1/2"></div>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 font-bold mb-12">Authorised Signatory</p>
                        <p className="font-bold text-indigo-900">New Vision Wind Power Private Limited</p>
                    </div>
                </div>
            </div>

            {/* Floating Save FAB (Mobile/Small screens) */}
            <div className="fixed bottom-6 right-6 lg:hidden">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-full h-14 w-14 shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white p-0"
                >
                    {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                </Button>
            </div>
        </div>
    );
}
