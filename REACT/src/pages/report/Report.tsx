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
    ebStatementBankingUtilized: number;
    ownCalculatedBankingUtilized: number;
    ownCalculatedEbBanking: number;
    ownOpeningBanking: number;
    hoverFormulaText: string;
    balanceHoverText?: string;
    ea_total_allotted?: number;
    act_total_calculated_wheeling_value?: number;
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
        ea_bank_c1: number;
        ea_bank_c2: number;
        ea_bank_c4: number;
        ea_bank_c5: number;
        ea_total_allotted?: number;
        act_total_calculated_wheeling_value?: number;
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
                        ea_bank_c1: number;
                        ea_bank_c2: number;
                        ea_bank_c4: number;
                        ea_bank_c5: number;
                        ea_total_allotted?: number;
                        act_total_calculated_wheeling_value?: number;
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
                            ea_bank_c1: Number(item.ea_bank_c1 || 0),
                            ea_bank_c2: Number(item.ea_bank_c2 || 0),
                            ea_bank_c4: Number(item.ea_bank_c4 || 0),
                            ea_bank_c5: Number(item.ea_bank_c5 || 0),
                            ea_total_allotted: Number(item.ea_total_allotted || 0),
                            act_total_calculated_wheeling_value: Number(item.act_total_calculated_wheeling_value || 0),
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
            initial[m] = false; // Collapsed by default
        });
        return initial;
    });

    const toggleMonth = (monthName: string) => {
        setExpandedMonths((prev) => ({
            ...prev,
            [monthName]: !prev[monthName],
        }));
    };

    const [allExpanded, setAllExpanded] = useState<boolean>(false);

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
    const runningOwnBalances: Record<string, number> = {};

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
                ea_bank_c1: 0,
                ea_bank_c2: 0,
                ea_bank_c4: 0,
                ea_bank_c5: 0,
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
                C1: { pp: dbUtilized.pp_c1, ut: dbUtilized.c1, eb: dbUtilizedNext.eb_c1, aoPP: dbUtilized.ao_pp_c1, aoBank: dbUtilized.ao_bank_c1, aoBal: dbUtilized.ao_bal_c1, eaBank: dbUtilized.ea_bank_c1 },
                C2: { pp: dbUtilized.pp_c2, ut: dbUtilized.c2, eb: dbUtilizedNext.eb_c2, aoPP: dbUtilized.ao_pp_c2, aoBank: dbUtilized.ao_bank_c2, aoBal: dbUtilized.ao_bal_c2, eaBank: dbUtilized.ea_bank_c2 },
                C4: { pp: dbUtilized.pp_c4, ut: dbUtilized.c4, eb: dbUtilizedNext.eb_c4, aoPP: dbUtilized.ao_pp_c4, aoBank: dbUtilized.ao_bank_c4, aoBal: dbUtilized.ao_bal_c4, eaBank: dbUtilized.ea_bank_c4 },
                C5: { pp: dbUtilized.pp_c5, ut: dbUtilized.c5, eb: dbUtilizedNext.eb_c5, aoPP: dbUtilized.ao_pp_c5, aoBank: dbUtilized.ao_bank_c5, aoBal: dbUtilized.ao_bal_c5, eaBank: dbUtilized.ea_bank_c5 }
            };

            // Fetch opening banking values
            const openingBanking = {
                C1: monthName === "April" ? 0 : (runningBalances[`${wmNumber}-C1`] || 0),
                C2: monthName === "April" ? 0 : (runningBalances[`${wmNumber}-C2`] || 0),
                C4: monthName === "April" ? 0 : (runningBalances[`${wmNumber}-C4`] || 0),
                C5: monthName === "April" ? 0 : (runningBalances[`${wmNumber}-C5`] || 0)
            };

            const openingOwnBanking = {
                C1: monthName === "April" ? 0 : (runningOwnBalances[`${wmNumber}-C1`] || 0),
                C2: monthName === "April" ? 0 : (runningOwnBalances[`${wmNumber}-C2`] || 0),
                C4: monthName === "April" ? 0 : (runningOwnBalances[`${wmNumber}-C4`] || 0),
                C5: monthName === "April" ? 0 : (runningOwnBalances[`${wmNumber}-C5`] || 0)
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
                    aoBankingUtilized: val.ut,
                    aoBalanceBanking: val.aoBal,
                    transmissionLoss: windmillLossesMap[wmNumber] || 0,
                    bankingLoss: globalBankingLoss,
                    ebBanking: val.eb,
                    ebStatementBankingUtilized: val.aoBank,
                    ea_total_allotted: dbUtilized.ea_total_allotted ?? 0,
                    act_total_calculated_wheeling_value: dbUtilized.act_total_calculated_wheeling_value ?? 0,
                    ownCalculatedBankingUtilized: 0,
                    ownCalculatedEbBanking: (dbUtilized.ea_total_allotted ?? 0) - (dbUtilized.act_total_calculated_wheeling_value ?? 0),
                    ownOpeningBanking: 0,
                    hoverFormulaText: "",
                    balanceHoverText: "",
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
            const windmillsInGroup = Array.from(new Set(group.records.map(r => r.windmillNumber)));
            windmillsInGroup.forEach((wmNumber) => {
                const wmRecords = group.records.filter(r => r.windmillNumber === wmNumber);
                const c1Rec = wmRecords.find(r => r.slot === "C1") || null;
                const c2Rec = wmRecords.find(r => r.slot === "C2") || null;
                const c4Rec = wmRecords.find(r => r.slot === "C4") || null;
                const c5Rec = wmRecords.find(r => r.slot === "C5") || null;

                const rowDefs = [
                    {
                        label: "Opening Banking (EB Statement)",
                        valC1: c1Rec?.banking ?? 0,
                        valC2: c2Rec?.banking ?? 0,
                        valC4: c4Rec?.banking ?? 0,
                        valC5: c5Rec?.banking ?? 0,
                        isMerged: false,
                        valTotal: 0
                    },
                    {
                        label: "Powerplant (EB Statement)",
                        valC1: c1Rec?.powerplant ?? 0,
                        valC2: c2Rec?.powerplant ?? 0,
                        valC4: c4Rec?.powerplant ?? 0,
                        valC5: c5Rec?.powerplant ?? 0,
                        isMerged: false,
                        valTotal: 0
                    },
                    {
                        label: "Powerplant Utilized (Allotment Order)",
                        valC1: c1Rec?.aoPowerplantUtilized ?? 0,
                        valC2: c2Rec?.aoPowerplantUtilized ?? 0,
                        valC4: c4Rec?.aoPowerplantUtilized ?? 0,
                        valC5: c5Rec?.aoPowerplantUtilized ?? 0,
                        isMerged: false,
                        valTotal: 0
                    },
                    {
                        label: "Banking Utilized (Allotment Order)",
                        valC1: c1Rec?.ebStatementBankingUtilized ?? 0,
                        valC2: c2Rec?.ebStatementBankingUtilized ?? 0,
                        valC4: c4Rec?.ebStatementBankingUtilized ?? 0,
                        valC5: c5Rec?.ebStatementBankingUtilized ?? 0,
                        isMerged: false,
                        valTotal: 0
                    },
                    {
                        label: "Balance Banking (Allotment Order)",
                        valC1: c1Rec?.ebBanking ?? 0,
                        valC2: c2Rec?.ebBanking ?? 0,
                        valC4: c4Rec?.ebBanking ?? 0,
                        valC5: c5Rec?.ebBanking ?? 0,
                        isMerged: false,
                        valTotal: 0
                    },
                    {
                        label: "Balance Banking (Our Own Calculation)",
                        valC1: "",
                        valC2: "",
                        valC4: "",
                        valC5: "",
                        isMerged: true,
                        valTotal: ((c1Rec?.ea_total_allotted ?? 0) - (c1Rec?.act_total_calculated_wheeling_value ?? 0)) * (1 - (globalBankingLoss / 100))
                    },
                ];

                rowDefs.forEach((row) => {
                    const totalVal = row.isMerged ? row.valTotal : ((row.valC1 as number) + (row.valC2 as number) + (row.valC4 as number) + (row.valC5 as number));
                    exportData.push({
                        "Month": group.displayMonth,
                        "Windmill Number": wmNumber,
                        "Particulars": row.label,
                        "C1": row.valC1,
                        "C2": row.valC2,
                        "C4": row.valC4,
                        "C5": row.valC5,
                        "Total": totalVal,
                    });
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

    // Find the EB Banking total of the current month (or fallback to the last filled month)
    const currentMonthBankingUnits = (() => {
        const currentMonthName = new Date().toLocaleString("en-US", { month: "long" });
        const currentMonthData = monthlyDataList.find(m => m.monthName === currentMonthName);
        if (currentMonthData && currentMonthData.records.length > 0) {
            return currentMonthData.records.reduce((sum, r) => sum + r.ebBanking, 0);
        }
        // Fallback to the last filled month in monthlyDataList
        for (let i = monthlyDataList.length - 1; i >= 0; i--) {
            const month = monthlyDataList[i];
            if (month.records.length > 0) {
                const totalEbBanking = month.records.reduce((sum, r) => sum + r.ebBanking, 0);
                if (totalEbBanking !== 0) {
                    return totalEbBanking;
                }
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
                                {currentMonthBankingUnits.toLocaleString()}
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
                                        Month / Windmill
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-left sticky top-0 z-20 border-r border-white/10">
                                        Particulars
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-center sticky top-0 z-20 border-r border-white/10">
                                        C1
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-center sticky top-0 z-20 border-r border-white/10">
                                        C2
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-center sticky top-0 z-20 border-r border-white/10">
                                        C4
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-center sticky top-0 z-20 border-r border-white/10">
                                        C5
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-center sticky top-0 z-20">
                                        Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDataList.map((group) => {
                                    const isExpanded = expandedMonths[group.monthName];

                                    // Calculate monthly totals for the collapsible header row
                                    const groupEbC1 = group.records.reduce((sum, r) => sum + (r.slot === "C1" ? r.ebBanking : 0), 0);
                                    const groupEbC2 = group.records.reduce((sum, r) => sum + (r.slot === "C2" ? r.ebBanking : 0), 0);
                                    const groupEbC4 = group.records.reduce((sum, r) => sum + (r.slot === "C4" ? r.ebBanking : 0), 0);
                                    const groupEbC5 = group.records.reduce((sum, r) => sum + (r.slot === "C5" ? r.ebBanking : 0), 0);
                                    const groupEbTotal = groupEbC1 + groupEbC2 + groupEbC4 + groupEbC5;

                                    const uniqueWindmillsCount = new Set(group.records.map(r => r.windmillNumber)).size;
                                    const windmillsInGroup = Array.from(new Set(group.records.map(r => r.windmillNumber)));

                                    return (
                                        <React.Fragment key={group.monthName}>
                                            {/* Month Summary Header Row (Collapsible Toggle) */}
                                            <TableRow
                                                onClick={() => toggleMonth(group.monthName)}
                                                className="bg-slate-100/70 hover:bg-slate-100 border-b border-slate-400 cursor-pointer font-semibold transition-colors duration-150"
                                            >
                                                <TableCell className="py-3 px-4 sticky left-0 bg-slate-100 z-10 shadow-[inset_-1px_0_rgba(148,163,184,1)] border-b border-slate-400 border-r border-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 shrink-0 ${isExpanded ? "" : "-rotate-90"}`} />
                                                        <span className="text-slate-800">{group.displayMonth}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 px-4 text-slate-500 italic border-b border-slate-400 border-r border-slate-400">
                                                    Total EB Banking (EB Statement) ({uniqueWindmillsCount} Windmills)
                                                </TableCell>
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-400 border-r border-slate-400 ${groupEbC1 < 0 ? "text-red-600" : "text-black"}`}>
                                                    {groupEbC1.toLocaleString()}
                                                </TableCell>
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-400 border-r border-slate-400 ${groupEbC2 < 0 ? "text-red-600" : "text-black"}`}>
                                                    {groupEbC2.toLocaleString()}
                                                </TableCell>
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-400 border-r border-slate-400 ${groupEbC4 < 0 ? "text-red-600" : "text-black"}`}>
                                                    {groupEbC4.toLocaleString()}
                                                </TableCell>
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-400 border-r border-slate-400 ${groupEbC5 < 0 ? "text-red-600" : "text-black"}`}>
                                                    {groupEbC5.toLocaleString()}
                                                </TableCell>
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-400 ${groupEbTotal < 0 ? "text-red-600" : "text-black"}`}>
                                                    {groupEbTotal.toLocaleString()}
                                                </TableCell>
                                            </TableRow>

                                            {/* Windmill Detail Rows (Visible only when expanded) */}
                                            {isExpanded && windmillsInGroup.flatMap((wmNumber) => {
                                                const wmRecords = group.records.filter(r => r.windmillNumber === wmNumber);
                                                const c1Rec = wmRecords.find(r => r.slot === "C1") || null;
                                                const c2Rec = wmRecords.find(r => r.slot === "C2") || null;
                                                const c4Rec = wmRecords.find(r => r.slot === "C4") || null;
                                                const c5Rec = wmRecords.find(r => r.slot === "C5") || null;

                                                const totalAllotted = c1Rec?.ea_total_allotted ?? 0;
                                                const totalWheeling = c1Rec?.act_total_calculated_wheeling_value ?? 0;
                                                const rawDiff = totalAllotted - totalWheeling;
                                                const lossVal = rawDiff * (globalBankingLoss / 100);
                                                const finalVal = rawDiff - lossVal;
                                                const calculatedHover = `Total Allotted: ${totalAllotted.toLocaleString()} - Total Wheeling Value: ${totalWheeling.toLocaleString()} = ${rawDiff.toLocaleString()} - ${globalBankingLoss}% Banking Loss (${lossVal.toLocaleString()}) = ${finalVal.toLocaleString()}`;

                                                const rowDefs = [
                                                    {
                                                        label: "Opening Banking (EB Statement)",
                                                        valC1: c1Rec?.banking ?? 0,
                                                        valC2: c2Rec?.banking ?? 0,
                                                        valC4: c4Rec?.banking ?? 0,
                                                        valC5: c5Rec?.banking ?? 0,
                                                    },
                                                    {
                                                        label: "Powerplant (EB Statement)",
                                                        valC1: c1Rec?.powerplant ?? 0,
                                                        valC2: c2Rec?.powerplant ?? 0,
                                                        valC4: c4Rec?.powerplant ?? 0,
                                                        valC5: c5Rec?.powerplant ?? 0,
                                                    },
                                                    {
                                                        label: "Powerplant Utilized (Allotment Order)",
                                                        valC1: c1Rec?.aoPowerplantUtilized ?? 0,
                                                        valC2: c2Rec?.aoPowerplantUtilized ?? 0,
                                                        valC4: c4Rec?.aoPowerplantUtilized ?? 0,
                                                        valC5: c5Rec?.aoPowerplantUtilized ?? 0,
                                                    },
                                                    {
                                                        label: "Banking Utilized (Allotment Order)",
                                                        valC1: c1Rec?.ebStatementBankingUtilized ?? 0,
                                                        valC2: c2Rec?.ebStatementBankingUtilized ?? 0,
                                                        valC4: c4Rec?.ebStatementBankingUtilized ?? 0,
                                                        valC5: c5Rec?.ebStatementBankingUtilized ?? 0,
                                                    },
                                                    {
                                                        label: "Balance Banking (Allotment Order)",
                                                        valC1: c1Rec?.ebBanking ?? 0,
                                                        valC2: c2Rec?.ebBanking ?? 0,
                                                        valC4: c4Rec?.ebBanking ?? 0,
                                                        valC5: c5Rec?.ebBanking ?? 0,
                                                    },
                                                    {
                                                        label: "Balance Banking (Our Own Calculation)",
                                                        isMerged: true,
                                                        valTotal: finalVal,
                                                        hoverText: calculatedHover
                                                    },
                                                ] as any[];

                                                return rowDefs.map((row, rIdx) => {
                                                    if (row.isMerged) {
                                                        return (
                                                            <TableRow
                                                                key={`${wmNumber}-${rIdx}`}
                                                                className="hover:bg-slate-50/80 border-b border-slate-400 last:border-b-0 transition-colors"
                                                            >
                                                                {rIdx === 0 && (
                                                                    <TableCell
                                                                        rowSpan={6}
                                                                        className="py-2.5 px-4 font-semibold text-slate-800 border-b border-slate-400 border-r border-slate-400 align-middle bg-white/95 sticky left-0 z-10 shadow-[inset_-1px_0_rgba(148,163,184,1)]"
                                                                    >
                                                                        <div className="flex items-center gap-1.5 justify-start">
                                                                            <Wind className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                                            <span className="tracking-tight">{wmNumber}</span>
                                                                        </div>
                                                                    </TableCell>
                                                                )}
                                                                <TableCell className="py-2 px-4 text-left border-b border-slate-400 border-r border-slate-400 align-middle text-slate-700 font-medium">
                                                                    {row.label}
                                                                </TableCell>
                                                                {row.hoverText ? (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <TableCell
                                                                                colSpan={5}
                                                                                className="py-2 px-4 text-center border-b border-slate-400 font-semibold cursor-help"
                                                                                style={{ color: '#B22222' }}
                                                                            >
                                                                                {row.valTotal.toLocaleString()}
                                                                            </TableCell>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className="bg-white text-black border border-slate-300 text-base font-semibold px-4 py-2.5 shadow-lg max-w-md">
                                                                            {row.hoverText}
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                ) : (
                                                                    <TableCell
                                                                        colSpan={5}
                                                                        className="py-2 px-4 text-center border-b border-slate-400 font-semibold"
                                                                        style={{ color: '#B22222' }}
                                                                    >
                                                                        {row.valTotal.toLocaleString()}
                                                                    </TableCell>
                                                                )}
                                                            </TableRow>
                                                        );
                                                    }

                                                    const totalVal = row.valC1 + row.valC2 + row.valC4 + row.valC5;

                                                    return (
                                                        <TableRow
                                                            key={`${wmNumber}-${rIdx}`}
                                                            className="hover:bg-slate-50/80 border-b border-slate-400 last:border-b-0 transition-colors"
                                                        >
                                                            {rIdx === 0 && (
                                                                <TableCell
                                                                    rowSpan={6}
                                                                    className="py-2.5 px-4 font-semibold text-slate-800 border-b border-slate-400 border-r border-slate-400 align-middle bg-white/95 sticky left-0 z-10 shadow-[inset_-1px_0_rgba(148,163,184,1)]"
                                                                >
                                                                    <div className="flex items-center gap-1.5 justify-start">
                                                                        <Wind className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                                        <span className="tracking-tight">{wmNumber}</span>
                                                                    </div>
                                                                </TableCell>
                                                            )}
                                                            <TableCell className="py-2 px-4 text-left border-b border-slate-400 border-r border-slate-400 align-middle text-slate-700 font-medium">
                                                                {row.label}
                                                            </TableCell>
                                                            <TableCell
                                                                className={`py-2 px-4 text-right border-b border-slate-400 border-r border-slate-400 ${row.valC1 < 0 ? "text-red-600" : "text-black"}`}
                                                                title={row.hoverC1 || undefined}
                                                            >
                                                                {row.valC1.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell
                                                                className={`py-2 px-4 text-right border-b border-slate-400 border-r border-slate-400 ${row.valC2 < 0 ? "text-red-600" : "text-black"}`}
                                                                title={row.hoverC2 || undefined}
                                                            >
                                                                {row.valC2.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell
                                                                className={`py-2 px-4 text-right border-b border-slate-400 border-r border-slate-400 ${row.valC4 < 0 ? "text-red-600" : "text-black"}`}
                                                                title={row.hoverC4 || undefined}
                                                            >
                                                                {row.valC4.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell
                                                                className={`py-2 px-4 text-right border-b border-slate-400 border-r border-slate-400 ${row.valC5 < 0 ? "text-red-600" : "text-black"}`}
                                                                title={row.hoverC5 || undefined}
                                                            >
                                                                {row.valC5.toLocaleString()}
                                                            </TableCell>
                                                            <TableCell className={`py-2 px-4 text-right border-b border-slate-400 font-semibold ${totalVal < 0 ? "text-red-600" : "text-black"}`}>
                                                                {totalVal.toLocaleString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                });
                                            })}
                                        </React.Fragment>
                                    );
                                })}
                                {filteredDataList.every(g => g.records.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-slate-400 bg-slate-50">
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
