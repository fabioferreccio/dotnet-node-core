import { CsBoolean } from "../../../src/Domain/ValueObjects/CsBoolean";
import { CsString } from "../../../src/Domain/ValueObjects/CsString";
import { CsInt16 } from "../../../src/Domain/ValueObjects/CsInt16";
import { CsInt32 } from "../../../src/Domain/ValueObjects/CsInt32";
import { CsInt64 } from "../../../src/Domain/ValueObjects/CsInt64";
import { CsByte } from "../../../src/Domain/ValueObjects/CsByte";
import { CsSByte } from "../../../src/Domain/ValueObjects/CsSByte";

describe("CsBoolean", () => {
    test("Constructor sets value correctly", () => {
        // Boolean
        expect(new CsBoolean(true).Value).toBe(true);
        expect(new CsBoolean(false).Value).toBe(false);

        // String
        expect(new CsBoolean("True").Value).toBe(true);
        expect(new CsBoolean("true").Value).toBe(true);
        expect(new CsBoolean("False").Value).toBe(false);
        expect(new CsBoolean("false").Value).toBe(false);
        expect(() => new CsBoolean("invalid")).toThrow();

        // Number
        expect(new CsBoolean(1).Value).toBe(true);
        expect(new CsBoolean(0).Value).toBe(false);
        expect(new CsBoolean(-1).Value).toBe(true);
        expect(new CsBoolean(123).Value).toBe(true);

        // CsString
        expect(new CsBoolean(new CsString("True")).Value).toBe(true);
        expect(new CsBoolean(new CsString("False")).Value).toBe(false);

        // CsInt32
        expect(new CsBoolean(new CsInt32(1)).Value).toBe(true);
        expect(new CsBoolean(new CsInt32(0)).Value).toBe(false);

        // CsInt64
        expect(new CsBoolean(new CsInt64(1)).Value).toBe(true);
        expect(new CsBoolean(new CsInt64(0)).Value).toBe(false);

        // CsByte
        expect(new CsBoolean(new CsByte(1)).Value).toBe(true);
        expect(new CsBoolean(new CsByte(0)).Value).toBe(false);
    });

    test("Constructor throws on null/undefined", () => {
        expect(() => new CsBoolean(null as any)).toThrow();
        expect(() => new CsBoolean(undefined as any)).toThrow();
    });

    test("Equals works correctly", () => {
        const t1 = new CsBoolean(true);
        const t2 = new CsBoolean(true);
        const f1 = new CsBoolean(false);

        expect(t1.Equals(t2)).toBe(true);
        expect(t1.Equals(f1)).toBe(false);
        expect(t1.Equals(null!)).toBe(false);
    });

    test("CompareTo works correctly", () => {
        const t = new CsBoolean(true);
        const f = new CsBoolean(false);

        // False < True
        expect(f.CompareTo(t)).toBe(-1);
        expect(t.CompareTo(f)).toBe(1);
        expect(t.CompareTo(t)).toBe(0);
        expect(f.CompareTo(f)).toBe(0);

        // CompareTo(null) -> 1
        expect(t.CompareTo(null)).toBe(1);
    });

    test("ToString returns True/False", () => {
        expect(new CsBoolean(true).toString()).toBe("True");
        expect(new CsBoolean(false).toString()).toBe("False");
        expect(new CsBoolean(true).ToString()).toBe("True");
    });

    test("Parse works with strings", () => {
        expect(CsBoolean.Parse("true").Value).toBe(true);
        expect(CsBoolean.Parse("True").Value).toBe(true);
        expect(CsBoolean.Parse("false").Value).toBe(false);
        expect(CsBoolean.Parse("FALSE").Value).toBe(false);
        // Numbers
        expect(CsBoolean.Parse(1).Value).toBe(true);
        expect(CsBoolean.Parse(0).Value).toBe(false);
        // CsInt32
        expect(CsBoolean.Parse(new CsInt32(1)).Value).toBe(true);
    });

    test("Parse works with CsString", () => {
        expect(CsBoolean.Parse(new CsString("True")).Value).toBe(true);
    });

    test("Parse throws on invalid input", () => {
        expect(() => CsBoolean.Parse("invalid")).toThrow();
        expect(() => CsBoolean.Parse(null as any)).toThrow();
    });

    test("TryParse works correctly", () => {
        let result: CsBoolean | null = null;
        const success = CsBoolean.TryParse("True", (val) => { result = val; });
        expect(success).toBe(true);
        expect(result!.Value).toBe(true);

        const successNum = CsBoolean.TryParse(1, (val) => { result = val; });
        expect(successNum).toBe(true);
        expect(result!.Value).toBe(true);

        const fail = CsBoolean.TryParse("invalid", () => {});
        expect(fail).toBe(false);
    });
});
