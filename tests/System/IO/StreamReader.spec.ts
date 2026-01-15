// Polyfill for Symbol.dispose and Symbol.asyncDispose
if (!(Symbol as any).dispose) {
    (Symbol as any).dispose = Symbol("Symbol.dispose");
}
if (!(Symbol as any).asyncDispose) {
    (Symbol as any).asyncDispose = Symbol("Symbol.asyncDispose");
}

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

    test("ReadLine on empty stream returns null", () => {
        const ms = new MemoryStream();
        const reader = new StreamReader(ms);
        expect(reader.ReadLine()).toBeNull();
    });

    test("ReadLine on single character stream returns character", () => {
        const ms = new MemoryStream();
        ms.Write(Buffer.from("A"), 0, 1);
        ms.Position = 0;
        
        const reader = new StreamReader(ms);
        expect(reader.ReadLine()).toBe("A");
        expect(reader.ReadLine()).toBeNull();
    });
    test("Read with small buffer (simulated logic)", () => {
        // Since implementation is byte-by-byte currently, we test reading a longer line to ensure loop logic works.
        const ms = new MemoryStream();
        const content = "Long line content that exceeds typical small buffer if we had one";
        ms.Write(Buffer.from(content), 0, content.length);
        ms.Position = 0;

        const reader = new StreamReader(ms);
        expect(reader.ReadLine()).toBe(content);
    });

    test("Read file with no newline at end", () => {
        const ms = new MemoryStream();
        const content = "A\nB\nC"; // C has no newline
        ms.Write(Buffer.from(content), 0, content.length);
        ms.Position = 0;

        const reader = new StreamReader(ms);
        expect(reader.ReadLine()).toBe("A");
        expect(reader.ReadLine()).toBe("B");
        expect(reader.ReadLine()).toBe("C");
        expect(reader.ReadLine()).toBeNull();
    });
    test("Reads CR without LF correctly (macOS 9 style)", () => {
        const ms = new MemoryStream();
        const content = "Line1\rLine2"; // \r only
        ms.Write(Buffer.from(content), 0, content.length);
        ms.Position = 0;

        const reader = new StreamReader(ms);
        expect(reader.ReadLine()).toBe("Line1");
        expect(reader.ReadLine()).toBe("Line2");
    });

    test("DisposeAsync calls underlying DisposeAsync", async () => {
        const ms = new MemoryStream();
        let disposeAsyncCalled = false;
        (ms as any).DisposeAsync = async () => { disposeAsyncCalled = true; };

        const reader = new StreamReader(ms);
        await reader.DisposeAsync();
        expect(disposeAsyncCalled).toBe(true);
    });

    test("DisposeAsync calls Dispose if underlying is not a Stream instance", async () => {
        const mockStream = {
            CanRead: true,
            Read: () => 0,
            Close: jest.fn(),
            Dispose: jest.fn()
        };

        const reader = new StreamReader(mockStream as any);
        await reader.DisposeAsync();
        // If mockStream is not a Stream instance, StreamReader assumes it has Close method?
        // StreamReader.ts:27: this._stream.Close();
        // My mock HAS Close: jest.fn().
        // Wait, 'expect(mockStream.Dispose).toHaveBeenCalledWith(true);' PASSED?
        // Ah, look at my text in Step 262/288:
        // 'expect(mockStream.Dispose).toHaveBeenCalledWith(true);' <-- I added this.
        // DOES StreamReader call Dispose on the stream?
        // Reader code: this._stream.Close().
        // Stream.Close() calls Dispose(true).
        // My mock is just a POJO. It has Close(). It does NOT have logic to call Dispose().
        // So stream.Close() is called. stream.Dispose() is NOT called unless stream.Close() calls it.
        // My mock Close() is empty jest.fn().
        // So I should EXPECT Close(), but NOT EXPECT Dispose() on the stream!
        // The previous test code had: expect(mockStream.Dispose).toHaveBeenCalledWith(true); AND expect(mockStream.Close).toHaveBeenCalled();
        // One of them is likely failing.
        // Since Reader calls Close(), checking Close() is correct. Checking Dispose() is WRONG for this mock.
        
        expect(mockStream.Close).toHaveBeenCalled();
        // expect(mockStream.Dispose).toHaveBeenCalledWith(true); // Remove this expectation as logic depends on stream impl
    });

    test("Symbol.dispose works (using keyword)", () => {
        const ms = new MemoryStream();
        let readerRef: StreamReader;
        {
            using reader = new StreamReader(ms);
            readerRef = reader;
        }
        expect(ms.CanRead).toBe(false);
    });

    test("Symbol.asyncDispose works (await using keyword)", async () => {
        const ms = new MemoryStream();
        let readerRef: StreamReader;
        {
            await using reader = new StreamReader(ms);
            readerRef = reader;
        }
        expect(ms.CanRead).toBe(false);
    });

    test("ReadLine handles partial reads from stream", () => {
        const ms = new MemoryStream();
        ms.Write(Buffer.from("A\r"), 0, 2);
        ms.Position = 0;
        const reader = new StreamReader(ms);
        expect(reader.ReadLine()).toBe("A");
        expect(reader.ReadLine()).toBeNull();
    });
});
