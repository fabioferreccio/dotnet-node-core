import * as fs from "fs";
import * as nodePath from "path";
import { DirectoryNotFoundException } from "./DirectoryNotFoundException";
import { Exception } from "../../Domain/SeedWork";
import { Task } from "../../Domain/Threading/Tasks/Task";

export class Directory {
    public static Exists(path: string): boolean {
        return fs.existsSync(path) && fs.statSync(path).isDirectory();
    }

    public static CreateDirectory(path: string): void {
        if (!Directory.Exists(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
    }

    public static Delete(path: string, recursive: boolean = false): void {
        if (!Directory.Exists(path)) {
            throw new DirectoryNotFoundException(`Could not find a part of the path '${path}'.`);
        }
        if (recursive) {
            fs.rmSync(path, { recursive: true, force: true });
        } else {
            fs.rmdirSync(path);
        }
    }

    public static GetFiles(path: string, searchPattern?: string): string[] {
        if (!Directory.Exists(path)) {
            throw new DirectoryNotFoundException(`Could not find a part of the path '${path}'.`);
        }

        const files = fs.readdirSync(path);

        // Simple Wildcard Implementation
        if (searchPattern) {
            // Escape special regex chars but allow *
            const regexString = "^" + searchPattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$";
            const regex = new RegExp(regexString);
            return files.filter((file) => regex.test(file)).map((file) => nodePath.join(path, file));
        }

        return files.map((file) => nodePath.join(path, file));
    }

    public static async ExistsAsync(path: string): Task<boolean> {
        try {
            const stat = await fs.promises.stat(path);
            return stat.isDirectory();
        } catch {
            return false;
        }
    }

    public static async CreateDirectoryAsync(path: string): Task<void> {
        if (!(await Directory.ExistsAsync(path))) {
            await fs.promises.mkdir(path, { recursive: true });
        }
    }

    public static async DeleteAsync(path: string, recursive: boolean = false): Task<void> {
        if (!(await Directory.ExistsAsync(path))) {
            throw new DirectoryNotFoundException(`Could not find a part of the path '${path}'.`);
        }
        if (recursive) {
            await fs.promises.rm(path, { recursive: true, force: true });
        } else {
            await fs.promises.rmdir(path);
        }
    }

    public static async GetFilesAsync(path: string, searchPattern?: string): Task<string[]> {
        if (!(await Directory.ExistsAsync(path))) {
            throw new DirectoryNotFoundException(`Could not find a part of the path '${path}'.`);
        }

        const files = await fs.promises.readdir(path);

        // Simple Wildcard Implementation
        if (searchPattern) {
            // Escape special regex chars but allow *
            const regexString = "^" + searchPattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") + "$";
            const regex = new RegExp(regexString);
            return files.filter((file) => regex.test(file)).map((file) => nodePath.join(path, file));
        }

        return files.map((file) => nodePath.join(path, file));
    }

    private constructor() {
        throw new Exception("Directory is a static class.");
    }
}
