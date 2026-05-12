import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/services/api";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ActualsPdf() {
    const navigate = useNavigate();
    const { client_eb_id } = useParams();

    const [header, setHeader] = useState(null);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [updatedTotal, setUpdatedTotal] = useState(0);
    const [grandTotal, setGrandTotal] = useState(0);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPdfData();
    }, []);

    const fetchPdfData = async () => {
        try {
            const res = await api.get(`/actuals/pdf/${client_eb_id}`);

            setHeader(res.data.header);
            const processedData = (res.data.data || []).map(item => {
                const val = item.updated_windmill_unit !== null && item.updated_windmill_unit !== undefined
                    ? item.updated_windmill_unit
                    : item.wheeling_charges;
                return {
                    ...item,
                    updated_windmill_unit: Number(Number(val).toFixed(2))
                };
            });
            setData(processedData);
            setTotal(res.data.total);

            // Calculate updated total from processed data
            const ut = processedData.reduce((acc, curr) => acc + (Number(curr.updated_windmill_unit) || 0), 0);
            setUpdatedTotal(ut);
            setGrandTotal(res.data.grand_total);

        } catch (err) {
            console.error("Error fetching PDF data:", err);
        }
    };

    const handleUpdateUnit = (index, value) => {
        const newData = [...data];
        newData[index].updated_windmill_unit = value;
        setData(newData);

        // Recalculate totals
        let newUpdatedTotal = 0;
        newData.forEach(item => {
            newUpdatedTotal += (parseFloat(item.updated_windmill_unit) || 0);
        });
        setUpdatedTotal(newUpdatedTotal);

        // Recalculate Tax and Grand Total (Assume 10% or fetch from header if available)
        // Better to let backend handle precise tax but we can estimate for UI
        const taxRate = 0.1; // Default
        const newTax = newUpdatedTotal * taxRate;
        setHeader(prev => ({ ...prev, self_gen_tax: newTax }));
        setGrandTotal(newUpdatedTotal + newTax);
    };

    const saveUpdatedUnits = async () => {
        setSaving(true);
        try {
            const updates = data.map(item => ({
                actual_id: item.actual_id,
                updated_windmill_unit: parseFloat(item.updated_windmill_unit) || 0
            }));

            await api.post("/actuals/update-units", { updates });
            toast.success("Units updated successfully");
            fetchPdfData(); // Refresh to get precise backend calculations
        } catch (err) {
            console.error("Error saving units:", err);
            toast.error("Failed to save units");
        } finally {
            setSaving(false);
        }
    };

    const getMonthName = (month) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return months[month - 1] || "";
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">

            {/* Top Buttons */}
            <div className="mb-4 flex justify-between items-center no-print max-w-[210mm] mx-auto">
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </Button>

                <Button
                    onClick={saveUpdatedUnits}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                >
                    <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            {/* PDF Container */}
            <div className="bg-white mx-auto p-8 shadow-lg max-w-[210mm] min-h-[297mm]">

                <h3 className="text-center font-bold mb-4">
                    Actual Allotment Units
                </h3>

                {/* Header */}
                {header && (
                    <div className="border p-4 mb-4 text-sm">
                        <p><b>Customer:</b> {header.customer_name}</p>
                        <p><b>Service No:</b> {header.sc_number}</p>
                        <p><b>Year:</b> {header.year}</p>
                        <p><b>Month:</b> {getMonthName(header.month)}</p>

                        <p>
                            <b>Self Generation Tax:</b>{" "}
                            {(Number(header?.self_gen_tax) || 0).toFixed(3)}{" "}
                        </p>
                    </div>
                )}

                {/* Table */}
                <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-left">Windmill</th>
                            <th className="border p-2 text-left">Windmill Name</th>
                            <th className="border p-2 text-left">Wheeling Units</th>
                            <th className="border p-2 text-left no-print">Updated Wheeling Units</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td className="border p-2">{item.windmill}</td>
                                <td className="border p-2">{item.windmill_name}</td>
                                <td className="border p-2">
                                    {(Number(item.wheeling_charges) || 0).toFixed(2)}
                                </td>
                                <td className="border p-2 no-print">
                                    <Input
                                        type="number"
                                        value={item.updated_windmill_unit}
                                        onChange={(e) => handleUpdateUnit(index, e.target.value)}
                                        className="h-8 text-xs"
                                    />
                                </td>
                            </tr>
                        ))}

                        {/* Total */}
                        <tr className="bg-gray-50 font-bold">
                            <td className="border p-2" colSpan={2}>Total Units</td>
                            <td className="border p-2">
                                {(Number(total) || 0).toFixed(2)}
                            </td>
                            <td className="border p-2 no-print">
                                {(Number(updatedTotal) || 0).toFixed(2)}
                            </td>
                        </tr>


                    </tbody>
                </table>

            </div>
        </div>
    );
}
