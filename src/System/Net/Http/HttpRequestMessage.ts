import { HttpMethod } from "./HttpMethod";
import { HttpContent } from "./HttpContent";
import { HttpRequestHeaders } from "./Headers/HttpRequestHeaders";
import { Version } from "../../Version";
import { CsString } from "../../../System/Types";
import { IDisposable } from "../../../Domain/Interfaces";

export class HttpRequestMessage implements IDisposable {
    private readonly _headers: HttpRequestHeaders;
    private _method: HttpMethod;
    private _requestUri: CsString | null;
    private _version: Version;
    private _content: HttpContent | null;
    private _disposed: boolean = false;

    public get Headers(): HttpRequestHeaders {
        return this._headers;
    }

    public get Method(): HttpMethod {
        return this._method;
    }
    public set Method(value: HttpMethod) {
        this._method = value;
    }

    public get RequestUri(): CsString | null {
        return this._requestUri;
    }
    public set RequestUri(value: CsString | null) {
        this._requestUri = value;
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

    constructor(method: HttpMethod = HttpMethod.Get, requestUri: string | CsString | null = null) {
        this._headers = new HttpRequestHeaders();
        this._method = method;
        this._version = new Version(1, 1);
        this._content = null;

        if (typeof requestUri === "string") {
            this._requestUri = CsString.From(requestUri);
        } else {
            this._requestUri = requestUri;
        }
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
