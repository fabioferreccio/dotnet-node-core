export interface IDisposable {
    Dispose(): void;

    [Symbol.dispose](): void;
}
