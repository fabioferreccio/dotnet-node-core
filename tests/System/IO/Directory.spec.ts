import { Directory } from "../../../src/System/IO/Directory";
import { File } from "../../../src/System/IO/File";
import { DirectoryNotFoundException } from "../../../src/System/IO/DirectoryNotFoundException";
import * as path from "path";
import * as fs from "fs";

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

    test("Delete throws IOException (or Error) when recursive is false and dir not empty", () => {
        const subDir = path.join(TEST_DIR, "delete_fail");
        Directory.CreateDirectory(subDir);
        File.WriteAllText(path.join(subDir, "file.txt"), "data");
        
        expect(() => Directory.Delete(subDir, false)).toThrow(); // Node usually throws ENOTEMPTY
    });
    
    test("Private constructor throws", () => {
         // @ts-ignore
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
