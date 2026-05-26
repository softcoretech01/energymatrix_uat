import React, { createContext, useContext, useEffect, useState } from "react";
import api from "@/services/api";

import { useLocation } from "react-router-dom";

export type NumberFormat = {
    id: number;
    country: string;
    example: string;
    thousands_separator: string;
    decimal_separator: string;
};

type NumberFormatContextType = {
    activeFormat: NumberFormat | null;
    availableFormats: NumberFormat[];
    refreshFormat: () => Promise<void>;
};

const NumberFormatContext = createContext<NumberFormatContextType | undefined>(undefined);

// Mapping from number_format_id to language/locale tags.
const LOCALE_MAP: Record<number, string> = {
    1: "en-US", // US / UK
    2: "de-DE", // Germany
    3: "fr-FR", // France
    4: "en-IN", // India
};

// Global variables that can be accessed synchronously outside React
let currentLocale = "en-IN";
let currentFormat: NumberFormat = {
    id: 4,
    country: "India",
    example: "12,34,567.89",
    thousands_separator: ",",
    decimal_separator: ".",
};

// Global overrides for Number.prototype.toLocaleString and Intl.NumberFormat
const originalToLocaleString = Number.prototype.toLocaleString;
Number.prototype.toLocaleString = function (locales, options) {
    // Override the locale to currentLocale
    return originalToLocaleString.call(this, currentLocale, options);
};

const OriginalNumberFormat = Intl.NumberFormat;
// @ts-ignore
Intl.NumberFormat = function (locales, options) {
    return new OriginalNumberFormat(currentLocale, options);
};
Intl.NumberFormat.prototype = OriginalNumberFormat.prototype;
// @ts-ignore
Intl.NumberFormat.supportedLocalesOf = OriginalNumberFormat.supportedLocalesOf;

// Export global parsing/formatting helper so non-component files (like utils.ts) can import them
export function globalStripSeparators(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return "";
    let s = value.toString();
    
    let thousands = currentFormat.thousands_separator || ",";
    let decimal = currentFormat.decimal_separator || ".";
    
    if (thousands === "space") {
        thousands = " ";
    }
    
    if (thousands === " " || thousands === "space") {
        s = s.replace(/\s/g, "");
    } else if (thousands) {
        const escaped = thousands.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        s = s.replace(new RegExp(escaped, "g"), "");
    }
    
    if (decimal && decimal !== ".") {
        const escapedDec = decimal.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        s = s.replace(new RegExp(escapedDec, "g"), ".");
    }
    return s;
}

export function globalFormatWithActiveSeparators(val: string | number): string {
    if (val === null || val === undefined || val === '') return '';
    const s = globalStripSeparators(val);
    if (isNaN(Number(s))) return s;
    
    const decimal = currentFormat.decimal_separator || '.';
    const parts = s.split('.');
    
    // Format integer part using native toLocaleString (which uses overridden locale)
    const formattedInt = Number(parts[0]).toLocaleString();
    
    return parts.length > 1 ? `${formattedInt}${decimal}${parts[1]}` : formattedInt;
}

export const NumberFormatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeFormat, setActiveFormat] = useState<NumberFormat | null>(null);
    const [availableFormats, setAvailableFormats] = useState<NumberFormat[]>([]);
    const [key, setKey] = useState(0); // A state key to force-update React tree if format changes
    const location = useLocation();

    const fetchFormatData = async () => {
        // Skip fetching if the user is not logged in (no token present)
        const token = localStorage.getItem("access_token");
        if (!token) return;

        try {
            // 1. Fetch available formats
            const formatsRes = await api.get("/total-shares/formats");
            const formats: NumberFormat[] = formatsRes.data || [];
            setAvailableFormats(formats);

            // 2. Fetch config
            const configRes = await api.get("/total-shares/");
            if (Array.isArray(configRes.data) && configRes.data.length > 0) {
                const config = configRes.data[0];
                const formatId = config.number_format_id || 4;
                const found = formats.find(f => f.id === formatId);
                if (found) {
                    // Only trigger update if the format actually changed
                    if (currentFormat.id !== found.id) {
                        currentFormat = found;
                        currentLocale = LOCALE_MAP[found.id] || "en-IN";
                        setActiveFormat(found);
                        setKey(prev => prev + 1); // Cause re-render of children with new formatting rule
                    } else if (!activeFormat) {
                        setActiveFormat(found);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching number format data:", error);
        }
    };

    useEffect(() => {
        fetchFormatData();

        // Check for updates every 10 seconds so DB changes apply "instantly"
        const interval = setInterval(fetchFormatData, 10000);
        return () => clearInterval(interval);
    }, [location.pathname]);

    return (
        <NumberFormatContext.Provider value={{ activeFormat, availableFormats, refreshFormat: fetchFormatData }}>
            <div key={key} style={{ display: "contents" }}>
                {children}
            </div>
        </NumberFormatContext.Provider>
    );
};

export const useNumberFormat = () => {
    const context = useContext(NumberFormatContext);
    if (!context) {
        throw new Error("useNumberFormat must be used within a NumberFormatProvider");
    }
    return context;
};
