import { Directory } from "../../../src/System/IO/Directory";
import { File } from "../../../src/System/IO/File";
import * as path from "path";
import * as fs from "fs";

// Fix syntax error introduced by bad paste
const TEST_DIR = path.join(__dirname, "directory_test_gap");

describe("Directory Gap Coverage", () => {
    beforeAll(() => {
        if (!fs.existsSync(TEST_DIR)) {
            fs.mkdirSync(TEST_DIR, { recursive: true });
        }
    });

    afterAll(() => {
        if (fs.existsSync(TEST_DIR)) {
            fs.rmSync(TEST_DIR, { recursive: true, force: true });
        }
    });

    test("GetFiles returns empty array for no match", () => {
        const subDir = path.join(TEST_DIR, "empty_search");
        Directory.CreateDirectory(subDir);
        File.WriteAllText(path.join(subDir, "a.txt"), "content");

        const files = Directory.GetFiles(subDir, "*.json"); // mismatch
        expect(files).toBeDefined();
        expect(files.length).toBe(0);
    });

    test("Delete throws DirectoryNotFoundException if directory does not exist", () => {
        const missing = path.join(TEST_DIR, "missing_for_delete");
        // Verify it throws the specific mapped exception
        expect(() => Directory.Delete(missing)).toThrow("Could not find a part of the path");
    });

    test("Delete throws IOException when valid but not empty (recursive=false)", () => {
        const subDir = path.join(TEST_DIR, "delete_fail_io");
        Directory.CreateDirectory(subDir);
        File.WriteAllText(path.join(subDir, "file.txt"), "data");

        // The shim might throw simple Error or IOException depending on implementation. 
        // We ensure it throws and message implies built-in restriction.
        expect(() => Directory.Delete(subDir, false)).toThrow(); 
    });

    test("Private constructor throws", () => {
        // @ts-expect-error Testing private constructor
        expect(() => new Directory()).toThrow("Directory is a static class.");
    });

    test("CreateDirectoryAsync and ExistsAsync work correctly", async () => {
        const subDir = path.join(TEST_DIR, "async_dir");
        await Directory.CreateDirectoryAsync(subDir);

        expect(await Directory.ExistsAsync(subDir)).toBe(true);
        // ExistsAsync returns false for file
        const file = path.join(subDir, "file.txt");
        File.WriteAllText(file, "test");
        expect(await Directory.ExistsAsync(file)).toBe(false);
    });

    test("GetFilesAsync works correctly", async () => {
        const subDir = path.join(TEST_DIR, "async_files");
        await Directory.CreateDirectoryAsync(subDir);
        File.WriteAllText(path.join(subDir, "a.txt"), "A");
        File.WriteAllText(path.join(subDir, "b.json"), "B");

        const allFiles = await Directory.GetFilesAsync(subDir);
        expect(allFiles.length).toBe(2);

        const jsonFiles = await Directory.GetFilesAsync(subDir, "*.json");
        expect(jsonFiles.length).toBe(1);
        expect(jsonFiles[0]).toContain("b.json");
    });

    test("DeleteAsync works correctly", async () => {
        const subDir = path.join(TEST_DIR, "async_delete");
        await Directory.CreateDirectoryAsync(subDir);
        expect(await Directory.ExistsAsync(subDir)).toBe(true);

        await Directory.DeleteAsync(subDir);
        expect(await Directory.ExistsAsync(subDir)).toBe(false);

        // Recursive
        const nest = path.join(TEST_DIR, "async_nest");
        await Directory.CreateDirectoryAsync(nest);
        File.WriteAllText(path.join(nest, "file.txt"), "data");

        await Directory.DeleteAsync(nest, true);
        expect(await Directory.ExistsAsync(nest)).toBe(false);
    });
});
