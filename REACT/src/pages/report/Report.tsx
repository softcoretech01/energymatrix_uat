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
    utilized: number;
    utilizedBanking: number;
    addedBanking: number;
    balance: number;
    transmissionLoss: number;
    bankingLoss: number;
    ebBanking: number;
    initDiff?: number;
    ppBorrowedFrom?: string;
    ppBorrowedAmount?: number;
    ppSharedTo?: string;
    ppSharedAmount?: number;
    bankBorrowedFrom?: string;
    bankBorrowedAmount?: number;
    bankSharedTo?: string;
    bankSharedAmount?: number;
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
    const [showAlternativeGrid, setShowAlternativeGrid] = useState<boolean>(true);
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
                eb_c5: 0
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
                C1: { pp: dbUtilized.pp_c1, ut: dbUtilized.c1, eb: dbUtilizedNext.eb_c1 },
                C2: { pp: dbUtilized.pp_c2, ut: dbUtilized.c2, eb: dbUtilizedNext.eb_c2 },
                C4: { pp: dbUtilized.pp_c4, ut: dbUtilized.c4, eb: dbUtilizedNext.eb_c4 },
                C5: { pp: dbUtilized.pp_c5, ut: dbUtilized.c5, eb: dbUtilizedNext.eb_c5 }
            };

            // Calculate initial diffs (surplus if positive, deficit if negative)
            const diffs = {
                C1: slotValues.C1.pp - slotValues.C1.ut,
                C2: slotValues.C2.pp - slotValues.C2.ut,
                C4: slotValues.C4.pp - slotValues.C4.ut,
                C5: slotValues.C5.pp - slotValues.C5.ut
            };

            // 1. Powerplant sharing variables
            let pp_c1_borrowed_from_c2 = 0;
            let pp_c2_borrowed_from_c1 = 0;
            let pp_c5_borrowed_from_c4 = 0;

            // Group A (C1 <----> C2 two-way powerplant sharing)
            if (diffs.C1 < 0 && diffs.C2 > 0) {
                pp_c1_borrowed_from_c2 = Math.min(-diffs.C1, diffs.C2);
            } else if (diffs.C2 < 0 && diffs.C1 > 0) {
                pp_c2_borrowed_from_c1 = Math.min(-diffs.C2, diffs.C1);
            }

            // Group B (C4 ----> C5 one-way powerplant sharing)
            if (diffs.C5 < 0 && diffs.C4 > 0) {
                pp_c5_borrowed_from_c4 = Math.min(-diffs.C5, diffs.C4);
            }

            // Adjusted powerplant deficits
            const adjustedDeficits = {
                C1: diffs.C1 < 0 ? -diffs.C1 - pp_c1_borrowed_from_c2 : 0,
                C2: diffs.C2 < 0 ? -diffs.C2 - pp_c2_borrowed_from_c1 : 0,
                C4: diffs.C4 < 0 ? -diffs.C4 : 0,
                C5: diffs.C5 < 0 ? -diffs.C5 - pp_c5_borrowed_from_c4 : 0
            };

            // Adjusted powerplant surpluses
            const adjustedSurpluses = {
                C1: diffs.C1 > 0 ? diffs.C1 - pp_c2_borrowed_from_c1 : 0,
                C2: diffs.C2 > 0 ? diffs.C2 - pp_c1_borrowed_from_c2 : 0,
                C4: diffs.C4 > 0 ? diffs.C4 - pp_c5_borrowed_from_c4 : 0,
                C5: diffs.C5 > 0 ? diffs.C5 : 0
            };

            // 2. Fetch opening banking values
            const openingBanking = {
                C1: monthName === "April" ? 0 : (runningBalances[`${wmNumber}-C1`] || 0),
                C2: monthName === "April" ? 0 : (runningBalances[`${wmNumber}-C2`] || 0),
                C4: monthName === "April" ? 0 : (runningBalances[`${wmNumber}-C4`] || 0),
                C5: monthName === "April" ? 0 : (runningBalances[`${wmNumber}-C5`] || 0)
            };

            // 3. Own banking utilization and remaining calculations
            const ownUtilization = {
                C1: Math.min(adjustedDeficits.C1, openingBanking.C1),
                C2: Math.min(adjustedDeficits.C2, openingBanking.C2),
                C4: Math.min(adjustedDeficits.C4, openingBanking.C4),
                C5: Math.min(adjustedDeficits.C5, openingBanking.C5)
            };

            const remDeficits = {
                C1: adjustedDeficits.C1 - ownUtilization.C1,
                C2: adjustedDeficits.C2 - ownUtilization.C2,
                C4: adjustedDeficits.C4 - ownUtilization.C4,
                C5: adjustedDeficits.C5 - ownUtilization.C5
            };

            const remBanking = {
                C1: openingBanking.C1 - ownUtilization.C1,
                C2: openingBanking.C2 - ownUtilization.C2,
                C4: openingBanking.C4 - ownUtilization.C4,
                C5: openingBanking.C5 - ownUtilization.C5
            };

            // 4. Banking sharing variables
            let bank_c1_borrowed_from_c2 = 0;
            let bank_c2_borrowed_from_c1 = 0;
            let bank_c5_borrowed_from_c4 = 0;

            // Group A (C1 <----> C2 two-way banking sharing)
            if (remDeficits.C1 > 0 && remBanking.C2 > 0) {
                bank_c1_borrowed_from_c2 = Math.min(remDeficits.C1, remBanking.C2);
            } else if (remDeficits.C2 > 0 && remBanking.C1 > 0) {
                bank_c2_borrowed_from_c1 = Math.min(remDeficits.C2, remBanking.C1);
            }

            // Group B (C4 ----> C5 one-way banking sharing)
            if (remDeficits.C5 > 0 && remBanking.C4 > 0) {
                bank_c5_borrowed_from_c4 = Math.min(remDeficits.C5, remBanking.C4);
            }

            // 5. Final allocations
            const finalLentToOther = {
                C1: bank_c2_borrowed_from_c1,
                C2: bank_c1_borrowed_from_c2,
                C4: bank_c5_borrowed_from_c4,
                C5: 0
            };

            const finalBorrowedFromOther = {
                C1: bank_c1_borrowed_from_c2,
                C2: bank_c2_borrowed_from_c1,
                C4: 0,
                C5: bank_c5_borrowed_from_c4
            };

            const unmetDeficits = {
                C1: remDeficits.C1 - finalBorrowedFromOther.C1,
                C2: remDeficits.C2 - finalBorrowedFromOther.C2,
                C4: remDeficits.C4 - finalBorrowedFromOther.C4,
                C5: remDeficits.C5 - finalBorrowedFromOther.C5
            };

            // finalUtilizedBanking includes own utilization, lent to other, and unmet deficits
            const finalUtilizedBanking = {
                C1: ownUtilization.C1 + finalLentToOther.C1 + unmetDeficits.C1,
                C2: ownUtilization.C2 + finalLentToOther.C2 + unmetDeficits.C2,
                C4: ownUtilization.C4 + finalLentToOther.C4 + unmetDeficits.C4,
                C5: ownUtilization.C5 + finalLentToOther.C5 + unmetDeficits.C5
            };

            const slots = ["C1", "C2", "C4", "C5"] as const;

            return slots.map((slot) => {
                const balanceKey = `${wmNumber}-${slot}`;
                const val = slotValues[slot];
                const initDiff = diffs[slot];

                const slotBanking = openingBanking[slot];
                const slotUtilizedBanking = finalUtilizedBanking[slot];

                // Determine powerplant sharing details
                let ppBorrowedFrom = "";
                let ppBorrowedAmount = 0;
                let ppSharedTo = "";
                let ppSharedAmount = 0;

                if (slot === "C1") {
                    if (initDiff < 0) {
                        ppBorrowedFrom = "C2";
                        ppBorrowedAmount = pp_c1_borrowed_from_c2;
                    } else {
                        ppSharedTo = "C2";
                        ppSharedAmount = pp_c2_borrowed_from_c1;
                    }
                } else if (slot === "C2") {
                    if (initDiff < 0) {
                        ppBorrowedFrom = "C1";
                        ppBorrowedAmount = pp_c2_borrowed_from_c1;
                    } else {
                        ppSharedTo = "C1";
                        ppSharedAmount = pp_c1_borrowed_from_c2;
                    }
                } else if (slot === "C4") {
                    if (initDiff >= 0) {
                        ppSharedTo = "C5";
                        ppSharedAmount = pp_c5_borrowed_from_c4;
                    }
                } else if (slot === "C5") {
                    if (initDiff < 0) {
                        ppBorrowedFrom = "C4";
                        ppBorrowedAmount = pp_c5_borrowed_from_c4;
                    }
                }

                // Determine banking sharing details
                let bankBorrowedFrom = "";
                let bankBorrowedAmount = 0;
                let bankSharedTo = "";
                let bankSharedAmount = 0;

                if (slot === "C1") {
                    if (finalBorrowedFromOther.C1 > 0) {
                        bankBorrowedFrom = "C2";
                        bankBorrowedAmount = finalBorrowedFromOther.C1;
                    } else if (finalLentToOther.C1 > 0) {
                        bankSharedTo = "C2";
                        bankSharedAmount = finalLentToOther.C1;
                    }
                } else if (slot === "C2") {
                    if (finalBorrowedFromOther.C2 > 0) {
                        bankBorrowedFrom = "C1";
                        bankBorrowedAmount = finalBorrowedFromOther.C2;
                    } else if (finalLentToOther.C2 > 0) {
                        bankSharedTo = "C1";
                        bankSharedAmount = finalLentToOther.C2;
                    }
                } else if (slot === "C4") {
                    if (finalLentToOther.C4 > 0) {
                        bankSharedTo = "C5";
                        bankSharedAmount = finalLentToOther.C4;
                    }
                } else if (slot === "C5") {
                    if (finalBorrowedFromOther.C5 > 0) {
                        bankBorrowedFrom = "C4";
                        bankBorrowedAmount = finalBorrowedFromOther.C5;
                    }
                }

                const transmissionLoss = windmillLossesMap[wmNumber] || 0;
                const bankingLoss = globalBankingLoss;

                // Calculate transmission loss and banking loss as percentages of the surplus (Added banking)
                const adjSurplus = adjustedSurpluses[slot];
                const slotAddedBanking = parseFloat(
                    (
                        adjSurplus +
                        (adjSurplus * transmissionLoss) / 100 -
                        (adjSurplus * bankingLoss) / 100
                    ).toFixed(2)
                );

                const slotBalance = parseFloat((slotBanking - slotUtilizedBanking + slotAddedBanking).toFixed(2));

                // Update running balance for next month's banking (using EB Banking units)
                runningBalances[balanceKey] = val.eb;

                return {
                    windmillNumber: wmNumber,
                    slot,
                    banking: slotBanking,
                    powerplant: val.pp,
                    utilized: val.ut,
                    utilizedBanking: slotUtilizedBanking,
                    addedBanking: slotAddedBanking,
                    balance: slotBalance,
                    transmissionLoss,
                    bankingLoss,
                    ebBanking: val.eb,
                    initDiff,
                    ppBorrowedFrom,
                    ppBorrowedAmount,
                    ppSharedTo,
                    ppSharedAmount,
                    bankBorrowedFrom,
                    bankBorrowedAmount,
                    bankSharedTo,
                    bankSharedAmount
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
                    "Closing Banking": row.balance,
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
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-8">
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Banking Report
                        </h1>
                        {showAlternativeGrid && (
                            <span className="text-base font-semibold text-slate-600 bg-red-50/50 border border-red-100 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                                Available Banking Units:{" "}
                                <span className="font-bold" style={{ color: 'firebrick' }}>
                                    {(() => {
                                        const lastGroupWithEb = [...filteredDataList].reverse().find(g =>
                                            g.records.reduce((sum, r) => sum + r.ebBanking, 0) > 0
                                        );
                                        const lastMonthEbBankingSum = lastGroupWithEb
                                            ? lastGroupWithEb.records.reduce((sum, r) => sum + r.ebBanking, 0)
                                            : 0;
                                        return lastMonthEbBankingSum.toLocaleString();
                                    })()}
                                </span>
                            </span>
                        )}
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
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
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
                {!showAlternativeGrid && (
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
                )}

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
                                    {!showAlternativeGrid && (
                                        <>
                                            <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-right sticky top-0 z-20 border-r border-white/10">
                                                Powerplant
                                            </TableHead>
                                            <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-right sticky top-0 z-20 border-r border-white/10">
                                                Total Utilized
                                            </TableHead>
                                        </>
                                    )}
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-right sticky top-0 z-20 border-r border-white/10">
                                        Utilized Banking
                                    </TableHead>
                                    <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-right sticky top-0 z-20 border-r border-white/10">
                                        Added Banking
                                    </TableHead>
                                    {!showAlternativeGrid && (
                                        <TableHead className="font-semibold text-xs tracking-wider uppercase text-slate-200 bg-sidebar text-right sticky top-0 z-20 border-r border-white/10">
                                            Closing Banking
                                        </TableHead>
                                    )}
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
                                    const totalUtilized = group.records.reduce((sum, r) => sum + r.utilized, 0);
                                    const totalUtilizedBanking = group.records.reduce((sum, r) => sum + r.utilizedBanking, 0);
                                    const totalAddedBanking = group.records.reduce((sum, r) => sum + r.addedBanking, 0);
                                    const totalBalance = group.records.reduce((sum, r) => sum + r.balance, 0);
                                    const totalEbBanking = group.records.reduce((sum, r) => sum + r.ebBanking, 0);
                                    const totalAltUtilized = group.records.reduce((sum, r) => sum + Math.max(0, r.banking - r.ebBanking), 0);
                                    const totalAltAdded = group.records.reduce((sum, r) => sum + Math.max(0, r.ebBanking - r.banking), 0);
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
                                                {!showAlternativeGrid && (
                                                    <>
                                                        <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-200 border-r border-slate-200 ${totalPowerplant < 0 ? "text-red-600" : "text-black"}`}>
                                                            {totalPowerplant.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-200 border-r border-slate-200 ${totalUtilized < 0 ? "text-red-600" : "text-black"}`}>
                                                            {totalUtilized.toLocaleString()}
                                                        </TableCell>
                                                    </>
                                                )}
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-200 border-r border-slate-200 ${(showAlternativeGrid ? totalAltUtilized : totalUtilizedBanking) < 0 ? "text-red-600" : "text-black"}`}>
                                                    {(showAlternativeGrid ? totalAltUtilized : totalUtilizedBanking).toLocaleString()}
                                                </TableCell>
                                                <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-200 border-r border-slate-200 ${(showAlternativeGrid ? totalAltAdded : totalAddedBanking) < 0 ? "text-red-600" : "text-black"}`}>
                                                    {(showAlternativeGrid ? totalAltAdded : totalAddedBanking).toLocaleString()}
                                                </TableCell>
                                                {!showAlternativeGrid && (
                                                    <TableCell className={`py-3 px-4 text-right font-bold border-b border-slate-200 border-r border-slate-200 ${totalBalance < 0 ? "text-red-600" : "text-black"}`}>
                                                        {totalBalance.toLocaleString()}
                                                    </TableCell>
                                                )}
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

                                                        const baseSurplus = row.powerplant > row.utilized ? row.powerplant - row.utilized : 0;
                                                        const transLossUnits = parseFloat(((baseSurplus * row.transmissionLoss) / 100).toFixed(2));
                                                        const bankLossUnits = parseFloat(((baseSurplus * row.bankingLoss) / 100).toFixed(2));

                                                        const altUtilized = Math.max(0, row.banking - row.ebBanking);
                                                        const altAdded = Math.max(0, row.ebBanking - row.banking);

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
                                                                {!showAlternativeGrid && (
                                                                    <>
                                                                        <TableCell className={`py-2.5 px-4 text-right border-b border-slate-200 border-r border-slate-200 ${row.powerplant < 0 ? "text-red-600" : "text-black"}`}>
                                                                            {row.powerplant.toLocaleString()}
                                                                        </TableCell>
                                                                        <TableCell className={`py-2.5 px-4 text-right border-b border-slate-200 border-r border-slate-200 ${row.utilized < 0 ? "text-red-600" : "text-black"}`}>
                                                                            {row.utilized.toLocaleString()}
                                                                        </TableCell>
                                                                    </>
                                                                )}
                                                                {showAlternativeGrid ? (
                                                                    <TableCell className={`py-2.5 px-4 text-right border-b border-slate-200 border-r border-slate-200 ${altUtilized < 0 ? "text-red-600" : "text-black"}`}>
                                                                        {altUtilized.toLocaleString()}
                                                                    </TableCell>
                                                                ) : (
                                                                    <TableCell className={`py-2.5 px-4 text-right border-b border-slate-200 border-r border-slate-200 cursor-help ${row.utilizedBanking < 0 ? "text-red-600" : "text-black"}`}>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <span className="block w-full">
                                                                                    {row.utilizedBanking.toLocaleString()}
                                                                                </span>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent className="bg-white text-slate-900 border border-slate-200 shadow-md p-3 text-sm rounded-md font-sans leading-relaxed z-50 text-left">
                                                                                {(() => {
                                                                                    const initDiffVal = row.initDiff ?? 0;
                                                                                    const initDeficit = initDiffVal < 0 ? -initDiffVal : 0;
                                                                                    const ownUse = initDeficit > 0 ? Math.min(initDeficit - (row.ppBorrowedAmount || 0), row.banking) : 0;
                                                                                    const unmet = initDeficit - (row.ppBorrowedAmount || 0) - ownUse - (row.bankBorrowedAmount || 0);

                                                                                    return (
                                                                                        <div className="space-y-1">
                                                                                            <div>
                                                                                                Total Utilized Banking: <span className="font-semibold" style={{ color: 'firebrick' }}>{row.utilizedBanking.toLocaleString()}</span> units.
                                                                                            </div>
                                                                                            {initDeficit > 0 && (
                                                                                                <>
                                                                                                    <div>
                                                                                                        • (Powerplant - Total utilized): <span className="font-semibold" style={{ color: 'firebrick' }}>{initDeficit.toLocaleString()}</span> units
                                                                                                    </div>
                                                                                                    {(row.ppBorrowedAmount || 0) > 0 && (
                                                                                                        <div>
                                                                                                            • Powerplant Borrowed: <span className="font-semibold" style={{ color: 'firebrick' }}>{row.ppBorrowedAmount?.toLocaleString()}</span> units from slot {row.ppBorrowedFrom}
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {(row.ppBorrowedAmount || 0) > 0 && (
                                                                                                        <div>
                                                                                                            • Net Deficit to cover from banking: <span className="font-semibold" style={{ color: 'firebrick' }}>{(initDeficit - (row.ppBorrowedAmount || 0)).toLocaleString()}</span> units
                                                                                                        </div>
                                                                                                    )}
                                                                                                    <div>
                                                                                                        • Utilized from {row.slot} banking: <span className="font-semibold" style={{ color: 'firebrick' }}>{ownUse.toLocaleString()}</span> units
                                                                                                    </div>
                                                                                                    {(row.bankBorrowedAmount || 0) > 0 && (
                                                                                                        <div>
                                                                                                            • Borrowed from slot {row.bankBorrowedFrom} banking: <span className="font-semibold" style={{ color: 'firebrick' }}>{row.bankBorrowedAmount?.toLocaleString()}</span> units
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {unmet > 0 && (
                                                                                                        <div>
                                                                                                            • Un-met deficit (negative balance): <span className="font-semibold" style={{ color: 'firebrick' }}>{unmet.toLocaleString()}</span> units
                                                                                                        </div>
                                                                                                    )}
                                                                                                </>
                                                                                            )}
                                                                                            {initDeficit <= 0 && (row.ppSharedAmount || 0) > 0 && (
                                                                                                <div>
                                                                                                    • Powerplant Shared: Lent <span className="font-semibold" style={{ color: 'firebrick' }}>{row.ppSharedAmount?.toLocaleString()}</span> units to slot {row.ppSharedTo}
                                                                                                </div>
                                                                                            )}
                                                                                            {(row.bankSharedAmount || 0) > 0 && (
                                                                                                <div>
                                                                                                    • Given to {row.bankSharedTo?.toLowerCase() || ''}: <span className="font-semibold" style={{ color: 'firebrick' }}>{row.bankSharedAmount?.toLocaleString()}</span> units
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    );
                                                                                })()}
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TableCell>
                                                                )}
                                                                {showAlternativeGrid ? (
                                                                    <TableCell className={`py-2.5 px-4 text-right border-b border-slate-200 border-r border-slate-200 ${altAdded < 0 ? "text-red-600" : "text-black"}`}>
                                                                        {altAdded.toLocaleString()}
                                                                    </TableCell>
                                                                ) : (
                                                                    <TableCell className={`py-2.5 px-4 text-right border-b border-slate-200 border-r border-slate-200 cursor-help ${row.addedBanking < 0 ? "text-red-600" : "text-black"}`}>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <span className="block w-full">
                                                                                    {row.addedBanking.toLocaleString()}
                                                                                </span>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent className="bg-white text-slate-900 border border-slate-200 shadow-md p-3 text-sm rounded-md font-sans leading-relaxed z-50 text-left">
                                                                                {(() => {
                                                                                    const initDiffVal = row.initDiff ?? 0;
                                                                                    const initSurplus = initDiffVal > 0 ? initDiffVal : 0;
                                                                                    if (initSurplus === 0) {
                                                                                        return <div>No surplus to add to banking.</div>;
                                                                                    }
                                                                                    const adjSurplus = initSurplus - (row.ppSharedAmount || 0);
                                                                                    const transLossUnits = parseFloat(((adjSurplus * row.transmissionLoss) / 100).toFixed(2));
                                                                                    const bankLossUnits = parseFloat(((adjSurplus * row.bankingLoss) / 100).toFixed(2));
                                                                                    return (
                                                                                        <div className="space-y-1">
                                                                                            <div>
                                                                                                Initial Powerplant Surplus: <span className="font-semibold" style={{ color: 'firebrick' }}>{initSurplus.toLocaleString()}</span> units.
                                                                                            </div>
                                                                                            {(row.ppSharedAmount || 0) > 0 && (
                                                                                                <div>
                                                                                                    • Shared with slot {row.ppSharedTo} deficit: <span className="font-semibold" style={{ color: 'firebrick' }}>{row.ppSharedAmount?.toLocaleString()}</span> units
                                                                                                </div>
                                                                                            )}
                                                                                            <div>
                                                                                                • Adjusted surplus base: <span className="font-semibold" style={{ color: 'firebrick' }}>{adjSurplus.toLocaleString()}</span> units
                                                                                            </div>
                                                                                            <div>
                                                                                                • Transmission Loss (+{row.transmissionLoss}%): +<span className="font-semibold" style={{ color: 'firebrick' }}>{transLossUnits.toLocaleString()}</span> units
                                                                                            </div>
                                                                                            <div>
                                                                                                • Banking Loss (-{row.bankingLoss}%): -<span className="font-semibold" style={{ color: 'firebrick' }}>{bankLossUnits.toLocaleString()}</span> units
                                                                                            </div>
                                                                                            <div>
                                                                                                Final Added Banking: <span className="font-semibold" style={{ color: 'firebrick' }}>{row.addedBanking.toLocaleString()}</span> units.
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })()}
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TableCell>
                                                                )}
                                                                {!showAlternativeGrid && (
                                                                    <TableCell className={`py-2.5 px-4 text-right border-b border-slate-200 border-r border-slate-200 cursor-help ${row.balance < 0 ? "text-red-600" : "text-black"}`}>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <span className="block w-full">
                                                                                    {row.balance.toLocaleString()}
                                                                                </span>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent className="bg-white text-slate-900 border border-slate-200 shadow-md p-3 text-sm rounded-md font-sans leading-relaxed z-50 text-left">
                                                                                Opening Banking (<span className="font-semibold" style={{ color: 'firebrick' }}>{row.banking.toLocaleString()}</span>) - Utilized Banking (<span className="font-semibold" style={{ color: 'firebrick' }}>{row.utilizedBanking.toLocaleString()}</span>) + Added Banking (<span className="font-semibold" style={{ color: 'firebrick' }}>{row.addedBanking.toLocaleString()}</span>) = <span className="font-semibold" style={{ color: 'firebrick' }}>{row.balance.toLocaleString()}</span>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TableCell>
                                                                )}
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
                                        <TableCell colSpan={showAlternativeGrid ? 7 : 10} className="text-center py-12 text-slate-400 bg-slate-50">
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

                {/* Alternative Grid Toggle Button at the end of screen */}
                <div className="flex justify-end mb-8">
                    <button
                        onClick={() => setShowAlternativeGrid(!showAlternativeGrid)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-sm transition-all active:scale-95 duration-150 cursor-pointer"
                    >
                        {showAlternativeGrid ? (
                            <>
                                <FileText className="h-3.5 w-3.5" />
                            </>
                        ) : (
                            <>
                                <Wallet className="h-3.5 w-3.5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
