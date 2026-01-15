// Polyfill for Symbol.dispose and Symbol.asyncDispose if not present
if (!(Symbol as any).dispose) {
    (Symbol as any).dispose = Symbol("Symbol.dispose");
}
if (!(Symbol as any).asyncDispose) {
    (Symbol as any).asyncDispose = Symbol("Symbol.asyncDispose");
}

import { MemoryStream } from "../../../src/System/IO/MemoryStream";
import { Stream } from "../../../src/System/IO/Stream";
import { NotSupportedException } from "../../../src/System/NotSupportedException";

describe("Stream Base Class (via MemoryStream)", () => {
    test("CopyTo copies data correctly", () => {
        const source = new MemoryStream();
        const dest = new MemoryStream();
        const data = new Uint8Array([1, 2, 3, 4, 5]);

        source.Write(data, 0, 5);
        source.Position = 0;

        source.CopyTo(dest);

        expect(dest.Length).toBe(5);
        expect(dest.ToArray()).toEqual(data);
    });

    test("CopyTo throws if destination is null (mocked check)", () => {
        const source = new MemoryStream();
        expect(() => source.CopyTo(null as unknown as Stream)).toThrow("Destination stream cannot be null.");
    });

    test("CopyTo throws if source is not readable", () => {
        const source = new MemoryStream();
        source.Close(); // Make it unreadable
        const dest = new MemoryStream();
        
        expect(() => {
            // Re-create closed source to be safe
            const s = new MemoryStream();
            s.Close();
            s.CopyTo(dest);
        }).toThrow(NotSupportedException);
    });

    test("CopyTo throws if destination is not writable", () => {
        const source = new MemoryStream();
        const dest = new MemoryStream();
        dest.Close(); // Make it unwritable

        expect(() => source.CopyTo(dest)).toThrow(NotSupportedException);
    });

    test("Explicit dispose() alias calls Close/Dispose", () => {
        const ms = new MemoryStream();
        ms.Dispose();
        expect(ms.CanRead).toBe(false);
    });

    test("Abstract Dispose(boolean) pattern", () => {
        // Mock stream to verify protected Dispose(bool) logic
        class MockStream extends Stream {
            public isDisposed = false;
            public wasDisposing = false;
            
            // Methods required by abstract
            public get CanRead() { return true; }
            public get CanSeek() { return true; }
            public get CanWrite() { return true; }
            public get Length() { return 0; }
            public get Position() { return 0; }
            public set Position(v: number) { }
            public Flush() { }
            public override async FlushAsync() { return super.FlushAsync(); } // Call base
            public Read(buffer: Uint8Array, offset: number, count: number): number { return 0; }
            public override async ReadAsync(buffer: Uint8Array, offset: number, count: number): Promise<number> { return super.ReadAsync(buffer, offset, count); } // Call base
            public Seek(offset: number, origin: number): number { return 0; }
            public SetLength(value: number) { }
            public Write(buffer: Uint8Array, offset: number, count: number) { }
            public override async WriteAsync(buffer: Uint8Array, offset: number, count: number) { return super.WriteAsync(buffer, offset, count); } // Call base

            // Expose protected method
            public override Dispose(disposing: boolean = true) {
                 this.isDisposed = true;
                 this.wasDisposing = disposing;
                 super.Dispose(disposing);
            }
        }

        const s = new MockStream();
        s.Dispose(); // calls Dispose(true)
        expect(s.isDisposed).toBe(true);
        expect(s.wasDisposing).toBe(true);
        
        const s2 = new MockStream();
        // @ts-ignore call protected if needed, but here we override publically or call internal
        // The base Close calls Dispose(true). 
        s2.Close();
        expect(s2.isDisposed).toBe(true);
        expect(s2.wasDisposing).toBe(true);
    });

    test("Base Stream.ReadAsync/WriteAsync/FlushAsync call synchronous counterparts", async () => {
         // MemoryStream does not override these, so it uses Base Stream implementation.
         const ms = new MemoryStream();
         
         // WriteAsync -> Write
         await ms.WriteAsync(new Uint8Array([1, 2]), 0, 2);
         expect(ms.Length).toBe(2);
         
         ms.Position = 0;
         
         // ReadAsync -> Read
         const buffer = new Uint8Array(2);
         const read = await ms.ReadAsync(buffer, 0, 2);
         expect(read).toBe(2);
         expect(buffer[0]).toBe(1);
         expect(buffer[1]).toBe(2);
         
         // FlushAsync -> Flush (No-op in MemoryStream but shouldn't throw)
         await ms.FlushAsync();
    });

    test("Stream.DisposeAsync calls Dispose(true)", async () => {
        let disposed = false;
        class DisposeAsyncStream extends Stream {
            public get CanRead() { return true; }
            public get CanSeek() { return true; }
            public get CanWrite() { return true; }
            public get Length() { return 0; }
            public get Position() { return 0; }
            public set Position(v: number) {}
            public Flush() {}
            public Read(buffer: Uint8Array, offset: number, count: number) { return 0; }
            public Seek(offset: number, origin: number) { return 0; }
            public SetLength(value: number) {}
            public Write(buffer: Uint8Array, offset: number, count: number) {}
            
            public override Dispose(disposing: boolean) {
                if (disposing) disposed = true;
                super.Dispose(disposing);
            }
        }

        const s = new DisposeAsyncStream();
        await s.DisposeAsync();
        expect(disposed).toBe(true);
    });

    test("Stream.Dispose() calls Dispose(true)", () => {
        // Already covered by pattern test, but explicitly:
        const ms = new MemoryStream();
        ms.Dispose();
        expect(ms.CanRead).toBe(false);
    });

    test("Stream[Symbol.dispose] calls Dispose(true)", () => {
        const ms = new MemoryStream();
        {
            using s = ms;
        }
        expect(ms.CanRead).toBe(false);
    });

    test("Stream[Symbol.asyncDispose] calls DisposeAsync", async () => {
        const ms = new MemoryStream();
        {
             await using s = ms;
        }
        expect(ms.CanRead).toBe(false);
    });
});

