// Polyfill for Symbol.dispose and Symbol.asyncDispose if not present
if (!(Symbol as any).dispose) {
    (Symbol as any).dispose = Symbol("Symbol.dispose");
}
if (!(Symbol as any).asyncDispose) {
    (Symbol as any).asyncDispose = Symbol("Symbol.asyncDispose");
}

import { FileStream, FileMode, FileAccess } from "../../../src/System/IO/FileStream";
import { File } from "../../../src/System/IO/File";
import { ObjectDisposedException } from "../../../src/System/ObjectDisposedException";
import * as crypto from "crypto";

describe("FileStream", () => {
    let TestFilePath: string;

    beforeEach(() => {
        TestFilePath = `test_filestream_${crypto.randomUUID()}.txt`;
    });

    afterEach(() => {
        try {
            if (File.Exists(TestFilePath)) {
                File.Delete(TestFilePath);
            }
        } catch {
            // Best effort cleanup
        }
    });

    test("should implement standard Dispose pattern", () => {
        const stream = new FileStream(TestFilePath, FileMode.Create);
        stream.Write(new Uint8Array([65, 66, 67]), 0, 3);
        stream.Dispose();

        expect(() => stream.Write(new Uint8Array([1]), 0, 1)).toThrow(ObjectDisposedException);
    });

    test("should support using keyword (Symbol.dispose)", () => {
        let streamRef: FileStream;
        {
            using stream = new FileStream(TestFilePath, FileMode.Create);
            streamRef = stream;
            stream.Write(new Uint8Array([65, 66, 67]), 0, 3);
        } // Auto-disposed here

        expect(() => streamRef!.Write(new Uint8Array([1]), 0, 1)).toThrow(ObjectDisposedException);
    });

    test("should support async using keyword (Symbol.asyncDispose)", async () => {
        let streamRef: FileStream;
        {
            await using stream = new FileStream(TestFilePath, FileMode.Create);
            streamRef = stream;
            await stream.WriteAsync(new Uint8Array([65, 66, 67]), 0, 3);
        } // Auto-disposed here

        expect(() => streamRef!.Write(new Uint8Array([1]), 0, 1)).toThrow(ObjectDisposedException);
    });

    test("ReadAsync should read content correctly", async () => {
        File.WriteAllText(TestFilePath, "Hello World");

        await using stream = new FileStream(TestFilePath, FileMode.Open);
        const buffer = new Uint8Array(5);
        const bytesRead = await stream.ReadAsync(buffer, 0, 5);

        expect(bytesRead).toBe(5);
        expect(new TextDecoder().decode(buffer)).toBe("Hello");
    });

    test("WriteAsync should write content correctly", async () => {
        {
            await using stream = new FileStream(TestFilePath, FileMode.Create);
            const content = new TextEncoder().encode("Async Write");
            await stream.WriteAsync(content, 0, content.length);
        }

        const readBack = File.ReadAllText(TestFilePath);
        expect(readBack).toBe("Async Write");
    });
});
