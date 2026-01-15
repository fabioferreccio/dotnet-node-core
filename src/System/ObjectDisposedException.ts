import { Exception } from "../Domain/SeedWork/Exception";

export class ObjectDisposedException extends Exception {
    public readonly ObjectName?: string;

    constructor(objectName?: string, message?: string) {
        super(message || "Cannot access a disposed object.");
        this.ObjectName = objectName;
    }
}
