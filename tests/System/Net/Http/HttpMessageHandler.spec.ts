import { HttpMessageHandler } from "../../../../src/System/Net/Http/HttpMessageHandler";
import { HttpRequestMessage } from "../../../../src/System/Net/Http/HttpRequestMessage";
import { HttpResponseMessage } from "../../../../src/System/Net/Http/HttpResponseMessage";
import { CancellationToken } from "../../../../src/System/Threading/CancellationToken";

describe("System.Net.Http.HttpMessageHandler", () => {
    class MockHandler extends HttpMessageHandler {
        public wasCalled = false;
        // Base defines public abstract SendAsync
        public async SendAsync(
            _request: HttpRequestMessage,
            _cancellationToken: CancellationToken,
        ): Promise<HttpResponseMessage> {
            this.wasCalled = true;
            return new HttpResponseMessage();
        }
    }

    test("Dispose is idempotent", () => {
        const handler = new MockHandler();
        handler.Dispose();
        handler.Dispose();
        expect(true).toBe(true);
    });
});
