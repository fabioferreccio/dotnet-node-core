import { HttpClient } from "../../../../src/System/Net/Http/HttpClient";
import { HttpClientHandler } from "../../../../src/System/Net/Http/HttpClientHandler";
import { HttpMethod } from "../../../../src/System/Net/Http/HttpMethod";
import { StringContent } from "../../../../src/System/Net/Http/StringContent";
import { CsString } from "../../../../src/System/Types/CsString";
import { HttpStatusCode } from "../../../../src/System/Net/Http/HttpStatusCode";

// Helper to mock fetch
function mockFetch(status: number, statusText: string, bodyText: string, headers: Record<string, string> = {}) {
    return jest.fn().mockResolvedValue({
        status,
        statusText,
        headers: new Map(Object.entries(headers)),
        text: jest.fn().mockResolvedValue(bodyText),
        // Add other properties if needed
    });
}

describe("HttpClient Integration", () => {
    let originalFetch: typeof global.fetch;

    beforeAll(() => {
        originalFetch = global.fetch;
    });

    afterAll(() => {
        global.fetch = originalFetch;
    });

    test("GetAsync calls fetch with correct args", async () => {
        const fetchMock = mockFetch(200, "OK", "Response Body", { Server: "Node" });
        global.fetch = fetchMock;

        const client = new HttpClient();
        client.DefaultRequestHeaders.Add("User-Agent", "TestClient");

        const response = await client.GetAsync("https://api.test/v1");

        expect(response.StatusCode).toBe(HttpStatusCode.OK);
        expect(await response.Content?.ReadAsStringAsync().then((s: CsString) => s.toString())).toBe("Response Body");
        expect(response.Headers.Contains("Server")).toBe(true);
        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.test/v1",
            expect.objectContaining({
                method: "GET",
                headers: expect.objectContaining({
                    "user-agent": "TestClient",
                }),
            }),
        );

        client.Dispose();
    });

    test("PostAsync sends body", async () => {
        const fetchMock = mockFetch(201, "Created", "OK");
        global.fetch = fetchMock;

        const client = new HttpClient();
        const content = new StringContent("Hello World");

        const response = await client.PostAsync("https://api.test/post", content);

        expect(response.StatusCode).toBe(201);
        expect(fetchMock).toHaveBeenCalledWith(
            "https://api.test/post",
            expect.objectContaining({
                method: "POST",
                // Body verification: StringContent turns to Buffer/Uint8Array.
                // We can check if body is defined.
                body: expect.any(Uint8Array),
            }),
        );

        client.Dispose();
    });

    test("Dispose disposes handler", () => {
        // To verify disposal, we pass a custom handler that tracks disposal state or spy on it?
        // But HttpClientHandler logic is "if handler passed, do NOT dispose it" (per my impl analysis).
        // BUT "if no handler passed, create one AND dispose it".
        // Use a mock/extended class to verify logic.

        class MockHandler extends HttpClientHandler {
            public disposed = false;
            protected override DisposeInternal(disposing: boolean): void {
                this.disposed = true;
                super.DisposeInternal(disposing);
            }
        }

        const handler = new MockHandler();
        const client = new HttpClient(handler);
        // By default implementation: passed handler is NOT disposed.
        client.Dispose();
        expect(handler.disposed).toBe(false);

        // However, if we want to validte "Disposal Chain" for internal handler (scenario where client OWNS handler)
        // We can't access private _handler easily.
        // We can create a client that DOES own the handler (default constructor) but we can't test it easily without spy on prototype?

        // Let's modify the test to test that checking logic works:
        // Use default constructor. Spy on HttpClientHandler.prototype.Dispose?
        const disposeSpy = jest.spyOn(HttpClientHandler.prototype, "Dispose");
        const client2 = new HttpClient();
        client2.Dispose();
        expect(disposeSpy).toHaveBeenCalled();
        disposeSpy.mockRestore();
    });

    test("Helper methods (PutAsync, DeleteAsync) delegate to SendAsync", async () => {
        const fetchMock = mockFetch(200, "OK", "{}");
        global.fetch = fetchMock;
        const client = new HttpClient();
        const sendSpy = jest.spyOn(client, "SendAsync");

        // PutAsync
        await client.PutAsync("http://foo.com", new StringContent("data"));
        expect(sendSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                Method: HttpMethod.Put,
            }),
        );

        // DeleteAsync
        await client.DeleteAsync("http://foo.com");
        expect(sendSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                Method: HttpMethod.Delete,
            }),
        );

        client.Dispose();
    });

    test("BaseAddress combines with relative URI", async () => {
        const fetchMock = mockFetch(200, "OK", "{}");
        global.fetch = fetchMock;

        const client = new HttpClient();
        client.BaseAddress = CsString.From("https://api.base/");

        // Test with relative path
        await client.GetAsync("v1/resource");
        expect(fetchMock).toHaveBeenCalledWith("https://api.base/v1/resource", expect.anything());

        // Test with absolute path (should ignore BaseAddress)
        await client.GetAsync("https://other.com/api");
        expect(fetchMock).toHaveBeenCalledWith("https://other.com/api", expect.anything());

        client.Dispose();
    });
});
