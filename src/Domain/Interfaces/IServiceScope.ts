import { IServiceProvider } from "./IServiceProvider";

export interface IServiceScope {
    /**
     * The IServiceProvider used to resolve dependencies from the scope.
     */
    readonly ServiceProvider: IServiceProvider;

    /**
     * Perlforms application-defined tasks associated with freeing, releasing, or resetting unmanaged resources.
     */
    Dispose(): void;
}

export interface IServiceScopeFactory {
    /**
     * Create an IServiceScope which contains an IServiceProvider used to resolve dependencies from a newly created scope.
     */
    CreateScope(): IServiceScope;
}
