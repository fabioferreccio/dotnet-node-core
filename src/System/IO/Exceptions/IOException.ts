import { Exception } from "../../../Domain/SeedWork/Exception";

export class IOException extends Exception {
    constructor(message: string, innerException?: Error | unknown) {
        super(message, innerException);
    }
}
