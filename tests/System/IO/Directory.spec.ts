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
});
