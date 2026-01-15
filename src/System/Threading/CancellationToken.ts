import { Exception } from "../../Domain/SeedWork";

export class CancellationToken {
    private _isCancellationRequested: boolean;

    constructor(checkForCancellation: boolean = false) {
        this._isCancellationRequested = checkForCancellation;
    }

    public get IsCancellationRequested(): boolean {
        return this._isCancellationRequested;
    }

    public ThrowIfCancellationRequested(): void {
        if (this.IsCancellationRequested) {
            throw new Exception("OperationCancelledException");
        }
    }

    public static get None(): CancellationToken {
        return new CancellationToken(false);
    }
}
