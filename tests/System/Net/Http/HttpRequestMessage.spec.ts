import { HttpRequestMessage } from "../../../../src/System/Net/Http/HttpRequestMessage";
import { HttpMethod } from "../../../../src/System/Net/Http/HttpMethod";
import { HttpContent } from "../../../../src/System/Net/Http/HttpContent";
import { CsString } from "../../../../src/System/Types/CsString";

describe("System.Net.Http.HttpRequestMessage", () => {
    test("Constructor with method and uri", () => {
        const req = new HttpRequestMessage(HttpMethod.Post, "http://example.com");
        expect(req.Method).toEqual(HttpMethod.Post);
        expect(req.RequestUri?.toString()).toBe("http://example.com");
    });

    test("Constructor defaults to GET", () => {
        const req = new HttpRequestMessage();
        expect(req.Method).toEqual(HttpMethod.Get);
    });

    test("Content property and Disposal", () => {
        const req = new HttpRequestMessage();

        // Mock Content
        class MockContent extends HttpContent {
            public disposed = false;
            protected SerializeToStreamAsync() {
                return Promise.resolve();
            }
            public ReadAsStreamAsync() {
                return Promise.resolve(null as any);
            }

            // Override DisposeInternal to track disposal
            protected override DisposeInternal(disposing: boolean) {
                this.disposed = true;
                super.DisposeInternal(disposing);
            }
        }
        const content = new MockContent();
        req.Content = content;

        // Dispose request should dispose content
        req.Dispose();
        expect(content.disposed).toBe(true);
    });

    test("Properties setters", () => {
        const req = new HttpRequestMessage();
        req.Method = HttpMethod.Put;
        expect(req.Method).toEqual(HttpMethod.Put);

        // Setter expects CsString | null. String assignment via setter not supported if strict.
        // Assuming we need to convert if using setter directly, or check if setter allows string.
        // Source file says: public set RequestUri(value: CsString | null)
        // So we must use CsString.
        const uri = CsString.From("http://test");
        req.RequestUri = uri;
        expect(req.RequestUri).toBe(uri);
    });
});
