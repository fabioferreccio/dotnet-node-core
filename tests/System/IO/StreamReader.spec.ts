import { MemoryStream } from "../../../src/System/IO/MemoryStream";
import { StreamReader } from "../../../src/System/IO/StreamReader";

describe("StreamReader", () => {
    test("Reads lines correctly", () => {
        const ms = new MemoryStream();
        const content = "Line1\r\nLine2";
        const buffer = Buffer.from(content);
        ms.Write(buffer, 0, buffer.length);
        ms.Position = 0;

        const reader = new StreamReader(ms);
        expect(reader.ReadLine()).toBe("Line1");
        expect(reader.ReadLine()).toBe("Line2");
        expect(reader.ReadLine()).toBeNull();
    });

    test("ReadToEnd consumes whole stream", () => {
        const ms = new MemoryStream();
        const content = "Hello World";
        const buffer = Buffer.from(content);
        ms.Write(buffer, 0, buffer.length);
        ms.Position = 0;

        const reader = new StreamReader(ms);
        expect(reader.ReadToEnd()).toBe("Hello World");
    });

    test("Close disposes stream", () => {
        const ms = new MemoryStream();
        const reader = new StreamReader(ms);
        reader.Close();
        expect(ms.CanRead).toBe(false);
    });

    test("Dispose is idempotent", () => {
        const ms = new MemoryStream();
        const reader = new StreamReader(ms);
        reader.Dispose();
        reader.Dispose();
    });
});
