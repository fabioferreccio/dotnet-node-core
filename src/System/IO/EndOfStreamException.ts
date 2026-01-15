import { IOException } from "./IOException";

export class EndOfStreamException extends IOException {
    constructor(message: string = "Unable to read beyond the end of the stream.") {
        super(message);
    }
}
