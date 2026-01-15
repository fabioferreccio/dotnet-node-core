import { Task } from "../Threading/Tasks/Task";

export interface IAsyncDisposable {
    DisposeAsync(): Task<void>;
    [Symbol.asyncDispose](): Task<void>;
}
