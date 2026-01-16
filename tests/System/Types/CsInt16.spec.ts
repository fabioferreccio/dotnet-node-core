import { CsInt16 } from "../../../src/System/Types/CsInt16";

describe("System.Int16 (CsInt16) - Comprehensive", () => {
    test("Boundary: MaxValue", () => {
        expect(CsInt16.From(32767).Value).toBe(32767);
        expect(CsInt16.MaxValue).toBe(32767);
    });

    test("Boundary: MinValue", () => {
        expect(CsInt16.From(-32768).Value).toBe(-32768);
        expect(CsInt16.MinValue).toBe(-32768);
    });

    test("Overflow: > 32767 throws Error", () => {
        expect(() => CsInt16.From(32768)).toThrow();
    });

    test("Underflow: < -32768 throws Error", () => {
        expect(() => CsInt16.From(-32769)).toThrow();
    });

    test("Truncation: Decimals are truncated", () => {
        expect(CsInt16.From(10.9).Value).toBe(10);
        expect(CsInt16.From(-10.9).Value).toBe(-10);
    });

    test("Equality Checks", () => {
        const a = CsInt16.From(100);
        const b = CsInt16.From(100);
        expect(a.Equals(b)).toBe(true);
        expect(a.CompareTo(b)).toBe(0);
    });

    test("CompareTo Coverage", () => {
        const a = CsInt16.From(10);
        const b = CsInt16.From(20);
        expect(a.CompareTo(b)).toBe(-1);
        expect(b.CompareTo(a)).toBe(1);
        expect(a.CompareTo(null)).toBe(1);
        expect(a.CompareTo(CsInt16.From(10))).toBe(0);
    });

    test("ToString", () => {
        expect(CsInt16.From(12345).ToString()).toBe("12345");
    });
});
