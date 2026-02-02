import "reflect-metadata";

export function Injectable(): ClassDecorator {
    return (target: object) => {
        // This decorator forces TypeScript to emit metadata
        // specifically "design:paramtypes" which is used for auto-resolution.
        // No runtime logic needed here, the existence of the decorator is enough.
        // However, we might want to tag it as "Injectable" for validation later.
        Reflect.defineMetadata("di:injectable", true, target);
    };
}
