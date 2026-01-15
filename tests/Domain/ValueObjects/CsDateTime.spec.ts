import { CsDateTime, DateTimeKind } from "../../../src/Domain/ValueObjects/CsDateTime";

describe("System.DateTime (CsDateTime) - Comprehensive", () => {
    // 1. Static Factory Methods
    test("Static: Now", () => {
        const now = CsDateTime.Now;
        expect(now.Kind).toBe(DateTimeKind.Local);
        expect(now.Year).toBeGreaterThan(2020);
    });

    test("Static: UtcNow", () => {
        const utcNow = CsDateTime.UtcNow;
        expect(utcNow.Kind).toBe(DateTimeKind.Utc);
        // Verify getters on UTC instance
        expect(utcNow.Year).toBeGreaterThan(2000);
        expect(utcNow.Month).toBeGreaterThan(0);
        expect(utcNow.Day).toBeGreaterThan(0);
        expect(utcNow.Hour).toBeGreaterThanOrEqual(0);
        expect(utcNow.Minute).toBeGreaterThanOrEqual(0);
        expect(utcNow.Second).toBeGreaterThanOrEqual(0);
    });

    test("Static: Today", () => {
        const today = CsDateTime.Today;
        expect(today.Kind).toBe(DateTimeKind.Local);
        expect(today.Hour).toBe(0);
        expect(today.Minute).toBe(0);
        expect(today.Second).toBe(0);
    });

    // 2. Formatting (ToString)
    test("ToString: Default (ISO)", () => {
        const dt = new CsDateTime(new Date("2023-01-01T12:00:00Z"), DateTimeKind.Utc);
        expect(dt.ToString()).toBe("2023-01-01T12:00:00.000Z");
    });

    test("ToString: Custom Format Tokens", () => {
        // Date: 2023-05-09 14:05:07
        const date = new Date(2023, 4, 9, 14, 5, 7);
        const dt = new CsDateTime(date, DateTimeKind.Local);

        expect(dt.ToString("yyyy-MM-dd HH:mm:ss")).toBe("2023-05-09 14:05:07");
        expect(dt.ToString("dd/MM/yyyy")).toBe("09/05/2023");
        // Verify individual components
        expect(dt.Year).toBe(2023);
        expect(dt.Month).toBe(5);
        expect(dt.Day).toBe(9);
        expect(dt.Hour).toBe(14);
        expect(dt.Minute).toBe(5);
        expect(dt.Second).toBe(7);
    });

    // 3. Timezone Conversions and Kind Logic
    test("ToUniversalTime", () => {
        const utc = new CsDateTime(new Date(), DateTimeKind.Utc);
        expect(utc.ToUniversalTime()).toBe(utc); // Should return same instance if already UTC

        const local = new CsDateTime(new Date(), DateTimeKind.Local);
        const converted = local.ToUniversalTime();
        expect(converted.Kind).toBe(DateTimeKind.Utc);
        expect(converted.Equals(local)).toBe(true); // Times should match
    });

    test("ToLocalTime", () => {
        const local = new CsDateTime(new Date(), DateTimeKind.Local);
        expect(local.ToLocalTime()).toBe(local); // Should return same instance

        const utc = new CsDateTime(new Date(), DateTimeKind.Utc);
        const converted = utc.ToLocalTime();
        expect(converted.Kind).toBe(DateTimeKind.Local);
    });

    // 4. Arithmetic
    test("AddDays", () => {
        const start = new CsDateTime(new Date(2023, 0, 1), DateTimeKind.Local);
        const next = start.AddDays(1);
        expect(next.Day).toBe(2);

        // Coverage for UTC Branch
        const utcStart = new CsDateTime(new Date(Date.UTC(2023, 0, 1)), DateTimeKind.Utc);
        const utcNext = utcStart.AddDays(1);
        expect(utcNext.Day).toBe(2);
    });

    test("AddHours", () => {
        const start = new CsDateTime(new Date(2023, 0, 1, 10), DateTimeKind.Local);
        const next = start.AddHours(2);
        expect(next.Hour).toBe(12);
    });

    test("AddMinutes", () => {
        const start = new CsDateTime(new Date(2023, 0, 1, 10, 0), DateTimeKind.Local);
        const next = start.AddMinutes(30);
        expect(next.Minute).toBe(30);
    });

    // 5. Comparison & Equality
    test("Equality", () => {
        const t1 = new Date().getTime();
        const dt1 = new CsDateTime(t1);
        const dt2 = new CsDateTime(t1);
        const dt3 = new CsDateTime(t1 + 1000);

        expect(dt1.Equals(dt2)).toBe(true);
        expect(dt1.Equals(dt3)).toBe(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(dt1.Equals(null as any)).toBe(false);
    });

    test("Comparisons: Greater/Less", () => {
        const early = new CsDateTime(new Date(2023, 0, 1));
        const late = new CsDateTime(new Date(2023, 0, 2));

        expect(late.GreaterThan(early)).toBe(true);
        expect(early.LessThan(late)).toBe(true);
        expect(early.GreaterThan(late)).toBe(false);
        expect(late.LessThan(early)).toBe(false);

        expect(early.GreaterThanOrEqual(early)).toBe(true);
        expect(early.LessThanOrEqual(early)).toBe(true);
        expect(late.GreaterThanOrEqual(early)).toBe(true);
        expect(early.LessThanOrEqual(late)).toBe(true);
    });

    test("CompareTo", () => {
        const a = new CsDateTime(new Date(100));
        const b = new CsDateTime(new Date(200));
        const c = new CsDateTime(new Date(100));

        expect(a.CompareTo(b)).toBe(-1); // Less
        expect(b.CompareTo(a)).toBe(1); // Greater
        expect(a.CompareTo(c)).toBe(0); // Equal
        expect(a.CompareTo(null)).toBe(1); // Null check
    });
});
