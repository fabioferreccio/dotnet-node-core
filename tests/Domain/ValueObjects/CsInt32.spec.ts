import { CsInt32 } from "../../../src/Domain/ValueObjects/CsInt32";

describe("System.Int32 (CsInt32) - Comprehensive", () => {
    // 1. Parse / TryParse
    test("Parse: Valid String", () => {
        const i = CsInt32.Parse("123");
        expect(i.Value).toBe(123);
    });

    test("Parse: Invalid String Throws", () => {
        expect(() => CsInt32.Parse("abc")).toThrow();
    });

    test("TryParse: Valid", () => {
        const result = CsInt32.TryParse("456");
        expect(result).not.toBeNull();
        expect(result!.Value).toBe(456);
    });

    test("TryParse: Invalid Returns Null", () => {
        const result = CsInt32.TryParse("invalid");
        expect(result).toBeNull();
    });

    // 2. Constants
    test("MaxValue / MinValue", () => {
        expect(CsInt32.MaxValue).toBe(2147483647);
        expect(CsInt32.MinValue).toBe(-2147483648);
    });

    // 3. Math
    test("Arithmetic", () => {
        const a = new CsInt32(10);
        const b = new CsInt32(5);
        expect(a.Add(b).Value).toBe(15);
        expect(a.Subtract(b).Value).toBe(5);
        expect(a.Multiply(b).Value).toBe(50);
        expect(a.Divide(b).Value).toBe(2);
    });

    test("Divide by Zero", () => {
        expect(() => new CsInt32(10).Divide(new CsInt32(0))).toThrow();
    });

    // 4. Comparison & Equality
    test("Equals", () => {
        const a = new CsInt32(100);
        const b = new CsInt32(100);
        expect(a.Equals(b)).toBe(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(a.Equals(null as any)).toBe(false);
    });

    test("CompareTo", () => {
        const a = new CsInt32(10);
        const b = new CsInt32(20);
        expect(a.CompareTo(b)).toBe(-1);
        expect(b.CompareTo(a)).toBe(1);
        expect(a.CompareTo(new CsInt32(10))).toBe(0);
        // Cover "if (!other) return 1;"
        expect(a.CompareTo(null)).toBe(1);
    });

    // 5. ToString
    test("ToString", () => {
        expect(new CsInt32(999).ToString()).toBe("999");
    });
});
