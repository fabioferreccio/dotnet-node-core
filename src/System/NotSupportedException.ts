import { Exception } from "../Domain/SeedWork/Exception";

export class NotSupportedException extends Exception {
    constructor(message: string = "Specified method is not supported.") {
        super(message);
    }
}
