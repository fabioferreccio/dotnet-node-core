// Polyfill for Symbol.dispose
if (!(Symbol as unknown as { dispose: symbol }).dispose) {
    (Symbol as unknown as { dispose: symbol }).dispose = Symbol("Symbol.dispose");
}
if (!(Symbol as unknown as { asyncDispose: symbol }).asyncDispose) {
    (Symbol as unknown as { asyncDispose: symbol }).asyncDispose = Symbol("Symbol.asyncDispose");
}

import { Version } from "../../../../src/System/Version";
import { CsString } from "../../../../src/Domain/ValueObjects/CsString";
import { HttpHeaders } from "../../../../src/System/Net/Http/Headers/HttpHeaders";
import { StringContent } from "../../../../src/System/Net/Http/StringContent";
import { HttpRequestMessage } from "../../../../src/System/Net/Http/HttpRequestMessage";
import { HttpResponseMessage } from "../../../../src/System/Net/Http/HttpResponseMessage";
import { HttpMethod } from "../../../../src/System/Net/Http/HttpMethod";
import { HttpStatusCode } from "../../../../src/System/Net/Http/HttpStatusCode";
import { HttpRequestException } from "../../../../src/System/Net/Http/HttpRequestException";

describe("System.Net.Http Primitives Coverage", () => {
    // Task 1: HttpMethod (Target: 100%)
    describe("HttpMethod", () => {
        test("Equality Check", () => {
            const get1 = HttpMethod.Get;
            const get2 = HttpMethod.Get;
            const post = HttpMethod.Post;

            expect(get1.Equals(get2)).toBe(true);
            expect(get1.Equals(post)).toBe(false);
            expect(get1.Equals(null)).toBe(false);
        });

        test("Comparison with string", () => {
            const put = new HttpMethod("PUT");
            expect(put.Equals(HttpMethod.Put)).toBe(true);
            expect(put.Method.toString()).toBe("PUT");
        });

        test("HttpMethod Equality Logic", () => {
            const m1 = new HttpMethod("get");
            expect(m1.Equals(HttpMethod.Get)).toBe(true);
            expect(m1.Equals(HttpMethod.Post)).toBe(false);
            expect(m1.Equals(new HttpMethod("GET"))).toBe(true);
        });

        test("Methods properties return correct instances", () => {
            expect(HttpMethod.Get.Method.toString()).toBe("GET");
            expect(HttpMethod.Post.Method.toString()).toBe("POST");
            expect(HttpMethod.Put.Method.toString()).toBe("PUT");
            expect(HttpMethod.Delete.Method.toString()).toBe("DELETE");
            expect(HttpMethod.Head.Method.toString()).toBe("HEAD");
            expect(HttpMethod.Options.Method.toString()).toBe("OPTIONS");
            expect(HttpMethod.Patch.Method.toString()).toBe("PATCH");
            expect(HttpMethod.Trace.Method.toString()).toBe("TRACE");
        });

        test("ToString returns method string", () => {
            expect(HttpMethod.Get.ToString().toString()).toBe("GET");
            expect(new HttpMethod("custom").ToString().toString()).toBe("CUSTOM");
        });
    });

    // Task 2: HttpStatusCode (Target: 100%)
    describe("HttpStatusCode", () => {
        test("Enum values map correctly", () => {
            const code: HttpStatusCode = HttpStatusCode.OK;
            expect(code).toBe(200);
            expect(HttpStatusCode.NotFound).toBe(404);
            expect(HttpStatusCode.InternalServerError).toBe(500);
        });
    });

    // Task 3: HttpRequestException (Target: 100%)
    describe("HttpRequestException", () => {
        test("Throw and Catch", () => {
            try {
                throw new HttpRequestException("Error occurred", 400);
            } catch (e) {
                expect(e).toBeInstanceOf(HttpRequestException);
                const ex = e as HttpRequestException;
                expect(ex.Message).toBe("Error occurred");
                expect(ex.StatusCode).toBe(400);
            }
        });
    });

    // Task 4: HttpResponseMessage (Target: 100%)
    describe("HttpResponseMessage", () => {
        test("Disposal Chain", () => {
            const response = new HttpResponseMessage(HttpStatusCode.OK);
            const content = new StringContent("test");
            response.Content = content;

            // Spy on content dispose
            let contentDisposed = false;
            const originalDispose = content.Dispose.bind(content);
            content.Dispose = () => {
                contentDisposed = true;
                originalDispose();
            };

            response.Dispose();
            expect(contentDisposed).toBe(true);
        });

        test("EnsureSuccessStatusCode - Success", () => {
            const response = new HttpResponseMessage(HttpStatusCode.OK);
            expect(() => response.EnsureSuccessStatusCode()).not.toThrow();
        });

        test("EnsureSuccessStatusCode - Failure", () => {
            const response = new HttpResponseMessage(HttpStatusCode.NotFound);
            response.ReasonPhrase = new CsString("Not Found");

            expect(() => response.EnsureSuccessStatusCode()).toThrow(HttpRequestException);

            try {
                response.EnsureSuccessStatusCode();
            } catch (e) {
                const ex = e as HttpRequestException;
                expect(ex.StatusCode).toBe(404);
            }
        });

        test("Full Request Lifecycle", () => {
            const msg = new HttpRequestMessage(HttpMethod.Post, "http://api.com");

            // Assert Accessors (trigger getters)
            expect(msg.Method.Equals(HttpMethod.Post)).toBe(true);
            expect(msg.RequestUri!.toString()).toBe("http://api.com");
            expect(msg.Version.Major.Value).toBe(1); // Default 1.1

            // Setters
            msg.Version = new Version(1, 0);
            expect(msg.Version.Major.Value).toBe(1);
            expect(msg.Version.Minor.Value).toBe(0);

            // Disposal
            const content = new StringContent("test");
            msg.Content = content;

            let contentDisposed = false;
            const originalDispose = content.Dispose.bind(content);
            content.Dispose = () => {
                contentDisposed = true;
                originalDispose();
            };

            msg.Dispose();
            expect(contentDisposed).toBe(true);
        });
    });

    // Task 5: HttpHeaders (Target: 100%)
    describe("HttpHeaders", () => {
        test("Case Insensitivity", () => {
            const headers = new HttpHeaders();
            headers.Add("Content-Type", "application/json");

            const values = headers.TryGetValues("content-type");
            expect(values).toBeDefined();
            expect(values![0]).toBe("application/json");
            expect(headers.Contains("CONTENT-TYPE")).toBe(true);
        });

        test("Multiple Values", () => {
            const headers = new HttpHeaders();
            headers.Add("Accept", "text/html");
            headers.Add("Accept", "application/xml");

            const values = headers.TryGetValues("accept");
            expect(values).toHaveLength(2);
            expect(values).toContain("text/html");
            expect(values).toContain("application/xml");
        });

        test("Remove", () => {
            const headers = new HttpHeaders();
            headers.Add("X-Test", "Value");
            expect(headers.Contains("x-test")).toBe(true);

            headers.Remove("x-test");
            expect(headers.Contains("X-Test")).toBe(false);
            expect(headers.TryGetValues("x-test")).toBeUndefined();
        });

        test("Clear", () => {
            const headers = new HttpHeaders();
            headers.Add("Head", "Val");
            headers.Clear();
            expect(headers.Contains("Head")).toBe(false);
        });

        test("Iterator", () => {
            const headers = new HttpHeaders();
            headers.Add("A", "1");
            headers.Add("B", "2");

            let count = 0;
            for (const _ of headers) {
                count++;
            }
            expect(count).toBe(2);
        });
    });

    // Additional: System.Version
    describe("System.Version", () => {
        test("Parse", () => {
            const v = Version.Parse("1.2.3.4");
            expect(v.Major.Value).toBe(1);
            expect(v.Minor.Value).toBe(2);
            expect(v.Build.Value).toBe(3);
            expect(v.Revision.Value).toBe(4);
        });

        test("CompareTo", () => {
            const v1 = new Version(1, 0);
            const v2 = new Version(1, 1);
            expect(v1.CompareTo(v2)).toBeLessThan(0);
            expect(v2.CompareTo(v1)).toBeGreaterThan(0);
            expect(v1.CompareTo(v1)).toBe(0);
        });
    });

    // Content Disposal Check
    test("Content Logic (ReadAsStringAsync, ReadAsStreamAsync)", async () => {
        const content = new StringContent("test");

        // ReadAsStringAsync
        const str = await content.ReadAsStringAsync();
        expect(str.toString()).toBe("test");

        // ReadAsStreamAsync
        const stream = await content.ReadAsStreamAsync();
        expect(stream.CanRead).toBe(true);
        expect(stream.Length).toBe(4);

        // Disposal
        content.Dispose();
        expect(stream.CanRead).toBe(false); // Underlying stream should be disposed
    });
});
