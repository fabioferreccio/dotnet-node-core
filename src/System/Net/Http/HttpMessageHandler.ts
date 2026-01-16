import { HttpRequestMessage } from "./HttpRequestMessage";
import { HttpResponseMessage } from "./HttpResponseMessage";
import { CancellationToken } from "../../Threading/CancellationToken";
import { Task } from "../../../Domain/Threading/Tasks/Task";
import { IDisposable } from "../../../Domain/Interfaces";
import { ObjectDisposedException } from "../../ObjectDisposedException";

export abstract class HttpMessageHandler implements IDisposable {
    protected _disposed: boolean = false;

    public abstract SendAsync(
        request: HttpRequestMessage,
        cancellationToken?: CancellationToken,
    ): Task<HttpResponseMessage>;

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
        // Override in subclasses
        void _disposing;
    }

    protected CheckDisposed(): void {
        if (this._disposed) {
            throw new ObjectDisposedException("HttpMessageHandler");
        }
    }
}
