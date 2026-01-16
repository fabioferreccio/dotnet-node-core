import { HttpStatusCode } from "./HttpStatusCode";
import { HttpContent } from "./HttpContent";
import { HttpRequestMessage } from "./HttpRequestMessage";
import { HttpResponseHeaders } from "./Headers/HttpResponseHeaders";
import { Version } from "../../Version";
import { CsString } from "../../../System/Types";
import { HttpRequestException } from "./HttpRequestException";
import { IDisposable } from "../../../Domain/Interfaces";

export class HttpResponseMessage implements IDisposable {
    private readonly _headers: HttpResponseHeaders;
    private _statusCode: HttpStatusCode;
    private _reasonPhrase: CsString;
    private _version: Version;
    private _content: HttpContent | null;
    private _requestMessage: HttpRequestMessage | null;
    private _disposed: boolean = false;

    public get Headers(): HttpResponseHeaders {
        return this._headers;
    }

    public get StatusCode(): HttpStatusCode {
        return this._statusCode;
    }
    public set StatusCode(value: HttpStatusCode) {
        this._statusCode = value;
    }

    public get ReasonPhrase(): CsString {
        return this._reasonPhrase;
    }
    public set ReasonPhrase(value: CsString) {
        this._reasonPhrase = value;
    }

    public get Version(): Version {
        return this._version;
    }
    public set Version(value: Version) {
        this._version = value;
    }

    public get Content(): HttpContent | null {
        return this._content;
    }
    public set Content(value: HttpContent | null) {
        this._content = value;
    }

    public get RequestMessage(): HttpRequestMessage | null {
        return this._requestMessage;
    }
    public set RequestMessage(value: HttpRequestMessage | null) {
        this._requestMessage = value;
    }

    public get IsSuccessStatusCode(): boolean {
        const val = this._statusCode as number;
        return val >= 200 && val <= 299;
    }

    constructor(statusCode: HttpStatusCode = HttpStatusCode.OK) {
        this._headers = new HttpResponseHeaders();
        this._statusCode = statusCode;
        this._version = new Version(1, 1);
        this._content = null;
        this._requestMessage = null;
        this._reasonPhrase = CsString.From(HttpStatusCode[statusCode] || "Unknown");
    }

    public EnsureSuccessStatusCode(): HttpResponseMessage {
        if (!this.IsSuccessStatusCode) {
            throw new HttpRequestException(
                `Response status code does not indicate success: ${this._statusCode as number} (${this._reasonPhrase.toString()}).`,
                this._statusCode as number,
            );
        }
        return this;
    }

    public Dispose(): void {
        this.DisposeInternal(true);
        this._disposed = true;
    }

    public [Symbol.dispose](): void {
        this.Dispose();
    }

    protected DisposeInternal(disposing: boolean): void {
        if (disposing && !this._disposed) {
            if (this._content != null) {
                this._content.Dispose();
                this._content = null;
            }
        }
    }
}
