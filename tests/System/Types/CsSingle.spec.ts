import { CsSingle } from "../../../src/System/Types/CsSingle";

describe("System.Single (CsSingle)", () => {
    test("Construction & Precision", () => {
        // Checking wrapping behavior
        const val = 1.123456789;
        const single = CsSingle.From(val);
        expect(single.Value).toBe(Math.fround(val));
    });

    test("Equals", () => {
        const a = CsSingle.From(1.5);
        const b = CsSingle.From(1.5);
        expect(a.Equals(b)).toBe(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(a.Equals(null as any)).toBe(false);
    });

    test("CompareTo", () => {
        const a = CsSingle.From(1.0);
        const b = CsSingle.From(2.0);
        expect(a.CompareTo(b)).toBe(-1);
        expect(b.CompareTo(a)).toBe(1);
        expect(a.CompareTo(CsSingle.From(Math.fround(1.0)))).toBe(0);
        expect(a.CompareTo(null)).toBe(1);
    });

    test("ToString", () => {
        expect(CsSingle.From(1.5).ToString()).toBe("1.5");
    });
});
