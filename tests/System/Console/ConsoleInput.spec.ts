import * as fs from "fs";
import { System } from "../../../src/index";

const { Console, IO } = System;

jest.mock("fs", () => ({
    ...jest.requireActual("fs"),
    readSync: jest.fn(),
    read: jest.fn(),
    openSync: jest.fn(),
    fstatSync: jest.fn().mockReturnValue({ size: 1000 }),
}));

describe("System.Console.In", () => {
    const mockReadSync = fs.readSync as jest.Mock;
    const mockRead = fs.read as any as jest.Mock;
    const mockFstatSync = fs.fstatSync as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockFstatSync.mockReturnValue({ size: 1000 });
    });

    test("should exist and be a singleton instance of StreamReader", () => {
        const input = Console.In;
        expect(input).toBeDefined();
        expect(input).toBeInstanceOf(IO.StreamReader);
        expect(Console.In).toBe(input); // Singleton check
    });

    test("should correctly ReadLine() from standard input (sync)", () => {
        const inputStr = "Hello from stdin\n";
        const buffer = Buffer.from(inputStr);
        let bytesRead = 0;

        // Mock readSync for FD 0
        mockReadSync.mockImplementation((fd, outBuffer, offset, length, _pos) => {
            if (fd !== 0) return 0;
            if (bytesRead >= buffer.length) return 0;

            const toRead = Math.min(length, buffer.length - bytesRead);
            for (let i = 0; i < toRead; i++) {
                outBuffer[offset + i] = buffer[bytesRead + i];
            }
            bytesRead += toRead;
            return toRead;
        });

        const line = Console.In.ReadLine();
        expect(line).toBe("Hello from stdin");
        expect(mockReadSync).toHaveBeenCalledWith(0, expect.any(Uint8Array), 0, 1, null);
    });

    test("should correctly ReadToEndAsync() from standard input (async)", () => {
        const inputStr = "Async Input Data";
        const buffer = Buffer.from(inputStr);
        let bytesRead = 0;

        // Mock read for FD 0
        mockRead.mockImplementation((fd, outBuffer, offset, length, _pos, callback) => {
            if (fd !== 0) {
                callback(null, 0);
                return;
            }

            if (bytesRead >= buffer.length) {
                callback(null, 0);
                return;
            }

            const toRead = Math.min(length, buffer.length - bytesRead);
            for (let i = 0; i < toRead; i++) {
                outBuffer[offset + i] = buffer[bytesRead + i];
            }
            bytesRead += toRead;
            callback(null, toRead);
        });

        return Console.In.ReadToEndAsync().then((content: string) => {
            expect(content).toBe("Async Input Data");
        });
    });

    test("should maintain cursor semantics between reads", () => {
        const inputStr = "Line 1\nLine 2\n";
        const buffer = Buffer.from(inputStr);
        let bytesRead = 0;

        mockReadSync.mockImplementation((fd, outBuffer, offset, length, _pos) => {
            if (fd !== 0) return 0;
            if (bytesRead >= buffer.length) return 0;

            const toRead = Math.min(length, buffer.length - bytesRead);
            for (let i = 0; i < toRead; i++) {
                outBuffer[offset + i] = buffer[bytesRead + i];
            }
            bytesRead += toRead;
            return toRead;
        });

        const line1 = Console.In.ReadLine();
        const line2 = Console.In.ReadLine();

        expect(line1).toBe("Line 1");
        expect(line2).toBe("Line 2");
    });
});
