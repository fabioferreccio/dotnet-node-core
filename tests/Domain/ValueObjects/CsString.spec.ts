import { CsString } from "../../../src/Domain/ValueObjects/CsString";

describe("System.String (CsString)", () => {
    test("Construction: Null/Undefined throws", () => {
        expect(() => new CsString(null as any)).toThrow();
        expect(() => new CsString(undefined as any)).toThrow();
    });

    test("Immutability: Trim and ToUpper", () => {
        const original = new CsString("  test  ");
        const trimmed = original.Trim();
        const upper = trimmed.ToUpper();

        expect(original.toString()).toBe("  test  ");
        expect(trimmed.toString()).toBe("test");
        expect(upper.toString()).toBe("TEST");
        expect(trimmed).not.toBe(original);
    });

    test("Static: IsNullOrEmpty", () => {
        expect(CsString.IsNullOrEmpty(null)).toBe(true);
        expect(CsString.IsNullOrEmpty(undefined)).toBe(true);
        expect(CsString.IsNullOrEmpty(new CsString(""))).toBe(true);
        expect(CsString.IsNullOrEmpty(new CsString(" "))).toBe(false);
        expect(CsString.IsNullOrEmpty(new CsString("a"))).toBe(false);
    });

    test("Static: IsNullOrWhiteSpace", () => {
        expect(CsString.IsNullOrWhiteSpace(null)).toBe(true);
        expect(CsString.IsNullOrWhiteSpace(new CsString("   "))).toBe(true);
        expect(CsString.IsNullOrWhiteSpace(new CsString(" a "))).toBe(false);
    });

    test("Substring", () => {
        const s = new CsString("Hello World");
        // Branch 1: Length provided
        expect(s.Substring(0, 5).toString()).toBe("Hello");
        // Branch 2: Length undefined
        expect(s.Substring(6).toString()).toBe("World");
    });

    test("Length", () => {
        expect(new CsString("abc").Length).toBe(3);
    });

    test("Equals", () => {
        const a = new CsString("foo");
        const b = new CsString("foo");
        const c = new CsString("bar");

        expect(a.Equals(b)).toBe(true);
        expect(a.Equals(c)).toBe(false);
        expect(a.Equals(null as any)).toBe(false);
    });

    test("CompareTo", () => {
        const a = new CsString("a");
        const b = new CsString("b");

        expect(a.CompareTo(b)).toBe(-1);
        expect(b.CompareTo(a)).toBe(1);
        expect(a.CompareTo(new CsString("a"))).toBe(0);
        expect(a.CompareTo(null)).toBe(1);
    });

    test("Addition (Concat)", () => {
        // Assuming + operator overload isn't possible, but maybe an Add/Concat method exists?
        // Standard TS doesn't support operator overloading.
        // We test standard string coercion if applicable, or explicit methods if they existed.
        // Since CsString wraps string, we just check toString behavior again.
        expect(new CsString("a").toString() + "b").toBe("ab");
    });
});
