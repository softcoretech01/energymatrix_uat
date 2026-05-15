import React, { useState, useEffect, useMemo } from "react";
import api from "@/services/api";
import { useSidebar } from "@/components/ui/sidebar";
import { Search, Edit, Eye, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
    TableFooter,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { utils, writeFile } from "xlsx";

const allotmentData = [];

const formatWithCommas = (val: string | number) => {
    if (val === null || val === undefined || val === '') return '';
    const s = val.toString().replace(/,/g, '');
    if (isNaN(Number(s))) return s;
    const parts = s.split('.');
    const formattedInt = Number(parts[0]).toLocaleString('en-IN');
    return parts.length > 1 ? `${formattedInt}.${parts[1]}` : formattedInt;
};

const stripCommas = (val: string | number) => {
    if (val === null || val === undefined) return '';
    return val.toString().replace(/,/g, '');
};


// Solar Data: 2 Customers, listed by SE Number
const initialSolarData = [];

type ChargeRow = {
    windmill: string;
    customer: string;
    seNumber: string;
    mrc: number; omc: number; trc: number; oc1: number; kp: number; ec: number; shc: number; other: number; dc: number; wc: number; sgt: number;
};

type SolarRow = {
    tempId: string;
    chargeKey: string;
    chargeCode: string;
    chargeLabel: string;
    customer: string;
    seNumber: string;
    isChecked?: boolean;
    value: string | number;
    systemValue: number;
};



const createInitialSolarRows = (labels: Record<string, string>): SolarRow[] => {
    const chargeKeys = ['mrc', 'omc', 'trc', 'oc1', 'kp', 'ec', 'shc', 'other', 'dc'];
    const chargeCodes: Record<string, string> = {
        mrc: 'C001', omc: 'C002', trc: 'C003', oc1: 'C004', kp: 'C005',
        ec: 'C006', shc: 'C007', other: 'C008', dc: 'C010'
    };
    return chargeKeys.map(key => ({
        tempId: `${key}-${Math.random().toString(36).substring(2, 11)}`,
        chargeKey: key,
        chargeCode: chargeCodes[key] || "",
        chargeLabel: labels[key] || key.toUpperCase(),
        customer: "",
        seNumber: "",
        isChecked: false,
        value: 0,
        systemValue: 0
    }));
};



function EnergyAllotment() {
    const { open } = useSidebar();
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("list");
    const topScrollRef = React.useRef<HTMLDivElement>(null);
    const tableContainerRef = React.useRef<HTMLDivElement>(null);
    const [tableScrollWidth, setTableScrollWidth] = useState(0);

    useEffect(() => {
        const topScroll = topScrollRef.current;
        const tableContainer = tableContainerRef.current;

        if (topScroll && tableContainer) {
            const syncTopScroll = () => {
                if (Math.abs(topScroll.scrollLeft - tableContainer.scrollLeft) > 1) {
                    topScroll.scrollLeft = tableContainer.scrollLeft;
                }
            };
            const syncTableScroll = () => {
                if (Math.abs(tableContainer.scrollLeft - topScroll.scrollLeft) > 1) {
                    tableContainer.scrollLeft = topScroll.scrollLeft;
                }
            };

            topScroll.addEventListener('scroll', syncTableScroll);
            tableContainer.addEventListener('scroll', syncTopScroll);

            // Observer to keep widths in sync
            const resizeObserver = new ResizeObserver(() => {
                setTableScrollWidth(tableContainer.scrollWidth);
            });
            resizeObserver.observe(tableContainer);

            return () => {
                topScroll.removeEventListener('scroll', syncTableScroll);
                tableContainer.removeEventListener('scroll', syncTopScroll);
                resizeObserver.disconnect();
            };
        }
    }, [activeTab]);
    const [selectedWindmillId, setSelectedWindmillId] = useState<string>("");
    // Dynamic lists for dropdowns
    const [customerList, setCustomerList] = useState<string[]>([]);
    const [customerSEMap, setCustomerSEMap] = useState<Record<string, string[]>>({});
    const [fullCustomerData, setFullCustomerData] = useState<any[]>([]);
    const [actualAdjustedTotals, setActualAdjustedTotals] = useState<Record<string, number>>({});

    // Tracks per-partner borrows for each row+slot, keyed by "customer|seNumber|wm|slot".
    // Value maps each partner slot (including "_own" for current slot) → { pp, bank } consumed.
    const [borrowedAmounts, setBorrowedAmounts] = useState<Record<string, Record<string, { pp: number; bank: number }>>>({});



    // State for Uploads
    const [uploads, setUploads] = useState<Record<string, { file: File | null, fileName: string, filePath?: string }>>({});

    // Dynamic Charge Names from Master
    const [chargeLabels, setChargeLabels] = useState<Record<string, string>>({
        mrc: "M.R.C",
        omc: "O&M Charges",
        trc: "T.R.C",
        oc1: "O.C",
        kp: "K.P",
        ec: "E.C",
        shc: "S.H.C",
        other: "O.C",
        dc: "D.C"
    });

    const handleFileUpload = async (wm: string, file: File | null) => {
        if (!file) {
            setUploads(prev => ({ ...prev, [wm]: { file: null, fileName: "" } }));
            return;
        }

        // Update local file state immediately for UI
        setUploads(prev => ({
            ...prev,
            [wm]: { file, fileName: file.name }
        }));

        // Automatically upload to the backend and fetch extracted data
        const windmillObj = windmillsDetailed.find(w => w.windmill_number === wm);
        if (!windmillObj) {
            toast.error(`Windmill ID not found for ${wm}`);
            return;
        }

        try {
            toast.info(`Uploading EB Statement for ${wm}...`);
            const formData = new FormData();
            formData.append("windmill_id", windmillObj.id.toString());
            formData.append("year", selectedYear);
            formData.append("month", selectedMonth);
            formData.append("file", file);

            const response = await api.post("/eb/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.data && response.data.parsed_data) {
                const parsed = response.data.parsed_data;
                toast.success(`Successfully uploaded and extracted data for ${wm}!`);

                // Update the grid values instantly
                setEbSummaryData(prev => ({
                    ...prev,
                    [wm]: {
                        ...prev[wm],
                        c1_pp: parsed.slots?.C1 || "0",
                        c1_bank: parsed.banking_slots?.C1 || "0",
                        c2_pp: parsed.slots?.C2 || "0",
                        c2_bank: parsed.banking_slots?.C2 || "0",
                        c4_pp: parsed.slots?.C4 || "0",
                        c4_bank: parsed.banking_slots?.C4 || "0",
                        c5_pp: parsed.slots?.C5 || "0",
                        c5_bank: parsed.banking_slots?.C5 || "0",
                    }
                }));

                // Auto-save the details using the header_id returned by upload
                if (response.data.header_id) {
                    try {
                        const detailsPayload = {
                            eb_header_id: response.data.header_id,
                            slots: parsed.slots,
                            banking_slots: parsed.banking_slots,
                            banking_units: parsed.banking_units || "0",
                            charges: parsed.charges || []
                        };
                        await api.post("/eb/save-all", detailsPayload);
                        console.log(`Auto-saved EB statement details for ${wm}`);
                    } catch (e) {
                        console.error("Failed to auto-save EB details:", e);
                    }
                }
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            const errMsg = error.response?.data?.detail || "Failed to upload file.";
            toast.error(errMsg);
        }
    };

    const handleAllotmentOrderUpload = (wm: string, file: File | null) => {
        if (!file) {
            setUploads(prev => ({ ...prev, [wm]: { file: null, fileName: "" } }));
            return;
        }

        // Update local file state for UI
        setUploads(prev => ({
            ...prev,
            [wm]: { file, fileName: file.name }
        }));
    };

    // Fetch Allotment Orders when month/year changes
    useEffect(() => {
        const fetchAllotmentOrders = async () => {
            try {
                const response = await api.get(`/windmills/allotment-order/list?year=${selectedYear}&month=${selectedMonth}`);
                if (response.data && response.data.status === "success") {
                    const orders = response.data.data;
                    const newUploads: Record<string, { file: File | null, fileName: string, filePath?: string }> = {};
                    orders.forEach((order: any) => {
                        // Assuming the API returns windmill_number or we map it
                        // The SP sp_get_allotment_orders usually returns windmill_number, file_name, file_path
                        if (order.windmill_number && order.file_name) {
                            newUploads[order.windmill_number] = {
                                file: null,
                                fileName: order.file_name,
                                filePath: order.file_path
                            };
                        }
                    });
                    setUploads(newUploads);
                } else {
                    setUploads({});
                }
            } catch (error) {
                console.error("Error fetching allotment orders:", error);
                setUploads({});
            }
        };

        if (selectedYear && selectedMonth) {
            fetchAllotmentOrders();
        }
    }, [selectedYear, selectedMonth]);

    // State for Charge Allocation (8 windmills)

    // State for Dynamic Windmill Headers
    const [windmillNumbers, setWindmillNumbers] = useState<string[]>(["WM-001", "WM-002", "WM-003", "WM-004", "WM-005", "WM-006", "WM-007", "WM-008", "SOLAR-001"]);
    const [windmillsDetailed, setWindmillsDetailed] = useState<any[]>([]);

    useEffect(() => {
        const fetchWindmills = async () => {
            try {
                const response = await api.get("/windmills/active-posted");
                if (Array.isArray(response.data)) {
                    const filteredData = response.data.filter((item: any) => String(item.type || '').toLowerCase() === 'windmill');
                    const numbers = Array.from(new Set(filteredData.map((item: any) => String(item.windmill_number || '').trim()))).filter(Boolean);
                    if (numbers.length > 0) {
                        setWindmillNumbers(numbers);
                        setWindmillsDetailed(filteredData);
                        toast.success(`Fetched ${numbers.length} active windmills.`);
                    } else {
                        toast.warning("No active windmills found.");
                    }
                } else {
                    toast.error("Unexpected response format from server.");
                }
            } catch (error) {
                console.error("Error fetching windmills:", error);
                toast.error("Failed to connect to server for windmill headers.");
            }
        };
        fetchWindmills();
    }, []);

    const [isFetchingCharges, setIsFetchingCharges] = useState(false);
    const [fetchedChargesSummary, setFetchedChargesSummary] = useState<Record<string, any>>({});
    const [chargeAllocationRows, setChargeAllocationRows] = useState<ChargeRow[]>([]);

    const reloadWindmillCharges = React.useCallback(async () => {
        if (!selectedMonth || !selectedYear || windmillNumbers.length === 0) return;

        setIsFetchingCharges(true);
        try {
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            let mIdx = parseInt(selectedMonth) - 1;
            const currentMonthName = monthNames[mIdx];
            const currentYear = parseInt(selectedYear);

            console.log(`🔍 Reloading Windmill Charges for ${currentYear}-${currentMonthName}...`);

            const [applicableRes, savedRes] = await Promise.all([
                api.get(`/eb/applicable-charges/summary?year=${currentYear}&month=${currentMonthName}`),
                api.get(`/windmills/charge-allotment/all-by-month?year=${selectedYear}&month=${selectedMonth}`)
            ]);

            let chargesMap: Record<string, any> = {};
            if (applicableRes.data && applicableRes.data.status === "success") {
                chargesMap = applicableRes.data.data;
                setFetchedChargesSummary(chargesMap);
            }

            let savedWindmills: any[] = [];
            if (savedRes.data && savedRes.data.status === "success") {
                savedWindmills = savedRes.data.windmill_charges || [];
            }

            setChargeAllocationRows(windmillNumbers.map(wm => {
                const saved = savedWindmills.find((s: any) => String(s.windmill || '').trim() === String(wm).trim());
                if (saved) {
                    return {
                        windmill: wm,
                        customer: String(saved.customer || "").trim(),
                        seNumber: String(saved.seNumber || "").trim(),
                        mrc: saved.mrc || 0,
                        omc: saved.omc || 0,
                        trc: saved.trc || 0,
                        oc1: saved.oc1 || 0,
                        kp: saved.kp || 0,
                        ec: saved.ec || 0,
                        shc: saved.shc || 0,
                        other: saved.other || 0,
                        dc: saved.dc || 0,
                    };
                } else {
                    const wmCharges = chargesMap[wm] || {};
                    return {
                        windmill: wm,
                        customer: "",
                        seNumber: "",
                        mrc: wmCharges["C001"] || 0,
                        omc: wmCharges["C002"] || 0,
                        trc: wmCharges["C003"] || 0,
                        oc1: wmCharges["C004"] || 0,
                        kp: wmCharges["C005"] || 0,
                        ec: wmCharges["C006"] || 0,
                        shc: wmCharges["C007"] || 0,
                        other: wmCharges["C008"] || 0,
                        dc: wmCharges["C010"] || 0,
                    };
                }
            }));

        } catch (error) {
            console.error("Error reloading windmill charges:", error);
        } finally {
            setIsFetchingCharges(false);
        }
    }, [selectedYear, selectedMonth, windmillNumbers]);

    useEffect(() => {
        reloadWindmillCharges();
    }, [reloadWindmillCharges]);

    // State for Solar Allocation
    const [solarAllocationRows, setSolarAllocationRows] = useState<SolarRow[]>(createInitialSolarRows(chargeLabels));

    // State for Energy Allotment List
    const [energyAllotmentData, setEnergyAllotmentData] = useState<(typeof allotmentData[0] & Record<string, any>)[]>(allotmentData);
    const [consumptionRequests, setConsumptionRequests] = useState<any[]>([]);
    const [ebSummaryData, setEbSummaryData] = useState<Record<string, any>>({});
    const [originalEbSummary, setOriginalEbSummary] = useState<Record<string, any>>({});
    const [solarWindmills, setSolarWindmills] = useState<any[]>([]);

    // Memoized Grid Logic for high performance
    const memoizedGridData = useMemo(() => {
        // 1. Filter by keyword
        const filtered = energyAllotmentData.filter(item => {
            if (!searchKeyword) return true;
            const kw = searchKeyword.toLowerCase();
            return (
                String(item.customer || '').toLowerCase().includes(kw) ||
                String(item.seNumber || '').toLowerCase().includes(kw) ||
                String(item.wm || '').toLowerCase().includes(kw)
            );
        });

        // 2. Group by Customer and SE
        const grouped: Record<string, Set<string>> = {};
        filtered.forEach(item => {
            const cust = String(item.customer || '').trim();
            const se = String(item.seNumber || '').trim();
            if (!grouped[cust]) grouped[cust] = new Set();
            grouped[cust].add(se);
        });

        // 3. Flat list for index-based calculations
        const order: { customer: string, seNumber: string }[] = [];
        Object.keys(grouped).sort().forEach(c => {
            Array.from(grouped[c]).sort().forEach(se => {
                order.push({ customer: c, seNumber: se });
            });
        });

        // 4. Pre-calculate Cumulative Allotments for O(1) lookups in grid cells
        // cumulativeMap[wm][col][rowIndex] = sum of allocations for all rows before rowIndex
        const cumulativeMap: Record<string, Record<string, number[]>> = {};

        windmillNumbers.forEach(wm => {
            cumulativeMap[wm] = { c1: [0], c2: [0], c4: [0], c5: [0] };

            // Temporary index for O(1) lookup of items in filtered data
            const itemMap = new Map();
            filtered.filter(d => d.wm === wm).forEach(d => {
                itemMap.set(`${String(d.customer || '').trim()}-${d.seNumber}`, d);
            });

            order.forEach((r, idx) => {
                const item = itemMap.get(`${r.customer}-${r.seNumber}`);
                ['c1', 'c2', 'c4', 'c5'].forEach(slot => {
                    const val = Number(String(item?.[slot] || '0').replace(/,/g, '')) || 0;
                    cumulativeMap[wm][slot][idx + 1] = cumulativeMap[wm][slot][idx] + val;
                });
            });
        });

        return { filtered, grouped, order, cumulativeMap };
    }, [energyAllotmentData, searchKeyword, windmillNumbers]);

    useEffect(() => {
        const fetchSolarWindmills = async () => {
            try {
                const response = await api.get("/eb-solar/windmills");
                if (response.data && response.data.status === "success") {
                    setSolarWindmills(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching solar windmills:", error);
            }
        };
        fetchSolarWindmills();
    }, []);
    useEffect(() => {
        const fetchConsumption = async () => {
            try {
                const currentMonth = parseInt(selectedMonth);
                const currentYear = parseInt(selectedYear);
                console.log(`🔍 Fetching consumption requests for month ${currentYear}-${currentMonth}...`);
                const response = await api.get(`/consumption-request/list?year=${currentYear}&month=${currentMonth}`);
                if (Array.isArray(response.data)) {
                    setConsumptionRequests(response.data);
                }
            } catch (error) {
                console.error("Error fetching consumption requests:", error);
            }
        };
        fetchConsumption();
    }, [selectedYear, selectedMonth]);

    // Fetch charge labels once on mount
    useEffect(() => {
        const fetchLabels = async () => {
            try {
                const labelRes = await api.get("/consumption/list");
                if (Array.isArray(labelRes.data)) {
                    const currentLabels = { ...chargeLabels };
                    labelRes.data.forEach((item: any) => {
                        if (item.charge_code === 'C001') currentLabels.mrc = item.charge_name;
                        if (item.charge_code === 'C002') currentLabels.omc = item.charge_name;
                        if (item.charge_code === 'C003') currentLabels.trc = item.charge_name;
                        if (item.charge_code === 'C004') currentLabels.oc1 = item.charge_name;
                        if (item.charge_code === 'C005') currentLabels.kp = item.charge_name;
                        if (item.charge_code === 'C006') currentLabels.ec = item.charge_name;
                        if (item.charge_code === 'C007') currentLabels.shc = item.charge_name;
                        if (item.charge_code === 'C008') currentLabels.other = item.charge_name;
                        if (item.charge_code === 'C010') currentLabels.dc = item.charge_name;
                    });
                    setChargeLabels(currentLabels);
                }
            } catch (err) {
                console.error("Error loading charge labels:", err);
            }
        };
        fetchLabels();
    }, []);

    const reloadSolarCharges = React.useCallback(async () => {
        if (!selectedYear || !selectedMonth) return;

        // 2. Fetch charges for the previous month
        if (solarWindmills.length === 0) {
            setSolarAllocationRows(createInitialSolarRows(chargeLabels));
            return;
        }

        try {
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            let mIdx = parseInt(selectedMonth) - 1;
            const currentMonthName = monthNames[mIdx];
            const currentYear = parseInt(selectedYear);

            console.log(`🔍 Solar Sync: Fetching charges for ${currentYear}-${currentMonthName}`);
            const [chargeRes, savedRes] = await Promise.all([
                api.get(`/eb-solar/applicable-charges/summary?year=${currentYear}&month=${currentMonthName}`),
                api.get(`/windmills/charge-allotment/all-by-month?year=${selectedYear}&month=${selectedMonth}`)
            ]);

            console.log("🔍 Solar Sync API Response:", chargeRes.data);

            let savedSolar: any[] = [];
            if (savedRes.data && savedRes.data.status === "success") {
                savedSolar = savedRes.data.solar_charges || [];
            }

            if (chargeRes.data && chargeRes.data.status === "success") {
                const dataMap = chargeRes.data.data || {};
                const solarWmRaw = solarWindmills[0]?.solar_number || "";
                const solarWm = String(solarWmRaw).trim();

                console.log(`🔍 Solar Sync: Looking for windmill "${solarWm}" (raw: "${solarWmRaw}")`);
                console.log(`🔍 Solar Sync: Available keys in dataMap:`, Object.keys(dataMap));

                // Create a trimmed version of dataMap for robust matching
                const trimmedDataMap: Record<string, any> = {};
                Object.keys(dataMap).forEach(k => {
                    trimmedDataMap[String(k).trim()] = dataMap[k];
                });

                const wmCharges = trimmedDataMap[solarWm] || {};
                console.log(`🔍 Solar Sync: Found charges for ${solarWm}:`, wmCharges);

                let dynamicRows: SolarRow[] = [];
                const excludedCodes = ['C009', 'C011'];
                const chargesToProcess = [
                    { charge_code: 'C001', charge_name: chargeLabels.mrc },
                    { charge_code: 'C002', charge_name: chargeLabels.omc },
                    { charge_code: 'C003', charge_name: chargeLabels.trc },
                    { charge_code: 'C004', charge_name: chargeLabels.oc1 },
                    { charge_code: 'C005', charge_name: chargeLabels.kp },
                    { charge_code: 'C006', charge_name: chargeLabels.ec },
                    { charge_code: 'C007', charge_name: chargeLabels.shc },
                    { charge_code: 'C008', charge_name: chargeLabels.other },
                    { charge_code: 'C010', charge_name: chargeLabels.dc }
                ].filter(c => !excludedCodes.includes(c.charge_code));

                chargesToProcess.forEach(charge => {
                    const code = charge.charge_code;
                    if (!code) return;
                    const label = charge.charge_name || code;

                    let chargeKey = code.toLowerCase();
                    if (code === 'C001') chargeKey = 'mrc';
                    else if (code === 'C002') chargeKey = 'omc';
                    else if (code === 'C003') chargeKey = 'trc';
                    else if (code === 'C004') chargeKey = 'oc1';
                    else if (code === 'C005') chargeKey = 'kp';
                    else if (code === 'C006') chargeKey = 'ec';
                    else if (code === 'C007') chargeKey = 'shc';
                    else if (code === 'C008') chargeKey = 'other';
                    else if (code === 'C010') chargeKey = 'dc';

                    const savedRows = savedSolar.filter((s: any) => s.charge_code === code);
                    const systemVal = wmCharges[code] || 0;

                    if (savedRows.length > 0) {
                        savedRows.forEach((savedRow: any) => {
                            dynamicRows.push({
                                tempId: `${code}-${Math.random().toString(36).substring(2, 11)}`,
                                chargeKey: chargeKey,
                                chargeCode: code,
                                chargeLabel: label,
                                customer: String(savedRow.customer || "").trim(),
                                seNumber: String(savedRow.seNumber || "").trim(),
                                value: savedRow.value || 0,
                                systemValue: systemVal || savedRow.system_value || 0,
                                isChecked: true
                            });
                        });
                    } else if (systemVal > 0) {
                        // Only add if systemVal > 0 if there are no saved rows
                        dynamicRows.push({
                            tempId: `${code}-${Math.random().toString(36).substring(2, 11)}`,
                            chargeKey: chargeKey,
                            chargeCode: code,
                            chargeLabel: label,
                            customer: "",
                            seNumber: "",
                            value: 0,
                            systemValue: systemVal,
                            isChecked: true
                        });
                    }
                });
                setSolarAllocationRows(dynamicRows);
            } else {
                let fallbackRows: SolarRow[] = [];
                const excludedCodes = ['C002', 'C009', 'C011'];
                const chargesToProcess = (fullChargeList.length > 0 ? fullChargeList : []).filter(c => !excludedCodes.includes(c.charge_code));
                chargesToProcess.forEach(charge => {
                    const code = charge.charge_code;
                    if (!code) return;
                    const label = charge.charge_name || code;

                    let chargeKey = code.toLowerCase();
                    if (code === 'C001') chargeKey = 'mrc';
                    else if (code === 'C002') chargeKey = 'omc';
                    else if (code === 'C003') chargeKey = 'trc';
                    else if (code === 'C004') chargeKey = 'oc1';
                    else if (code === 'C005') chargeKey = 'kp';
                    else if (code === 'C006') chargeKey = 'ec';
                    else if (code === 'C007') chargeKey = 'shc';
                    else if (code === 'C008') chargeKey = 'other';
                    else if (code === 'C010') chargeKey = 'dc';

                    const savedRows = savedSolar.filter((s: any) => s.charge_code === code);
                    if (savedRows.length > 0) {
                        savedRows.forEach((savedRow: any) => {
                            fallbackRows.push({
                                tempId: `${code}-${Math.random().toString(36).substring(2, 11)}`,
                                chargeKey: chargeKey,
                                chargeCode: code,
                                chargeLabel: label,
                                customer: String(savedRow.customer || "").trim(),
                                seNumber: String(savedRow.seNumber || "").trim(),
                                value: savedRow.value || 0,
                                systemValue: 0,
                                isChecked: true
                            });
                        });
                    }
                });

                if (fallbackRows.length > 0) {
                    setSolarAllocationRows(fallbackRows);
                } else {
                    setSolarAllocationRows(createInitialSolarRows(chargeLabels));
                }
            }
        } catch (error) {
            console.error("Error fetching solar charges:", error);
            setSolarAllocationRows(createInitialSolarRows(chargeLabels));
        }
    }, [selectedYear, selectedMonth, solarWindmills]);

    useEffect(() => {
        reloadSolarCharges();
    }, [reloadSolarCharges]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                console.log("🔵 Fetching customers for energy allotment...");

                // Use the new endpoint that includes customer IDs
                const response = await api.get("/customers/for-energy-allotment");
                console.log("🔵 Raw API response:", response.data);
                console.log("🔵 Response type:", typeof response.data, " | Is Array:", Array.isArray(response.data));

                if (Array.isArray(response.data) && response.data.length > 0) {
                    console.log(`🔵 Received ${response.data.length} records`);

                    const firstItem = response.data[0];
                    console.log("🔍 First record:", firstItem);
                    console.log("🔍 First record keys:", Object.keys(firstItem));
                    console.log("🔍 First record ID:", firstItem.id, "Type:", typeof firstItem.id);

                    // Log all records to check ID population
                    response.data.forEach((item, idx) => {
                        console.log(`  [${idx}] ${item.customer_name} - ID: ${item.id} SE: ${item.service_number}`);
                    });

                    // Create formatted data
                    const formattedData = response.data.map((item, idx) => {
                        const customerId = item.id || item.customer_id || item.cust_id || item.mc_id || 0;
                        return {
                            customer_id: customerId,
                            service_id: item.service_id || 0,
                            wm: "",
                            customer: item.customer_name || item.customer,
                            seNumber: item.service_number || item.sc_number || '',
                            totalAgreedUnits: item.total_agreed_units || 0,
                            consumption: "0",
                            c1: "0", c1_pp: "0", c1_bank: "0",
                            c2: "0", c2_pp: "0", c2_bank: "0",
                            c4: "0", c4_pp: "0", c4_bank: "0",
                            c5: "0", c5_pp: "0", c5_bank: "0",
                            c1_allot: "0", c2_allot: "0", c4_allot: "0", c5_allot: "0"
                        };
                    });

                    setEnergyAllotmentData(formattedData);
                    console.log("✅ Formatted data ready:", formattedData);

                    // Populate dynamic dropdowns for Charge Allocation
                    const uniqueCustomers = Array.from(new Set(response.data.map((item: any) => String(item.customer_name || item.customer || '').trim()))).filter(Boolean) as string[];
                    setCustomerList(uniqueCustomers);

                    const seMap: Record<string, string[]> = {};
                    response.data.forEach((item: any) => {
                        const name = String(item.customer_name || item.customer || '').trim();
                        const se = String(item.service_number || item.sc_number || '').trim();
                        if (name && se) {
                            if (!seMap[name]) seMap[name] = [];
                            if (!seMap[name].includes(se)) seMap[name].push(se);
                        }
                    });
                    setCustomerSEMap(seMap);
                    setFullCustomerData(response.data);

                    toast.success(`✓ Loaded ${formattedData.length} customer records`);

                } else {
                    console.warn("⚠️  Empty or invalid response");
                    toast.warning("No customers found. Fill in data manually.");
                }
            } catch (error: any) {
                console.error("❌ Error fetching customers:", error);
                if (error.response?.status === 401) {
                    toast.error("Session expired. Please login again.");
                } else {
                    toast.warning("Could not load customers. You can still enter data manually.");
                }
            }
        };
        fetchCustomers();
    }, []);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const months = [
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ];

    // Calculate Totals
    const totals = allotmentData.reduce((acc, row) => ({
        c1: acc.c1 + Number(row.c1.replace(/,/g, '')),
        c2: acc.c2 + Number(row.c2.replace(/,/g, '')),
        c4: acc.c4 + Number(row.c4.replace(/,/g, '')),
        c5: acc.c5 + Number(row.c5.replace(/,/g, '')),
        consumption: acc.consumption + Number(row.consumption.replace(/,/g, '')),
    }), { c1: 0, c2: 0, c4: 0, c5: 0, consumption: 0 });

    const handleEditClick = () => {
        // Date constraints removed for now as requested
        setIsEditing(!isEditing);
    };

    // C1↔C2 mutual borrowing; C4 can borrow from C5; C5 cannot borrow from C4.
    const PARTNER_SLOT: Record<string, string> = { c1: 'c2', c2: 'c1', c4: 'c5' };

    const canBorrowFrom = (col: string, partner: string): boolean => {
        return PARTNER_SLOT[col] === partner;
    };

    const isPartnered = (col: string): boolean => {
        return !!PARTNER_SLOT[col];
    };

    const fetchEbStatementSummary = async () => {
        try {
            console.log(`🔍 Fetching EB Statement P/B values for allotment month ${selectedYear}-${selectedMonth}...`);
            const response = await api.get(`/eb/summary/by-month?year=${selectedYear}&month=${selectedMonth}`);
            if (response.data && response.data.status === "success") {
                const summaryData = response.data.data;
                console.log("✅ EB Summary fetched successfully:", summaryData);
                // We only set originalEbSummary here; ebSummaryData is derived via useEffect
                setOriginalEbSummary(summaryData);
            } else {
                console.warn("⚠️ EB Summary response was not successful:", response.data);
                setOriginalEbSummary({});
            }
        } catch (error: any) {
            console.error("❌ Error fetching EB statement summary:", error?.response?.data || error.message);
            setOriginalEbSummary({});
        }
    };

    useEffect(() => {
        fetchEbStatementSummary();
    }, [selectedYear, selectedMonth]);

    // ── NEW: Robust Balance Recalculation Effect ──
    // This ensures headers (P:/B:) always reflect (Original Pool - Total Grid Allotments)
    useEffect(() => {
        if (!originalEbSummary || Object.keys(originalEbSummary).length === 0) {
            setEbSummaryData({});
            setBorrowedAmounts({});
            return;
        }

        const newSummary = JSON.parse(JSON.stringify(originalEbSummary));
        const newBorrows: Record<string, any> = {};

        energyAllotmentData.forEach(item => {
            const wm = String(item.wm || '').trim();
            if (!wm || !newSummary[wm]) return;
            const cust = String(item.customer || '').trim();
            const se = String(item.seNumber || '').trim();

            ['c1', 'c2', 'c4', 'c5'].forEach(slot => {
                const val = parseFloat(stripCommas(item[slot])) || 0;
                if (val === 0) return;

                const borrowKey = `${cust}|${se}|${wm}|${slot}`;
                const partner = PARTNER_SLOT[slot];
                let remainingToAllot = val;

                // Take from own pool first
                const ownPP = Number(newSummary[wm][`${slot}_pp`]) || 0;
                const ownBank = Number(newSummary[wm][`${slot}_bank`]) || 0;

                const takeOwnPP = Math.min(remainingToAllot, ownPP);
                remainingToAllot -= takeOwnPP;
                const takeOwnBank = Math.min(remainingToAllot, ownBank);
                remainingToAllot -= takeOwnBank;

                newSummary[wm][`${slot}_pp`] = ownPP - takeOwnPP;
                newSummary[wm][`${slot}_bank`] = ownBank - takeOwnBank;

                const slotInfo: any = { _own: { pp: takeOwnPP, bank: takeOwnBank } };

                // Take from partner if still remaining
                if (remainingToAllot > 0 && partner) {
                    const partPP = Number(newSummary[wm][`${partner}_pp`]) || 0;
                    const partBank = Number(newSummary[wm][`${partner}_bank`]) || 0;

                    const takePartPP = Math.min(remainingToAllot, partPP);
                    remainingToAllot -= takePartPP;
                    const takePartBank = Math.min(remainingToAllot, partBank);
                    remainingToAllot -= takePartBank;

                    newSummary[wm][`${partner}_pp`] = partPP - takePartPP;
                    newSummary[wm][`${partner}_bank`] = partBank - takePartBank;

                    slotInfo[partner] = { pp: takePartPP, bank: takePartBank };
                }

                newBorrows[borrowKey] = slotInfo;
            });
        });

        setEbSummaryData(newSummary);
        setBorrowedAmounts(newBorrows);
    }, [energyAllotmentData, originalEbSummary, memoizedGridData.order]);

    const autoLoadAllAllotments = React.useCallback(async () => {
        if (!selectedYear || !selectedMonth || !fullCustomerData || fullCustomerData.length === 0) return;
        try {
            const response = await api.get(
                `/windmills/energy-allotment/all-by-month?year=${selectedYear}&month=${selectedMonth}`
            );

            if (response.data && response.data.status === "success") {
                const savedData: any[] = response.data.data;

                // ALWAYS build a fresh skeleton from fullCustomerData when period changes
                const skeletonMap = new Map();
                const baseData = fullCustomerData.map(item => {
                    const customerId = item.id || item.customer_id || item.cust_id || item.mc_id || 0;
                    return {
                        customer_id: customerId,
                        service_id: item.service_id || 0,
                        wm: "",
                        customer: item.customer_name || item.customer,
                        seNumber: item.service_number || item.sc_number || '',
                        totalAgreedUnits: item.total_agreed_units || 0,
                        consumption: "0",
                        c1: "0", c1_pp: "0", c1_bank: "0",
                        c2: "0", c2_pp: "0", c2_bank: "0",
                        c4: "0", c4_pp: "0", c4_bank: "0",
                        c5: "0", c5_pp: "0", c5_bank: "0",
                        c1_allot: "0", c2_allot: "0", c4_allot: "0", c5_allot: "0"
                    };
                });

                baseData.forEach(d => {
                    const key = `${d.customer_id}-${d.service_id}`;
                    if (!skeletonMap.has(key)) {
                        skeletonMap.set(key, { ...d });
                    }
                });

                let resultRows: any[] = Array.from(skeletonMap.values());

                if (savedData.length > 0) {
                    savedData.forEach((s: any) => {
                        const cid = s.customer_id || 0;
                        const sid = s.service_id || 0;
                        const key = `${cid}-${sid}`;
                        const wm = String(s.windmill_number || '').trim();

                        const emptyIdx = resultRows.findIndex(r =>
                            String(`${r.customer_id || 0}-${r.service_id || 0}`) === key && r.wm === ""
                        );

                        if (emptyIdx >= 0) {
                            resultRows[emptyIdx] = {
                                ...resultRows[emptyIdx],
                                wm: wm,
                                c1: String(s.c1 || '0'), c1_pp: String(s.c1_pp || '0'), c1_bank: String(s.c1_bank || '0'), c1_allot: String(s.c1 || '0'),
                                c2: String(s.c2 || '0'), c2_pp: String(s.c2_pp || '0'), c2_bank: String(s.c2_bank || '0'), c2_allot: String(s.c2 || '0'),
                                c4: String(s.c4 || '0'), c4_pp: String(s.c4_pp || '0'), c4_bank: String(s.c4_bank || '0'), c4_allot: String(s.c4 || '0'),
                                c5: String(s.c5 || '0'), c5_pp: String(s.c5_pp || '0'), c5_bank: String(s.c5_bank || '0'), c5_allot: String(s.c5 || '0'),
                            };
                        } else {
                            const base = resultRows.find(r => String(`${r.customer_id || 0}-${r.service_id || 0}`) === key);
                            if (base) {
                                resultRows.push({
                                    ...base,
                                    wm: wm,
                                    c1: String(s.c1 || '0'), c1_pp: String(s.c1_pp || '0'), c1_bank: String(s.c1_bank || '0'), c1_allot: String(s.c1 || '0'),
                                    c2: String(s.c2 || '0'), c2_pp: String(s.c2_pp || '0'), c2_bank: String(s.c2_bank || '0'), c2_allot: String(s.c2 || '0'),
                                    c4: String(s.c4 || '0'), c4_pp: String(s.c4_pp || '0'), c4_bank: String(s.c4_bank || '0'), c4_allot: String(s.c4 || '0'),
                                    c5: String(s.c5 || '0'), c5_pp: String(s.c5_pp || '0'), c5_bank: String(s.c5_bank || '0'), c5_allot: String(s.c5 || '0'),
                                });
                            }
                        }
                    });
                }

                setEnergyAllotmentData(resultRows);
                console.log(`✅ Auto-loaded ${savedData.length} allotment rows for ${selectedMonth}/${selectedYear}`);
            }
        } catch (error) {
            console.error("❌ Auto-load allotments error:", error);
        }
    }, [selectedYear, selectedMonth, fullCustomerData]);

    useEffect(() => {
        autoLoadAllAllotments();
    }, [autoLoadAllAllotments]);

    useEffect(() => {
        const fetchActualAdjustedTotals = async () => {
            if (!selectedYear || !selectedMonth) return;
            try {
                const response = await api.get(`/actuals/list?year=${selectedYear}&month=${selectedMonth}`);
                if (Array.isArray(response.data)) {
                    const aggregation: Record<string, number> = {};
                    response.data.forEach((item: any) => {
                        const name = String(item.customer_name || '').trim();
                        if (name) {
                            aggregation[name] = (aggregation[name] || 0) + (parseFloat(item.manual_adjusted_total) || 0);
                        }
                    });
                    setActualAdjustedTotals(aggregation);
                }
            } catch (error) {
                console.error("Error fetching actual adjusted totals:", error);
            }
        };
        fetchActualAdjustedTotals();
    }, [selectedYear, selectedMonth]);

    const handleSearch = async () => {
        if (!selectedWindmillId) {
            toast.error("Please select a windmill first.");
            return;
        }

        toast.info("Fetching Windmill EB Statement details and saved allotments...");

        try {
            // 1. Fetch Availability (P/B rows)
            await fetchEbStatementSummary();

            // 2. Fetch Saved Allotments for the Grid
            const response = await api.get(`/windmills/energy-allotment/details-list?windmill_id=${selectedWindmillId}&year=${selectedYear}&month=${selectedMonth}`);

            if (response.data && response.data.status === "success") {
                const savedData = response.data.data;

                if (savedData.length > 0) {
                    const windmillObj = windmillsDetailed.find(w => w.id.toString() === selectedWindmillId);
                    const wmNumber = windmillObj?.windmill_number || "";

                    // Update the grid with saved values
                    setEnergyAllotmentData(prev => {
                        const newData = [...prev];
                        savedData.forEach((savedRow: any) => {
                            const index = newData.findIndex(d =>
                                d.customer_id === savedRow.customer_id &&
                                d.service_id === savedRow.service_id
                            );

                            if (index >= 0) {
                                // Important: We update/create a row for this specific windmill
                                // If a row for this customer/service/wm already exists, update it.
                                // If not, we might need to handle multi-wm rows better, but 
                                // usually the grid is pre-populated with customers.
                                const existingRowIndex = newData.findIndex(d =>
                                    d.customer_id === savedRow.customer_id &&
                                    d.service_id === savedRow.service_id &&
                                    d.wm === wmNumber
                                );

                                if (existingRowIndex >= 0) {
                                    newData[existingRowIndex] = {
                                        ...newData[existingRowIndex],
                                        c1: savedRow.c1.toString(),
                                        c1_pp: savedRow.c1_pp.toString(),
                                        c1_bank: savedRow.c1_bank.toString(),
                                        c1_allot: savedRow.c1.toString(),
                                        c2: savedRow.c2.toString(),
                                        c2_pp: savedRow.c2_pp.toString(),
                                        c2_bank: savedRow.c2_bank.toString(),
                                        c2_allot: savedRow.c2.toString(),
                                        c4: savedRow.c4.toString(),
                                        c4_pp: savedRow.c4_pp.toString(),
                                        c4_bank: savedRow.c4_bank.toString(),
                                        c4_allot: savedRow.c4.toString(),
                                        c5: savedRow.c5.toString(),
                                        c5_pp: savedRow.c5_pp.toString(),
                                        c5_bank: savedRow.c5_bank.toString(),
                                        c5_allot: savedRow.c5.toString(),
                                    };
                                } else {
                                    // If row doesn't exist for this WM, we could add it, 
                                    // but let's just update the first one found or handle as needed.
                                    // For now, let's assume rows are keyed by (customer, service, wm)
                                    newData[index] = {
                                        ...newData[index],
                                        wm: wmNumber,
                                        c1: savedRow.c1.toString(),
                                        c1_pp: savedRow.c1_pp.toString(),
                                        c1_bank: savedRow.c1_bank.toString(),
                                        c1_allot: savedRow.c1.toString(),
                                        c2: savedRow.c2.toString(),
                                        c2_pp: savedRow.c2_pp.toString(),
                                        c2_bank: savedRow.c2_bank.toString(),
                                        c2_allot: savedRow.c2.toString(),
                                        c4: savedRow.c4.toString(),
                                        c4_pp: savedRow.c4_pp.toString(),
                                        c4_bank: savedRow.c4_bank.toString(),
                                        c4_allot: savedRow.c4.toString(),
                                        c5: savedRow.c5.toString(),
                                        c5_pp: savedRow.c5_pp.toString(),
                                        c5_bank: savedRow.c5_bank.toString(),
                                        c5_allot: savedRow.c5.toString(),
                                    };
                                }
                            }
                        });
                        return newData;
                    });
                    toast.success("Loaded saved allotments!");
                } else {
                    toast.info("No saved allotments found for this selection.");
                }
            }
        } catch (error) {
            console.error("Search error:", error);
            toast.error("Failed to fetch search results.");
        }
    };

    const handleSave = async () => {
        if (isSaving) return;

        setIsSaving(true);
        try {
            // Check for pending uploads if active tab is uploads
            if (activeTab === "uploads") {
                const pendingUploads = Object.entries(uploads).filter(([wm, data]) => data.file !== null);

                if (pendingUploads.length === 0) {
                    toast.warning("ℹ️ No new files to save. Please select a file first.");
                    setIsSaving(false);
                    return;
                }

                let successCount = 0;
                let errorCount = 0;

                for (const [wm, data] of pendingUploads) {
                    const windmillObj = windmillsDetailed.find(w => w.windmill_number === wm);
                    if (!windmillObj) {
                        toast.error(`Windmill ID not found for ${wm}`);
                        errorCount++;
                        continue;
                    }

                    try {
                        toast.info(`Saving Allotment Order for ${wm}...`);
                        const formData = new FormData();
                        formData.append("windmill_id", windmillObj.id.toString());
                        formData.append("year", selectedYear);
                        formData.append("month", selectedMonth);
                        formData.append("file", data.file!);

                        const response = await api.post("/windmills/allotment-order/upload", formData, {
                            headers: { "Content-Type": "multipart/form-data" }
                        });

                        if (response.data && response.data.status === "success") {
                            successCount++;
                            // Clear the `file` object to mark it as saved and store filePath
                            setUploads(prev => ({
                                ...prev,
                                [wm]: { file: null, fileName: response.data.file_name, filePath: response.data.file_path }
                            }));
                        } else {
                            errorCount++;
                        }
                    } catch (error: any) {
                        console.error(`Allotment order upload error for ${wm}:`, error);
                        let errMsg = `Failed to upload for ${wm}.`;
                        if (error.response?.data?.detail) {
                            const detail = error.response.data.detail;
                            if (typeof detail === 'string') errMsg = detail;
                            else if (Array.isArray(detail)) errMsg = detail.map((err: any) => err.msg).join(", ");
                        }
                        toast.error(errMsg);
                        errorCount++;
                    }
                }

                if (successCount > 0) {
                    toast.success(`✅ ${successCount} files saved successfully!`);
                }
                if (errorCount > 0) {
                    toast.error(`❌ Failed to save ${errorCount} files.`);
                }

                setIsSaving(false);
                return;
            }
            if (!energyAllotmentData || energyAllotmentData.length === 0) {
                toast.error("No data available");
                setIsSaving(false);
                return;
            }

            let successCount = 0;
            let errorCount = 0;
            let skippedCount = 0;

            // 1. Identify rows with data across all three modules
            const rowsWithData = energyAllotmentData.filter(row => {
                const hasData =
                    (parseFloat(row.c1) || 0) !== 0 ||
                    (parseFloat(row.c1_bank) || 0) !== 0 ||
                    (parseFloat(row.c2) || 0) !== 0 ||
                    (parseFloat(row.c2_bank) || 0) !== 0 ||
                    (parseFloat(row.c4) || 0) !== 0 ||
                    (parseFloat(row.c4_bank) || 0) !== 0 ||
                    (parseFloat(row.c5) || 0) !== 0 ||
                    (parseFloat(row.c5_bank) || 0) !== 0 ||
                    (parseFloat(row.consumption) || 0) !== 0;
                return hasData;
            });

            const windmillChargesToSave = chargeAllocationRows.filter(r => r.customer && r.seNumber);
            const solarRowsToSave = solarAllocationRows.filter(r => r.customer && r.seNumber && r.value > 0);

            // Block save only for non-list tabs when nothing to save
            if (activeTab !== "list" && rowsWithData.length === 0 && windmillChargesToSave.length === 0 && solarRowsToSave.length === 0) {
                toast.warning("ℹ️ No rows with data. Fill in at least one field to save.");
                setIsSaving(false);
                return;
            }

            if (activeTab === "list") {
                // Fetch FRESH server-side EB summary so the save's borrowing logic
                // starts from the original pool — not the UI-deducted header values
                // shown to the user while entering allocations.
                let freshEbSummary = ebSummaryData;
                try {
                    const freshRes = await api.get(`/eb/summary/by-month?year=${selectedYear}&month=${selectedMonth}`);
                    if (freshRes.data?.status === "success") {
                        freshEbSummary = freshRes.data.data;
                    }
                } catch (e) {
                    console.warn("Could not refresh EB summary before save — using cached values.", e);
                }
                const runningBalance = JSON.parse(JSON.stringify(freshEbSummary));


                if (rowsWithData.length > 0) {
                    const totalRows = rowsWithData.length;
                    toast.info(`Saving ${totalRows} energy allotment records...`);

                    for (const row of rowsWithData) {
                        try {
                            const wm = row.wm;
                            const windmillObj = windmillsDetailed.find(w => w.windmill_number === wm);
                            const resolvedWindmillId = ebSummaryData[wm]?.windmill_id || windmillObj?.id || 0;

                            // Resolve customer and service IDs robustly
                            const masterInfo = fullCustomerData.find(c =>
                                String(c.customer_name || "").trim() === String(row.customer || "").trim() &&
                                String(c.service_number || "").trim() === String(row.seNumber || "").trim()
                            );

                            const resolvedCustomerId = row.customer_id || masterInfo?.id || 0;
                            const resolvedServiceId = row.service_id || masterInfo?.service_id || 0;

                            if (resolvedCustomerId === 0 || resolvedWindmillId === 0) {
                                console.warn(`Missing IDs for row: ${row.customer}. Cust: ${resolvedCustomerId}, WM: ${resolvedWindmillId}`);
                                skippedCount++;
                                continue;
                            }

                            const slots = ['c1', 'c2', 'c4', 'c5'];
                            const splitValues: any = {};

                            slots.forEach(slot => {
                                let rem = parseFloat(stripCommas(row[slot])) || 0;
                                const oldPP = parseFloat(row[`${slot}_pp`]) || 0;
                                const oldBank = parseFloat(row[`${slot}_bank`]) || 0;
                                const partner = PARTNER_SLOT[slot];

                                // Use own pool first (from fresh server state)
                                let availOwnPP = (parseFloat(runningBalance[wm]?.[`${slot}_pp`]) || 0) + oldPP;
                                let useOwnPP = Math.min(rem, availOwnPP);
                                rem -= useOwnPP;
                                if (runningBalance[wm]) runningBalance[wm][`${slot}_pp`] = availOwnPP - useOwnPP;

                                let availOwnBN = (parseFloat(runningBalance[wm]?.[`${slot}_bank`]) || 0) + oldBank;
                                let useOwnBN = Math.min(rem, availOwnBN);
                                rem -= useOwnBN;
                                if (runningBalance[wm]) runningBalance[wm][`${slot}_bank`] = availOwnBN - useOwnBN;

                                // Use partner pool if still remaining
                                let usePartPP = 0;
                                let usePartBN = 0;
                                if (rem > 0 && partner) {
                                    let availPartPP = (parseFloat(runningBalance[wm]?.[`${partner}_pp`]) || 0);
                                    usePartPP = Math.min(rem, availPartPP);
                                    rem -= usePartPP;
                                    if (runningBalance[wm]) runningBalance[wm][`${partner}_pp`] = availPartPP - usePartPP;

                                    let availPartBN = (parseFloat(runningBalance[wm]?.[`${partner}_bank`]) || 0);
                                    usePartBN = Math.min(rem, availPartBN);
                                    rem -= usePartBN;
                                    if (runningBalance[wm]) runningBalance[wm][`${partner}_bank`] = availPartBN - usePartBN;
                                }

                                splitValues[`${slot}_power`] = useOwnPP + usePartPP;
                                splitValues[`${slot}_banking`] = useOwnBN + usePartBN;
                            });

                            const payload = {
                                allotment_year: parseInt(selectedYear),
                                allotment_month: parseInt(selectedMonth),
                                allotment_date: new Date().toISOString().split('T')[0],
                                customer_id: resolvedCustomerId,
                                windmill_id: resolvedWindmillId,
                                service_id: resolvedServiceId,
                                service_number: row.seNumber ? String(row.seNumber).trim() : null,
                                c1_power: splitValues.c1_power,
                                c1_banking: splitValues.c1_banking,
                                c2_power: splitValues.c2_power,
                                c2_banking: splitValues.c2_banking,
                                c4_power: splitValues.c4_power,
                                c4_banking: splitValues.c4_banking,
                                c5_power: splitValues.c5_power,
                                c5_banking: splitValues.c5_banking,
                                requested_power: parseFloat(stripCommas(row.consumption)) || 0,
                                requested_banking: 0,
                                allocated_power: parseFloat(stripCommas(row.c1)) || 0, // Using actual current value
                                allocated_banking: 0,
                                utilized_power: 0,
                                utilized_banking: 0
                            };

                            const response = await api.post("/windmills/energy-allotment/create", payload);
                            if (response.status === 200 || response.data?.status === "success") {
                                successCount++;
                            } else {
                                errorCount++;
                            }
                        } catch (rowError: any) {
                            console.error("❌ Exception for row:", row.customer, rowError);
                            errorCount++;
                        }
                    }

                    // Update UI state to reflect saved values
                    setEnergyAllotmentData(prev => prev.map(row => {
                        const updated = rowsWithData.find(r => r.customer === row.customer && r.seNumber === row.seNumber && r.wm === row.wm);
                        if (updated) {
                            return {
                                ...row,
                                c1_allot: updated.c1,
                                c2_allot: updated.c2,
                                c4_allot: updated.c4,
                                c5_allot: updated.c5
                            };
                        }
                        return row;
                    }));

                    if (successCount > 0) toast.success(`Successfully saved ${successCount} allotments.`);
                    if (errorCount > 0) toast.error(`Failed to save ${errorCount} allotments.`);
                }

                // 3. Final Balance Sync
                const windmillNumbers = Object.keys(ebSummaryData);
                if (windmillNumbers.length > 0) {
                    try {
                        const balancePayload = {
                            year: parseInt(selectedYear),
                            month: parseInt(selectedMonth),
                            balances: windmillNumbers.flatMap(wm => ['c1', 'c2', 'c4', 'c5'].map(slot => {
                                // Send the calculated remaining balance from ebSummaryData
                                return {
                                    wm,
                                    slot,
                                    pp: Math.round(Number(ebSummaryData[wm]?.[`${slot}_pp`])),
                                    bank: Math.round(Number(ebSummaryData[wm]?.[`${slot}_bank`]))
                                };
                            }))
                        };
                        await api.post("/windmills/energy-allotment/update-balance", balancePayload);
                        console.log("✅ Final balances synced successfully.");
                    } catch (balError) {
                        console.error("❌ Failed to sync balances:", balError);
                    }
                }
                await fetchEbStatementSummary();
            } else if (activeTab === "allocation") {
                // -------------------------------------------------------
                // 2. Save Windmill Charge Allocation Table
                // -------------------------------------------------------
                if (windmillChargesToSave.length > 0) {
                    console.log("💾 Saving Windmill Charge Allocation rows...");
                    for (const row of windmillChargesToSave) {
                        const match = fullCustomerData.find(c => {
                            const dbCust = String(c.customer_name || c.customer || "").trim();
                            const dbSE = String(c.service_number || c.sc_number || "").trim();
                            const rowCust = String(row.customer || "").trim();
                            const rowSE = String(row.seNumber || "").trim();
                            return dbCust === rowCust && dbSE === rowSE;
                        });

                        const wmObj = windmillsDetailed.find(w => w.windmill_number === row.windmill);

                        if (match) {
                            const chargePayload = {
                                customer_id: match.id || match.customer_id || 0,
                                windmill_id: wmObj?.id || 0,
                                service_id: match.service_id || 0,
                                allotment_year: parseInt(selectedYear),
                                allotment_month: parseInt(selectedMonth),
                                charges: {
                                    C001: row.mrc,
                                    C002: row.omc,
                                    C003: row.trc,
                                    C004: row.oc1,
                                    C005: row.kp,
                                    C006: row.ec,
                                    C007: row.shc,
                                    C008: row.other,
                                    C010: row.dc,
                                }
                            };
                            try {
                                await api.post("/windmills/charge-allotment/save", chargePayload);
                                successCount++;
                            } catch (e: any) {
                                console.error(`Error saving windmill charges for ${row.windmill}:`, e);
                                console.error(`  --> Server detail:`, e.response?.data);
                                console.error(`  --> Payload sent:`, chargePayload);
                                errorCount++;
                            }
                        }
                    }
                }

                // -------------------------------------------------------
                // 3. Save Solar Charge Allocation Table
                // -------------------------------------------------------
                if (solarRowsToSave.length > 0) {
                    console.log("💾 Saving Solar Charge Allocation rows...");
                    const solarWm = solarWindmills[0];

                    const items = solarRowsToSave.map(row => {
                        const match = fullCustomerData.find(c => {
                            const dbCust = String(c.customer_name || c.customer || "").trim();
                            const dbSE = String(c.service_number || c.sc_number || "").trim();
                            const rowCust = String(row.customer || "").trim();
                            const rowSE = String(row.seNumber || "").trim();
                            return dbCust === rowCust && dbSE === rowSE;
                        });

                        let code = row.chargeCode || "";
                        if (!code) {
                            if (row.chargeKey === 'mrc') code = 'C001';
                            else if (row.chargeKey === 'omc') code = 'C002';
                            else if (row.chargeKey === 'trc') code = 'C003';
                            else if (row.chargeKey === 'oc1') code = 'C004';
                            else if (row.chargeKey === 'kp') code = 'C005';
                            else if (row.chargeKey === 'ec') code = 'C006';
                            else if (row.chargeKey === 'shc') code = 'C007';
                            else if (row.chargeKey === 'other') code = 'C008';
                            else if (row.chargeKey === 'dc') code = 'C010';
                        }

                        return {
                            charge_code: code,
                            value: row.value,
                            system_value: row.systemValue,
                            customer_id: match?.id || match?.customer_id || 0,
                            service_id: match?.service_id || 0
                        };
                    });

                    const grouped = items.reduce((acc: any, item: any) => {
                        const key = `${item.customer_id}-${item.service_id}`;
                        if (!acc[key]) acc[key] = { customer_id: item.customer_id, service_id: item.service_id, items: [] };
                        acc[key].items.push({
                            charge_code: item.charge_code,
                            value: item.value,
                            system_value: item.system_value
                        });
                        return acc;
                    }, {});

                    for (const key in grouped) {
                        const group = grouped[key];
                        const solarPayload = {
                            customer_id: group.customer_id,
                            solar_id: solarWm?.id || 0,
                            service_id: group.service_id,
                            allotment_year: parseInt(selectedYear),
                            allotment_month: parseInt(selectedMonth),
                            items: group.items
                        };
                        try {
                            await api.post("/windmills/solar-allotment/save", solarPayload);
                            successCount++;
                        } catch (e: any) {
                            console.error(`Error saving solar group ${key}:`, e);
                            console.error(`  --> Server detail:`, e.response?.data);
                            console.error(`  --> Payload sent:`, solarPayload);
                            errorCount++;
                        }
                    }
                }
            }

            // Final summary
            const summary = `📊 ${activeTab === 'list' ? 'Allotment' : 'Charges'} Saved: ${successCount} | Errors: ${errorCount}`;
            console.log("\n" + summary);

            if (successCount > 0) {
                toast.success(`✅ ${successCount} records saved successfully!`);
                setIsEditing(false);
                // Clear borrow-tracking so freshly loaded data starts with no UI deductions
                setBorrowedAmounts({});
                await Promise.all([
                    autoLoadAllAllotments(),
                    reloadWindmillCharges(),
                    reloadSolarCharges()
                ]);
            } else if (errorCount > 0) {
                toast.error(`❌ Failed to save. Errors: ${errorCount}`);
            }
        } catch (error: any) {
            console.error("❌ Top-level error:", error);
            toast.error("Unexpected error. Check console.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            const monthLabel = months.find(m => m.value === selectedMonth)?.label || selectedMonth;
            const workbook = utils.book_new();

            if (activeTab === 'allocation') {
                toast.info("Fetching charge allocation data for export...");
                const response = await api.get(
                    `/windmills/charge-allotment/export?year=${selectedYear}&month=${selectedMonth}`
                );

                if (!response.data || response.data.status !== "success") {
                    toast.warning("No charge allocation data found to export.");
                    return;
                }

                const { windmill_charges, solar_charges } = response.data;

                if (windmill_charges.length === 0 && solar_charges.length === 0) {
                    toast.warning("No saved charge data found for the selected period.");
                    return;
                }

                if (windmill_charges && windmill_charges.length > 0) {
                    const wsWindmill = utils.json_to_sheet(windmill_charges);
                    const colWidths = Object.keys(windmill_charges[0]).map(key => ({ wch: Math.max(key.length, 14) }));
                    wsWindmill['!cols'] = colWidths;
                    utils.book_append_sheet(workbook, wsWindmill, "Windmill Charges");
                }

                if (solar_charges && solar_charges.length > 0) {
                    const wsSolar = utils.json_to_sheet(solar_charges);
                    const colWidths = Object.keys(solar_charges[0]).map(key => ({ wch: Math.max(key.length, 14) }));
                    wsSolar['!cols'] = colWidths;
                    utils.book_append_sheet(workbook, wsSolar, "Solar Charges");
                }

                const fileName = `Charge_Allocation_${monthLabel}_${selectedYear}.xlsx`;
                writeFile(workbook, fileName);
                toast.success(`✓ Exported charge data to ${fileName}`);

            } else if (activeTab === 'list') {
                toast.info("Fetching allotment data for export...");
                const response = await api.get(
                    `/windmills/energy-allotment/export?year=${selectedYear}&month=${selectedMonth}`
                );

                if (!response.data || response.data.status !== "success") {
                    toast.warning("No allotment data found to export.");
                    return;
                }

                const dataToExport = response.data.data;
                if (dataToExport.length === 0) {
                    toast.warning("No saved allocation data found for the selected period.");
                    return;
                }

                const worksheet = utils.json_to_sheet(dataToExport);
                const colWidths = Object.keys(dataToExport[0]).map(key => ({ wch: Math.max(key.length, 14) }));
                worksheet['!cols'] = colWidths;
                utils.book_append_sheet(workbook, worksheet, "Energy Allotment");

                const fileName = `Energy_Allotment_${monthLabel}_${selectedYear}.xlsx`;
                writeFile(workbook, fileName);
                toast.success(`✓ Exported ${dataToExport.length} records to ${fileName}`);
            } else {
                toast.info("Excel export not available for this tab.");
            }
        } catch (error) {
            console.error("Excel Export Error:", error);
            toast.error("Failed to generate Excel file.");
        }
    };

    const handleChargeCustomerChange = (index: number, customer: string) => {
        setChargeAllocationRows(prev => {
            const newData = [...prev];
            newData[index] = {
                ...newData[index],
                customer,
                seNumber: "",
                mrc: 0, omc: 0, trc: 0, oc1: 0, kp: 0, ec: 0, shc: 0, other: 0, dc: 0
            };
            return newData;
        });
    };

    const handleChargeSEChange = (index: number, seNumber: string) => {
        setChargeAllocationRows(prev => {
            const newData = [...prev];
            const row = newData[index];
            const wm = row.windmill;
            const wmCharges = fetchedChargesSummary[wm] || {};

            newData[index] = {
                ...row,
                seNumber,
                mrc: wmCharges["C001"] || 0,
                omc: wmCharges["C002"] || 0,
                trc: wmCharges["C003"] || 0,
                oc1: wmCharges["C004"] || 0,
                kp: wmCharges["C005"] || 0,
                ec: wmCharges["C006"] || 0,
                shc: wmCharges["C007"] || 0,
                other: wmCharges["C008"] || 0,
                dc: wmCharges["C010"] || 0,
            };
            return newData;
        });
    };


    const handleChargeFieldChange = (index: number, field: string, value: string) => {
        setChargeAllocationRows(prev => {
            const newData = [...prev];
            const cleanVal = stripCommas(value);
            if (cleanVal !== '' && isNaN(Number(cleanVal))) return prev;
            newData[index] = { ...newData[index], [field]: Number(cleanVal) || 0 };
            return newData;
        });
    };

    // Handlers for Solar Allocation
    const handleSolarCheckChange = (index: number, checked: boolean) => {
        const newData = [...solarAllocationRows];
        newData[index] = { ...newData[index], isChecked: checked };
        setSolarAllocationRows(newData);
    };

    const handleSolarFieldChange = (index: number, value: string) => {
        const newData = [...solarAllocationRows];
        // Allow numeric characters and a single decimal point for typing, strip commas
        const cleanValue = stripCommas(value).replace(/[^0-9.]/g, '');
        // If there's more than one dot, keep only the first one
        const parts = cleanValue.split('.');
        const finalValue = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleanValue;

        newData[index] = { ...newData[index], value: finalValue };
        setSolarAllocationRows(newData);
    };

    const handleSolarCustomerChange = (index: number, customer: string) => {
        const newData = [...solarAllocationRows];
        newData[index] = { ...newData[index], customer, seNumber: "" };
        setSolarAllocationRows(newData);
    };

    const handleSolarSEChange = (index: number, seNumber: string) => {
        const newData = [...solarAllocationRows];
        newData[index] = { ...newData[index], seNumber };
        setSolarAllocationRows(newData);
    };

    const addSolarSplitRow = (index: number) => {
        setSolarAllocationRows(prev => {
            const rowToCopy = prev[index];
            const newRows = [...prev];
            newRows.splice(index + 1, 0, {
                ...rowToCopy,
                tempId: `${rowToCopy.chargeCode}-${Math.random().toString(36).substring(2, 11)}`,
                customer: "",
                seNumber: "",
                value: 0,
                isChecked: true
            });
            return newRows;
        });
    };

    const removeSolarSplitRow = (index: number) => {
        const newRows = solarAllocationRows.filter((_, i) => i !== index);
        setSolarAllocationRows(newRows);
    };

    const handleEnergyAllotmentChange = (index: number, field: string, value: string) => {
        const newData = [...energyAllotmentData];
        newData[index] = { ...newData[index], [field]: value };
        setEnergyAllotmentData(newData);
    };

    const handleGridUpdate = (customer: string, seNumber: string, wm: string, field: string, value: string) => {
        const cleanValue = stripCommas(value);
        if (cleanValue !== '' && isNaN(Number(cleanValue))) return;

        const formattedValue = formatWithCommas(cleanValue);
        const trimmedCustomer = String(customer || '').trim();
        const trimmedSE = String(seNumber || '').trim();
        const trimmedWM = String(wm || '').trim();

        // Subtraction Logic: Requested = Original - Allocated
        const originalReq = consumptionRequests.find(r =>
            String(r.customer_name || '').trim() === trimmedCustomer &&
            (String(r.sc_number || '').trim() === trimmedSE || String(r.sc_number || '').trim() === trimmedWM)
        );

        const getSubtractedValue = (allocVal: string, origVal: any) => {
            const a = parseFloat(stripCommas(allocVal)) || 0;
            const o = parseFloat(origVal) || 0;
            const res = Math.max(o - a, 0);
            return res.toFixed(2).replace(/\.00$/, "");
        };

        setEnergyAllotmentData(prev => {
            const newData = [...prev];
            const index = newData.findIndex(d =>
                String(d.customer || '').trim() === trimmedCustomer &&
                String(d.seNumber || '').trim() === trimmedSE &&
                String(d.wm || '').trim() === trimmedWM
            );

            if (index >= 0) {
                const updated: any = { ...newData[index], [field]: formattedValue };
                if (field === 'c1') updated.req_c1 = getSubtractedValue(formattedValue, originalReq?.c1);
                if (field === 'c2') updated.req_c2 = getSubtractedValue(formattedValue, originalReq?.c2);
                if (field === 'c4') updated.req_c4 = getSubtractedValue(formattedValue, originalReq?.c4);
                if (field === 'c5') updated.req_c5 = getSubtractedValue(formattedValue, originalReq?.c5);
                newData[index] = updated;
                return newData;
            } else {
                const sibling = newData.find(d =>
                    String(d.customer || '').trim() === trimmedCustomer &&
                    String(d.seNumber || '').trim() === trimmedSE
                );

                const masterInfo = fullCustomerData.find(c =>
                    String(c.customer_name || "").trim() === trimmedCustomer &&
                    String(c.service_number || "").trim() === trimmedSE
                );

                const resolvedCustId = sibling?.customer_id || masterInfo?.id || 0;
                const resolvedServiceId = sibling?.service_id || masterInfo?.service_id || 0;

                const newEntry: any = {
                    wm: trimmedWM,
                    customer: trimmedCustomer,
                    seNumber: trimmedSE,
                    customer_id: resolvedCustId,
                    service_id: resolvedServiceId,
                    consumption: sibling ? sibling.consumption : "0",
                    c1: "0", c1_pp: "0", c1_bank: "0",
                    c2: "0", c2_pp: "0", c2_bank: "0",
                    c4: "0", c4_pp: "0", c4_bank: "0",
                    c5: "0", c5_pp: "0", c5_bank: "0",
                    c1_allot: "0", c2_allot: "0", c4_allot: "0", c5_allot: "0",
                    [field]: formattedValue
                };

                if (field === 'c1') newEntry.req_c1 = getSubtractedValue(formattedValue, originalReq?.c1);
                if (field === 'c2') newEntry.req_c2 = getSubtractedValue(formattedValue, originalReq?.c2);
                if (field === 'c4') newEntry.req_c4 = getSubtractedValue(formattedValue, originalReq?.c4);
                if (field === 'c5') newEntry.req_c5 = getSubtractedValue(formattedValue, originalReq?.c5);

                return [...newData, newEntry];
            }
        });
    };

    const handleGridBlur = (customer: string, seNumber: string, wm: string, field: string, value: string) => {
        // Transmission loss addition removed as requested by user
    };


    return (
        <ErrorBoundary>
            <div className="p-2 bg-slate-50 min-h-screen font-sans">
                <div className="max-w-full mx-auto bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-3 space-y-2">
                        {/* Page Title */}
                        <div className="flex items-center justify-between pb-1">
                            <h1 className="text-xl font-bold text-slate-800">Energy Allotment</h1>
                        </div>

                        {/* Search Filters */}
                        <div className="space-y-1">
                            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex flex-nowrap gap-2 items-center">
                                <span className="text-sm font-semibold text-slate-600 mr-2">Search</span>
                                <Select value={selectedWindmillId} onValueChange={setSelectedWindmillId}>
                                    <SelectTrigger className="w-[200px] h-9 bg-white border-slate-300 text-sm">
                                        <SelectValue placeholder="Select Windmill" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {windmillsDetailed.map(wm => (
                                            <SelectItem key={wm.id} value={wm.id.toString()}>{wm.windmill_number}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Year Selection */}
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="w-[140px] h-9 bg-white border-slate-300 text-sm">
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

                                {/* Month Selection */}
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="w-[140px] h-9 bg-white border-slate-300 text-sm">
                                        <SelectValue placeholder="Select Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map((month) => (
                                            <SelectItem key={month.value} value={month.value}>
                                                {month.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="flex-1"></div>

                                <Button size="sm" className="h-9 text-sm bg-primary hover:bg-primary/90 text-white px-6 flex items-center gap-2" onClick={handleSearch}>
                                    <Search className="h-4 w-4" />
                                    Search
                                </Button>
                                <Button size="sm" className="h-9 text-sm bg-red-600 hover:bg-red-700 text-white px-4 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save"}
                                </Button>
                                <Button size="sm" className="h-9 text-sm bg-slate-500 hover:bg-slate-600 text-white px-4" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                                <Button size="sm" className="h-9 text-sm bg-[#DAA520] hover:bg-[#B8860B] text-white px-4" onClick={handleExportExcel}>
                                    Export Excel
                                </Button>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="space-y-2">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="flex justify-between items-center bg-primary/5 p-2 rounded-t-lg border-b border-primary/10 h-12">
                                    <TabsList className="bg-transparent p-0 h-auto">
                                        <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md px-4 py-1.5 text-sm font-semibold text-slate-600">Energy Allotment List</TabsTrigger>
                                        <TabsTrigger value="allocation" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md px-4 py-1.5 text-sm font-semibold text-slate-600">Charge Allocation</TabsTrigger>
                                        <TabsTrigger value="uploads" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md px-4 py-1.5 text-sm font-semibold text-slate-600">Allotment Order Upload</TabsTrigger>
                                    </TabsList>

                                    <div className="flex items-center gap-2">
                                        <div className="relative w-64">
                                            <Search className="absolute right-2 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Keyword search..."
                                                className="bg-white border-slate-300 pr-8 h-9 text-sm"
                                                value={searchKeyword}
                                                onChange={(e) => setSearchKeyword(e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-500 hover:text-slate-700"
                                            onClick={handleEditClick}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <TabsContent value="list" className="mt-0">
                                    <div className="flex justify-between items-center p-2 bg-white border-x border-slate-200">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1.5 text-xs font-medium">
                                                <span className="font-bold text-amber-500">P</span>
                                                <span className="text-slate-600">- Power Plant Available</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-medium">
                                                <span className="font-bold text-red-500">B</span>
                                                <span className="text-slate-600">- Banking Units</span>
                                            </div>
                                        </div>
                                        <div className="text-[11px] font-bold text-indigo-600 pr-4 flex items-center gap-2">
                                            {/* Borrowing logic removed */}
                                        </div>
                                    </div>
                                    {/* Top Scrollbar Sync */}
                                    <div
                                        ref={topScrollRef}
                                        className="overflow-x-scroll border-x border-slate-200 bg-white thin-scrollbar sticky top-0 z-[60]"
                                        style={{ height: '10px', maxWidth: open ? 'calc(100vw - 18rem)' : 'calc(100vw - 5rem)' }}
                                    >
                                        <div style={{ width: `${tableScrollWidth}px`, height: '1px' }} />
                                    </div>
                                    <div
                                        ref={tableContainerRef}
                                        className="border border-slate-200 rounded-b-lg mt-0 bg-white overflow-scroll thin-scrollbar max-h-[calc(100vh-180px)]"
                                        style={{ maxWidth: open ? 'calc(100vw - 18rem)' : 'calc(100vw - 5rem)' }}
                                    >
                                        <Table noWrapper className="min-w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                                            <TableHeader className="bg-sidebar">
                                                <TableRow className="bg-sidebar h-[50px]">
                                                    <TableHead rowSpan={2} className="font-semibold text-white whitespace-nowrap min-w-[120px] w-[120px] border-r border-white/20 bg-sidebar sticky top-0 left-0 z-50 h-[130px]">Customer</TableHead>
                                                    <TableHead rowSpan={2} className="font-semibold text-white whitespace-nowrap min-w-[120px] w-[120px] border-r border-white/20 bg-sidebar sticky top-0 left-[120px] z-50 h-[130px]">Service Number</TableHead>
                                                    <TableHead rowSpan={2} className="font-semibold text-white whitespace-nowrap min-w-[120px] w-[120px] border-r border-white/20 bg-sidebar sticky top-0 left-[240px] z-50 h-[130px]"></TableHead>
                                                    {windmillNumbers.map((wm) => {
                                                        return (
                                                            <TableHead key={wm} colSpan={4} className="font-semibold text-center border-b border-r border-white/20 p-0 bg-sidebar sticky top-0 z-40 h-[50px]">
                                                                <div className="text-white h-full flex items-center justify-center">
                                                                    {wm}
                                                                </div>
                                                            </TableHead>
                                                        );
                                                    })}
                                                    <TableHead rowSpan={2} className="font-semibold text-white text-center border-b border-r border-white/20 align-middle sticky top-0 right-0 z-50 bg-sidebar h-[130px]">Total</TableHead>
                                                </TableRow>
                                                <TableRow className="bg-sidebar h-[80px]">
                                                    {windmillNumbers.map((wm) => {
                                                        const wmItems = energyAllotmentData.filter(d => d.wm === wm);
                                                        const renderColHeader = (col: 'c1' | 'c2' | 'c4' | 'c5', label: string, isLast = false) => {

                                                            const displayPower = ebSummaryData[wm] ? Math.round(Number(ebSummaryData[wm][`${col}_pp`])) || 0 : 0;
                                                            const displayBank = ebSummaryData[wm] ? Math.round(Number(ebSummaryData[wm][`${col}_bank`])) || 0 : 0;

                                                            const handleManualUpdate = (col: string, type: 'pp' | 'bank', newVal: string) => {
                                                                const cleanVal = stripCommas(newVal);
                                                                if (cleanVal !== '' && isNaN(Number(cleanVal))) return;
                                                                const numericVal = parseFloat(cleanVal) || 0;
                                                                setEbSummaryData(prev => ({
                                                                    ...prev,
                                                                    [wm]: { ...prev[wm], [`${col}_${type}`]: numericVal }
                                                                }));
                                                            };

                                                            return (
                                                                <TableHead key={`${wm}-${col}`} className={`p-1 text-xs font-semibold text-white text-center border-r ${isLast ? 'border-white/20 last:border-r-0' : 'border-white/10'} align-middle sticky top-[50px] z-40 bg-sidebar h-[80px]`}>
                                                                    <div className="flex flex-col gap-1 items-start w-fit mx-auto mb-1">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[10px] text-white font-bold w-4 text-right">P:</span>
                                                                            <input
                                                                                type="text"
                                                                                value={formatWithCommas(displayPower)}
                                                                                onChange={(e) => handleManualUpdate(col, 'pp', e.target.value)}
                                                                                className="border border-black px-1 bg-white text-red-500 w-[60px] text-center font-bold h-[22px] text-[10px] focus:outline-none"
                                                                            />
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-[10px] text-white font-bold w-4 text-right">B:</span>
                                                                            <input
                                                                                type="text"
                                                                                value={formatWithCommas(displayBank)}
                                                                                onChange={(e) => handleManualUpdate(col, 'bank', e.target.value)}
                                                                                className="border border-black px-1 bg-white text-red-500 w-[60px] text-center font-bold h-[22px] text-[10px] focus:outline-none"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-[10px] uppercase opacity-80">{label}</div>
                                                                </TableHead>
                                                            );
                                                        };

                                                        return (
                                                            <React.Fragment key={wm}>
                                                                {renderColHeader('c1', 'C1')}
                                                                {renderColHeader('c2', 'C2')}
                                                                {renderColHeader('c4', 'C4')}
                                                                {renderColHeader('c5', 'C5', true)}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </TableRow>
                                                {/* Power Plant Row */}
                                                <TableRow className="bg-[#e0f2fe] border-b border-white hover:bg-[#e0f2fe] h-[40px]">
                                                    <TableHead colSpan={3} className="py-2 text-sm text-[#0369a1] font-bold border-r bg-[#e0f2fe] align-middle sticky top-[130px] left-0 z-50 text-center uppercase tracking-wide h-[40px]">
                                                        Power Plant
                                                    </TableHead>
                                                    {windmillNumbers.map((wm) => {
                                                        const renderC = (col: 'c1' | 'c2' | 'c4' | 'c5') => {
                                                            const totalPP = originalEbSummary && originalEbSummary[wm] ? Math.round(Number(originalEbSummary[wm][`${col}_pp`])) || 0 : 0;
                                                            return <TableHead key={`${wm}-${col}-pp`} className="p-1 border-r text-center font-bold text-[#0369a1] text-[11px] bg-[#e0f2fe] sticky top-[130px] z-40 h-[40px]">{formatWithCommas(totalPP)}</TableHead>
                                                        };
                                                        return (
                                                            <React.Fragment key={`${wm}-pp`}>
                                                                {renderC('c1')}
                                                                {renderC('c2')}
                                                                {renderC('c4')}
                                                                {renderC('c5')}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                    <TableHead className="p-1 border-r bg-[#e0f2fe] font-bold text-[#0369a1] text-center h-[40px]">
                                                        {(() => {
                                                            let total = 0;
                                                            windmillNumbers.forEach(wm => {
                                                                ['c1', 'c2', 'c4', 'c5'].forEach(slot => {
                                                                    total += originalEbSummary && originalEbSummary[wm] ? Math.round(Number(originalEbSummary[wm][`${slot}_pp`])) || 0 : 0;
                                                                });
                                                            });
                                                            return formatWithCommas(total);
                                                        })()}
                                                    </TableHead>
                                                </TableRow>

                                                {/* Banking Row */}
                                                <TableRow className="bg-[#ffedd5] border-b border-white hover:bg-[#ffedd5] h-[40px]">
                                                    <TableHead colSpan={3} className="py-2 text-sm text-[#c2410c] font-bold border-r bg-[#ffedd5] align-middle sticky top-[170px] left-0 z-50 text-center uppercase tracking-wide h-[40px]">
                                                        Banking
                                                    </TableHead>
                                                    {windmillNumbers.map((wm) => {
                                                        const renderC = (col: 'c1' | 'c2' | 'c4' | 'c5') => {
                                                            const totalBank = originalEbSummary && originalEbSummary[wm] ? Math.round(Number(originalEbSummary[wm][`${col}_bank`])) || 0 : 0;
                                                            return <TableHead key={`${wm}-${col}-bank`} className="p-1 border-r text-center font-bold text-[#c2410c] text-[11px] bg-[#ffedd5] sticky top-[170px] z-40 h-[40px]">{formatWithCommas(totalBank)}</TableHead>
                                                        };
                                                        return (
                                                            <React.Fragment key={`${wm}-bank`}>
                                                                {renderC('c1')}
                                                                {renderC('c2')}
                                                                {renderC('c4')}
                                                                {renderC('c5')}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                    <TableHead className="p-1 border-r bg-[#ffedd5] font-bold text-[#c2410c] text-center h-[40px]">
                                                        {(() => {
                                                            let total = 0;
                                                            windmillNumbers.forEach(wm => {
                                                                ['c1', 'c2', 'c4', 'c5'].forEach(slot => {
                                                                    total += originalEbSummary && originalEbSummary[wm] ? Math.round(Number(originalEbSummary[wm][`${slot}_bank`])) || 0 : 0;
                                                                });
                                                            });
                                                            return formatWithCommas(total);
                                                        })()}
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {/* Group Logic */}
                                                {(() => {
                                                    const generators = windmillNumbers;
                                                    const { filtered: filteredData, grouped: groupedData, order: renderedOrder, cumulativeMap } = memoizedGridData;

                                                    return (
                                                        <React.Fragment>


                                                            {Object.entries(groupedData).sort().map(([customer, seSet]) => {
                                                                const seList = Array.from(seSet).sort();

                                                                const rows = seList.map((seNumber, seIndex) => {
                                                                    const rowItems = filteredData.filter(d => String(d.customer || '').trim() === customer && String(d.seNumber || '').trim() === seNumber);
                                                                    const rowTotal = rowItems.reduce((acc, d) => acc + (Number(stripCommas(d.c1)) || 0) + (Number(stripCommas(d.c2)) || 0) + (Number(stripCommas(d.c4)) || 0) + (Number(stripCommas(d.c5)) || 0), 0);
                                                                    const totalConsumptionReq = consumptionRequests.find(r => String(r.customer_name || '').trim() === customer && String(r.sc_number || '').trim() === seNumber);

                                                                    const currentIndex = renderedOrder.findIndex(r => r.customer === customer && r.seNumber === seNumber);

                                                                    const getNetRequest = (val: string | number) => {
                                                                        return typeof val === 'string' ? parseFloat(stripCommas(val)) || 0 : val || 0;
                                                                    };

                                                                    const getTransmissionLoss = (wm: string) => {
                                                                        const w = windmillsDetailed.find(x => String(x.windmill_number || '').trim() === String(wm || '').trim());
                                                                        if (w) return parseFloat(w.transmission_loss) || 0;
                                                                        const s = solarWindmills.find(x => String(x.solar_number || '').trim() === String(wm || '').trim());
                                                                        if (s) return parseFloat(s.transmission_loss) || 0;
                                                                        return 0;
                                                                    };

                                                                    const getGrossRequest = (net: string | number, wm: string) => {
                                                                        const n = getNetRequest(net);
                                                                        const lossPercent = getTransmissionLoss(wm);
                                                                        const loss = (n * lossPercent) / 100;
                                                                        return Math.round(n + loss);
                                                                    };

                                                                    const getNetAlloc = (grossStr: string, wm: string) => {
                                                                        const gross = parseFloat(stripCommas(grossStr)) || 0;
                                                                        const lossPercent = getTransmissionLoss(wm);
                                                                        return gross / (1 + (lossPercent / 100));
                                                                    };

                                                                    const totalNetAllocC1 = rowItems.reduce((acc, d) => acc + getNetAlloc(d.c1, d.wm), 0);
                                                                    const totalNetAllocC2 = rowItems.reduce((acc, d) => acc + getNetAlloc(d.c2, d.wm), 0);
                                                                    const totalNetAllocC4 = rowItems.reduce((acc, d) => acc + getNetAlloc(d.c4, d.wm), 0);
                                                                    const totalNetAllocC5 = rowItems.reduce((acc, d) => acc + getNetAlloc(d.c5, d.wm), 0);

                                                                    const req1 = getNetRequest(totalConsumptionReq?.c1);
                                                                    const req2 = getNetRequest(totalConsumptionReq?.c2);
                                                                    const req4 = getNetRequest(totalConsumptionReq?.c4);
                                                                    const req5 = getNetRequest(totalConsumptionReq?.c5);

                                                                    const defC1 = Math.max(0, totalNetAllocC1 - req1);
                                                                    const defC2 = Math.max(0, totalNetAllocC2 - req2);
                                                                    const defC4 = Math.max(0, totalNetAllocC4 - req4);
                                                                    // const defC5 = Math.max(0, totalNetAllocC5 - req5); // C5 cannot be borrowed from by C4? No, C4 borrows from C5.

                                                                    const adjNetC1 = Math.max(0, req1 - totalNetAllocC1 - defC2);
                                                                    const adjNetC2 = Math.max(0, req2 - totalNetAllocC2 - defC1);
                                                                    const adjNetC4 = Math.max(0, req4 - totalNetAllocC4); // C4 balance just reflects its own cap
                                                                    const adjNetC5 = Math.max(0, req5 - totalNetAllocC5 - defC4); // C5 balance reduced if C4 borrowed

                                                                    const getRemainingGross = (remNet: number, wm: string) => {
                                                                        const lossPercent = getTransmissionLoss(wm);
                                                                        return formatWithCommas(Math.round(remNet * (1 + (lossPercent / 100))));
                                                                    };

                                                                    const firstGen = generators[0] || "";
                                                                    const grossTotal = getGrossRequest(totalConsumptionReq?.total || 0, firstGen);

                                                                    return (
                                                                        <React.Fragment key={`${customer}-${seNumber}`}>
                                                                            {/* Row 1: Requested */}
                                                                            <TableRow className="hover:bg-slate-50 border-t border-slate-200 group">
                                                                                {seIndex === 0 && (
                                                                                    <TableCell rowSpan={seList.length * 5} className="py-2 text-sm text-indigo-700 font-bold border-r bg-white align-top border-b border-slate-200 sticky left-0 z-20 w-[120px] min-w-[120px]">
                                                                                        <div className="flex flex-col gap-1">
                                                                                            <span className="uppercase">{customer}</span>
                                                                                            {(() => {
                                                                                                const custItem = filteredData.find(d => String(d.customer || '').trim() === customer);
                                                                                                const totalAgreed = custItem?.totalAgreedUnits || 0;
                                                                                                return (
                                                                                                    <div className="mt-4 flex flex-col">
                                                                                                        <span className="text-[10px] text-slate-500 font-semibold">Total Agreed Units :</span>
                                                                                                        <span className="text-xs text-blue-700 font-bold">{totalAgreed}</span>
                                                                                                        <span className="text-[10px] text-slate-500 font-semibold mt-1">Total Adjusted Units :</span>
                                                                                                        <span className="text-xs text-emerald-700 font-bold">{actualAdjustedTotals[customer] || 0}</span>
                                                                                                    </div>
                                                                                                );
                                                                                            })()}
                                                                                        </div>
                                                                                    </TableCell>
                                                                                )}
                                                                                <TableCell rowSpan={5} className="py-2 text-sm text-slate-800 font-bold border-r bg-white align-top border-b border-slate-200 sticky left-[120px] z-20 w-[120px] min-w-[120px]">
                                                                                    <div className="flex flex-col gap-2">
                                                                                        <span>{seNumber}</span>
                                                                                        <div className="flex flex-col text-[10px] font-semibold gap-1">
                                                                                            <span><span className="text-slate-500">Requested:</span> <span className="text-[#B22222]">{formatWithCommas(grossTotal)}</span></span>
                                                                                            <span><span className="text-slate-500">Allocated:</span> <span className="text-[#B22222]">{rowTotal}</span></span>
                                                                                        </div>
                                                                                    </div>
                                                                                </TableCell>
                                                                                <TableCell className="py-2 px-2 text-xs text-slate-600 font-semibold border-r bg-white sticky left-[240px] z-20 w-[120px] min-w-[120px]">
                                                                                    Requested
                                                                                </TableCell>
                                                                                {generators.map(wm => {
                                                                                    const reqC1 = getGrossRequest(totalConsumptionReq?.c1 ?? '0', wm);
                                                                                    const reqC2 = getGrossRequest(totalConsumptionReq?.c2 ?? '0', wm);
                                                                                    const reqC4 = getGrossRequest(totalConsumptionReq?.c4 ?? '0', wm);
                                                                                    const reqC5 = getGrossRequest(totalConsumptionReq?.c5 ?? '0', wm);
                                                                                    return (
                                                                                        <React.Fragment key={wm}>
                                                                                            <TableCell className="p-1 border-r text-center">
                                                                                                <Input disabled className="h-7 text-center text-xs px-0" value={formatWithCommas(reqC1)} title={`Base: ${totalConsumptionReq?.c1 || 0} + Loss: ${(reqC1 - (parseFloat(stripCommas(totalConsumptionReq?.c1 || '0')) || 0)).toFixed(4)}`} />
                                                                                            </TableCell>
                                                                                            <TableCell className="p-1 border-r text-center">
                                                                                                <Input disabled className="h-7 text-center text-xs px-0" value={formatWithCommas(reqC2)} title={`Base: ${totalConsumptionReq?.c2 || 0} + Loss: ${(reqC2 - (parseFloat(stripCommas(totalConsumptionReq?.c2 || '0')) || 0)).toFixed(4)}`} />
                                                                                            </TableCell>
                                                                                            <TableCell className="p-1 border-r text-center">
                                                                                                <Input disabled className="h-7 text-center text-xs px-0" value={formatWithCommas(reqC4)} title={`Base: ${totalConsumptionReq?.c4 || 0} + Loss: ${(reqC4 - (parseFloat(stripCommas(totalConsumptionReq?.c4 || '0')) || 0)).toFixed(4)}`} />
                                                                                            </TableCell>
                                                                                            <TableCell className="p-1 border-r text-center">
                                                                                                <Input disabled className="h-7 text-center text-xs px-0" value={formatWithCommas(reqC5)} title={`Base: ${totalConsumptionReq?.c5 || 0} + Loss: ${(reqC5 - (parseFloat(stripCommas(totalConsumptionReq?.c5 || '0')) || 0)).toFixed(4)}`} />
                                                                                            </TableCell>
                                                                                        </React.Fragment>
                                                                                    );
                                                                                })}
                                                                                <TableCell className="p-1 border-r text-center align-middle bg-slate-50 font-bold text-slate-700 text-xs py-2">
                                                                                    {totalConsumptionReq?.total || '0'}
                                                                                </TableCell>
                                                                            </TableRow>

                                                                            {/* Row 2: Allocated */}
                                                                            <TableRow className="hover:bg-slate-50 group">
                                                                                <TableCell className="py-2 px-2 text-xs text-slate-600 font-semibold border-r bg-white sticky left-[240px] z-20 w-[120px] min-w-[120px]">
                                                                                    Allocated
                                                                                </TableCell>
                                                                                {generators.map(wm => {
                                                                                    const item = filteredData.find(d => String(d.customer || '').trim() === customer && String(d.seNumber || '').trim() === String(seNumber || '').trim() && String(d.wm || '').trim() === String(wm || '').trim());
                                                                                    return (
                                                                                        <React.Fragment key={wm}>
                                                                                            <TableCell className="p-1 border-r text-center">
                                                                                                <Input
                                                                                                    className="h-7 text-center text-xs px-0"
                                                                                                    maxLength={12}
                                                                                                    value={item ? item.c1 : ''}
                                                                                                    onChange={(e) => handleGridUpdate(customer, seNumber, wm, 'c1', e.target.value)}
                                                                                                    onBlur={(e) => handleGridBlur(customer, seNumber, wm, 'c1', e.target.value)}
                                                                                                />
                                                                                            </TableCell>
                                                                                            <TableCell className="p-1 border-r text-center">
                                                                                                <Input
                                                                                                    className="h-7 text-center text-xs px-0"
                                                                                                    maxLength={12}
                                                                                                    value={item ? item.c2 : ''}
                                                                                                    onChange={(e) => handleGridUpdate(customer, seNumber, wm, 'c2', e.target.value)}
                                                                                                    onBlur={(e) => handleGridBlur(customer, seNumber, wm, 'c2', e.target.value)}
                                                                                                />
                                                                                            </TableCell>
                                                                                            <TableCell className="p-1 border-r text-center">
                                                                                                <Input
                                                                                                    className="h-7 text-center text-xs px-0"
                                                                                                    maxLength={12}
                                                                                                    value={item ? item.c4 : ''}
                                                                                                    onChange={(e) => handleGridUpdate(customer, seNumber, wm, 'c4', e.target.value)}
                                                                                                    onBlur={(e) => handleGridBlur(customer, seNumber, wm, 'c4', e.target.value)}
                                                                                                />
                                                                                            </TableCell>
                                                                                            <TableCell className="p-1 border-r text-center">
                                                                                                <Input
                                                                                                    className="h-7 text-center text-xs px-0"
                                                                                                    maxLength={12}
                                                                                                    value={item ? item.c5 : ''}
                                                                                                    onChange={(e) => handleGridUpdate(customer, seNumber, wm, 'c5', e.target.value)}
                                                                                                    onBlur={(e) => handleGridBlur(customer, seNumber, wm, 'c5', e.target.value)}
                                                                                                />
                                                                                            </TableCell>
                                                                                        </React.Fragment>
                                                                                    );
                                                                                })}
                                                                                <TableCell className="p-1 border-r text-center align-middle bg-slate-50 font-bold text-slate-700 text-xs py-2">{formatWithCommas(rowTotal)}</TableCell>
                                                                            </TableRow>

                                                                            {/* Row 3: Balance Allocation */}
                                                                            <TableRow className="hover:bg-green-50 group">
                                                                                <TableCell className="py-2 px-2 text-xs text-green-700 font-semibold border-r bg-green-50 sticky left-[240px] z-20 w-[120px] min-w-[120px]">
                                                                                    Balance Allocation
                                                                                </TableCell>
                                                                                {generators.map(wm => {
                                                                                    const curBalC1 = getRemainingGross(adjNetC1, wm);
                                                                                    const curBalC2 = getRemainingGross(adjNetC2, wm);
                                                                                    const curBalC4 = getRemainingGross(adjNetC4, wm);
                                                                                    const curBalC5 = getRemainingGross(adjNetC5, wm);
                                                                                    return (
                                                                                        <React.Fragment key={wm}>
                                                                                            <TableCell className="p-1 border-r text-center">
                                                                                                <Input disabled className="h-7 text-center text-xs px-0 bg-green-50 text-green-700 font-semibold" value={curBalC1} />
                                                                                            </TableCell>
                                                                                            <TableCell className="p-1 border-r text-center">
                                                                                                <Input disabled className="h-7 text-center text-xs px-0 bg-green-50 text-green-700 font-semibold" value={curBalC2} />
                                                                                            </TableCell>
                                                                                            <TableCell className="p-1 border-r text-center">
                                                                                                <Input disabled className="h-7 text-center text-xs px-0 bg-green-50 text-green-700 font-semibold" value={curBalC4} />
                                                                                            </TableCell>
                                                                                            <TableCell className="p-1 border-r text-center">
                                                                                                <Input disabled className="h-7 text-center text-xs px-0 bg-green-50 text-green-700 font-semibold" value={curBalC5} />
                                                                                            </TableCell>
                                                                                        </React.Fragment>
                                                                                    );
                                                                                })}
                                                                                <TableCell className="p-1 border-r text-center align-middle bg-green-50 font-bold text-green-700 text-xs py-2">
                                                                                    {(() => {
                                                                                        const firstGen = generators[0] || "";
                                                                                        const b1 = parseFloat(stripCommas(getRemainingGross(adjNetC1, firstGen))) || 0;
                                                                                        const b2 = parseFloat(stripCommas(getRemainingGross(adjNetC2, firstGen))) || 0;
                                                                                        const b4 = parseFloat(stripCommas(getRemainingGross(adjNetC4, firstGen))) || 0;
                                                                                        const b5 = parseFloat(stripCommas(getRemainingGross(adjNetC5, firstGen))) || 0;
                                                                                        return formatWithCommas(Math.round(b1 + b2 + b4 + b5));
                                                                                    })()}
                                                                                </TableCell>
                                                                            </TableRow>

                                                                            {/* Row 4: Utilized Power */}
                                                                            <TableRow className="hover:bg-slate-50 group">
                                                                                <TableCell className="py-2 px-2 text-xs text-slate-600 font-semibold border-r bg-white sticky left-[240px] z-20 w-[120px] min-w-[120px]">
                                                                                    Utilized Power
                                                                                </TableCell>
                                                                                {generators.map(wm => {
                                                                                    const trimmedWM = String(wm || '').trim();
                                                                                    const getUP = (col: string) => {
                                                                                        const borrowKey = `${customer}|${seNumber}|${trimmedWM}|${col}`;
                                                                                        const slotBorrow = borrowedAmounts[borrowKey];
                                                                                        let up = 0;
                                                                                        if (slotBorrow) {
                                                                                            up += slotBorrow._own?.pp || 0;
                                                                                            Object.keys(slotBorrow).forEach(k => {
                                                                                                if (k !== '_own') up += slotBorrow[k]?.pp || 0;
                                                                                            });
                                                                                        }
                                                                                        return Math.round(up);
                                                                                    };
                                                                                    return (
                                                                                        <React.Fragment key={wm}>
                                                                                            <TableCell className="p-1 border-r text-center text-[#B22222] font-semibold text-xs">{formatWithCommas(getUP('c1'))}</TableCell>
                                                                                            <TableCell className="p-1 border-r text-center text-[#B22222] font-semibold text-xs">{formatWithCommas(getUP('c2'))}</TableCell>
                                                                                            <TableCell className="p-1 border-r text-center text-[#B22222] font-semibold text-xs">{formatWithCommas(getUP('c4'))}</TableCell>
                                                                                            <TableCell className="p-1 border-r text-center text-[#B22222] font-semibold text-xs">{formatWithCommas(getUP('c5'))}</TableCell>
                                                                                        </React.Fragment>
                                                                                    );
                                                                                })}
                                                                                <TableCell className="p-1 border-r text-center align-middle bg-slate-50 font-bold text-slate-700 text-xs py-2">
                                                                                    {(() => {
                                                                                        let total = 0;
                                                                                        generators.forEach(wm => {
                                                                                            const trimmedWM = String(wm || '').trim();
                                                                                            ['c1', 'c2', 'c4', 'c5'].forEach(col => {
                                                                                                const borrowKey = `${customer}|${seNumber}|${trimmedWM}|${col}`;
                                                                                                const slotBorrow = borrowedAmounts[borrowKey];
                                                                                                if (slotBorrow) {
                                                                                                    total += slotBorrow._own?.pp || 0;
                                                                                                    Object.keys(slotBorrow).forEach(k => {
                                                                                                        if (k !== '_own') total += slotBorrow[k]?.pp || 0;
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        });
                                                                                        return formatWithCommas(Math.round(total));
                                                                                    })()}
                                                                                </TableCell>
                                                                            </TableRow>

                                                                            {/* Row 4: Utilized Bank */}
                                                                            <TableRow className="hover:bg-slate-50 border-b border-slate-200 group">
                                                                                <TableCell className="py-2 px-2 text-xs text-slate-600 font-semibold border-r bg-white sticky left-[240px] z-20 w-[120px] min-w-[120px]">
                                                                                    Utilized Bank
                                                                                </TableCell>
                                                                                {generators.map(wm => {
                                                                                    const trimmedWM = String(wm || '').trim();
                                                                                    const getUB = (col: string) => {
                                                                                        const borrowKey = `${customer}|${seNumber}|${trimmedWM}|${col}`;
                                                                                        const slotBorrow = borrowedAmounts[borrowKey];
                                                                                        if (!slotBorrow) return '-';
                                                                                        let ub = 0;
                                                                                        ub += slotBorrow._own?.bank || 0;
                                                                                        Object.keys(slotBorrow).forEach(k => {
                                                                                            if (k !== '_own') ub += slotBorrow[k]?.bank || 0;
                                                                                        });
                                                                                        return Math.round(ub);
                                                                                    };
                                                                                    return (
                                                                                        <React.Fragment key={wm}>
                                                                                            <TableCell className="p-1 border-r text-center text-[#B22222] font-semibold text-xs">{getUB('c1') !== '-' ? formatWithCommas(getUB('c1')) : '-'}</TableCell>
                                                                                            <TableCell className="p-1 border-r text-center text-[#B22222] font-semibold text-xs">{getUB('c2') !== '-' ? formatWithCommas(getUB('c2')) : '-'}</TableCell>
                                                                                            <TableCell className="p-1 border-r text-center text-[#B22222] font-semibold text-xs">{getUB('c4') !== '-' ? formatWithCommas(getUB('c4')) : '-'}</TableCell>
                                                                                            <TableCell className="p-1 border-r text-center text-[#B22222] font-semibold text-xs">{getUB('c5') !== '-' ? formatWithCommas(getUB('c5')) : '-'}</TableCell>
                                                                                        </React.Fragment>
                                                                                    );
                                                                                })}
                                                                                <TableCell className="p-1 border-r text-center align-middle bg-slate-50 font-bold text-slate-700 text-xs py-2">
                                                                                    {(() => {
                                                                                        let total = 0;
                                                                                        generators.forEach(wm => {
                                                                                            const trimmedWM = String(wm || '').trim();
                                                                                            ['c1', 'c2', 'c4', 'c5'].forEach(col => {
                                                                                                const borrowKey = `${customer}|${seNumber}|${trimmedWM}|${col}`;
                                                                                                const slotBorrow = borrowedAmounts[borrowKey];
                                                                                                if (slotBorrow) {
                                                                                                    total += slotBorrow._own?.bank || 0;
                                                                                                    Object.keys(slotBorrow).forEach(k => {
                                                                                                        if (k !== '_own') total += slotBorrow[k]?.bank || 0;
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        });
                                                                                        return total > 0 ? formatWithCommas(Math.round(total)) : '-';
                                                                                    })()}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        </React.Fragment>
                                                                    );
                                                                });
                                                                return (
                                                                    <React.Fragment key={customer}>
                                                                        {rows}
                                                                        <TableRow className="bg-slate-50/80 border-b-2 border-slate-200">
                                                                            <TableCell className="py-2 text-sm font-bold text-slate-700 text-center border-r sticky left-0 z-20 bg-slate-100 w-[120px] min-w-[120px]">&nbsp;</TableCell>
                                                                            <TableCell className="py-2 text-sm font-bold text-slate-700 text-center border-r sticky left-[120px] z-20 bg-slate-100 w-[120px] min-w-[120px]">Total</TableCell>
                                                                            <TableCell className="py-2 text-sm font-bold text-slate-700 text-center border-r sticky left-[240px] z-20 bg-slate-100 w-[120px] min-w-[120px]">&nbsp;</TableCell>
                                                                            {generators.map(wm => {
                                                                                const stats = filteredData
                                                                                    .filter(d => String(d.customer || '').trim() === customer && d.wm === wm)
                                                                                    .reduce((acc, curr) => {
                                                                                        const c1 = Number(stripCommas(curr.c1)) || 0;
                                                                                        const c2 = Number(stripCommas(curr.c2)) || 0;
                                                                                        const c4 = Number(stripCommas(curr.c4)) || 0;
                                                                                        const c5 = Number(stripCommas(curr.c5)) || 0;

                                                                                        const count = [curr.c1, curr.c2, curr.c4, curr.c5].filter(val => parseFloat(stripCommas(val)) > 0).length;

                                                                                        return {
                                                                                            sum: acc.sum + c1 + c2 + c4 + c5,
                                                                                            count: acc.count + count
                                                                                        };
                                                                                    }, { sum: 0, count: 0 });
                                                                                return (
                                                                                    <TableCell key={wm} colSpan={4} className="py-2 text-center font-bold text-indigo-700 text-xs border-r">
                                                                                        <div className="flex flex-col items-center justify-center">
                                                                                            <span className="text-indigo-700 font-bold text-[13px]">{formatWithCommas(stats.sum)}</span>
                                                                                            <span className="text-[10px] text-slate-500 font-medium">({stats.count} entries)</span>
                                                                                        </div>
                                                                                    </TableCell>
                                                                                );
                                                                            })}
                                                                            <TableCell className="py-2 text-center font-bold text-indigo-700 text-xs border-r">
                                                                                {formatWithCommas(filteredData.filter(d => String(d.customer || '').trim() === customer).reduce((acc, curr) => {
                                                                                    const c1 = Number(stripCommas(curr.c1)) || 0;
                                                                                    const c2 = Number(stripCommas(curr.c2)) || 0;
                                                                                    const c4 = Number(stripCommas(curr.c4)) || 0;
                                                                                    const c5 = Number(stripCommas(curr.c5)) || 0;
                                                                                    return acc + c1 + c2 + c4 + c5;
                                                                                }, 0))}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    </React.Fragment>
                                                                );
                                                            })}
                                                        </React.Fragment>
                                                    );
                                                })()}
                                            </TableBody>

                                        </Table>
                                    </div>
                                </TabsContent>

                                <TabsContent value="allocation" className="mt-0">
                                    <div className="space-y-6">
                                        {/* Windmill Allocation Table */}
                                        <div className="border border-slate-200 rounded-b-lg mt-0 bg-white overflow-x-auto thin-scrollbar" style={{ maxWidth: open ? 'calc(100vw - 18rem)' : 'calc(100vw - 5rem)' }}>
                                            <Table>
                                                <TableHeader className="bg-sidebar">
                                                    <TableRow>
                                                        <TableHead className="py-2 h-10 font-semibold text-white whitespace-nowrap pl-3 text-xs">Windmill No</TableHead>
                                                        <TableHead className="py-2 h-10 font-semibold text-white whitespace-nowrap text-xs">Customer</TableHead>
                                                        <TableHead className="py-2 h-10 font-semibold text-white whitespace-nowrap text-xs">Service Number</TableHead>
                                                        <TableHead className="py-2 h-10 font-semibold text-white text-right whitespace-nowrap text-xs px-3">{chargeLabels.mrc}</TableHead>
                                                        <TableHead className="py-2 h-10 font-semibold text-white text-right whitespace-nowrap text-xs px-3">{chargeLabels.omc}</TableHead>
                                                        <TableHead className="py-2 h-10 font-semibold text-white text-right whitespace-nowrap text-xs px-3">{chargeLabels.trc}</TableHead>
                                                        <TableHead className="py-2 h-10 font-semibold text-white text-right whitespace-nowrap text-xs px-3">{chargeLabels.oc1}</TableHead>
                                                        <TableHead className="py-2 h-10 font-semibold text-white text-right whitespace-nowrap text-xs px-3">{chargeLabels.kp}</TableHead>
                                                        <TableHead className="py-2 h-10 font-semibold text-white text-right whitespace-nowrap text-xs px-3">{chargeLabels.ec}</TableHead>
                                                        <TableHead className="py-2 h-10 font-semibold text-white text-right whitespace-nowrap text-xs px-3">{chargeLabels.shc}</TableHead>
                                                        <TableHead className="py-2 h-10 font-semibold text-white text-right whitespace-nowrap text-xs px-3">{chargeLabels.other}</TableHead>
                                                        <TableHead className="py-2 h-10 font-semibold text-white text-right whitespace-nowrap text-xs px-3">{chargeLabels.dc}</TableHead>
                                                        <TableHead className="py-2 h-10 font-semibold text-white text-right whitespace-nowrap text-xs px-3 bg-sidebar/90 border-l border-white/10">Total</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {isFetchingCharges ? (
                                                        <TableRow>
                                                            <TableCell colSpan={11} className="h-24 text-center text-slate-500 italic text-sm">
                                                                <div className="flex flex-col items-center justify-center gap-2">
                                                                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                                    Fetching previous month charges from EB statements...
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        chargeAllocationRows.map((row, index) => (
                                                            <TableRow key={row.windmill} className="hover:bg-slate-50 border-b border-slate-100 h-10">
                                                                <TableCell className="p-1.5 border-r text-xs text-slate-900 font-bold pl-3 whitespace-nowrap">{row.windmill}</TableCell>
                                                                <TableCell className="p-1.5 border-r min-w-[140px]">
                                                                    <Select value={row.customer} onValueChange={(val) => handleChargeCustomerChange(index, val)}>
                                                                        <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-sm px-2">
                                                                            <SelectValue placeholder="Customer" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {customerList.map(c => (
                                                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </TableCell>
                                                                <TableCell className="p-1.5 border-r min-w-[130px]">
                                                                    <Select value={row.seNumber} onValueChange={(val) => handleChargeSEChange(index, val)} disabled={!row.customer}>
                                                                        <SelectTrigger className="h-8 text-xs bg-white border-slate-200 rounded-sm px-2">
                                                                            <SelectValue placeholder="Service No" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {(customerSEMap[row.customer] || [])
                                                                                .filter(se => {
                                                                                    if (se === row.seNumber) return true;
                                                                                    const isUsed = chargeAllocationRows.some((r, idx) =>
                                                                                        idx !== index &&
                                                                                        r.windmill === row.windmill &&
                                                                                        r.customer === row.customer &&
                                                                                        r.seNumber === se
                                                                                    );
                                                                                    return !isUsed;
                                                                                })
                                                                                .map(se => (
                                                                                    <SelectItem key={se} value={se}>{se}</SelectItem>
                                                                                ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </TableCell>
                                                                <TableCell className="p-1.5 border-r"><Input readOnly={!isEditing} className="h-8 text-right text-[11px] border-slate-200 shadow-none focus-visible:ring-1 bg-white text-black font-normal rounded-sm px-2" value={formatWithCommas(row.mrc)} onChange={(e) => handleChargeFieldChange(index, 'mrc', e.target.value)} /></TableCell>
                                                                <TableCell className="p-1.5 border-r"><Input readOnly={!isEditing} className="h-8 text-right text-[11px] border-slate-200 shadow-none focus-visible:ring-1 bg-white text-black font-normal rounded-sm px-2" value={formatWithCommas(row.omc)} onChange={(e) => handleChargeFieldChange(index, 'omc', e.target.value)} /></TableCell>
                                                                <TableCell className="p-1.5 border-r"><Input readOnly={!isEditing} className="h-8 text-right text-[11px] border-slate-200 shadow-none focus-visible:ring-1 bg-white text-black font-normal rounded-sm px-2" value={formatWithCommas(row.trc)} onChange={(e) => handleChargeFieldChange(index, 'trc', e.target.value)} /></TableCell>
                                                                <TableCell className="p-1.5 border-r"><Input readOnly={!isEditing} className="h-8 text-right text-[11px] border-slate-200 shadow-none focus-visible:ring-1 bg-white text-black font-normal rounded-sm px-2" value={formatWithCommas(row.oc1)} onChange={(e) => handleChargeFieldChange(index, 'oc1', e.target.value)} /></TableCell>
                                                                <TableCell className="p-1.5 border-r"><Input readOnly={!isEditing} className="h-8 text-right text-[11px] border-slate-200 shadow-none focus-visible:ring-1 bg-white text-black font-normal rounded-sm px-2" value={formatWithCommas(row.kp)} onChange={(e) => handleChargeFieldChange(index, 'kp', e.target.value)} /></TableCell>
                                                                <TableCell className="p-1.5 border-r"><Input readOnly={!isEditing} className="h-8 text-right text-[11px] border-slate-200 shadow-none focus-visible:ring-1 bg-white text-black font-normal rounded-sm px-2" value={formatWithCommas(row.ec)} onChange={(e) => handleChargeFieldChange(index, 'ec', e.target.value)} /></TableCell>
                                                                <TableCell className="p-1.5 border-r"><Input readOnly={!isEditing} className="h-8 text-right text-[11px] border-slate-200 shadow-none focus-visible:ring-1 bg-white text-black font-normal rounded-sm px-2" value={formatWithCommas(row.shc)} onChange={(e) => handleChargeFieldChange(index, 'shc', e.target.value)} /></TableCell>
                                                                <TableCell className="p-1.5 border-r"><Input readOnly={!isEditing} className="h-8 text-right text-[11px] border-slate-200 shadow-none focus-visible:ring-1 bg-white text-black font-normal rounded-sm px-2" value={formatWithCommas(row.other)} onChange={(e) => handleChargeFieldChange(index, 'other', e.target.value)} /></TableCell>
                                                                <TableCell className="p-1.5 border-r"><Input readOnly={!isEditing} className="h-8 text-right text-[11px] border-slate-200 shadow-none focus-visible:ring-1 bg-white text-black font-normal rounded-sm px-2" value={formatWithCommas(row.dc)} onChange={(e) => handleChargeFieldChange(index, 'dc', e.target.value)} /></TableCell>
                                                                <TableCell className="p-1.5 border-r bg-slate-50 font-bold text-right text-[11px] pr-3 text-indigo-700">
                                                                    {formatWithCommas(
                                                                        (Number(row.mrc) || 0) + (Number(row.omc) || 0) + (Number(row.trc) || 0) + (Number(row.oc1) || 0) +
                                                                        (Number(row.kp) || 0) + (Number(row.ec) || 0) + (Number(row.shc) || 0) +
                                                                        (Number(row.other) || 0) + (Number(row.dc) || 0)
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                                <TableFooter className="bg-slate-100/80 border-t-2 border-slate-200">
                                                    <TableRow className="h-10 hover:bg-slate-100/80">
                                                        <TableCell colSpan={3} className="text-xs font-bold text-slate-700 pl-3">Grand Total</TableCell>
                                                        <TableCell className="text-right text-[11px] font-bold pr-3 text-slate-900 border-r border-slate-200">{formatWithCommas(chargeAllocationRows.reduce((sum, r) => sum + (Number(r.mrc) || 0), 0))}</TableCell>
                                                        <TableCell className="text-right text-[11px] font-bold pr-3 text-slate-900 border-r border-slate-200">{formatWithCommas(chargeAllocationRows.reduce((sum, r) => sum + (Number(r.omc) || 0), 0))}</TableCell>
                                                        <TableCell className="text-right text-[11px] font-bold pr-3 text-slate-900 border-r border-slate-200">{formatWithCommas(chargeAllocationRows.reduce((sum, r) => sum + (Number(r.trc) || 0), 0))}</TableCell>
                                                        <TableCell className="text-right text-[11px] font-bold pr-3 text-slate-900 border-r border-slate-200">{formatWithCommas(chargeAllocationRows.reduce((sum, r) => sum + (Number(r.oc1) || 0), 0))}</TableCell>
                                                        <TableCell className="text-right text-[11px] font-bold pr-3 text-slate-900 border-r border-slate-200">{formatWithCommas(chargeAllocationRows.reduce((sum, r) => sum + (Number(r.kp) || 0), 0))}</TableCell>
                                                        <TableCell className="text-right text-[11px] font-bold pr-3 text-slate-900 border-r border-slate-200">{formatWithCommas(chargeAllocationRows.reduce((sum, r) => sum + (Number(r.ec) || 0), 0))}</TableCell>
                                                        <TableCell className="text-right text-[11px] font-bold pr-3 text-slate-900 border-r border-slate-200">{formatWithCommas(chargeAllocationRows.reduce((sum, r) => sum + (Number(r.shc) || 0), 0))}</TableCell>
                                                        <TableCell className="text-right text-[11px] font-bold pr-3 text-slate-900 border-r border-slate-200">{formatWithCommas(chargeAllocationRows.reduce((sum, r) => sum + (Number(r.other) || 0), 0))}</TableCell>
                                                        <TableCell className="text-right text-[11px] font-bold pr-3 text-slate-900 border-r border-slate-200">{formatWithCommas(chargeAllocationRows.reduce((sum, r) => sum + (Number(r.dc) || 0), 0))}</TableCell>
                                                        <TableCell className="text-right text-[11px] font-bold pr-3 bg-indigo-50 text-indigo-700">
                                                            {formatWithCommas(chargeAllocationRows.reduce((sum, r) => sum +
                                                                (Number(r.mrc) || 0) + (Number(r.omc) || 0) + (Number(r.trc) || 0) + (Number(r.oc1) || 0) +
                                                                (Number(r.kp) || 0) + (Number(r.ec) || 0) + (Number(r.shc) || 0) +
                                                                (Number(r.other) || 0) + (Number(r.dc) || 0)
                                                                , 0))}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableFooter>
                                            </Table>
                                        </div>

                                        {/* Solar Allocation Table */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 px-1">
                                                <h3 className="font-bold text-slate-700">SOLAR</h3>
                                                {solarWindmills.length > 0 && (
                                                    <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100 shadow-sm ml-1">
                                                        {solarWindmills.map(sw => sw.solar_number).join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="border border-slate-200 rounded-lg mt-0 bg-white overflow-x-auto thin-scrollbar" style={{ maxWidth: open ? 'calc(100vw - 18rem)' : 'calc(100vw - 5rem)' }}>
                                                <Table>
                                                    <TableHeader className="bg-sidebar">
                                                        <TableRow>
                                                            <TableHead className="py-2 h-10 font-semibold text-white whitespace-nowrap pl-4">Charges</TableHead>
                                                            <TableHead className="py-2 h-10 font-semibold text-white text-center whitespace-nowrap">Value</TableHead>
                                                            <TableHead className="py-2 h-10 font-semibold text-white whitespace-nowrap">Customer</TableHead>
                                                            <TableHead className="py-2 h-10 font-semibold text-white whitespace-nowrap">Service Number</TableHead>
                                                            <TableHead className="py-2 h-10 font-semibold text-white text-center whitespace-nowrap pr-4">Allocation</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {solarAllocationRows.map((row, index) => {
                                                            const isFirstInGroup = solarAllocationRows.findIndex(r => r.chargeCode === row.chargeCode) === index;
                                                            return (
                                                                <TableRow key={row.tempId} className="hover:bg-slate-50 border-b border-slate-100">
                                                                    <TableCell className="py-2 pl-4 pr-3 text-sm text-slate-700 font-medium w-[240px] border-r">
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex flex-col min-h-[50px]">
                                                                                <span>{row.chargeLabel}</span>
                                                                                <div className="flex flex-col mt-0.5">
                                                                                    {row.systemValue > 0 && (
                                                                                        <span className="text-[11px] text-slate-500 font-medium">System Total: {row.systemValue}</span>
                                                                                    )}
                                                                                    {(() => {
                                                                                        const totalAllocated = solarAllocationRows
                                                                                            .filter(r => r.chargeCode === row.chargeCode)
                                                                                            .reduce((sum, r) => sum + (parseFloat(String(r.value)) || 0), 0);
                                                                                        const balance = (row.systemValue || 0) - totalAllocated;

                                                                                        return (
                                                                                            <span className={`text-[11px] font-bold ${balance <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                                                                Balance: {balance.toFixed(2).replace(/\.00$/, "")}
                                                                                            </span>
                                                                                        );
                                                                                    })()}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-6 w-6 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                                                    onClick={() => addSolarSplitRow(index)}
                                                                                    title="Add customer for this charge"
                                                                                >
                                                                                    <Plus className="h-3.5 w-3.5" />
                                                                                </Button>
                                                                                {solarAllocationRows.filter(r => r.chargeCode === row.chargeCode).length > 1 && (
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="icon"
                                                                                        className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                                        onClick={() => removeSolarSplitRow(index)}
                                                                                        title="Remove this allocation"
                                                                                    >
                                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                                    </Button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="p-1.5 border-r text-center">
                                                                        <span className="text-xs font-medium text-slate-600">
                                                                            {row.systemValue > 0 ? row.systemValue : ""}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell className="p-1.5 w-[180px] border-r">
                                                                        <Select
                                                                            value={row.customer}
                                                                            onValueChange={(val) => handleSolarCustomerChange(index, val)}
                                                                        >
                                                                            <SelectTrigger className="h-8 text-xs border-slate-200 bg-white shadow-none focus:ring-1">
                                                                                <SelectValue placeholder="Select Customer" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {customerList.map(cust => (
                                                                                    <SelectItem key={cust} value={cust}>{cust}</SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </TableCell>
                                                                    <TableCell className="p-1.5 w-[180px] border-r">
                                                                        <Select
                                                                            value={row.seNumber}
                                                                            onValueChange={(val) => handleSolarSEChange(index, val)}
                                                                            disabled={!row.customer}
                                                                        >
                                                                            <SelectTrigger className="h-8 text-xs border-slate-200 bg-white shadow-none focus:ring-1">
                                                                                <SelectValue placeholder="Select SE Number" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {(customerSEMap[row.customer] || [])
                                                                                    .filter(se => {
                                                                                        // Only show SE numbers not already used for THIS specific charge code
                                                                                        if (se === row.seNumber) return true;
                                                                                        const isUsed = solarAllocationRows.some(r =>
                                                                                            r.chargeCode === row.chargeCode &&
                                                                                            r.customer === row.customer &&
                                                                                            r.seNumber === se
                                                                                        );
                                                                                        return !isUsed;
                                                                                    })
                                                                                    .map(se => (
                                                                                        <SelectItem key={se} value={se}>{se}</SelectItem>
                                                                                    ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </TableCell>
                                                                    <TableCell className="p-1.5 pr-4">
                                                                        <Input
                                                                            className="h-8 text-center text-xs border-slate-200 shadow-none focus-visible:ring-1 bg-white font-semibold rounded-sm px-2 text-black"
                                                                            value={row.value === 0 ? "" : formatWithCommas(row.value)}
                                                                            onChange={(e) => handleSolarFieldChange(index, e.target.value)}
                                                                            placeholder="0"
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="uploads" className="mt-0">
                                    <div className="border border-slate-200 rounded-b-lg mt-0 bg-white overflow-x-auto thin-scrollbar" style={{ maxWidth: open ? 'calc(100vw - 18rem)' : 'calc(100vw - 5rem)' }}>
                                        <Table>
                                            <TableHeader className="bg-sidebar">
                                                <TableRow>
                                                    <TableHead className="h-8 py-1 font-semibold text-white whitespace-nowrap pl-4 w-16 text-xs">#</TableHead>
                                                    <TableHead className="h-8 py-1 font-semibold text-white whitespace-nowrap text-xs">Wind Mill Number</TableHead>
                                                    <TableHead className="h-8 py-1 font-semibold text-white whitespace-nowrap w-1/3 text-xs">Upload Files</TableHead>
                                                    <TableHead className="h-8 py-1 font-semibold text-white whitespace-nowrap w-1/3 text-xs">File Name</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {windmillNumbers.map((wm, index) => (
                                                    <TableRow key={index} className="hover:bg-slate-50 border-b border-slate-100 h-10">
                                                        <TableCell className="py-2 text-xs text-slate-700 font-medium pl-4">{index + 1}</TableCell>
                                                        <TableCell className="py-2 text-xs text-slate-700 font-medium">{wm}</TableCell>
                                                        <TableCell className="py-2 text-xs text-slate-700">
                                                            <div className="flex items-center gap-2 max-w-sm">
                                                                <Input
                                                                    type="file"
                                                                    value={uploads[wm]?.file ? undefined : ""}
                                                                    onChange={(e) => handleAllotmentOrderUpload(wm, e.target.files ? e.target.files[0] : null)}
                                                                    className="bg-white border-slate-300 h-8 text-xs focus:ring-blue-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                                                />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-2 text-xs text-slate-600">
                                                            {uploads[wm]?.fileName ? (
                                                                <a
                                                                    href={uploads[wm]?.file ? URL.createObjectURL(uploads[wm].file!) : uploads[wm]?.filePath ? `http://localhost:8000/${uploads[wm].filePath}` : "#"}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                                                >
                                                                    {uploads[wm].fileName}
                                                                </a>
                                                            ) : (
                                                                <span className="text-slate-400 italic">No file selected</span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}

export default EnergyAllotment;
