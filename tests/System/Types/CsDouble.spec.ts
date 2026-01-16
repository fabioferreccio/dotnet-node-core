import { CsDouble } from "../../../src/System/Types/CsDouble";

describe("System.Double (CsDouble)", () => {
    test("Construction", () => {
        expect(CsDouble.From(3.14).Value).toBe(3.14);
    });

    test("Equals", () => {
        const a = CsDouble.From(1.23);
        const b = CsDouble.From(1.23);
        const c = CsDouble.From(1.24);
        expect(a.Equals(b)).toBe(true);
        expect(a.Equals(c)).toBe(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(a.Equals(null as any)).toBe(false);
    });

    test("CompareTo", () => {
        const a = CsDouble.From(1.0);
        const b = CsDouble.From(2.0);
        expect(a.CompareTo(b)).toBe(-1);
        expect(b.CompareTo(a)).toBe(1);
        expect(a.CompareTo(CsDouble.From(1.0))).toBe(0);
        expect(a.CompareTo(null)).toBe(1);
    });

    test("ToString", () => {
        expect(CsDouble.From(3.5).ToString()).toBe("3.5");
    });
});
