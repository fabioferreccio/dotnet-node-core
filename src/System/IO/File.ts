import * as fs from "fs";
import { FileNotFoundException } from "./Exceptions/FileNotFoundException";
import { Exception } from "../../Domain/SeedWork";

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

    private constructor() {
        throw new Exception("File is a static class.");
    }
}
