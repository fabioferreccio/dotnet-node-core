import { Stream } from "../../IO/Stream";
import { HttpContentHeaders } from "./Headers/HttpContentHeaders";
import { CsString } from "../../../System/Types";
import { StreamReader } from "../../IO/StreamReader";
import { IDisposable } from "../../../Domain/Interfaces";

export abstract class HttpContent implements IDisposable {
    private readonly _headers: HttpContentHeaders;
    private _disposed: boolean = false;

    public get Headers(): HttpContentHeaders {
        return this._headers;
    }

    constructor() {
        this._headers = new HttpContentHeaders();
    }

    public async ReadAsStringAsync(): Promise<CsString> {
        this.CheckDisposed();
        const stream = await this.ReadAsStreamAsync();
        // Since we are reading the stream, we shouldn't dispose it here if the stream is the content itself?
        // In .NET ReadAsStringAsync buffers the content.
        // For this implementation, we will assume ReadAsStreamAsync returns a stream we can read.

        // We need to use StreamReader.
        // NOTE: If StreamReader disposes the underlying stream, we might have issues if ReadAsStreamAsync returns the backing store.
        // However, usually ReadAsStringAsync reads the whole thing.

        const reader = new StreamReader(stream, "utf-8", true);
        const result = await reader.ReadToEndAsync();
        // Dispose reader?
        // If we dispose reader, it disposes stream.
        // ReadAsStringAsync usually leaves stream open OR disposes it depending on ownership.
        // We will leave it for now or prefer disposing reader if we own it.
        reader.Dispose();

        return CsString.From(result);
    }

    public abstract ReadAsStreamAsync(): Promise<Stream>;

    protected abstract SerializeToStreamAsync(stream: Stream, context?: unknown): Promise<void>;

    public Dispose(): void {
        if (!this._disposed) {
            this._disposed = true;
            this.DisposeInternal(true);
        }
    }

    public [Symbol.dispose](): void {
        this.Dispose();
    }

    protected DisposeInternal(_disposing: boolean): void {
        // Override in children
        void _disposing;
    }

    protected CheckDisposed(): void {
        if (this._disposed) {
            throw new Error("ObjectDisposedException: HttpContent");
        }
    }
}
