import { HttpMethod } from "../../../../src/System/Net/Http/HttpMethod";

describe("System.Net.Http.HttpMethod", () => {
    test("Static properties return correct instances", () => {
        expect(HttpMethod.Get.Method.toString()).toBe("GET");
        expect(HttpMethod.Post.Method.toString()).toBe("POST");
        expect(HttpMethod.Put.Method.toString()).toBe("PUT");
        expect(HttpMethod.Delete.Method.toString()).toBe("DELETE");
        expect(HttpMethod.Head.Method.toString()).toBe("HEAD");
        expect(HttpMethod.Options.Method.toString()).toBe("OPTIONS");
        expect(HttpMethod.Patch.Method.toString()).toBe("PATCH");
        expect(HttpMethod.Trace.Method.toString()).toBe("TRACE");
    });

    test("Constructor sets method", () => {
        const m = new HttpMethod("CUSTOM");
        expect(m.Method.toString()).toBe("CUSTOM");
    });

    test("Equals: Normalized comparison", () => {
        const m1 = HttpMethod.Get;
        const m2 = HttpMethod.Get;
        // Implementation normalizes to UpperCase, so "get" becomes "GET"
        const m3 = new HttpMethod("get");
        
        expect(m1.Equals(m2)).toBe(true);
        expect(m1.Equals(m3)).toBe(true); 
        expect(m1.Equals(null)).toBe(false);
    });
    
    test("ToString returns Method", () => {
        // ToString() returns CsString
        expect(HttpMethod.Get.ToString().toString()).toBe("GET");
    });
});
