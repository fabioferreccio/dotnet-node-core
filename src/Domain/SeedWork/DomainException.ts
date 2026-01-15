import { Exception } from "./Exception";

export class DomainException extends Exception {
    constructor(message: string, innerException?: Error | unknown) {
        super(message, innerException);
    }
}
