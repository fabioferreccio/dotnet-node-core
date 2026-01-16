import { HttpMessageHandler } from "./HttpMessageHandler";
import { HttpClientHandler } from "./HttpClientHandler";
import { HttpRequestHeaders } from "./Headers/HttpRequestHeaders";
import { HttpRequestMessage } from "./HttpRequestMessage";
import { HttpResponseMessage } from "./HttpResponseMessage";
import { HttpContent } from "./HttpContent";
import { HttpMethod } from "./HttpMethod";
import { CancellationToken } from "../../Threading/CancellationToken";
import { Task } from "../../../Domain/Threading/Tasks/Task";
import { CsString } from "../../../System/Types/CsString";
import { CsInt32 } from "../../../System/Types/CsInt32";

export class HttpClient extends HttpMessageHandler {
    private _handler: HttpMessageHandler;
    private _disposeHandler: boolean;
    private _baseAddress: CsString | null = null;
    private _defaultRequestHeaders: HttpRequestHeaders;
    private _timeout: CsInt32; // Milliseconds

    constructor(handler?: HttpMessageHandler) {
        super();
        this._handler = handler ?? new HttpClientHandler();
        this._disposeHandler = !handler; // If we created it, we dispose it
        this._defaultRequestHeaders = new HttpRequestHeaders();
        this._timeout = CsInt32.From(100000); // 100 sec default
    }

    public get BaseAddress(): CsString | null {
        return this._baseAddress;
    }
    public set BaseAddress(value: CsString | null) {
        this._baseAddress = value;
    }

    public get DefaultRequestHeaders(): HttpRequestHeaders {
        return this._defaultRequestHeaders;
    }

    public get Timeout(): CsInt32 {
        return this._timeout;
    }
    public set Timeout(value: CsInt32) {
        this._timeout = value;
    }

    public override async SendAsync(
        request: HttpRequestMessage,
        cancellationToken?: CancellationToken,
    ): Task<HttpResponseMessage> {
        this.CheckDisposed();

        // Merge Default Headers
        for (const [key, values] of this._defaultRequestHeaders) {
            if (!request.Headers.Contains(key)) {
                for (const v of values) {
                    request.Headers.Add(key, v);
                }
            }
        }

        // Base Address Logic
        if (this._baseAddress && !request.RequestUri?.toString().startsWith("http")) {
            const reqUri = request.RequestUri;
            if (reqUri) {
                const uriStr = reqUri.toString();
                if (!uriStr.includes("://")) {
                    request.RequestUri = CsString.From(this._baseAddress.toString() + uriStr);
                }
            } else {
                request.RequestUri = this._baseAddress;
            }
        }

        return this._handler.SendAsync(request, cancellationToken);
    }

    public async GetAsync(requestUri: CsString | string): Task<HttpResponseMessage> {
        return this.SendAsync(new HttpRequestMessage(HttpMethod.Get, requestUri));
    }

    public async PostAsync(requestUri: CsString | string, content: HttpContent): Task<HttpResponseMessage> {
        const msg = new HttpRequestMessage(HttpMethod.Post, requestUri);
        msg.Content = content;
        return this.SendAsync(msg);
    }

    public async PutAsync(requestUri: CsString | string, content: HttpContent): Task<HttpResponseMessage> {
        const msg = new HttpRequestMessage(HttpMethod.Put, requestUri);
        msg.Content = content;
        return this.SendAsync(msg);
    }

    public async DeleteAsync(requestUri: CsString | string): Task<HttpResponseMessage> {
        return this.SendAsync(new HttpRequestMessage(HttpMethod.Delete, requestUri));
    }

    protected override DisposeInternal(disposing: boolean): void {
        if (disposing && this._disposeHandler) {
            this._handler.Dispose();
        }
        super.DisposeInternal(disposing);
    }
}
