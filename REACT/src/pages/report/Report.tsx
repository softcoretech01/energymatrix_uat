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
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface WindmillRecord {
    windmillNumber: string;
    slot: string;
    banking: number;
    powerplant: number;
    aoPowerplantUtilized: number;
    aoBankingUtilized: number;
    aoBalanceBanking: number;
    transmissionLoss: number;
    bankingLoss: number;
    ebBanking: number;
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

    const [selectedYear, setSelectedYear] = useState<string>((new Date().getFullYear() - 1).toString());
    const [reportType, setReportType] = useState<"current" | "financial">("financial");
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
        eb_c1: number;
        eb_c2: number;
        eb_c4: number;
        eb_c5: number;
        ao_pp_c1: number;
        ao_pp_c2: number;
        ao_pp_c4: number;
        ao_pp_c5: number;
        ao_bank_c1: number;
        ao_bank_c2: number;
        ao_bank_c4: number;
        ao_bank_c5: number;
        ao_bal_c1: number;
        ao_bal_c2: number;
        ao_bal_c4: number;
        ao_bal_c5: number;
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
                const yearParam = reportType === "current" ? new Date().getFullYear() : selectedYear;
                const modeParam = reportType === "current" ? "calendar" : "financial";
                const response = await api.get(`/banking/utilized?year=${yearParam}&mode=${modeParam}`);
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
                        eb_c1: number;
                        eb_c2: number;
                        eb_c4: number;
                        eb_c5: number;
                        ao_pp_c1: number;
                        ao_pp_c2: number;
                        ao_pp_c4: number;
                        ao_pp_c5: number;
                        ao_bank_c1: number;
                        ao_bank_c2: number;
                        ao_bank_c4: number;
                        ao_bank_c5: number;
                        ao_bal_c1: number;
                        ao_bal_c2: number;
                        ao_bal_c4: number;
                        ao_bal_c5: number;
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
                            eb_c1: Number(item.eb_c1 || 0),
                            eb_c2: Number(item.eb_c2 || 0),
                            eb_c4: Number(item.eb_c4 || 0),
                            eb_c5: Number(item.eb_c5 || 0),
                            ao_pp_c1: Number(item.ao_pp_c1 || 0),
                            ao_pp_c2: Number(item.ao_pp_c2 || 0),
                            ao_pp_c4: Number(item.ao_pp_c4 || 0),
                            ao_pp_c5: Number(item.ao_pp_c5 || 0),
                            ao_bank_c1: Number(item.ao_bank_c1 || 0),
                            ao_bank_c2: Number(item.ao_bank_c2 || 0),
                            ao_bank_c4: Number(item.ao_bank_c4 || 0),
                            ao_bank_c5: Number(item.ao_bank_c5 || 0),
                            ao_bal_c1: Number(item.ao_bal_c1 || 0),
                            ao_bal_c2: Number(item.ao_bal_c2 || 0),
                            ao_bal_c4: Number(item.ao_bal_c4 || 0),
                            ao_bal_c5: Number(item.ao_bal_c5 || 0),
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
    }, [selectedYear, reportType]);

    // Collapsible states for the 12 months
    const monthsList = reportType === "current"
        ? (selectedYear === new Date().getFullYear().toString()
            ? [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ].slice(0, new Date().getMonth() + 1)
            : [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ])
        : [
            "April", "May", "June", "July", "August", "September",
            "October", "November", "December", "January", "February", "March"
        ];

    const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        const allPossibleMonths = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        allPossibleMonths.forEach((m) => {
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

    // Generate records for each month of the selected financial/calendar year
    const yearNum = reportType === "current" ? new Date().getFullYear() : (parseInt(selectedYear) || currentYear);

    // Running balance per windmill and slot for the current financial/calendar year.
    // Key: `${windmillNumber}-${slot}` -> balance
    const runningBalances: Record<string, number> = {};

    const monthlyDataList: MonthlyData[] = monthsList.map((monthName, idx) => {
        const calendarMonths = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const monthNum = calendarMonths.indexOf(monthName) + 1;

        let monthYear = yearNum;
        if (reportType === "financial") {
            // For financial year, January, February, March belong to the next calendar year
            if (monthNum >= 1 && monthNum <= 3) {
                monthYear = yearNum + 1;
            }
        }

        const records: WindmillRecord[] = windmills.flatMap((wmNumber, wIdx) => {
            // Fetch dynamic utilized value from database
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
                pp_c5: 0,
                eb_c1: 0,
                eb_c2: 0,
                eb_c4: 0,
                eb_c5: 0,
                ao_pp_c1: 0,
                ao_pp_c2: 0,
                ao_pp_c4: 0,
                ao_pp_c5: 0,
                ao_bank_c1: 0,
                ao_bank_c2: 0,
                ao_bank_c4: 0,
                ao_bank_c5: 0,
                ao_bal_c1: 0,
                ao_bal_c2: 0,
                ao_bal_c4: 0,
                ao_bal_c5: 0,
            };

            // Fetch dynamic values for NEXT month to get its banking_units as current month's EB Banking
            let nextMonthNum = monthNum + 1;
            let nextMonthYear = monthYear;
            if (nextMonthNum > 12) {
                nextMonthNum = 1;
                nextMonthYear = monthYear + 1;
            }
            const nextKey = `${nextMonthYear}-${nextMonthNum}-${wmNumber}`;
            const dbUtilizedNext = utilizedData[nextKey] || {
                eb_c1: 0,
                eb_c2: 0,
                eb_c4: 0,
                eb_c5: 0
            };

            // Define slot values for calculations
            const slotValues = {
                C1: { pp: dbUtilized.pp_c1, ut: dbUtilized.c1, eb: dbUtilizedNext.eb_c1, aoPP: dbUtilized.ao_pp_c1, aoBank: dbUtilized.ao_bank_c1, aoBal: dbUtilized.ao_bal_c1 },
                C2: { pp: dbUtilized.pp_c2, ut: dbUtilized.c2, eb: dbUtilizedNext.eb_c2, aoPP: dbUtilized.ao_pp_c2, aoBank: dbUtilized.ao_bank_c2, aoBal: dbUtilized.ao_bal_c2 },
                C4: { pp: dbUtilized.pp_c4, ut: dbUtilized.c4, eb: dbUtilizedNext.eb_c4, aoPP: dbUtilized.ao_pp_c4, aoBank: dbUtilized.ao_bank_c4, aoBal: dbUtilized.ao_bal_c4 },
                C5: { pp: dbUtilized.pp_c5, ut: dbUtilized.c5, eb: dbUtilizedNext.eb_c5, aoPP: dbUtilized.ao_pp_c5, aoBank: dbUtilized.ao_bank_c5, aoBal: dbUtilized.ao_bal_c5 }
            };

            // Fetch opening banking values
            const openingBanking = {
                C1: monthName === "April" ? 0 : (runningBalances[`${wmNumber}-C1`] || 0),
                C2: monthName === "April" ? 0 : (runningBalances[`${wmNumber}-C2`] || 0),
                C4: monthName === "April" ? 0 : (runningBalances[`${wmNumber}-C4`] || 0),
                C5: monthName === "April" ? 0 : (runningBalances[`${wmNumber}-C5`] || 0)
            };

            const slots = ["C1", "C2", "C4", "C5"] as const;

            return slots.map((slot) => {
                const balanceKey = `${wmNumber}-${slot}`;
                const val = slotValues[slot];
                const slotBanking = openingBanking[slot];

                // Update running balance for next month's banking (using EB Banking units)
                runningBalances[balanceKey] = val.eb;

                return {
                    windmillNumber: wmNumber,
                    slot,
                    banking: slotBanking,
                    powerplant: val.pp,
                    aoPowerplantUtilized: val.aoPP,
                    aoBankingUtilized: val.aoBank,
                    aoBalanceBanking: val.aoBal,
                    transmissionLoss: windmillLossesMap[wmNumber] || 0,
                    bankingLoss: globalBankingLoss,
                    ebBanking: val.eb,
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
                    "Powerplant Utilized": row.aoPowerplantUtilized,
                    "Banking Utilized": row.aoBankingUtilized,
                    "Balance Banking": row.aoBalanceBanking,
                    "EB Banking": row.ebBanking
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
        XLSX.writeFile(workbook, `Banking_Report_${yearNum}.xlsx`);
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
    const globalAoPowerplantUtilized = filteredDataList.reduce(
        (sum, month) => sum + month.records.reduce((mSum, r) => mSum + r.aoPowerplantUtilized, 0),
        0
    );
    const globalEbBanking = filteredDataList.reduce(
        (sum, month) => sum + month.records.reduce((mSum, r) => mSum + r.ebBanking, 0),
        0
    );
    const globalAoBankingUtilized = filteredDataList.reduce(
        (sum, month) => sum + month.records.reduce((mSum, r) => mSum + r.aoBankingUtilized, 0),
        0
    );
    const globalAoBalanceBanking = filteredDataList.reduce(
        (sum, month) => sum + month.records.reduce((mSum, r) => mSum + r.aoBalanceBanking, 0),
        0
    );

    // Find the EB Banking total of the last month where all values are filled
    const lastFilledMonthEbBanking = (() => {
        for (let i = filteredDataList.length - 1; i >= 0; i--) {
            const month = filteredDataList[i];
            if (month.records.length > 0 && month.records.every(r =>
                r.banking !== 0 || r.powerplant !== 0 || r.aoPowerplantUtilized !== 0 ||
                r.aoBankingUtilized !== 0 || r.aoBalanceBanking !== 0 || r.ebBanking !== 0
            )) {
                return month.records.reduce((sum, r) => sum + r.ebBanking, 0);
            }
        }
        return 0;
    })();

    return (
        <div className="p-6 bg-slate-50 min-h-screen font-sans">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-8">
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Banking Report
                        </h1>
                        <span className="text-base font-semibold text-black">
                            Total Banking units available as on date:{" "}
                            <span style={{ color: "#CB4154" }} className="font-bold text-lg">
                                {lastFilledMonthEbBanking.toLocaleString()}
                            </span>
                        </span>
                    </div>
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
                    >
                        <FileSpreadsheet className="h-4 w-4" />
                        Export Excel
                    </button>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-0 flex flex-wrap items-center justify-between gap-4">
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
                                    setSelectedMonthFilter("all");
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

                {/* Warning Label */}
                <p className="text-sm font-semibold mb-0 mt-0 text-right" style={{ color: "#CB4154" }}>
                    Upload EB Statements and Allotment Orders for all months till date to get the complete report.
                </p>

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
                                        Powerplant Utilized
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-right sticky top-0 z-20 border-r border-white/10">
                                        Banking Utilized
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-right sticky top-0 z-20 border-r border-white/10">
                                        Balance Banking
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-right sticky top-0 z-20">
                                        EB Banking
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDataList.map((group) => {
                                    const isExpanded = expandedMonths[group.monthName];

                                    // Calculate totals for the group row
                                    const totalBanking = group.records.reduce((sum, r) => sum + r.banking, 0);
                                    const totalPowerplant = group.records.reduce((sum, r) => sum + r.powerplant, 0);
                                    const totalAoPowerplantUtilized = group.records.reduce((sum, r) => sum + r.aoPowerplantUtilized, 0);
                                    const totalAoBankingUtilized = group.records.reduce((sum, r) => sum + r.aoBankingUtilized, 0);
                                    const totalAoBalanceBanking = group.records.reduce((sum, r) => sum + r.aoBalanceBanking, 0);
                                    const totalEbBanking = group.records.reduce((sum, r) => sum + r.ebBanking, 0);
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
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-200 border-r border-slate-200 ${totalAoPowerplantUtilized < 0 ? "text-red-600" : "text-black"}`}>
                                                    {totalAoPowerplantUtilized.toLocaleString()}
                                                </TableCell>
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-200 border-r border-slate-200 ${totalAoBankingUtilized < 0 ? "text-red-600" : "text-black"}`}>
                                                    {totalAoBankingUtilized.toLocaleString()}
                                                </TableCell>
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-200 border-r border-slate-200 ${totalAoBalanceBanking < 0 ? "text-red-600" : "text-black"}`}>
                                                    {totalAoBalanceBanking.toLocaleString()}
                                                </TableCell>
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-200 ${totalEbBanking < 0 ? "text-red-600" : "text-black"}`}>
                                                    {totalEbBanking.toLocaleString()}
                                                </TableCell>
                                            </TableRow>

                                            {/* Windmill Detail Rows (Visible only when expanded) */}
                                            {isExpanded && (
                                                <>
                                                    {group.records.map((row, index) => {
                                                        const firstIdx = group.records.findIndex(r => r.windmillNumber === row.windmillNumber);
                                                        const count = group.records.filter(r => r.windmillNumber === row.windmillNumber).length;
                                                        const isFirst = index === firstIdx;

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
                                                                <TableCell className={`py-2.5 px-4 text-right border-b border-slate-200 border-r border-slate-200 ${row.aoPowerplantUtilized < 0 ? "text-red-600" : "text-black"}`}>
                                                                    {row.aoPowerplantUtilized.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell className={`py-2.5 px-4 text-right border-b border-slate-200 border-r border-slate-200 ${row.aoBankingUtilized < 0 ? "text-red-600" : "text-black"}`}>
                                                                    {row.aoBankingUtilized.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell className={`py-2.5 px-4 text-right border-b border-slate-200 border-r border-slate-200 ${row.aoBalanceBanking < 0 ? "text-red-600" : "text-black"}`}>
                                                                    {row.aoBalanceBanking.toLocaleString()}
                                                                </TableCell>
                                                                <TableCell className={`py-2.5 px-4 text-right border-b border-slate-200 ${row.ebBanking < 0 ? "text-red-600" : "text-black"}`}>
                                                                    {row.ebBanking.toLocaleString()}
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
