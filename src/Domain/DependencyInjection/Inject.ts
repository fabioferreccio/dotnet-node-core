import "reflect-metadata";

/**
 * Metadata key for parameter injection tokens.
 */
export const INJECT_METADATA_KEY = "di:inject";

/**
 * Decorator for constructor parameters to specify a manual injection token.
 * This is useful for resolving TypeScript interfaces which are erased at runtime.
 *
 * @param token The service identifier/token to inject.
 *
 * @example
 * constructor(@Inject("ILogger") logger: ILogger) { ... }
 */
export function Inject(token: unknown): ParameterDecorator {
    return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        // If propertyKey is undefined, it's a constructor parameter.
        // target is the constructor function itself.
        const injections: Record<number, unknown> =
            propertyKey === undefined
                ? Reflect.getOwnMetadata(INJECT_METADATA_KEY, target) || {}
                : Reflect.getOwnMetadata(INJECT_METADATA_KEY, target, propertyKey) || {};

        injections[parameterIndex] = token;

        if (propertyKey === undefined) {
            Reflect.defineMetadata(INJECT_METADATA_KEY, injections, target);
        } else {
            Reflect.defineMetadata(INJECT_METADATA_KEY, injections, target, propertyKey);
        }
    };
}
