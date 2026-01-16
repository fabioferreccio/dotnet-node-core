import { CsInt64 } from "../../../src/System/Types/CsInt64";

describe("System.Int64 (CsInt64) - Comprehensive", () => {
    test("Construction: string", () => {
        const val = CsInt64.From("900719925474099200");
        expect(val.Value.toString()).toBe("900719925474099200");
    });

    test("Construction: number", () => {
        const val = CsInt64.From(12345);
        expect(val.Value).toBe(12345n);
    });

    test("Construction: bigint", () => {
        const val = CsInt64.From(12345n);
        expect(val.Value).toBe(12345n);
    });

    test("Static: Zero", () => {
        expect(CsInt64.Zero.Value).toBe(0n);
    });

    test("Math: Add", () => {
        const a = CsInt64.From(10n);
        const b = CsInt64.From(20n);
        expect(a.Add(b).Value).toBe(30n);
    });

    test("Math: Subtract", () => {
        const a = CsInt64.From(20n);
        const b = CsInt64.From(5n);
        expect(a.Subtract(b).Value).toBe(15n);
    });

    test("Math: Multiply", () => {
        const a = CsInt64.From(10n);
        const b = CsInt64.From(10n);
        expect(a.Multiply(b).Value).toBe(100n);
    });

    test("Math: Divide", () => {
        const a = CsInt64.From(100n);
        const b = CsInt64.From(2n);
        expect(a.Divide(b).Value).toBe(50n);
    });

    test("Math: Divide by Zero throws", () => {
        const a = CsInt64.From(100n);
        const zero = CsInt64.From(0n);
        expect(() => a.Divide(zero)).toThrow();
    });

    test("Equals", () => {
        const a = CsInt64.From(1n);
        const b = CsInt64.From(1n);
        expect(a.Equals(b)).toBe(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(a.Equals(null as any)).toBe(false);
    });

    test("CompareTo", () => {
        const a = CsInt64.From(10n);
        const b = CsInt64.From(20n);
        expect(a.CompareTo(b)).toBe(-1);
        expect(b.CompareTo(a)).toBe(1);
        expect(a.CompareTo(CsInt64.From(10n))).toBe(0);
        expect(a.CompareTo(null)).toBe(1);
    });

    test("ToString", () => {
        expect(CsInt64.From(123n).ToString()).toBe("123");
    });
});
