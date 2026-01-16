import { CsDecimal } from "../../../src/System/Types/CsDecimal";

describe("System.Decimal (CsDecimal)", () => {
    test("Construction", () => {
        expect(CsDecimal.From(123.456).Value).toBe(123.456);
    });

    test("Math Operations", () => {
        const a = CsDecimal.From(10.5);
        const b = CsDecimal.From(2.0);

        expect(a.Add(b).Value).toBe(12.5);
        expect(a.Subtract(b).Value).toBe(8.5);
        expect(a.Multiply(b).Value).toBe(21.0);
        expect(a.Divide(b).Value).toBe(5.25);
    });

    test("Math: Divide by Zero", () => {
        expect(() => CsDecimal.From(10).Divide(CsDecimal.From(0))).toThrow();
    });

    test("Equals", () => {
        const a = CsDecimal.From(10.0);
        const b = CsDecimal.From(10.0);
        expect(a.Equals(b)).toBe(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(a.Equals(null as any)).toBe(false);
    });

    test("CompareTo", () => {
        const a = CsDecimal.From(10);
        const b = CsDecimal.From(20);
        expect(a.CompareTo(b)).toBe(-1);
        expect(b.CompareTo(a)).toBe(1);
        expect(a.CompareTo(CsDecimal.From(10))).toBe(0);
        expect(a.CompareTo(null)).toBe(1);
    });

    test("ToString", () => {
        expect(CsDecimal.From(99.99).ToString()).toBe("99.99");
    });
});
