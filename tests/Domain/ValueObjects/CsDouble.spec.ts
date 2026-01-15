import { CsDouble } from "../../../src/Domain/ValueObjects/CsDouble";

describe("System.Double (CsDouble)", () => {
    test("Construction", () => {
        expect(new CsDouble(3.14).Value).toBe(3.14);
    });

    test("Equals", () => {
        const a = new CsDouble(1.23);
        const b = new CsDouble(1.23);
        const c = new CsDouble(1.24);
        expect(a.Equals(b)).toBe(true);
        expect(a.Equals(c)).toBe(false);
        expect(a.Equals(null as any)).toBe(false);
    });

    test("CompareTo", () => {
        const a = new CsDouble(1.0);
        const b = new CsDouble(2.0);
        expect(a.CompareTo(b)).toBe(-1);
        expect(b.CompareTo(a)).toBe(1);
        expect(a.CompareTo(new CsDouble(1.0))).toBe(0);
        expect(a.CompareTo(null)).toBe(1);
    });

    test("ToString", () => {
        expect(new CsDouble(3.5).ToString()).toBe("3.5");
    });
});
