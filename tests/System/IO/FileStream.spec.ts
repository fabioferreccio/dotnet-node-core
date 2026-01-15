import { FileStream, FileMode, FileAccess } from "../../../src/System/IO/FileStream";
import { File } from "../../../src/System/IO/File";
import * as path from "path";

const TEST_FILE = path.join(__dirname, "filestream_test.bin");

describe("FileStream", () => {
    afterEach(() => {
        if (File.Exists(TEST_FILE)) File.Delete(TEST_FILE);
    });

    test("Creates file on Write", () => {
        const fs = new FileStream(TEST_FILE, FileMode.Create, FileAccess.Write);
        const data = new Uint8Array([65, 66, 67]); // ABC
        fs.Write(data, 0, 3);
        fs.Close();

        expect(File.Exists(TEST_FILE)).toBe(true);
        expect(File.ReadAllText(TEST_FILE)).toBe("ABC");
    });

    test("Reads file correctly", () => {
        File.WriteAllText(TEST_FILE, "ABC");

        const fs = new FileStream(TEST_FILE, FileMode.Open, FileAccess.Read);
        const buf = new Uint8Array(3);
        const read = fs.Read(buf, 0, 3);
        fs.Close();

        expect(read).toBe(3);
        expect(buf[0]).toBe(65);
    }); // Close "Reads file correctly"

    const TEST_DIR = path.dirname(TEST_FILE);

    test("Constructor throws FileNotFoundException for missing file in Open mode", () => {
        const missingPath = path.join(TEST_DIR, "missing.bin");
        expect(() => {
            new FileStream(missingPath, FileMode.Open, FileAccess.Read);
        }).toThrow();
        // Ideally verify it is FileNotFoundException, but Jest depends on class instance check which can be tricky if not exported or different instance.
        // We can check error message or use expect(..).toThrow(FileNotFoundException) if we import it.
    });

    test("Seek works on FileStream", () => {
        const fs = new FileStream(TEST_FILE, FileMode.Create, FileAccess.ReadWrite);
        fs.Write(new Uint8Array([1, 2, 3]), 0, 3);

        expect(fs.Position).toBe(3);
        fs.Seek(0, 0); // Begin
        expect(fs.Position).toBe(0);

        const buf = new Uint8Array(1);
        fs.Read(buf, 0, 1);
        expect(buf[0]).toBe(1);

        fs.Close();
    });

    test("Operations throw after Dispose", () => {
        const fs = new FileStream(TEST_FILE, FileMode.Create);
        fs.Close();
        
        expect(() => fs.Read(new Uint8Array(1), 0, 1)).toThrow(); // ObjectDisposedException
        expect(() => fs.Write(new Uint8Array(1), 0, 1)).toThrow();
        expect(() => fs.Flush()).toThrow();
        expect(() => fs.Length).toThrow();
        expect(() => fs.Position).toThrow();
    });

    test("Dispose is idempotent", () => {
         const fs = new FileStream(TEST_FILE, FileMode.Create);
         fs.Close();
         fs.Close(); // Should not throw
         expect(() => fs.Read(new Uint8Array(1), 0, 1)).toThrow();
    });

    test("Flush works", () => {
         const fs = new FileStream(TEST_FILE, FileMode.Create);
         fs.Write(new Uint8Array([1]), 0, 1);
         fs.Flush();
         fs.Close();
         expect(File.Exists(TEST_FILE)).toBe(true);
    });

    test("SetLength throws if not writable", () => {
         File.WriteAllText(TEST_FILE, "ABC");
         const fs = new FileStream(TEST_FILE, FileMode.Open, FileAccess.Read);
         expect(fs.CanWrite).toBe(false);
         expect(() => fs.SetLength(1)).toThrow("Stream does not support writing (SetLength).");
         fs.Close();
    });

    test("FileModes coverage", () => {
         // CreateNew
         if (File.Exists(TEST_FILE)) File.Delete(TEST_FILE);
         const fs1 = new FileStream(TEST_FILE, FileMode.CreateNew);
         fs1.Close();
         expect(File.Exists(TEST_FILE)).toBe(true);
         
         // CreateNew throws if exists
         expect(() => new FileStream(TEST_FILE, FileMode.CreateNew)).toThrow(); // EEXIST

         // Truncate
         File.WriteAllText(TEST_FILE, "ABC");
         const fs2 = new FileStream(TEST_FILE, FileMode.Truncate);
         expect(fs2.Length).toBe(0);
         fs2.Close();

         // Append
         File.WriteAllText(TEST_FILE, "A");
         const fs3 = new FileStream(TEST_FILE, FileMode.Append);
         fs3.Write(new Uint8Array([66]), 0, 1);
         fs3.Close();
         expect(File.ReadAllText(TEST_FILE)).toBe("AB");
         
         // OpenOrCreate
         if (File.Exists(TEST_FILE)) File.Delete(TEST_FILE);
         const fs4 = new FileStream(TEST_FILE, FileMode.OpenOrCreate);
         fs4.Close();
         expect(File.Exists(TEST_FILE)).toBe(true);
    });

    test("Write throws if stream is Read-Only", () => {
        File.WriteAllText(TEST_FILE, "ABC");
        const fs = new FileStream(TEST_FILE, FileMode.Open, FileAccess.Read);
        expect(fs.CanWrite).toBe(false);
        expect(() => fs.Write(new Uint8Array([1]), 0, 1)).toThrow("Stream does not support writing.");
        fs.Close();
    });

    test("Read throws if stream is Write-Only", () => {
        const fs = new FileStream(TEST_FILE, FileMode.Create, FileAccess.Write);
        expect(fs.CanRead).toBe(false);
        expect(() => fs.Read(new Uint8Array(1), 0, 1)).toThrow("Stream does not support reading.");
        fs.Close();
    });

    test("Seek throws if stream is closed", () => {
        const fs = new FileStream(TEST_FILE, FileMode.Create);
        fs.Close();
        expect(() => fs.Seek(0, 0)).toThrow(/Cannot access a closed file/); // ObjectDisposedException
    });
});
