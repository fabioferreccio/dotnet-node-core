import { IServiceScope, IServiceProvider, IDisposable, IAsyncDisposable } from "../../Domain/Interfaces";
import { Task } from "../../Domain/Threading/Tasks/Task";

export class ServiceScope implements IServiceScope, IDisposable, IAsyncDisposable {
    private readonly _serviceProvider: IServiceProvider;
    private _isDisposed: boolean = false;

    constructor(serviceProvider: IServiceProvider) {
        this._serviceProvider = serviceProvider;
    }

    public get ServiceProvider(): IServiceProvider {
        if (this._isDisposed) {
            throw new Error("Cannot access ServiceProvider of a disposed scope.");
        }
        return this._serviceProvider;
    }

    public Dispose(): void {
        if (!this._isDisposed) {
            this._isDisposed = true;
            // The ServiceProvider inside a scope IS the scoped container.
            // If the ServiceProvider implements Dispose (which it does), we call it.
            const disposable = this._serviceProvider as Partial<IDisposable>;
            if (typeof disposable.Dispose === "function") {
                disposable.Dispose();
            }
        }
    }

    public [Symbol.dispose](): void {
        this.Dispose();
    }

    public async DisposeAsync(): Task<void> {
        this.Dispose();
        return Promise.resolve();
    }

    public async [Symbol.asyncDispose](): Task<void> {
        await this.DisposeAsync();
    }
}
