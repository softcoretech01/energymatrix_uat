import React, { useState, useEffect } from "react";
import { Search, ChevronDown, ChevronRight, CheckCircle, FileText, CreditCard, Wind, TrendingUp, Wallet, FileSpreadsheet, ChevronsUpDown, ChevronsDownUp, FilterX, TrendingDown, PlusCircle } from "lucide-react";
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

interface WindmillRecord {
    windmillNumber: string;
    slot: string;
    banking: number;
    powerplant: number;
    utilized: number;
    utilizedBanking: number;
    addedBanking: number;
    balance: number;
    transmissionLoss: number;
    bankingLoss: number;
}

interface MonthlyData {
    monthName: string; // e.g. "April"
    displayMonth: string; // e.g. "April 2026"
    records: WindmillRecord[];
}

export default function BankReport() {
    const currentYear = new Date().getFullYear();
    // Years dropdown with +- 3 years from current year
    const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

    const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
    const [windmills, setWindmills] = useState<string[]>([]);
    const [windmillLossesMap, setWindmillLossesMap] = useState<Record<string, number>>({});
    const [globalBankingLoss, setGlobalBankingLoss] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedWindmillFilter, setSelectedWindmillFilter] = useState<string>("all");
    const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>("all");
    const [utilizedData, setUtilizedData] = useState<Record<string, {
        total: number;
        c1: number;
        c2: number;
        c4: number;
        c5: number;
        pp_c1: number;
        pp_c2: number;
        pp_c4: number;
        pp_c5: number;
    }>>({});

    useEffect(() => {
        const fetchWindmills = async () => {
            try {
                const response = await api.get("/windmills/active-posted");
                if (Array.isArray(response.data)) {
                    const losses: Record<string, number> = {};
                    response.data.forEach((item: any) => {
                        const wmNum = String(item.windmill_number || "").trim();
                        if (wmNum) {
                            losses[wmNum] = Number(item.transmission_loss || 0);
                        }
                    });
                    setWindmillLossesMap(losses);

                    const numbers = Array.from(
                        new Set(
                            response.data
                                .filter((item: any) => String(item.type || "").toLowerCase() === "windmill")
                                .map((item: any) => String(item.windmill_number || "").trim())
                        )
                    ).filter(Boolean);
                    if (numbers.length > 0) {
                        setWindmills(numbers);
                    } else {
                        toast.warning("No active windmills found.");
                    }
                } else {
                    toast.error("Unexpected response format from server.");
                }
            } catch (error) {
                console.error("Error fetching windmills:", error);
                toast.error("Failed to connect to server for windmill headers.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchWindmills();
    }, []);

    useEffect(() => {
        const fetchUtilizedData = async () => {
            try {
                const response = await api.get(`/banking/utilized?year=${selectedYear}`);
                if (Array.isArray(response.data)) {
                    if (response.data.length > 0) {
                        setGlobalBankingLoss(Number(response.data[0].banking_loss || 0));
                    }
                    const dataMap: Record<string, {
                        total: number;
                        c1: number;
                        c2: number;
                        c4: number;
                        c5: number;
                        pp_c1: number;
                        pp_c2: number;
                        pp_c4: number;
                        pp_c5: number;
                    }> = {};
                    response.data.forEach((item: any) => {
                        const key = `${item.year}-${item.month}-${String(item.windmill_number || "").trim()}`;
                        dataMap[key] = {
                            total: Number(item.total_utilized || 0),
                            c1: Number(item.c1 || 0),
                            c2: Number(item.c2 || 0),
                            c4: Number(item.c4 || 0),
                            c5: Number(item.c5 || 0),
                            pp_c1: Number(item.pp_c1 || 0),
                            pp_c2: Number(item.pp_c2 || 0),
                            pp_c4: Number(item.pp_c4 || 0),
                            pp_c5: Number(item.pp_c5 || 0),
                        };
                    });
                    setUtilizedData(dataMap);
                }
            } catch (error) {
                console.error("Error fetching utilized data:", error);
                toast.error("Failed to fetch dynamic utilized units.");
            }
        };
        fetchUtilizedData();
    }, [selectedYear]);

    // Collapsible states for the 12 months
    const monthsList = [
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December", "January", "February", "March"
    ];

    const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        monthsList.forEach((m) => {
            initial[m] = true; // Expanded by default
        });
        return initial;
    });

    const toggleMonth = (monthName: string) => {
        setExpandedMonths((prev) => ({
            ...prev,
            [monthName]: !prev[monthName],
        }));
    };

    const [allExpanded, setAllExpanded] = useState<boolean>(true);

    const toggleAllMonths = () => {
        const nextState = !allExpanded;
        const nextExpanded: Record<string, boolean> = {};
        monthsList.forEach((m) => {
            nextExpanded[m] = nextState;
        });
        setExpandedMonths(nextExpanded);
        setAllExpanded(nextState);
    };

    // Generate records for each month of the selected financial year
    const yearNum = parseInt(selectedYear) || currentYear;

    // Running balance per windmill and slot for the current financial year.
    // Key: `${windmillNumber}-${slot}` -> balance
    const runningBalances: Record<string, number> = {};

    const monthlyDataList: MonthlyData[] = monthsList.map((monthName, idx) => {
        // Financial year logic: Jan, Feb, March belong to the next calendar year
        const yearOffset = idx >= 9 ? 1 : 0;
        const monthYear = yearNum + yearOffset;

        const records: WindmillRecord[] = windmills.flatMap((wmNumber, wIdx) => {
            // Fetch dynamic utilized value from database
            const monthNum = idx >= 9 ? idx - 8 : idx + 4;
            const key = `${monthYear}-${monthNum}-${wmNumber}`;
            const dbUtilized = utilizedData[key] || {
                total: 0,
                c1: 0,
                c2: 0,
                c4: 0,
                c5: 0,
                pp_c1: 0,
                pp_c2: 0,
                pp_c4: 0,
                pp_c5: 0
            };

            const slots = ["C1", "C2", "C4", "C5"];

            return slots.map((slot) => {
                const balanceKey = `${wmNumber}-${slot}`;

                // Rule 1: in every year "April" month will have "Banking" = 0 for all windmills
                let slotBanking = 0;
                if (monthName !== "April") {
                    slotBanking = runningBalances[balanceKey] || 0;
                }

                let slotPowerplant = 0;
                let slotUtilized = 0;

                if (slot === "C1") {
                    slotPowerplant = dbUtilized.pp_c1;
                    slotUtilized = dbUtilized.c1;
                } else if (slot === "C2") {
                    slotPowerplant = dbUtilized.pp_c2;
                    slotUtilized = dbUtilized.c2;
                } else if (slot === "C4") {
                    slotPowerplant = dbUtilized.pp_c4;
                    slotUtilized = dbUtilized.c4;
                } else if (slot === "C5") {
                    slotPowerplant = dbUtilized.pp_c5;
                    slotUtilized = dbUtilized.c5;
                }

                // Rule 2, 3 & 4:
                // Balance = Powerplant - utilized. If utilized > powerplant, deduct remaining from Banking.
                // If utilized < powerplant, Balance = Banking + remaining powerplant.
                // Balance of one month is Banking of next month.
                // Capped at 0 since banked units cannot go below 0.
                const slotUtilizedBanking = slotUtilized > slotPowerplant ? slotUtilized - slotPowerplant : 0;
                const slotAddedBankingOriginal = slotPowerplant > slotUtilized ? slotPowerplant - slotUtilized : 0;
                const transmissionLoss = windmillLossesMap[wmNumber] || 0;
                const bankingLoss = globalBankingLoss;
                
                // Calculate transmission loss and banking loss as percentages of the surplus (Added banking)
                const slotAddedBanking = parseFloat(
                    (
                        slotAddedBankingOriginal +
                        (slotAddedBankingOriginal * transmissionLoss) / 100 -
                        (slotAddedBankingOriginal * bankingLoss) / 100
                    ).toFixed(2)
                );
                
                const slotBalance = parseFloat((slotBanking - slotUtilizedBanking + slotAddedBanking).toFixed(2));

                // Update running balance for next month's banking
                runningBalances[balanceKey] = slotBalance;

                return {
                    windmillNumber: wmNumber,
                    slot,
                    banking: slotBanking,
                    powerplant: slotPowerplant,
                    utilized: slotUtilized,
                    utilizedBanking: slotUtilizedBanking,
                    addedBanking: slotAddedBanking,
                    balance: slotBalance,
                    transmissionLoss,
                    bankingLoss,
                };
            });
        });

        return {
            monthName,
            displayMonth: `${monthName} ${monthYear}`,
            records,
        };
    });

    // Filtering logic based on dropdown selectors
    const filteredDataList = monthlyDataList
        .filter((group) => {
            // Filter by selected month
            if (selectedMonthFilter !== "all" && group.monthName !== selectedMonthFilter) {
                return false;
            }
            return true;
        })
        .map((group) => {
            const filteredRecords = group.records.filter((rec) => {
                // Filter by selected windmill
                if (selectedWindmillFilter !== "all" && rec.windmillNumber !== selectedWindmillFilter) {
                    return false;
                }
                return true;
            });

            return {
                ...group,
                records: filteredRecords,
            };
        });



    const handleExportExcel = () => {
        // Prepare data for export
        const exportData: any[] = [];
        filteredDataList.forEach((group) => {
            group.records.forEach((row) => {
                exportData.push({
                    "Month": group.displayMonth,
                    "Windmill Number": row.windmillNumber,
                    "Slot": row.slot,
                    "Opening Banking": row.banking,
                    "Powerplant": row.powerplant,
                    "Total Utilized": row.utilized,
                    "Utilized Banking": row.utilizedBanking,
                    "Added Banking": row.addedBanking,
                    "Closing Banking": row.balance
                });
            });
        });

        if (exportData.length === 0) {
            toast.error("No data available to export.");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Banking Report");
        XLSX.writeFile(workbook, `Banking_Report_${selectedYear}.xlsx`);
        toast.success("Excel report exported successfully!");
    };

    // Calculate global aggregates based on selected filters
    const globalBanking = filteredDataList.reduce(
        (sum, month) => sum + month.records.reduce((mSum, r) => mSum + r.banking, 0),
        0
    );
    const globalPowerplant = filteredDataList.reduce(
        (sum, month) => sum + month.records.reduce((mSum, r) => mSum + r.powerplant, 0),
        0
    );
    const globalUtilized = filteredDataList.reduce(
        (sum, month) => sum + month.records.reduce((mSum, r) => mSum + r.utilized, 0),
        0
    );
    const globalUtilizedBanking = filteredDataList.reduce(
        (sum, month) => sum + month.records.reduce((mSum, r) => mSum + r.utilizedBanking, 0),
        0
    );
    const globalAddedBanking = filteredDataList.reduce(
        (sum, month) => sum + month.records.reduce((mSum, r) => mSum + r.addedBanking, 0),
        0
    );
    const globalBalance = filteredDataList.reduce(
        (sum, month) => sum + month.records.reduce((mSum, r) => mSum + r.balance, 0),
        0
    );

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        Banking Report
                    </h1>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        Export Excel
                    </button>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
                    {/* Left Actions (Financial Year) */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Financial Year Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700">Financial Year:</span>
                            <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">April</span>
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
                            <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">March - {yearNum + 1}</span>
                        </div>
                    </div>

                    {/* Right Selectors (Windmill, Month, Collapse/Expand, Clear) */}
                    <div className="flex flex-wrap items-center gap-3 ml-auto">
                        {/* Windmill Selector */}
                        <div className="w-[185px]">
                            <Select value={selectedWindmillFilter} onValueChange={setSelectedWindmillFilter}>
                                <SelectTrigger className="bg-white border-slate-300 rounded-lg h-9">
                                    <SelectValue placeholder="Select Windmill" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Select Windmill</SelectItem>
                                    {windmills.map((wm) => (
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
                            onClick={toggleAllMonths}
                            title={allExpanded ? "Collapse All" : "Expand All"}
                            className="h-9 w-9 flex items-center justify-center text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors duration-150 active:scale-95 shadow-sm"
                        >
                            {allExpanded ? (
                                <ChevronsDownUp className="h-4 w-4" />
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

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                    {/* Added Banking Card */}
                    <div className="p-5 bg-cyan-50/50 border border-cyan-100/80 rounded-xl flex flex-col items-center justify-center transition-all duration-300 hover:bg-cyan-50 hover:-translate-y-1 hover:shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                            <PlusCircle className="h-5 w-5 text-cyan-600" />
                            <span className="text-sm font-semibold text-cyan-700">Added Banking</span>
                        </div>
                        <span className="text-2xl font-bold text-cyan-900">
                            {globalAddedBanking.toLocaleString()}
                        </span>
                    </div>

                    {/* Utilized Banking Card */}
                    <div className="p-5 bg-rose-50/50 border border-rose-100/80 rounded-xl flex flex-col items-center justify-center transition-all duration-300 hover:bg-rose-50 hover:-translate-y-1 hover:shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="h-5 w-5 text-rose-600" />
                            <span className="text-sm font-semibold text-rose-700">Utilized Banking</span>
                        </div>
                        <span className="text-2xl font-bold text-rose-900">
                            {globalUtilizedBanking.toLocaleString()}
                        </span>
                    </div>

                    {/* Closing Balance Card */}
                    <div className="p-5 bg-blue-50/50 border border-blue-100/80 rounded-xl flex flex-col items-center justify-center transition-all duration-300 hover:bg-blue-50 hover:-translate-y-1 hover:shadow-md">
                        <div className="flex flex-col items-center text-center gap-1 mb-2">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-700">Closing Banking</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-normal normal-case">
                                (Added Banking - Utilized Banking)
                            </span>
                        </div>
                        <span className="text-2xl font-bold text-blue-900">
                            {(globalAddedBanking - globalUtilizedBanking).toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Collapsible Grid Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="max-h-[600px] overflow-y-auto relative">
                        <Table noWrapper className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                            <TableHeader className="sticky top-0 bg-sidebar z-20 shadow-[inset_0_-1px_0_rgba(255,255,255,0.15)]">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar w-[200px] text-left sticky left-0 top-0 z-30 shadow-[inset_-1px_0_rgba(255,255,255,0.15)] border-r border-white/10">
                                        Month
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-left sticky top-0 z-20 border-r border-white/10">
                                        Windmill Number
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-left sticky top-0 z-20 border-r border-white/10">
                                        Slots
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-right sticky top-0 z-20 border-r border-white/10">
                                        Opening Banking
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-right sticky top-0 z-20 border-r border-white/10">
                                        Powerplant
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-right sticky top-0 z-20 border-r border-white/10">
                                        Total Utilized
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-right sticky top-0 z-20 border-r border-white/10">
                                        Utilized Banking
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-right sticky top-0 z-20 border-r border-white/10">
                                        Added Banking
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-right sticky top-0 z-20">
                                        Closing Banking
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDataList.map((group) => {
                                    const isExpanded = expandedMonths[group.monthName];

                                    // Calculate totals for the group row
                                    const totalBanking = group.records.reduce((sum, r) => sum + r.banking, 0);
                                    const totalPowerplant = group.records.reduce((sum, r) => sum + r.powerplant, 0);
                                    const totalUtilized = group.records.reduce((sum, r) => sum + r.utilized, 0);
                                    const totalUtilizedBanking = group.records.reduce((sum, r) => sum + r.utilizedBanking, 0);
                                    const totalAddedBanking = group.records.reduce((sum, r) => sum + r.addedBanking, 0);
                                    const totalBalance = group.records.reduce((sum, r) => sum + r.balance, 0);
                                    const uniqueWindmillsCount = new Set(group.records.map(r => r.windmillNumber)).size;

                                    return (
                                        <React.Fragment key={group.monthName}>
                                            {/* Month Summary Header Row (Collapsible Toggle) */}
                                            <TableRow
                                                onClick={() => toggleMonth(group.monthName)}
                                                className="bg-slate-100/70 hover:bg-slate-100 border-b border-slate-200 cursor-pointer font-semibold transition-colors duration-150"
                                            >
                                                <TableCell className="py-3 px-4 sticky left-0 bg-slate-100 z-10 shadow-[inset_-1px_0_rgba(226,232,240,1)] border-b border-slate-200 border-r border-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 shrink-0 ${isExpanded ? "" : "-rotate-90"}`} />
                                                        <span className="text-slate-800">{group.displayMonth}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell colSpan={2} className="py-3 px-4 text-slate-500 italic border-b border-slate-200 border-r border-slate-200">
                                                    Total ({uniqueWindmillsCount} Windmills)
                                                </TableCell>
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-200 border-r border-slate-200 ${totalBanking < 0 ? "text-red-600" : "text-black"}`}>
                                                    {totalBanking.toLocaleString()}
                                                </TableCell>
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-200 border-r border-slate-200 ${totalPowerplant < 0 ? "text-red-600" : "text-black"}`}>
                                                    {totalPowerplant.toLocaleString()}
                                                </TableCell>
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-200 border-r border-slate-200 ${totalUtilized < 0 ? "text-red-600" : "text-black"}`}>
                                                    {totalUtilized.toLocaleString()}
                                                </TableCell>
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-200 border-r border-slate-200 ${totalUtilizedBanking < 0 ? "text-red-600" : "text-black"}`}>
                                                    {totalUtilizedBanking.toLocaleString()}
                                                </TableCell>
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-200 border-r border-slate-200 ${totalAddedBanking < 0 ? "text-red-600" : "text-black"}`}>
                                                    {totalAddedBanking.toLocaleString()}
                                                </TableCell>
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-200 ${totalBalance < 0 ? "text-red-600" : "text-black"}`}>
                                                    {totalBalance.toLocaleString()}
                                                </TableCell>
                                            </TableRow>

                                            {/* Windmill Detail Rows (Visible only when expanded) */}
                                            {isExpanded && (
                                                <>
                                                    {group.records.map((row, index) => {
                                                        const firstIdx = group.records.findIndex(r => r.windmillNumber === row.windmillNumber);
                                                        const count = group.records.filter(r => r.windmillNumber === row.windmillNumber).length;
                                                        const isFirst = index === firstIdx;

                                                        const baseSurplus = row.powerplant > row.utilized ? row.powerplant - row.utilized : 0;
                                                        const transLossUnits = parseFloat(((baseSurplus * row.transmissionLoss) / 100).toFixed(2));
                                                        const bankLossUnits = parseFloat(((baseSurplus * row.bankingLoss) / 100).toFixed(2));

                                                        return (
                                                            <TableRow
                                                                key={index}
                                                                className="hover:bg-slate-50/80 border-b border-slate-100 last:border-b-0 transition-colors"
                                                            >
                                                                {index === 0 && (
                                                                    <TableCell
                                                                        rowSpan={group.records.length}
                                                                        className="sticky left-0 bg-white z-10 shadow-[inset_-1px_0_rgba(226,232,240,1)] border-b border-slate-200 border-r border-slate-200"
                                                                    >
                                                                        {/* Visual grouping spacing */}
                                                                    </TableCell>
                                                                )}
                                                                {isFirst && (
                                                                    <TableCell
                                                                        rowSpan={count}
                                                                        className="py-2.5 px-4 font-semibold text-slate-800 border-b border-slate-200 border-r border-slate-200 align-middle bg-white/95"
                                                                    >
                                                                        <div className="flex items-center gap-1.5 justify-start">
                                                                            <Wind className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                                            <span className="tracking-tight">{row.windmillNumber}</span>
                                                                        </div>
                                                                    </TableCell>
                                                                )}
                                                                <TableCell className="py-2 px-4 text-left border-b border-slate-200 border-r border-slate-200 align-middle text-slate-700 font-semibold">
                                                                    {row.slot}
                                                                </TableCell>
                                                                <TableCell className={`py-2.5 px-4 text-right border-b border-slate-200 border-r border-slate-200 ${row.banking < 0 ? "text-red-600" : "text-black"}`}>
                                                                    {row.banking.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell className={`py-2.5 px-4 text-right border-b border-slate-200 border-r border-slate-200 ${row.powerplant < 0 ? "text-red-600" : "text-black"}`}>
                                                                    {row.powerplant.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell className={`py-2.5 px-4 text-right border-b border-slate-200 border-r border-slate-200 ${row.utilized < 0 ? "text-red-600" : "text-black"}`}>
                                                                    {row.utilized.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell
                                                                    className={`py-2.5 px-4 text-right border-b border-slate-200 border-r border-slate-200 ${row.utilizedBanking < 0 ? "text-red-600" : "text-black"}`}
                                                                    title={`Deficit: Total Utilized (${row.utilized.toLocaleString()}) - Powerplant (${row.powerplant.toLocaleString()}) = ${row.utilizedBanking.toLocaleString()}`}
                                                                >
                                                                    {row.utilizedBanking.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell
                                                                    className={`py-2.5 px-4 text-right border-b border-slate-200 border-r border-slate-200 ${row.addedBanking < 0 ? "text-red-600" : "text-black"}`}
                                                                    title={`Surplus Base: Powerplant (${row.powerplant.toLocaleString()}) - Total Utilized (${row.utilized.toLocaleString()}) = ${baseSurplus.toLocaleString()}\nTransmission Loss (+${row.transmissionLoss}%): +${transLossUnits.toLocaleString()}\nBanking Loss (-${row.bankingLoss}%): -${bankLossUnits.toLocaleString()}\nAdded Banking = ${row.addedBanking.toLocaleString()}`}
                                                                >
                                                                    {row.addedBanking.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell
                                                                    className={`py-2.5 px-4 text-right border-b border-slate-200 ${row.balance < 0 ? "text-red-600" : "text-black"}`}
                                                                    title={`Opening Banking (${row.banking.toLocaleString()}) - Utilized Banking (${row.utilizedBanking.toLocaleString()}) + Added Banking (${row.addedBanking.toLocaleString()}) = ${row.balance.toLocaleString()}`}
                                                                >
                                                                    {row.balance.toLocaleString()}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                                {filteredDataList.every(g => g.records.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-12 text-slate-400 bg-slate-50">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Search className="h-8 w-8 text-slate-300 stroke-[1.5]" />
                                                <div>
                                                    <p className="font-medium text-slate-700">
                                                        {isLoading ? "Loading report data..." : "No records found"}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {isLoading
                                                            ? "Please wait while we load the windmills..."
                                                            : windmills.length === 0
                                                                ? "No active windmills found in the database."
                                                                : "Try checking the spelling or search keyword."}
                                                    </p>
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
    );
}
