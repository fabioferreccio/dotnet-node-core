import { CsBoolean } from "../../../src/System/Types/CsBoolean";
import { CsString } from "../../../src/System/Types/CsString";
import { CsInt16 } from "../../../src/System/Types/CsInt16";
import { CsInt32 } from "../../../src/System/Types/CsInt32";
import { CsInt64 } from "../../../src/System/Types/CsInt64";
import { CsByte } from "../../../src/System/Types/CsByte";
import { CsSByte } from "../../../src/System/Types/CsSByte";

describe("CsBoolean", () => {
    test("Constructor sets value correctly", () => {
        // Boolean
        expect(CsBoolean.From(true).Value).toBe(true);
        expect(CsBoolean.From(false).Value).toBe(false);

        // String
        expect(CsBoolean.From("True").Value).toBe(true);
        expect(CsBoolean.From("true").Value).toBe(true);
        expect(CsBoolean.From("False").Value).toBe(false);
        expect(CsBoolean.From("false").Value).toBe(false);
        expect(() => CsBoolean.From("invalid")).toThrow();

        // Number
        expect(CsBoolean.From(1).Value).toBe(true);
        expect(CsBoolean.From(0).Value).toBe(false);
        expect(CsBoolean.From(-1).Value).toBe(true);
        expect(CsBoolean.From(123).Value).toBe(true);

        // CsString
        expect(CsBoolean.From(CsString.From("True")).Value).toBe(true);
        expect(CsBoolean.From(CsString.From("False")).Value).toBe(false);

        // CsInt32
        expect(CsBoolean.From(CsInt32.From(1)).Value).toBe(true);
        expect(CsBoolean.From(CsInt32.From(0)).Value).toBe(false);

        // CsInt64
        expect(CsBoolean.From(CsInt64.From(1)).Value).toBe(true);
        expect(CsBoolean.From(CsInt64.From(0)).Value).toBe(false);

        // CsByte
        expect(CsBoolean.From(CsByte.From(1)).Value).toBe(true);
        expect(CsBoolean.From(CsByte.From(0)).Value).toBe(false);
    });

    test("Constructor throws on null/undefined", () => {
        expect(() => CsBoolean.From(null as any)).toThrow();
        expect(() => CsBoolean.From(undefined as any)).toThrow();
    });

    test("Equals works correctly", () => {
        const t1 = CsBoolean.From(true);
        const t2 = CsBoolean.From(true);
        const f1 = CsBoolean.From(false);

        expect(t1.Equals(t2)).toBe(true);
        expect(t1.Equals(f1)).toBe(false);
        expect(t1.Equals(null!)).toBe(false);
    });

    test("CompareTo works correctly", () => {
        const t = CsBoolean.From(true);
        const f = CsBoolean.From(false);

        // False < True
        expect(f.CompareTo(t)).toBe(-1);
        expect(t.CompareTo(f)).toBe(1);
        expect(t.CompareTo(t)).toBe(0);
        expect(f.CompareTo(f)).toBe(0);

        // CompareTo(null) -> 1
        expect(t.CompareTo(null)).toBe(1);
    });

    test("ToString returns True/False", () => {
        expect(CsBoolean.From(true).toString()).toBe("True");
        expect(CsBoolean.From(false).toString()).toBe("False");
        expect(CsBoolean.From(true).ToString()).toBe("True");
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
        expect(CsBoolean.Parse(CsInt32.From(1)).Value).toBe(true);
    });

    test("Parse works with CsString", () => {
        expect(CsBoolean.Parse(CsString.From("True")).Value).toBe(true);
    });

    test("Parse throws on invalid input", () => {
        expect(() => CsBoolean.Parse("invalid")).toThrow();
        expect(() => CsBoolean.Parse(null as any)).toThrow();
    });

    test("TryParse works correctly", () => {
        let result: CsBoolean | null = null;
        const success = CsBoolean.TryParse("True", (val) => {
            result = val;
        });
        expect(success).toBe(true);
        expect(result!.Value).toBe(true);

        const successNum = CsBoolean.TryParse(1, (val) => {
            result = val;
        });
        expect(successNum).toBe(true);
        expect(result!.Value).toBe(true);

        const fail = CsBoolean.TryParse("invalid", () => {});
        expect(fail).toBe(false);
    });
});
