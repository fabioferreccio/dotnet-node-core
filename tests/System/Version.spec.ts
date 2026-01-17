import { Version } from "../../src/System/Version";

describe("System.Version", () => {
    test("Constructor: Major/Minor", () => {
        const v = new Version(1, 2);
        expect(v.Major.Value).toBe(1);
        expect(v.Minor.Value).toBe(2);
        expect(v.Build.Value).toBe(-1);
        expect(v.Revision.Value).toBe(-1);
    });

    test("Constructor: Major/Minor/Build", () => {
        const v = new Version(1, 2, 3);
        expect(v.Major.Value).toBe(1);
        expect(v.Minor.Value).toBe(2);
        expect(v.Build.Value).toBe(3);
        expect(v.Revision.Value).toBe(-1);
    });

    test("Constructor: Major/Minor/Build/Revision", () => {
        const v = new Version(1, 2, 3, 4);
        expect(v.Major.Value).toBe(1);
        expect(v.Minor.Value).toBe(2);
        expect(v.Build.Value).toBe(3);
        expect(v.Revision.Value).toBe(4);
    });

    test("ToString", () => {
        // Version.ToString() returns CsString. We need .toString() on that to get primitive.
        expect(new Version(1, 2).ToString().toString()).toBe("1.2");
        expect(new Version(1, 2, 3).ToString().toString()).toBe("1.2.3");
        expect(new Version(1, 2, 3, 4).ToString().toString()).toBe("1.2.3.4");
    });

    // CompareTo block skipped in replacement as it was correct?
    // Wait, CompareTo used .toBe(1). That should be fine if CompareTo returns primitive number.
    // Version.ts: public CompareTo(other: Version | null): number
    // So expect(v.CompareTo(null)).toBe(1) is correct.

    test("Parse", () => {
        const v = Version.Parse("1.2.3.4");
        expect(v.Major.Value).toBe(1);
        expect(v.Minor.Value).toBe(2);
        expect(v.Build.Value).toBe(3);
        expect(v.Revision.Value).toBe(4);
    });

    test("CompareTo: Equality", () => {
        const v1 = new Version(1, 0);
        const v2 = new Version(1, 0);
        expect(v1.CompareTo(v2)).toBe(0);
        expect(v1.Equals(v2)).toBe(true);
    });

    test("CompareTo handles null", () => {
        const v = new Version(1, 0);
        expect(v.CompareTo(null)).toBe(1);
        expect(v.Equals(null)).toBe(false);
    });

    test("CompareTo: Greater/Lesser", () => {
        const v1 = new Version(1, 0);
        const v2 = new Version(2, 0);
        const v3 = new Version(1, 1);

        expect(v1.CompareTo(v2)).toBe(-1); // 1.0 < 2.0
        expect(v2.CompareTo(v1)).toBe(1); // 2.0 > 1.0
        expect(v1.CompareTo(v3)).toBe(-1); // 1.0 < 1.1
    });

    test("Parse", () => {
        const v = Version.Parse("1.2.3.4");
        expect(v.Major.Value).toBe(1);
        expect(v.Minor.Value).toBe(2);
        expect(v.Build.Value).toBe(3);
        expect(v.Revision.Value).toBe(4);
    });
});
