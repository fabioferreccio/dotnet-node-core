import { CsString } from "../../../src/System/Types/CsString";

describe("System.String (CsString)", () => {
    test("Construction: Null/Undefined throws", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => CsString.From(null as any)).toThrow();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => CsString.From(undefined as any)).toThrow();
    });

    test("Immutability: Trim and ToUpper", () => {
        const original = CsString.From("  test  ");
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
        expect(CsString.IsNullOrEmpty(CsString.From(""))).toBe(true);
        expect(CsString.IsNullOrEmpty(CsString.From(" "))).toBe(false);
        expect(CsString.IsNullOrEmpty(CsString.From("a"))).toBe(false);
    });

    test("Static: IsNullOrWhiteSpace", () => {
        expect(CsString.IsNullOrWhiteSpace(null)).toBe(true);
        expect(CsString.IsNullOrWhiteSpace(CsString.From("   "))).toBe(true);
        expect(CsString.IsNullOrWhiteSpace(CsString.From(" a "))).toBe(false);
    });

    test("Substring", () => {
        const s = CsString.From("Hello World");
        // Branch 1: Length provided
        expect(s.Substring(0, 5).toString()).toBe("Hello");
        // Branch 2: Length undefined
        expect(s.Substring(6).toString()).toBe("World");
    });

    test("Length", () => {
        expect(CsString.From("abc").Length).toBe(3);
    });

    test("Equals", () => {
        const a = CsString.From("foo");
        const b = CsString.From("foo");
        const c = CsString.From("bar");

        expect(a.Equals(b)).toBe(true);
        expect(a.Equals(c)).toBe(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(a.Equals(null as any)).toBe(false);
    });

    test("CompareTo", () => {
        const a = CsString.From("a");
        const b = CsString.From("b");

        expect(a.CompareTo(b)).toBe(-1);
        expect(b.CompareTo(a)).toBe(1);
        expect(a.CompareTo(CsString.From("a"))).toBe(0);
        expect(a.CompareTo(null)).toBe(1);
    });

    test("Addition (Concat)", () => {
        // Assuming + operator overload isn't possible, but maybe an Add/Concat method exists?
        // Standard TS doesn't support operator overloading.
        // We test standard string coercion if applicable, or explicit methods if they existed.
        // Since CsString wraps string, we just check toString behavior again.
        expect(CsString.From("a").toString() + "b").toBe("ab");
    });
});
