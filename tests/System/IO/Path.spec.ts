import { Path } from "../../../src/System/IO/Path";

describe("Path", () => {
    test("Combine joins paths", () => {
        const result = Path.Combine("a", "b", "c");
        // Normalize separators for cross-platform test consistency if needed, but path.join handles it.
        // On Windows it will be a\b\c
        expect(result).toMatch(/a[\\/]b[\\/]c/);
    });

    test("GetExtension returns extension", () => {
        expect(Path.GetExtension("file.txt")).toBe(".txt");
        expect(Path.GetExtension("archive.tar.gz")).toBe(".gz"); // Node path.extname returns last extension
        expect(Path.GetExtension("no_ext")).toBe("");
        expect(Path.GetExtension(".dotfile")).toBe("");
    });

    test("GetFileName returns file name", () => {
        expect(Path.GetFileName("/path/to/file.txt")).toBe("file.txt");
        expect(Path.GetFileName("file.txt")).toBe("file.txt");
        expect(Path.GetFileName("C:\\path\\to\\file.txt")).toBe("file.txt");
    });

    test("GetFileNameWithoutExtension returns correct name", () => {
        expect(Path.GetFileNameWithoutExtension("/path/to/file.txt")).toBe("file");
        expect(Path.GetFileNameWithoutExtension("file.tar.gz")).toBe("file.tar"); // Node behavior
        expect(Path.GetFileNameWithoutExtension("file")).toBe("file");
    });

    test("GetDirectoryName returns directory", () => {
        expect(Path.GetDirectoryName("/path/to/file.txt")).toBe("/path/to");
        expect(Path.GetDirectoryName("C:\\path\\to\\file.txt")).toBe("C:\\path\\to");
    });

    test("GetFullPath resolves path", () => {
        const full = Path.GetFullPath("file.txt");
        expect(full).toContain("file.txt");
        expect(full.length).toBeGreaterThan("file.txt".length);
    });

    test("Private constructor throws", () => {
        // @ts-expect-error Testing private constructor
        expect(() => new Path()).toThrow("Path is a static class.");
    });
});
