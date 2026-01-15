import { Stream } from "./Stream";
import { ObjectDisposedException } from "../ObjectDisposedException";
import { IDisposable, IAsyncDisposable } from "../../Domain/Interfaces";
import { Exception } from "../../Domain/SeedWork";
import { Task } from "../../Domain/Threading/Tasks/Task";

export class StreamWriter implements IDisposable, IAsyncDisposable {
    private _stream: Stream;
    private _encoding: string;
    private _isOpen: boolean;
    private _autoFlush: boolean = false;

    constructor(stream: Stream, encoding: string = "utf-8") {
        if (!stream) throw new Exception("Stream cannot be null.");
        if (!stream.CanWrite) throw new Exception("Stream is not writable.");
        this._stream = stream;
        this._encoding = encoding;
        this._isOpen = true;
    }

    public get AutoFlush(): boolean {
        return this._autoFlush;
    }

    public set AutoFlush(value: boolean) {
        this._autoFlush = value;
        if (value) {
            this.Flush();
        }
    }

    public Close(): void {
        this.Dispose(true);
    }

    public Dispose(disposing: boolean = true): void {
        if (disposing && this._isOpen) {
             this.Flush();
             this._isOpen = false;
             this._stream.Close();
        }
    }

    public [Symbol.dispose](): void {
        this.Dispose(true);
    }

    public async DisposeAsync(): Task<void> {
        if (this._stream instanceof Stream) {
            await (this._stream as unknown as IAsyncDisposable).DisposeAsync();
        } else {
             this.Dispose(true);
        }
    }

    public async [Symbol.asyncDispose](): Task<void> {
        await this.DisposeAsync();
    }

    public Flush(): void {
        this.EnsureNotDisposed();
        this._stream.Flush();
    }

    public Write(value: string): void {
        this.EnsureNotDisposed();
        if (!value) return;
        const buffer = Buffer.from(value, this._encoding as BufferEncoding);
        this._stream.Write(buffer, 0, buffer.length);
        if (this._autoFlush) {
            this.Flush();
        }
    }

    public WriteLine(value: string): void {
        this.Write(value + "\r\n"); // Standard windows line ending or use OS specific? .NET defaults to \r\n mostly
    }

    private EnsureNotDisposed(): void {
        if (!this._isOpen) throw new ObjectDisposedException("StreamWriter");
    }
}
