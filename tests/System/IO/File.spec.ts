import { File } from "../../../src/System/IO/File";
import { FileNotFoundException } from "../../../src/System/IO/FileNotFoundException";
import * as path from "path";
import * as fs from "fs";

const TEST_DIR = path.join(__dirname, "file_tests");
const TEST_FILE = path.join(TEST_DIR, "test.txt");

describe("File", () => {
    beforeAll(() => {
        if (!File.Exists(TEST_DIR)) {
            // Use fs really or File.Exists? File.Exists wraps fs.existsSync
            // We need to make dir for verify
            fs.mkdirSync(TEST_DIR, { recursive: true });
        }
    });

    afterEach(() => {
        if (File.Exists(TEST_FILE)) File.Delete(TEST_FILE);
    });

    afterAll(() => {
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
    });

    test("Negative Tests: ReadAllText throws FileNotFoundException", () => {
        const missing = path.join(TEST_DIR, "missing.txt");
        expect(() => File.ReadAllText(missing)).toThrow(FileNotFoundException);
    });

    test("Negative Tests: Copy throws FileNotFoundException for missing source", () => {
        const missing = path.join(TEST_DIR, "missing_src.txt");
        const dest = path.join(TEST_DIR, "dest.txt");
        expect(() => File.Copy(missing, dest)).toThrow(FileNotFoundException);
    });

    test("Negative Tests: Move throws FileNotFoundException for missing source", () => {
        const missing = path.join(TEST_DIR, "missing_move.txt");
        const dest = path.join(TEST_DIR, "dest_move.txt");
        expect(() => File.Move(missing, dest)).toThrow(FileNotFoundException);
    });

    test("Copy throws Error if destination exists and overwrite false (EEXIST)", () => {
        File.WriteAllText(TEST_FILE, "content");
        const dest = path.join(TEST_DIR, "dest_exist.txt");
        File.WriteAllText(dest, "existing");

        expect(() => File.Copy(TEST_FILE, dest, false)).toThrow(/already exists/);

        File.Delete(dest);
    });

    test("Private constructor throws", () => {
        // @ts-expect-error Testing private constructor
        expect(() => new File()).toThrow("File is a static class.");
    });

    test("WriteAllTextAsync and ReadAllTextAsync work correctly", async () => {
        const pathAsync = path.join(TEST_DIR, "async_test.txt");
        await File.WriteAllTextAsync(pathAsync, "Hello Async");

        expect(await File.ExistsAsync(pathAsync)).toBe(true);
        const content = await File.ReadAllTextAsync(pathAsync);
        expect(content.toString()).toBe("Hello Async");

        await File.DeleteAsync(pathAsync);
        expect(await File.ExistsAsync(pathAsync)).toBe(false);
    });

    test("CopyAsync works correctly", async () => {
        const src = path.join(TEST_DIR, "src_async.txt");
        const dest = path.join(TEST_DIR, "dest_async.txt");
        await File.WriteAllTextAsync(src, "copy me");

        await File.CopyAsync(src, dest);

        expect(await File.ExistsAsync(dest)).toBe(true);
        expect((await File.ReadAllTextAsync(dest)).toString()).toBe("copy me");

        // Overwrite false throws
        await expect(File.CopyAsync(src, dest, false)).rejects.toThrow();

        // Overwrite true works
        await File.WriteAllTextAsync(src, "new content");
        await File.CopyAsync(src, dest, true);
        expect((await File.ReadAllTextAsync(dest)).toString()).toBe("new content");
    });

    test("MoveAsync works correctly", async () => {
        const src = path.join(TEST_DIR, "move_src_async.txt");
        const dest = path.join(TEST_DIR, "move_dest_async.txt");
        await File.WriteAllTextAsync(src, "move me");

        await File.MoveAsync(src, dest);

        expect(await File.ExistsAsync(src)).toBe(false);
        expect(await File.ExistsAsync(dest)).toBe(true);
        expect((await File.ReadAllTextAsync(dest)).toString()).toBe("move me");
    });

    test("ReadAllTextAsync throws FileNotFoundException", async () => {
        const missing = path.join(TEST_DIR, "missing_async.txt");
        await expect(File.ReadAllTextAsync(missing)).rejects.toThrow(FileNotFoundException);
    });
});
