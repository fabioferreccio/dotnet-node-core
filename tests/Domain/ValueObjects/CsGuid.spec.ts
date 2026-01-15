import { CsGuid } from "../../../src/Domain/ValueObjects/CsGuid";

describe("System.Guid (CsGuid) - Comprehensive", () => {
    test("Static: NewGuid", () => {
        const g1 = CsGuid.NewGuid();
        const g2 = CsGuid.NewGuid();
        expect(g1.ToString().length).toBe(36);
        expect(g1.Equals(g2)).toBe(false);
    });

    test("Static: Empty", () => {
        expect(CsGuid.Empty.ToString()).toBe("00000000-0000-0000-0000-000000000000");
    });

    test("Parse: Valid", () => {
        const valid = "d4e2a6c8-5b3f-4e1a-9c7d-8e2b0a4f6c3d";
        const guid = CsGuid.Parse(valid);
        expect(guid.ToString()).toBe(valid);
    });

    test("Parse: Invalid Throws", () => {
        expect(() => CsGuid.Parse("invalid-guid")).toThrow("Invalid GUID format");
    });

    test("TryParse", () => {
        const valid = "d4e2a6c8-5b3f-4e1a-9c7d-8e2b0a4f6c3d";
        expect(CsGuid.TryParse(valid, null)).toBe(true);
        expect(CsGuid.TryParse("garbage", null)).toBe(false);
    });

    test("Equals", () => {
        const g1 = CsGuid.Empty;
        const g2 = CsGuid.Empty;
        expect(g1.Equals(g2)).toBe(true);
        // Cover "if (!other) return false"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(g1.Equals(null as any)).toBe(false);
    });
});
