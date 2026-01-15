import { IDisposable, IAsyncDisposable } from "../../Domain/Interfaces";
import { SeekOrigin } from "./FileStream";
import { NotSupportedException } from "../NotSupportedException";
import { Exception } from "../../Domain/SeedWork";
import { Task } from "../../Domain/Threading/Tasks/Task";

export abstract class Stream implements IDisposable, IAsyncDisposable {
    public abstract get CanRead(): boolean;
    public abstract get CanSeek(): boolean;
    public abstract get CanWrite(): boolean;
    public abstract get Length(): number;
    public abstract get Position(): number;
    public abstract set Position(value: number);

    public abstract Flush(): void;
    public abstract Read(buffer: Uint8Array, offset: number, count: number): number;
    public abstract Write(buffer: Uint8Array, offset: number, count: number): void;
    public abstract Seek(offset: number, origin: SeekOrigin): number;
    public abstract SetLength(value: number): void;

    public async FlushAsync(): Task<void> {
        this.Flush();
        return Promise.resolve();
    }

    public async ReadAsync(buffer: Uint8Array, offset: number, count: number): Task<number> {
        return Promise.resolve(this.Read(buffer, offset, count));
    }

    public async WriteAsync(buffer: Uint8Array, offset: number, count: number): Task<void> {
        this.Write(buffer, offset, count);
        return Promise.resolve();
    }

    public Close(): void {
        this.Dispose(true);
    }

    public Dispose(_disposing: boolean = true): void {
        // Implement in subclass if needed
        void _disposing;
    }

    public async DisposeAsync(): Task<void> {
        this.Dispose(true);
        return Promise.resolve();
    }

    // Explicit IDisposable implementation
    public [Symbol.dispose](): void {
        this.Dispose(true);
    }

    public async [Symbol.asyncDispose](): Task<void> {
        await this.DisposeAsync();
    }

    public CopyTo(destination: Stream, bufferSize: number = 81920): void {
        if (!destination) throw new Exception("Destination stream cannot be null.");
        if (!this.CanRead) throw new NotSupportedException("Source stream does not support reading.");
        if (!destination.CanWrite) throw new NotSupportedException("Destination stream does not support writing.");

        const buffer = new Uint8Array(bufferSize);
        let bytesRead: number;
        while ((bytesRead = this.Read(buffer, 0, buffer.length)) > 0) {
            destination.Write(buffer, 0, bytesRead);
        }
    }

    public async CopyToAsync(destination: Stream, bufferSize: number = 81920, cancellationToken?: any): Task<void> {
        if (!destination) throw new Exception("Destination stream cannot be null.");
        if (!this.CanRead) throw new NotSupportedException("Source stream does not support reading.");
        if (!destination.CanWrite) throw new NotSupportedException("Destination stream does not support writing.");

        const buffer = new Uint8Array(bufferSize);
        let bytesRead: number;
        while ((bytesRead = await this.ReadAsync(buffer, 0, buffer.length)) > 0) {
            await destination.WriteAsync(buffer, 0, bytesRead);
        }
    }
}
