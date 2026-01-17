import { HttpHeaders } from "../../../../../src/System/Net/Http/Headers/HttpHeaders";

describe("System.Net.Http.Headers.HttpHeaders", () => {
    class TestHeaders extends HttpHeaders {}

    test("Add and TryGetValues", () => {
        const headers = new TestHeaders();
        headers.Add("User-Agent", "TestClient");
        
        const values = headers.TryGetValues("User-Agent");
        expect(values).toBeDefined();
        expect(values).toContain("TestClient");
    });

    test("Add multiple values", () => {
        const headers = new TestHeaders();
        headers.Add("Accept", "application/json");
        headers.Add("Accept", "text/plain");

        const values = headers.TryGetValues("Accept");
        expect(values).toBeDefined();
        expect(values!.length).toBe(2);
        expect(values).toContain("application/json");
        expect(values).toContain("text/plain");
    });

    test("Remove", () => {
        const headers = new TestHeaders();
        headers.Add("X-Custom", "Value");
        expect(headers.Remove("X-Custom")).toBe(true);
        expect(headers.Remove("X-Missing")).toBe(false);
    });

    test("Contains", () => {
        const headers = new TestHeaders();
        headers.Add("X-Key", "Value");
        expect(headers.Contains("X-Key")).toBe(true);
        expect(headers.Contains("X-Other")).toBe(false);
    });

    test("TryGetValues returns undefined for missing key", () => {
        const headers = new TestHeaders();
        expect(headers.TryGetValues("Missing")).toBeUndefined();
    });

    test("Clear", () => {
        const headers = new TestHeaders();
        headers.Add("A", "1");
        headers.Clear();
        expect(headers.Contains("A")).toBe(false);
    });
});
