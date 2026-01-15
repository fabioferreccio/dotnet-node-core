import * as nodePath from "path";
import { Exception } from "../../Domain/SeedWork";

export class Path {
    public static Combine(...paths: string[]): string {
        return nodePath.join(...paths);
    }

    public static GetExtension(path: string): string {
        return nodePath.extname(path);
    }

    public static GetFileName(path: string): string {
        return nodePath.basename(path);
    }

    public static GetFileNameWithoutExtension(path: string): string {
        const ext = nodePath.extname(path);
        return nodePath.basename(path, ext);
    }

    public static GetDirectoryName(path: string): string {
        return nodePath.dirname(path);
    }

    public static GetFullPath(path: string): string {
        return nodePath.resolve(path);
    }

    // Prevent instantiation
    private constructor() {
        throw new Exception("Path is a static class.");
    }
}
