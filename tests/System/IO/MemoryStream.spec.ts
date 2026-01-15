import { MemoryStream } from "../../../src/System/IO/MemoryStream";
import { SeekOrigin } from "../../../src/System/IO/FileStream";

describe("MemoryStream", () => {
    test("Can Write and Read bytes", () => {
        const ms = new MemoryStream();
        const data = new Uint8Array([1, 2, 3]);
        ms.Write(data, 0, 3);

        expect(ms.Position).toBe(3);
        expect(ms.Length).toBe(3);

        ms.Position = 0;
        const readBuffer = new Uint8Array(3);
        const readCount = ms.Read(readBuffer, 0, 3);

        expect(readCount).toBe(3);
        expect(readBuffer[0]).toBe(1);
        expect(readBuffer[2]).toBe(3);
    });

    test("Auto-expands capacity", () => {
        const ms = new MemoryStream(2); // Small capacity
        const data = new Uint8Array([1, 2, 3, 4, 5]);
        ms.Write(data, 0, 5);

        expect(ms.Length).toBe(5);
        expect(ms.Capacity).toBeGreaterThan(2);
    });

    test("Seek works correctly", () => {
        const ms = new MemoryStream();
        const data = new Uint8Array([10, 20, 30]);
        ms.Write(data, 0, 3);

        ms.Seek(-1, SeekOrigin.End);
        expect(ms.Position).toBe(2);

        const buf = new Uint8Array(1);
        ms.Read(buf, 0, 1);
        expect(buf[0]).toBe(30);
    });

    test("Flush does nothing but is callable", () => {
        const ms = new MemoryStream();
        ms.Flush(); // Should not throw
        expect(true).toBe(true);
    });

    test("Getters return correct values", () => {
        const ms = new MemoryStream();
        expect(ms.CanRead).toBe(true);
        expect(ms.CanSeek).toBe(true);
        expect(ms.CanWrite).toBe(true);
        ms.Close();
        expect(ms.CanRead).toBe(false);
    });

    test("Seek throws on invalid origin", () => {
        const ms = new MemoryStream();
        expect(() => ms.Seek(0, 99 as SeekOrigin)).toThrow("Invalid seek origin.");
        expect(() => ms.Seek(-1, SeekOrigin.Begin)).toThrow("Seek before begin.");
    });

    test("Dispose is idempotent", () => {
        const ms = new MemoryStream();
        ms.Dispose(true);
        ms.Dispose(true); // Should be fine
    });
    
    test("SetLength works and updates position", () => {
        const ms = new MemoryStream();
        ms.SetLength(10);
        expect(ms.Length).toBe(10);
        expect(ms.Position).toBe(0);

        ms.Position = 15; // Allowed in .NET
        ms.SetLength(5);
        expect(ms.Length).toBe(5);
        expect(ms.Position).toBe(5); // Should be truncated to length
    });

    test("Capacity validation", () => {
        const ms = new MemoryStream();
        ms.Write(new Uint8Array([1]), 0, 1);
        expect(() => { ms.Capacity = 0; }).toThrow("Capacity cannot be less than current length.");
    });
    
    test("Constructor capacity", () => {
         const ms = new MemoryStream(100);
         expect(ms.Capacity).toBe(100);
         expect(ms.Length).toBe(0);
    });

    test("ToArray returns copy", () => {
        const ms = new MemoryStream();
        ms.Write(new Uint8Array([1, 2]), 0, 2);
        const arr = ms.ToArray();
        arr[0] = 99;
        
        ms.Position = 0;
        const buf = new Uint8Array(1);
        ms.Read(buf, 0, 1);
        expect(buf[0]).toBe(1); // Original should be unchanged
    });
});
