import { CsByte } from "../../../src/System/Types/CsByte";

describe("System.Byte (CsByte) - Comprehensive", () => {
    // Bounds & Construction
    test("Boundary: 0 to 255", () => {
        expect(CsByte.From(0).Value).toBe(0);
        expect(CsByte.From(255).Value).toBe(255);
        expect(CsByte.MinValue).toBe(0);
        expect(CsByte.MaxValue).toBe(255);
    });

    test("Overflow/Underflow Throws", () => {
        expect(() => CsByte.From(256)).toThrow();
        expect(() => CsByte.From(-1)).toThrow();
        expect(() => CsByte.From(256.1)).toThrow();
    });

    test("Truncation", () => {
        expect(CsByte.From(10.9).Value).toBe(10);
        // Valid negative decimal truncation: -0.1 | 0 === 0
        expect(CsByte.From(-0.1).Value).toBe(0);
    });

    // Equality
    test("Equals", () => {
        const a = CsByte.From(100);
        expect(a.Equals(CsByte.From(100))).toBe(true);
        expect(a.Equals(CsByte.From(50))).toBe(false);
        // Cover "if (!other) return false"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(a.Equals(null as any)).toBe(false);
    });

    // Comparison
    test("CompareTo", () => {
        const a = CsByte.From(10);
        expect(a.CompareTo(CsByte.From(20))).toBe(-1);
        expect(a.CompareTo(CsByte.From(5))).toBe(1);
        expect(a.CompareTo(CsByte.From(10))).toBe(0);
        // Cover "if (!other) return 1"
        expect(a.CompareTo(null)).toBe(1);
    });

    // ToString
    test("ToString", () => {
        expect(CsByte.From(128).ToString()).toBe("128");
    });
});
