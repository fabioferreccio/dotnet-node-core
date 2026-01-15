import { Stream } from "./Stream";
import { ObjectDisposedException } from "../ObjectDisposedException";
import { IDisposable, IAsyncDisposable } from "../../Domain/Interfaces";
import { Exception } from "../../Domain/SeedWork";
import { Task } from "../../Domain/Threading/Tasks/Task";

export class StreamReader implements IDisposable, IAsyncDisposable {
    private _stream: Stream;
    private _encoding: string;
    private _isOpen: boolean;

    constructor(stream: Stream, encoding: string = "utf-8") {
        if (!stream) throw new Exception("Stream cannot be null.");
        if (!stream.CanRead) throw new Exception("Stream is not readable.");
        this._stream = stream;
        this._encoding = encoding;
        this._isOpen = true;
    }

    public Close(): void {
        this.Dispose(true);
    }

    public Dispose(disposing: boolean = true): void {
        if (disposing && this._isOpen) {
            this._isOpen = false;
            this._stream.Close();
        }
    }

    public [Symbol.dispose](): void {
        this.Dispose(true);
    }

    public async DisposeAsync(): Task<void> {
        if (this._stream instanceof Stream) {
             await this._stream.DisposeAsync();
        } else {
             this.Dispose(true);
        }
    }

    public async [Symbol.asyncDispose](): Task<void> {
        await this.DisposeAsync();
    }

    public get EndOfStream(): boolean {
        this.EnsureNotDisposed();
        return this._stream.Position >= this._stream.Length;
    }

    public ReadLine(): string | null {
        this.EnsureNotDisposed();
        if (this.EndOfStream) return null;

        // Simple inefficient implementation for now: Read byte by byte until \n
        // Optimize later with buffering.
        const charCodes: number[] = [];
        const buffer = new Uint8Array(1);

        while (true) {
            const bytesRead = this._stream.Read(buffer, 0, 1);
            if (bytesRead === 0) break; // End of stream

            const byte = buffer[0];
            if (byte === 13) {
                // \r
                // Check next for \n
                const pos = this._stream.Position;
                const nRead = this._stream.Read(buffer, 0, 1);
                if (nRead > 0 && buffer[0] === 10) {
                    // Consumed \n
                } else {
                    // Backtrack if not \n (generic approach, though \r usually implies \n or EOL)
                    // But Standard: \r\n, or \n, or \r.
                    // If just \r, we treat as EOL.
                    // If we read something else, we put it back? Seek back.
                    if (nRead > 0) this._stream.Position = pos;
                }
                break;
            }
            if (byte === 10) {
                // \n
                break;
            }
            charCodes.push(byte);
        }

        if (charCodes.length === 0 && this.EndOfStream) return null; // Logic check: if we hit EOF immediately
        // Wait, if we read bytes then hit EOF, we return string.

        return Buffer.from(charCodes).toString(this._encoding as BufferEncoding);
    }

    public ReadToEnd(): string {
        this.EnsureNotDisposed();
        const len = this._stream.Length - this._stream.Position;
        if (len <= 0) return "";

        const buffer = new Uint8Array(len);
        this._stream.Read(buffer, 0, len);
        return Buffer.from(buffer).toString(this._encoding as BufferEncoding);
    }

    private EnsureNotDisposed(): void {
        if (!this._isOpen) throw new ObjectDisposedException("StreamReader");
    }
}
