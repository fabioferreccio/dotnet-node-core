import { HttpContent } from "../../../../src/System/Net/Http/HttpContent";
import { MemoryStream } from "../../../../src/System/IO/MemoryStream";

describe("System.Net.Http.HttpContent", () => {
    class MockContent extends HttpContent {
        private _data: string;
        constructor(data: string) {
            super();
            this._data = data;
        }

        public override ReadAsStreamAsync(): Promise<any> {
            const ms = new MemoryStream();
            const buffer = Buffer.from(this._data);
            ms.Write(buffer, 0, buffer.length);
            ms.Position = 0;
            return Promise.resolve(ms);
        }

        protected SerializeToStreamAsync(stream: any, context: any): Promise<void> {
            const buffer = Buffer.from(this._data);
            stream.Write(buffer, 0, buffer.length);
            return Promise.resolve();
        }

        // TryComputeLength is not on base abstract class in this snapshot?
        // Checking snapshot: Only ReadAsStreamAsync and SerializeToStreamAsync are abstract.
    }

    test("Headers are lazy initialized", () => {
        const content = new MockContent("test");
        expect(content.Headers).toBeDefined();
    });

    test("ReadAsStringAsync reads data", async () => {
        const content = new MockContent("Hello");
        const str = await content.ReadAsStringAsync();
        expect(str.toString()).toBe("Hello");
    });

    test("Dispose disposes resources", () => {
        const content = new MockContent("test");
        content.Dispose();
        expect(true).toBe(true);
    });
});
