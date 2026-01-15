import * as fs from "fs";
import * as path from "path";
import { File } from "../../../src/System/IO/File";
import { Directory } from "../../../src/System/IO/Directory";
import { Path } from "../../../src/System/IO/Path";
import { FileNotFoundException } from "../../../src/System/IO/FileNotFoundException";
import { DirectoryNotFoundException } from "../../../src/System/IO/DirectoryNotFoundException";

const TEST_DIR = path.join(__dirname, "test_temp_io");

describe("System.IO Integration Tests", () => {
    // Setup: Create temp dir
    beforeAll(() => {
        if (!fs.existsSync(TEST_DIR)) {
            fs.mkdirSync(TEST_DIR);
        }
    });

    // Teardown: Delete temp dir
    afterAll(() => {
        if (fs.existsSync(TEST_DIR)) {
            // Using Node's internal recursive delete to be safe in cleanup
            fs.rmSync(TEST_DIR, { recursive: true, force: true });
        }
    });

    // Cleanup between tests? Or let them operate on unique files?
    // Safer to clean specific files within tests or use unique names.

    test("Path.Combine joins paths correctly", () => {
        const result = Path.Combine("a", "b", "c.txt");
        // Normalize for OS (Windows use \, Linux /)
        const expected = path.join("a", "b", "c.txt");
        expect(result).toBe(expected);
    });

    test("Path.GetExtension returns extension", () => {
        expect(Path.GetExtension("file.txt")).toBe(".txt");
        expect(Path.GetExtension("file")).toBe("");
    });

    test("File.WriteAllText creates file and File.Exists returns true", () => {
        const filePath = Path.Combine(TEST_DIR, "write_test.txt");
        const content = "Hello World";

        File.WriteAllText(filePath, content);

        expect(File.Exists(filePath)).toBe(true);
        expect(fs.existsSync(filePath)).toBe(true);
    });

    test("File.ReadAllText reads content correctly", () => {
        const filePath = Path.Combine(TEST_DIR, "read_test.txt");
        const content = "Read Me";
        File.WriteAllText(filePath, content);

        const readBack = File.ReadAllText(filePath);
        expect(readBack).toBe(content);
    });

    test("File.ReadAllText throws FileNotFoundException for missing file", () => {
        const filePath = Path.Combine(TEST_DIR, "missing.txt");

        expect(() => File.ReadAllText(filePath)).toThrow(FileNotFoundException);
        try {
            File.ReadAllText(filePath);
        } catch (e) {
            expect(e).toBeInstanceOf(FileNotFoundException);
            if (e instanceof FileNotFoundException) {
                expect(e.Message).toContain("Could not find file");
                expect(e.FileName).toBe(filePath);
            }
        }
    });

    test("File.Delete removes file", () => {
        const filePath = Path.Combine(TEST_DIR, "delete_test.txt");
        File.WriteAllText(filePath, "data");
        expect(File.Exists(filePath)).toBe(true);

        File.Delete(filePath);
        expect(File.Exists(filePath)).toBe(false);
    });

    test("File.Copy copies file", () => {
        const src = Path.Combine(TEST_DIR, "src.txt");
        const dst = Path.Combine(TEST_DIR, "dst.txt");
        File.WriteAllText(src, "copy me");

        File.Copy(src, dst);
        expect(File.Exists(dst)).toBe(true);
        expect(File.ReadAllText(dst)).toBe("copy me");
    });

    test("File.Move moves file", () => {
        const src = Path.Combine(TEST_DIR, "move_src.txt");
        const dst = Path.Combine(TEST_DIR, "move_dst.txt");
        File.WriteAllText(src, "move me");

        File.Move(src, dst);
        expect(File.Exists(src)).toBe(false);
        expect(File.Exists(dst)).toBe(true);
    });

    test("Directory.CreateDirectory creates folder", () => {
        const dirPath = Path.Combine(TEST_DIR, "subdir");
        expect(Directory.Exists(dirPath)).toBe(false);

        Directory.CreateDirectory(dirPath);
        expect(Directory.Exists(dirPath)).toBe(true);
    });

    test("Directory.Delete removes folder", () => {
        const dirPath = Path.Combine(TEST_DIR, "subdir_del");
        Directory.CreateDirectory(dirPath);
        expect(Directory.Exists(dirPath)).toBe(true);

        Directory.Delete(dirPath);
        expect(Directory.Exists(dirPath)).toBe(false);
    });

    test("Directory.GetFiles returns files", () => {
        const dirPath = Path.Combine(TEST_DIR, "search_dir");
        Directory.CreateDirectory(dirPath);
        File.WriteAllText(Path.Combine(dirPath, "a.txt"), "a");
        File.WriteAllText(Path.Combine(dirPath, "b.log"), "b");

        const files = Directory.GetFiles(dirPath);
        expect(files.length).toBe(2);

        // Test wildcards if implemented (simple logic)
        const txtFiles = Directory.GetFiles(dirPath, "*.txt");
        expect(txtFiles.length).toBe(1);
        expect(Path.GetExtension(txtFiles[0])).toBe(".txt");
    });

    test("Directory.Delete throws DirectoryNotFoundException", () => {
        const dirPath = Path.Combine(TEST_DIR, "missing_dir");
        expect(() => Directory.Delete(dirPath)).toThrow(DirectoryNotFoundException);
    });
});
