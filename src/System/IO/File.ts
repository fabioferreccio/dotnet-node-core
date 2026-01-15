import * as fs from "fs";
import { FileNotFoundException } from "./FileNotFoundException";
import { Exception } from "../../Domain/SeedWork";
import { CsString } from "../../Domain/ValueObjects";
import { Task } from "../../Domain/Threading/Tasks/Task";

export class File {
    public static Exists(path: string): boolean {
        return fs.existsSync(path);
    }

    public static ReadAllText(path: string, encoding: BufferEncoding = "utf-8"): string {
        if (!File.Exists(path)) {
            throw new FileNotFoundException(`Could not find file '${path}'.`, path);
        }
        return fs.readFileSync(path, { encoding });
    }

    public static WriteAllText(path: string, contents: string, encoding: BufferEncoding = "utf-8"): void {
        fs.writeFileSync(path, contents, { encoding });
    }

    public static Delete(path: string): void {
        if (File.Exists(path)) {
            fs.unlinkSync(path);
        }
    }

    public static Copy(sourceFileName: string, destFileName: string, overwrite: boolean = false): void {
        if (!File.Exists(sourceFileName)) {
            throw new FileNotFoundException(`Could not find file '${sourceFileName}'.`, sourceFileName);
        }

        const flags = overwrite ? 0 : fs.constants.COPYFILE_EXCL;
        try {
            fs.copyFileSync(sourceFileName, destFileName, flags);
        } catch (error: unknown) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === "EEXIST") {
                throw new Error(`The file '${destFileName}' already exists.`);
            }
            throw error;
        }
    }

    public static Move(sourceFileName: string, destFileName: string): void {
        if (!File.Exists(sourceFileName)) {
            throw new FileNotFoundException(`Could not find file '${sourceFileName}'.`, sourceFileName);
        }
        fs.renameSync(sourceFileName, destFileName);
    }

    public static async ReadAllTextAsync(path: string): Task<CsString> { 
        try {
            const content = await fs.promises.readFile(path, "utf-8");
            return new CsString(content);
        } catch (error: unknown) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === "ENOENT") {
                throw new FileNotFoundException(`Could not find file '${path}'.`, path);
            }
            throw error;
        }
    }

    public static async WriteAllTextAsync(path: string, contents: string, encoding: BufferEncoding = "utf-8"): Task<void> {
        await fs.promises.writeFile(path, contents, { encoding });
    }

    public static async DeleteAsync(path: string): Task<void> {
        if (await File.ExistsAsync(path)) {
            await fs.promises.unlink(path);
        }
    }

    public static async CopyAsync(sourceFileName: string, destFileName: string, overwrite: boolean = false): Task<void> {
        if (!(await File.ExistsAsync(sourceFileName))) {
            throw new FileNotFoundException(`Could not find file '${sourceFileName}'.`, sourceFileName);
        }

        const flags = overwrite ? 0 : fs.constants.COPYFILE_EXCL;
        try {
            await fs.promises.copyFile(sourceFileName, destFileName, flags);
        } catch (error: unknown) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === "EEXIST") {
                throw new Error(`The file '${destFileName}' already exists.`);
            }
            throw error;
        }
    }

    public static async MoveAsync(sourceFileName: string, destFileName: string): Task<void> {
        if (!(await File.ExistsAsync(sourceFileName))) {
            throw new FileNotFoundException(`Could not find file '${sourceFileName}'.`, sourceFileName);
        }
        await fs.promises.rename(sourceFileName, destFileName);
    }

    public static async ExistsAsync(path: string): Task<boolean> {
        try {
            await fs.promises.access(path);
            return true;
        } catch {
            return false;
        }
    }

    private constructor() {
        throw new Exception("File is a static class.");
    }
}
