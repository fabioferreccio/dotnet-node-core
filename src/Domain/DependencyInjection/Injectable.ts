import "reflect-metadata";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Injectable(): (target: new (...args: any[]) => any) => void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (target: new (...args: any[]) => any) => {
        // This decorator forces TypeScript to emit metadata
        // specifically "design:paramtypes" which is used for auto-resolution.
        // No runtime logic needed here, the existence of the decorator is enough.
        // However, we might want to tag it as "Injectable" for validation later.
        Reflect.defineMetadata("di:injectable", true, target);
    };
}
