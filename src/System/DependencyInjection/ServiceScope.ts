import { IServiceScope, IServiceProvider, IDisposable } from "../../Domain/Interfaces";

export class ServiceScope implements IServiceScope, IDisposable {
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ("Dispose" in this._serviceProvider && typeof (this._serviceProvider as any).Dispose === "function") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (this._serviceProvider as any).Dispose();
            }
        }
    }
}
