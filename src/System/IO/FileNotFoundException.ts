import { IOException } from "./IOException";

export class FileNotFoundException extends IOException {
    public readonly FileName?: string;

    constructor(message: string, fileName?: string, innerException?: Error | unknown) {
        super(message, innerException);
        this.FileName = fileName;
    }
}
