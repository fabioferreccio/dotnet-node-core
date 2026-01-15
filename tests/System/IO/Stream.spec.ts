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
});
