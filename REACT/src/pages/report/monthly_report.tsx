import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronRight, Wind, Calendar, CreditCard, FileSpreadsheet, ListCollapse, ChevronsUpDown, FilterX } from "lucide-react";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import api from "@/services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface SlotRecord {
    slot: string;
    opening: number;
    utilized: number;
    added: number;
    ending: number;
}

interface WindmillRecord {
    windmillNumber: string;
    opening: number;
    utilized: number;
    added: number;
    ending: number;
    slots: SlotRecord[];
}

interface MonthlyData {
    monthName: string;
    displayMonth: string;
    year: number;
    month: number;
    opening: number;
    utilized: number;
    added: number;
    ending: number;
    windmills: WindmillRecord[];
}

export default function MonthlyReport() {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

    const [selectedYear, setSelectedYear] = useState<string>((new Date().getFullYear() - 1).toString());
    const [reportType, setReportType] = useState<"current" | "financial">("financial");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [monthlySummary, setMonthlySummary] = useState<MonthlyData[]>([]);
    const [selectedWindmillFilter, setSelectedWindmillFilter] = useState<string>("all");
    const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>("all");

    // Collapsible states for months: Key = monthName
    const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

    // Collapsible states for windmills: Key = `${monthName}-${windmillNumber}`
    const [expandedWindmills, setExpandedWindmills] = useState<Record<string, boolean>>({});

    const fetchSummaryData = async () => {
        setIsLoading(true);
        try {
            const yearParam = reportType === "current" ? new Date().getFullYear() : selectedYear;
            const modeParam = reportType === "current" ? "calendar" : "financial";
            const response = await api.get(`/banking/monthly-summary?year=${yearParam}&mode=${modeParam}`);
            if (response.data && response.data.status === "success") {
                setMonthlySummary(response.data.data);
            } else {
                toast.error("Unexpected response format from server.");
            }
        } catch (error) {
            console.error("Error fetching monthly summary data:", error);
            toast.error("Failed to fetch monthly banking summary.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setSelectedWindmillFilter("all");
        setSelectedMonthFilter("all");
        fetchSummaryData();
    }, [selectedYear, reportType]);

    const toggleMonth = (monthName: string) => {
        setExpandedMonths(prev => ({
            ...prev,
            [monthName]: !prev[monthName]
        }));
    };

    const toggleWindmill = (monthName: string, wmNum: string) => {
        const key = `${monthName}-${wmNum}`;
        setExpandedWindmills(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const windmillsList = Array.from(
        new Set(
            monthlySummary.flatMap(m => m.windmills.map(w => w.windmillNumber))
        )
    ).sort();

    const monthsList = reportType === "current"
        ? [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ]
        : [
            "April", "May", "June", "July", "August", "September",
            "October", "November", "December", "January", "February", "March"
        ];

    const filteredSummary = monthlySummary
        .filter(group => {
            if (selectedMonthFilter !== "all" && group.monthName !== selectedMonthFilter) {
                return false;
            }
            return true;
        })
        .map(group => {
            const filteredWindmills = group.windmills.filter(wm => {
                if (selectedWindmillFilter !== "all" && wm.windmillNumber !== selectedWindmillFilter) {
                    return false;
                }
                return true;
            });
            
            // Recompute monthly totals based on filtered windmills
            const opening = filteredWindmills.reduce((sum, w) => sum + w.opening, 0);
            const utilized = filteredWindmills.reduce((sum, w) => sum + w.utilized, 0);
            const added = filteredWindmills.reduce((sum, w) => sum + w.added, 0);
            const ending = filteredWindmills.reduce((sum, w) => sum + w.ending, 0);

            return {
                ...group,
                windmills: filteredWindmills,
                opening,
                utilized,
                added,
                ending
            };
        })
        .filter(group => group.windmills.length > 0);

    const isAllExpanded = filteredSummary.length > 0 && filteredSummary.every(m => !!expandedMonths[m.monthName]);

    const toggleAll = () => {
        if (isAllExpanded) {
            setExpandedMonths({});
            setExpandedWindmills({});
        } else {
            const monthsState: Record<string, boolean> = {};
            const wmState: Record<string, boolean> = {};
            filteredSummary.forEach(m => {
                monthsState[m.monthName] = true;
                m.windmills.forEach(w => {
                    wmState[`${m.monthName}-${w.windmillNumber}`] = true;
                });
            });
            setExpandedMonths(monthsState);
            setExpandedWindmills(wmState);
        }
    };

    const handleExportExcel = () => {
        const exportData: any[] = [];

        filteredSummary.forEach(group => {
            group.windmills.forEach(wm => {
                wm.slots.forEach(slot => {
                    exportData.push({
                        "Month": group.displayMonth,
                        "Windmill Number": wm.windmillNumber,
                        "Slot": slot.slot,
                        "Opening Banking": slot.opening,
                        "Utilized Banking": slot.utilized,
                        "Added Banking": slot.added,
                        "EB Banking": slot.ending,
                    });
                });
                // Windmill total row
                exportData.push({
                    "Month": group.displayMonth,
                    "Windmill Number": `${wm.windmillNumber} (Total)`,
                    "Slot": "All",
                    "Opening Banking": wm.opening,
                    "Utilized Banking": wm.utilized,
                    "Added Banking": wm.added,
                    "EB Banking": wm.ending,
                });
            });
            // Month total row
            exportData.push({
                "Month": `${group.displayMonth} (Total)`,
                "Windmill Number": "All",
                "Slot": "All",
                "Opening Banking": group.opening,
                "Utilized Banking": group.utilized,
                "Added Banking": group.added,
                "EB Banking": group.ending,
            });
        });

        if (exportData.length === 0) {
            toast.error("No data available to export.");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Banking");
        XLSX.writeFile(workbook, `Monthly_Banking_Report_${selectedYear}.xlsx`);
        toast.success("Excel report exported successfully!");
    };

    return (
        <div className="p-4 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-full mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                                <CreditCard className="h-6 w-6 text-indigo-600" />
                                Monthly Banking Report
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Summary of banking utilized and added monthly as per EB Statement
                            </p>
                        </div>
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md active:scale-95 md:self-center"
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            Export Excel
                        </button>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-4">
                        {/* Left Actions (Radio buttons for Current Year / Financial Year) */}
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="radio"
                                    name="reportType"
                                    value="current"
                                    checked={reportType === "current"}
                                    onChange={() => {
                                        setReportType("current");
                                        setSelectedYear(new Date().getFullYear().toString());
                                    }}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className={`text-sm font-semibold transition-colors duration-150 ${reportType === "current" ? "text-slate-900" : "text-slate-500"}`}>
                                    Current Year
                                </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="radio"
                                    name="reportType"
                                    value="financial"
                                    checked={reportType === "financial"}
                                    onChange={() => {
                                        setReportType("financial");
                                        setSelectedYear((new Date().getFullYear() - 1).toString());
                                    }}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                />
                                <span className={`text-sm font-semibold transition-colors duration-150 ${reportType === "financial" ? "text-slate-900" : "text-slate-500"}`}>
                                    Financial Year
                                </span>
                            </label>
                        </div>

                        {/* Right Selectors (Windmill, Month, Year, Collapse/Expand, Clear) */}
                        <div className="flex flex-wrap items-center gap-3 ml-auto">
                            {reportType === "financial" ? (
                                <>
                                    <span className="text-sm font-semibold text-slate-600 self-center">April</span>
                                    <div className="w-[110px]">
                                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                                            <SelectTrigger className="bg-white border-slate-300 rounded-lg h-9">
                                                <SelectValue placeholder="Select Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <span className="text-sm font-semibold text-slate-600 self-center mr-5">March {parseInt(selectedYear) + 1}</span>
                                </>
                            ) : (
                                <>
                                    {/* Year Selector */}
                                    <div className="w-[120px]">
                                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                                            <SelectTrigger className="bg-white border-slate-300 rounded-lg h-9">
                                                <SelectValue placeholder="Select Year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}

                            {/* Windmill Selector */}
                            <div className="w-[185px]">
                                <Select value={selectedWindmillFilter} onValueChange={setSelectedWindmillFilter}>
                                    <SelectTrigger className="bg-white border-slate-300 rounded-lg h-9">
                                        <SelectValue placeholder="Select Windmill" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Select Windmill</SelectItem>
                                        {windmillsList.map((wm) => (
                                            <SelectItem key={wm} value={wm}>
                                                {wm}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Month Selector */}
                            <div className="w-[140px]">
                                <Select value={selectedMonthFilter} onValueChange={setSelectedMonthFilter}>
                                    <SelectTrigger className="bg-white border-slate-300 rounded-lg h-9">
                                        <SelectValue placeholder="Select Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Select Month</SelectItem>
                                        {monthsList.map((m) => (
                                            <SelectItem key={m} value={m}>
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Collapse/Expand Toggle Icon */}
                            <button
                                onClick={toggleAll}
                                title={isAllExpanded ? "Collapse All" : "Expand All"}
                                className="h-9 w-9 flex items-center justify-center text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors duration-150 active:scale-95 shadow-sm"
                            >
                                {isAllExpanded ? (
                                    <ListCollapse className="h-4 w-4" />
                                ) : (
                                    <ChevronsUpDown className="h-4 w-4" />
                                )}
                            </button>

                            {/* Clear Filters Icon Button */}
                            {(selectedWindmillFilter !== "all" || selectedMonthFilter !== "all") && (
                                <button
                                    onClick={() => {
                                        setSelectedWindmillFilter("all");
                                        setSelectedMonthFilter("all");
                                        toast.success("Filters cleared");
                                    }}
                                    title="Clear Filters"
                                    className="h-9 w-9 flex items-center justify-center text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 rounded-lg transition-colors duration-150 active:scale-95 shadow-sm"
                                >
                                    <FilterX className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner bg-white">
                        <div className="overflow-auto max-h-[calc(100vh-280px)] relative">
                            <Table noWrapper className="border-collapse border border-slate-200 min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                                <TableHeader className="bg-[#147087] text-white sticky top-0 z-30">
                                    <TableRow className="hover:bg-[#147087]/90 border-b border-slate-200">
                                        <TableHead className="text-white font-bold h-11 w-[200px] text-left align-middle pl-4 border-r border-slate-200/30 uppercase text-[11px] tracking-wider sticky top-0 left-0 bg-[#147087] z-40 shadow-[inset_-1px_0_rgba(255,255,255,0.15)]">MONTH</TableHead>
                                        <TableHead className="text-white font-bold h-11 w-[240px] text-left align-middle border-r border-slate-200/30 uppercase text-[11px] tracking-wider sticky top-0 bg-[#147087] z-30">WINDMILL NUMBER</TableHead>
                                        <TableHead className="text-white font-bold h-11 w-[120px] text-center align-middle border-r border-slate-200/30 uppercase text-[11px] tracking-wider sticky top-0 bg-[#147087] z-30">SLOTS</TableHead>
                                        <TableHead className="text-white font-bold h-11 text-right align-middle pr-4 border-r border-slate-200/30 uppercase text-[11px] tracking-wider sticky top-0 bg-[#147087] z-30">OPENING BANKING</TableHead>
                                        <TableHead className="text-white font-bold h-11 text-right align-middle pr-4 border-r border-slate-200/30 uppercase text-[11px] tracking-wider sticky top-0 bg-[#147087] z-30">UTILIZED BANKING</TableHead>
                                        <TableHead className="text-white font-bold h-11 text-right align-middle pr-4 border-r border-slate-200/30 uppercase text-[11px] tracking-wider sticky top-0 bg-[#147087] z-30">ADDED BANKING</TableHead>
                                        <TableHead className="text-white font-bold h-11 text-right align-middle pr-4 uppercase text-[11px] tracking-wider sticky top-0 bg-[#147087] z-30">EB BANKING</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-20 text-slate-400 bg-slate-50/50">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <p className="font-semibold text-slate-700 text-base">Fetching monthly rollup summary...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredSummary.map((group) => {
                                            const isMonthExpanded = !!expandedMonths[group.monthName];
                                            const windmillCount = group.windmills.length;

                                            // Month cell spans the month total row + all slots of all windmills
                                            const monthRowSpan = isMonthExpanded ? (1 + windmillCount * 4) : 1;

                                            return (
                                                <React.Fragment key={group.monthName}>
                                                    {/* Month Row */}
                                                    <TableRow className="border-b border-slate-200 hover:bg-slate-100/30 transition-colors font-semibold bg-slate-50/50">
                                                        <TableCell
                                                            rowSpan={monthRowSpan}
                                                            onClick={() => toggleMonth(group.monthName)}
                                                            className="cursor-pointer py-3.5 pl-4 text-left text-slate-800 align-middle bg-[#f4f6fa] border border-slate-200 select-none hover:bg-slate-200/60 transition-colors sticky left-0 z-10 shadow-[inset_-1px_0_rgba(226,232,240,1)]"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {isMonthExpanded ? (
                                                                    <ChevronDown className="h-4 w-4 text-slate-700 shrink-0" />
                                                                ) : (
                                                                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                                                                )}
                                                                <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{group.displayMonth}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-3 text-left text-slate-500 italic align-middle border border-slate-200 font-medium">
                                                            Total ({windmillCount} Windmills)
                                                        </TableCell>
                                                        <TableCell className="py-3 text-center align-middle border border-slate-200 font-bold text-slate-400"></TableCell>
                                                        <TableCell className="py-3 text-right font-bold text-slate-900 pr-4 align-middle border border-slate-200">
                                                            {Math.round(group.opening).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="py-3 text-right font-bold text-slate-900 pr-4 align-middle border border-slate-200">
                                                            {Math.round(group.utilized).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="py-3 text-right font-bold text-slate-900 pr-4 align-middle border border-slate-200">
                                                            {Math.round(group.added).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="py-3 text-right font-bold text-slate-900 pr-4 align-middle border border-slate-200">
                                                            {Math.round(group.ending).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>

                                                    {/* Windmills List under Month */}
                                                    {isMonthExpanded && group.windmills.map((wm) => {
                                                        return (
                                                            <React.Fragment key={wm.windmillNumber}>
                                                                {wm.slots.map((slot, sIdx) => {
                                                                    return (
                                                                        <TableRow
                                                                            key={slot.slot}
                                                                            className="hover:bg-slate-50/40 bg-white transition-colors border-b border-slate-200"
                                                                        >
                                                                            {/* Windmill cell spans its 4 slots */}
                                                                            {sIdx === 0 && (
                                                                                <TableCell
                                                                                    rowSpan={4}
                                                                                    className="py-3 px-4 font-semibold text-slate-700 border border-slate-200 align-middle bg-white text-center w-[240px]"
                                                                                >
                                                                                    <div className="flex items-center gap-1.5 justify-center text-slate-700">
                                                                                        <Wind className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                                                        <span className="tracking-tight whitespace-nowrap text-sm font-medium">{wm.windmillNumber}</span>
                                                                                    </div>
                                                                                </TableCell>
                                                                            )}

                                                                            <TableCell className="py-2.5 text-center font-bold text-slate-600 align-middle border border-slate-200 bg-slate-50/10 text-xs">
                                                                                {slot.slot}
                                                                            </TableCell>
                                                                            <TableCell className="py-2.5 text-right text-slate-600 pr-4 align-middle border border-slate-200 text-sm">
                                                                                {Math.round(slot.opening).toLocaleString()}
                                                                            </TableCell>
                                                                            <TableCell className="py-2.5 text-right text-slate-600 pr-4 align-middle border border-slate-200 text-sm">
                                                                                {Math.round(slot.utilized).toLocaleString()}
                                                                            </TableCell>
                                                                            <TableCell className="py-2.5 text-right text-slate-600 pr-4 align-middle border border-slate-200 text-sm">
                                                                                {Math.round(slot.added).toLocaleString()}
                                                                            </TableCell>
                                                                            <TableCell className="py-2.5 text-right text-slate-600 pr-4 align-middle border border-slate-200 text-sm">
                                                                                {Math.round(slot.ending).toLocaleString()}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    );
                                                                })}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            );
                                        })
                                    )}

                                    {!isLoading && filteredSummary.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12 text-slate-400 bg-slate-50 border border-slate-200">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <Search className="h-8 w-8 text-slate-300 stroke-[1.5]" />
                                                    <div>
                                                        <p className="font-semibold text-slate-700">No records found</p>
                                                        <p className="text-xs text-slate-500 mt-1">Try selecting a different year or mode.</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
