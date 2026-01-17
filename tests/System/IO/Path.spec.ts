import { Path } from "../../../src/System/IO/Path";
import * as path from "path";

describe("Path", () => {
    test("Combine joins paths", () => {
        const result = Path.Combine("a", "b", "c");
        const expected = path.join("a", "b", "c");
        expect(result).toBe(expected);
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
    });

    test("GetFileNameWithoutExtension returns correct name", () => {
        expect(Path.GetFileNameWithoutExtension("/path/to/file.txt")).toBe("file");
        expect(Path.GetFileNameWithoutExtension("file.tar.gz")).toBe("file.tar"); // Node behavior
        expect(Path.GetFileNameWithoutExtension("file")).toBe("file");
    });

    test("GetDirectoryName returns directory", () => {
        const input = "/path/to/file.txt";
        const expected = path.dirname(input);
        expect(Path.GetDirectoryName(input)).toBe(expected);
    });

    test("GetFullPath resolves path", () => {
        const input = "file.txt";
        const result = Path.GetFullPath(input);
        const expected = path.resolve(input);

        expect(result).toBe(expected);
    });

    test("Private constructor throws", () => {
        // @ts-expect-error Testing private constructor
        expect(() => new Path()).toThrow("Path is a static class.");
    });
});
