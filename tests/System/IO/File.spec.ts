import { File } from "../../../src/System/IO/File";
import { FileNotFoundException } from "../../../src/System/IO/FileNotFoundException";
import * as path from "path";

const TEST_DIR = path.join(__dirname, "file_tests");
const TEST_FILE = path.join(TEST_DIR, "test.txt");

describe("File", () => {
    beforeAll(() => {
        if (!File.Exists(TEST_DIR)) { // Use fs really or File.Exists? File.Exists wraps fs.existsSync
            // We need to make dir for verify
            require("fs").mkdirSync(TEST_DIR, { recursive: true });
        }
    });

    afterEach(() => {
        if (File.Exists(TEST_FILE)) File.Delete(TEST_FILE);
    });
    
    afterAll(() => {
         require("fs").rmSync(TEST_DIR, { recursive: true, force: true });
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
        // @ts-ignore
        expect(() => new File()).toThrow("File is a static class.");
    });
});
