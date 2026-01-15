import { IOException } from "./IOException";

export class DirectoryNotFoundException extends IOException {
    constructor(message: string, innerException?: Error | unknown) {
        super(message, innerException);
    }
}
