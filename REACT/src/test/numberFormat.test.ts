import { describe, it, expect, beforeAll } from "vitest";

// Import context functions and overrides by importing the file
import { 
    globalStripSeparators, 
    globalFormatWithActiveSeparators 
} from "../contexts/NumberFormatContext";
import { formatNumber, stripSeparators } from "../lib/utils";

describe("Dynamic Number Formatting Utilities", () => {
    it("should strip separators correctly under default Indian format (Thousands: ',', Decimal: '.')", () => {
        const val = "12,34,567.89";
        const stripped = stripSeparators(val);
        expect(stripped).toBe("1234567.89");
        expect(parseFloat(stripped)).toBe(1234567.89);
    });

    it("should format number under default Indian locale grouping (en-IN)", () => {
        const val = 1234567.89;
        const formatted = formatNumber(val);
        // Expect Indian Lakh/Crore grouping (12,34,567.89)
        expect(formatted).toBe("12,34,567.89");
    });

    it("should format using overridden toLocaleString and Intl.NumberFormat", () => {
        const num = 1000000;
        expect(num.toLocaleString()).toBe("10,00,000");

        const formatter = new Intl.NumberFormat();
        expect(formatter.format(num)).toBe("10,00,000");
    });
});
