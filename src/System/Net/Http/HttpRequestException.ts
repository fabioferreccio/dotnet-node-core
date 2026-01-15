import { Exception } from "../../../Domain/SeedWork";

export class HttpRequestException extends Exception {
    public readonly StatusCode: number | null;

    constructor(message: string, statusCode?: number) {
        super(message);
        this.StatusCode = statusCode ?? null;
        Object.setPrototypeOf(this, HttpRequestException.prototype);
    }
}
