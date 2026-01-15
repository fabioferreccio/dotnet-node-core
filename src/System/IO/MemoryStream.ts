import { Stream } from "./Stream";
import { ObjectDisposedException } from "../ObjectDisposedException";
import { NotSupportedException } from "../NotSupportedException";
import { IOException } from "./IOException";
import { SeekOrigin } from "./FileStream";

export class MemoryStream extends Stream {
    private _buffer: Uint8Array;
    private _capacity: number;
    private _length: number;
    private _position: number;
    private _isOpen: boolean;
    private _expandable: boolean;

    constructor(capacity: number = 0) {
        super();
        this._buffer = new Uint8Array(capacity);
        this._capacity = capacity;
        this._length = 0;
        this._position = 0;
        this._isOpen = true;
        this._expandable = true;
    }

    public get CanRead(): boolean {
        return this._isOpen;
    }
    public get CanSeek(): boolean {
        return this._isOpen;
    }
    public get CanWrite(): boolean {
        return this._isOpen;
    }

    public get Length(): number {
        this.EnsureNotDisposed();
        return this._length;
    }

    public get Position(): number {
        this.EnsureNotDisposed();
        return this._position;
    }

    public set Position(value: number) {
        this.EnsureNotDisposed();
        if (value < 0) throw new IOException("Position cannot be negative.");
        // Allowing position > length is valid in .NET (it expands on write)
        this._position = value;
    }

    public get Capacity(): number {
        return this._capacity;
    }

    public set Capacity(value: number) {
        this.EnsureNotDisposed();
        if (value < this._length) throw new IOException("Capacity cannot be less than current length.");
        if (value !== this._capacity) {
            const newBuffer = new Uint8Array(value);
            if (this._length > 0) {
                newBuffer.set(this._buffer.subarray(0, this._length));
            }
            this._buffer = newBuffer;
            this._capacity = value;
        }
    }

    public Flush(): void {
        this.EnsureNotDisposed();
        // MemoryStream flush does nothing
    }

    public Read(buffer: Uint8Array, offset: number, count: number): number {
        this.EnsureNotDisposed();
        if (offset < 0 || count < 0) throw new IOException("Offset and count must be non-negative.");
        if (buffer.length - offset < count) throw new IOException("Invalid offset/count.");

        const n = this._length - this._position;
        if (n <= 0) return 0;

        let toRead = count;
        if (toRead > n) toRead = n;

        if (toRead <= 0) return 0;

        const slice = this._buffer.subarray(this._position, this._position + toRead);
        buffer.set(slice, offset);
        this._position += toRead;

        return toRead;
    }

    public Write(buffer: Uint8Array, offset: number, count: number): void {
        this.EnsureNotDisposed();
        if (offset < 0 || count < 0) throw new IOException("Offset and count must be non-negative.");
        if (buffer.length - offset < count) throw new IOException("Invalid offset/count.");

        const i = this._position + count;
        if (i > this._length) {
            if (i > this._capacity) {
                this.EnsureCapacity(i);
            }
            this._length = i;
        }

        const slice = buffer.subarray(offset, offset + count);
        this._buffer.set(slice, this._position);
        this._position = i;
    }

    public Seek(offset: number, origin: SeekOrigin): number {
        this.EnsureNotDisposed();
        let tempPos: number;

        switch (origin) {
            case SeekOrigin.Begin:
                tempPos = offset;
                break;
            case SeekOrigin.Current:
                tempPos = this._position + offset;
                break;
            case SeekOrigin.End:
                tempPos = this._length + offset;
                break;
            default:
                throw new IOException("Invalid seek origin.");
        }

        if (tempPos < 0) throw new IOException("Seek before begin.");
        this._position = tempPos;
        return this._position;
    }

    public SetLength(value: number): void {
        this.EnsureNotDisposed();
        if (value < 0) throw new IOException("Length cannot be negative.");
        this.EnsureCapacity(value);
        this._length = value;
        if (this._position > value) this._position = value;
    }

    public override Dispose(disposing: boolean): void {
        if (disposing) {
            this._isOpen = false;
            this._expandable = false;
        }
    }

    public ToArray(): Uint8Array {
        const copy = new Uint8Array(this._length);
        copy.set(this._buffer.subarray(0, this._length));
        return copy;
    }

    private EnsureNotDisposed(): void {
        if (!this._isOpen) throw new ObjectDisposedException("MemoryStream");
    }

    private EnsureCapacity(value: number): void {
        if (value > this._capacity) {
            if (!this._expandable) throw new NotSupportedException("MemoryStream is is not expandable.");
            let newCapacity = value;
            if (newCapacity < 256) newCapacity = 256;
            if (newCapacity < this._capacity * 2) newCapacity = this._capacity * 2;
            this.Capacity = newCapacity;
        }
    }
}
