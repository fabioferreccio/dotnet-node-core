import { BindingContext } from "./BindingContext";
import { Command } from "./Command";
import { IServiceProvider } from "../../Domain/Interfaces/IServiceProvider";

/**
 * Represents the execution environment for a command.
 * @experimental This API is in preview and may change.
 */
export class InvocationContext {
    private readonly _bindingContext: BindingContext;
    private readonly _command: Command;
    private readonly _services: IServiceProvider;

    public constructor(bindingContext: BindingContext, command: Command, services: IServiceProvider) {
        this._bindingContext = bindingContext;
        this._command = command;
        this._services = services;
        Object.freeze(this);
    }

    /**
     * Gets the binding context for the invocation.
     */
    public get BindingContext(): BindingContext {
        return this._bindingContext;
    }

    /**
     * Gets the command being executed.
     */
    public get Command(): Command {
        return this._command;
    }

    /**
     * Gets the service provider for the invocation.
     */
    public get Services(): IServiceProvider {
        return this._services;
    }
}
