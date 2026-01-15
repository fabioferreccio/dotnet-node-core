export class Exception extends Error {
    public readonly InnerException?: Error | unknown;

    constructor(message: string, innerException?: Error | unknown) {
        super(message, { cause: innerException });
        this.InnerException = innerException;
        this.name = this.constructor.name;

        Object.setPrototypeOf(this, new.target.prototype);
    }

    public override toString(): string {
        return `[${this.name}] ${this.message}`;
    }

    public get Message(): string {
        return this.message;
    }
}
