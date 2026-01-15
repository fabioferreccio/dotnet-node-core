import { CsInt16 } from "../../../src/Domain/ValueObjects/CsInt16";

describe("System.Int16 (CsInt16) - Comprehensive", () => {
    test("Boundary: MaxValue", () => {
        expect(new CsInt16(32767).Value).toBe(32767);
        expect(CsInt16.MaxValue).toBe(32767);
    });

    test("Boundary: MinValue", () => {
        expect(new CsInt16(-32768).Value).toBe(-32768);
        expect(CsInt16.MinValue).toBe(-32768);
    });

    test("Overflow: > 32767 throws Error", () => {
        expect(() => new CsInt16(32768)).toThrow();
    });

    test("Underflow: < -32768 throws Error", () => {
        expect(() => new CsInt16(-32769)).toThrow();
    });

    test("Truncation: Decimals are truncated", () => {
        expect(new CsInt16(10.9).Value).toBe(10);
        expect(new CsInt16(-10.9).Value).toBe(-10);
    });

    test("Equality Checks", () => {
        const a = new CsInt16(100);
        const b = new CsInt16(100);
        expect(a.Equals(b)).toBe(true);
        expect(a.CompareTo(b)).toBe(0);
    });

    test("CompareTo Coverage", () => {
        const a = new CsInt16(10);
        const b = new CsInt16(20);
        expect(a.CompareTo(b)).toBe(-1);
        expect(b.CompareTo(a)).toBe(1);
        expect(a.CompareTo(null)).toBe(1);
        expect(a.CompareTo(new CsInt16(10))).toBe(0);
    });

    test("ToString", () => {
        expect(new CsInt16(12345).ToString()).toBe("12345");
    });
});
