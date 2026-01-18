import { JsonSerializerOptions } from "./JsonSerializerOptions";
import { Constructor } from "./Serialization/JsonConverter";
import { JsonStringWriter } from "./JsonStringWriter";
import { InternalPools } from "../../Runtime/Pooling/InternalPools";
import { DeserializationContext } from "./DeserializationContext";

import { JsonTypeMetadata } from "./Metadata/JsonTypeMetadata";
import { NullHandling } from "./Metadata/NullHandling";
import { JsonSerializationContext } from "./Diagnostics/JsonSerializationContext";

export class JsonSerializer {
    public static Serialize<T>(value: T, options?: JsonSerializerOptions): string {
        const opts = options ?? new JsonSerializerOptions();
        const writer = new JsonStringWriter();

        if (value === null || value === undefined) {
            return "null";
        }

        // Determine type
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const proto = Object.getPrototypeOf(value);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const type = proto ? (proto.constructor as Constructor) : (value as any).constructor;

        // Diagnostics: Start
        let diagContext: JsonSerializationContext | undefined;
        if (opts.Diagnostics) {
            diagContext = {
                TargetType: type,
                IsMetadataEnabled: !!opts.GetTypeMetadata(type),
                Depth: 0,
                NodeCount: 0,
                StartTime: Date.now(),
            };
            if (opts.Diagnostics.OnSerializeStart) {
                opts.Diagnostics.OnSerializeStart(diagContext);
            }
        }

        try {
            JsonSerializer.WriteObject(writer, value, type, opts, diagContext);
        } finally {
            // Diagnostics: End
            if (opts.Diagnostics && diagContext) {
                diagContext.EndTime = Date.now();
                if (opts.Diagnostics.OnSerializeEnd) {
                    opts.Diagnostics.OnSerializeEnd(diagContext);
                }
            }
        }

        return writer.toString();
    }

    public static Deserialize<T>(json: string, targetType: Constructor<T>, options?: JsonSerializerOptions): T {
        const opts = options ?? new JsonSerializerOptions();
        const parsed: unknown = JSON.parse(json);

        // Rent Context

        const context = InternalPools.DeserializationContextPool.Rent();

        // Diagnostics: Start
        let diagContext: JsonSerializationContext | undefined;
        if (opts.Diagnostics) {
            diagContext = {
                TargetType: targetType,
                IsMetadataEnabled: !!opts.GetTypeMetadata(targetType),
                Depth: 0,
                NodeCount: 0,
                StartTime: Date.now(),
            };
            if (opts.Diagnostics.OnDeserializeStart) {
                opts.Diagnostics.OnDeserializeStart(diagContext);
            }
        }

        try {
            return JsonSerializer.DeserializeObject(parsed, targetType, opts, context, diagContext);
        } finally {
            // Diagnostics: End
            if (opts.Diagnostics && diagContext) {
                diagContext.EndTime = Date.now();
                if (opts.Diagnostics.OnDeserializeEnd) {
                    opts.Diagnostics.OnDeserializeEnd(diagContext);
                }
            }

            // Return Context
            InternalPools.DeserializationContextPool.Return(context);
        }
    }

    private static WriteObject(
        writer: JsonStringWriter,
        value: unknown,
        type: Constructor<unknown> | null,
        options: JsonSerializerOptions,
        diagContext?: JsonSerializationContext,
    ): void {
        if (diagContext) {
            diagContext.NodeCount++;
            diagContext.Depth++;
        }

        try {
            if (value === null || value === undefined) {
                writer.WriteNullValue();
                return;
            }

            // 1. Primitives (Fast Path)
            if (typeof value === "string") {
                writer.WriteStringValue(value);
                return;
            }
            if (typeof value === "number") {
                writer.WriteNumberValue(value);
                return;
            }
            if (typeof value === "boolean") {
                writer.WriteBooleanValue(value);
                return;
            }

            // 2. Converters
            if (type) {
                const converter = options.GetConverter(type);
                if (converter) {
                    // Diagnostics: Converter Used
                    if (options.Diagnostics?.OnConverterUsed && diagContext) {
                        options.Diagnostics.OnConverterUsed(type, converter);
                    }

                    converter.Write(writer, value, options);
                    return;
                }
            }

            // 3. toJSON Support (Standard JSON serialization behavior)
            if (
                value !== null &&
                (typeof value === "object" || typeof value === "function") &&
                "toJSON" in value &&
                typeof (value as { toJSON: unknown }).toJSON === "function"
            ) {
                const jsonValue = (value as { toJSON: () => unknown }).toJSON();
                // Recurse with the result of toJSON.
                // We pass null for type because the type of the result (e.g. string or array)
                // should be inferred from the value itself.
                JsonSerializer.WriteObject(writer, jsonValue, null, options, diagContext);
                return;
            }

            // 3. Arrays
            if (Array.isArray(value)) {
                writer.WriteStartArray();
                for (const item of value) {
                    // Infer type of item? Or just pass unknown.
                    let itemType: Constructor<unknown> | null = null;
                    if (item !== null && item !== undefined) {
                        itemType = Object.getPrototypeOf(item).constructor as Constructor<unknown>;
                    }
                    JsonSerializer.WriteObject(writer, item, itemType, options, diagContext);
                }
                writer.WriteEndArray();
                return;
            }

            // 4. Objects (Metadata Aware)
            // Check metadata
            let metadata: JsonTypeMetadata | undefined;
            if (type) {
                metadata = options.GetTypeMetadata(type);
            }

            writer.WriteStartObject();
            const keys = Object.keys(value as object);
            for (const key of keys) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const propVal = (value as any)[key];

                // Metadata resolution
                let jsonName = key;
                let propConverter: import("./Serialization/JsonConverter").JsonConverter<unknown> | null = null;
                let nullHandling = NullHandling.Default;

                if (metadata) {
                    const propMeta = metadata.GetProperty(key);
                    if (propMeta) {
                        jsonName = propMeta.JsonName;
                        propConverter = propMeta.Converter;
                        nullHandling = propMeta.NullHandling;

                        // Diagnostics: Metadata Applied
                        if (options.Diagnostics?.OnMetadataApplied && diagContext && type) {
                            options.Diagnostics.OnMetadataApplied(type, key);
                        }
                    }
                }

                // Null Handling Checks
                if (propVal === null || propVal === undefined) {
                    if (nullHandling === NullHandling.Ignore) {
                        continue;
                    }
                    if (nullHandling === NullHandling.Disallow) {
                        throw new Error(`Property '${key}' is null but configured as DisallowNull.`);
                    }
                    // Allow or Default -> Emit null
                }

                writer.WritePropertyName(jsonName);

                if (propConverter) {
                    // Diagnostics: Converter Used (Property Level)
                    // Note: We might be missing the exact runtime type here if value is null, but we have propConverter.
                    if (options.Diagnostics?.OnConverterUsed && diagContext && type) {
                        // We pass 'type' as the parent container type? Or the property type?
                        // The interface calls for (type, converter). Likely the Type being converted.
                        // But we don't know the property type unless we infer it or have it from metadata.
                        // Metadata doesn't strictly store property Type, only Converter.
                        // We'll pass the container type or try to get value type.
                        let valueType = type; // fallback
                        if (propVal !== null && propVal !== undefined) {
                            valueType = Object.getPrototypeOf(propVal).constructor as Constructor<unknown>;
                        }
                        options.Diagnostics.OnConverterUsed(valueType, propConverter);
                    }
                    propConverter.Write(writer, propVal, options);
                } else {
                    let propType: Constructor<unknown> | null = null;
                    if (propVal !== null && propVal !== undefined) {
                        propType = Object.getPrototypeOf(propVal).constructor as Constructor<unknown>;
                    }
                    JsonSerializer.WriteObject(writer, propVal, propType, options, diagContext);
                }
            }
            writer.WriteEndObject();
        } finally {
            if (diagContext) {
                diagContext.Depth--;
            }
        }
    }

    /**
     * Internal recursive deserializer.
     */
    private static DeserializeObject<T>(
        source: unknown,
        targetType: Constructor<T>,
        options: JsonSerializerOptions,
        context: DeserializationContext,
        diagContext?: JsonSerializationContext,
    ): T {
        // Safety: Track Depth
        context.Depth++;
        if (diagContext) {
            diagContext.Depth++;
            diagContext.NodeCount++;
        }

        try {
            // 1. Null Check
            if (source === null || source === undefined) {
                return source as unknown as T;
            }

            // 2. Check for Converter (Leaf System Types)
            const converter = options.GetConverter(targetType);
            if (converter) {
                // Diagnostics: Converter Used
                if (options.Diagnostics?.OnConverterUsed && diagContext) {
                    options.Diagnostics.OnConverterUsed(targetType, converter);
                }
                return converter.Read(source, targetType, options) as T;
            }

            // 3. Container Handling (List<T>)
            let instance: T;
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                instance = new (targetType as any)();
            } catch (_e) {
                throw new Error(
                    `Deserialization failed: Could not instantiate ${targetType.name}. Ensure it has a parameterless constructor or accessible factory.`,
                );
            }

            // 4. List Handling (Explicit)
            if (Array.isArray(source)) {
                if ("Add" in (instance as object) && "ElementType" in (instance as object)) {
                    // strict safe cast
                    const listInstance = instance as unknown as {
                        Add(item: unknown): void;
                        ElementType: Constructor<unknown>;
                    };
                    const elemType = listInstance.ElementType;

                    if (!elemType) {
                        throw new Error(
                            `Deserialization failed: List ${targetType.name} does not allow type inference. ElementType is undefined.`,
                        );
                    }

                    for (const item of source) {
                        const deserializedItem = JsonSerializer.DeserializeObject(
                            item,
                            elemType,
                            options,
                            context,
                            diagContext,
                        );
                        listInstance.Add(deserializedItem);
                    }
                    return instance;
                } else {
                    throw new Error(
                        `Deserialization mismatch: JSON is Array but target type ${targetType.name} is not a List.`,
                    );
                }
            }

            // 5. DTO Handling (Object)
            if (typeof source === "object") {
                const sourceObj = source as Record<string, unknown>;
                const metadata = options.GetTypeMetadata(targetType);

                for (const jsonKey of Object.keys(sourceObj)) {
                    let dtoKey = jsonKey;
                    let propMeta: import("./Metadata/JsonPropertyMetadata").JsonPropertyMetadata | undefined;

                    if (metadata) {
                        const found = metadata.GetPropertyByJsonName(jsonKey);
                        if (found) {
                            dtoKey = found.PropertyName;
                            propMeta = found;

                            // Diagnostics: Metadata Applied
                            if (options.Diagnostics?.OnMetadataApplied && diagContext) {
                                options.Diagnostics.OnMetadataApplied(targetType, found.PropertyName); // Use DTO name or JSON name? Requirement: "type, propertyName". Using Resolved PropertyName.
                            }
                        }
                    }

                    if (dtoKey in (instance as object)) {
                        const propVal = (instance as Record<string, unknown>)[dtoKey];

                        // NullHandling Check
                        const jsonVal = sourceObj[jsonKey];
                        if (jsonVal === null) {
                            if (propMeta) {
                                if (propMeta.NullHandling === NullHandling.Disallow) {
                                    throw new Error(
                                        `Property '${dtoKey}' (JSON '${jsonKey}') is null but configured as DisallowNull.`,
                                    );
                                }
                                if (propMeta.NullHandling === NullHandling.Ignore) {
                                    continue;
                                }
                            }
                            // Else Allow or Default -> continue processing (PopulateObject or assignment handles null)
                        }

                        if (propVal === undefined) {
                            continue;
                        }

                        // Converter Override
                        if (propMeta && propMeta.Converter) {
                            const converted = propMeta.Converter.Read(
                                jsonVal,
                                Object.getPrototypeOf(propVal).constructor as Constructor<unknown>,
                                options,
                            );

                            // Diagnostics: Converter Used (Property)
                            if (options.Diagnostics?.OnConverterUsed && diagContext) {
                                // We have propVal, so we know the type
                                const pType = Object.getPrototypeOf(propVal).constructor as Constructor<unknown>;
                                options.Diagnostics.OnConverterUsed(pType, propMeta.Converter);
                            }

                            (instance as Record<string, unknown>)[dtoKey] = converted;
                            continue;
                        }

                        if (propVal === null) {
                            // If propVal is null, we can't infer type easily unless we use reflection or it's a known type.
                            // But we can't easily set it if it's null on the instance?
                            // Existing logic skipped null propVals:
                            // "if (propVal === null) continue;"
                            // We preserve this behavior for now unless we know the type.
                            continue;
                        }

                        const propType = Object.getPrototypeOf(propVal).constructor as Constructor<unknown>;

                        const hydrated = JsonSerializer.PopulateObject(
                            jsonVal,
                            propType,
                            options,
                            context,
                            propVal,
                            diagContext,
                        );

                        if (hydrated !== undefined) {
                            (instance as Record<string, unknown>)[dtoKey] = hydrated;
                        }
                    }
                }
                return instance;
            }

            return instance;
        } catch (error) {
            // Diagnostics: Error
            if (options.Diagnostics?.OnError && diagContext && error instanceof Error) {
                // Enrich context
                // Requirement: TargetType, PropertyPath (if available), MetadataApplied (yes/no)
                // We can attach to error object.
                // We don't have PropertyPath easily here without passing it down or reconstructing it.
                // But we have TargetType.
                Object.defineProperty(error, "context", {
                    value: {
                        ...diagContext,
                        TargetType: targetType,
                    },
                    writable: true,
                    enumerable: false,
                    configurable: true,
                });

                options.Diagnostics.OnError(error, diagContext);
            }
            throw error;
        } finally {
            context.Depth--;
            if (diagContext) {
                diagContext.Depth--;
            }
        }
    }

    private static PopulateObject<T>(
        source: unknown,
        targetType: Constructor<T>,
        options: JsonSerializerOptions,
        context: DeserializationContext,

        existingValue?: T,
        diagContext?: JsonSerializationContext,
    ): T {
        if (diagContext) {
            diagContext.NodeCount++; // Should PopulateObject count as a node? Yes, it's visiting an object.
            // Depth? PopulateObject is recursive step usually, let's say yes. But wait, PopulateObject is called FROM DeserializeObject (visited).
            // Actually PopulateObject is used when we have an existing value.
            // Let's treat it similar to DeserializeObject.
        }
        // If Leaf Converter Exists:
        const converter = options.GetConverter(targetType);

        if (converter) {
            // Diagnostics: Converter
            if (options.Diagnostics?.OnConverterUsed && diagContext) {
                options.Diagnostics.OnConverterUsed(targetType, converter);
            }
            return converter.Read(source, targetType, options, existingValue) as T;
        }

        // If List (detected by shape):
        if (
            existingValue &&
            typeof existingValue === "object" &&
            "Add" in (existingValue as object) &&
            "ElementType" in (existingValue as object)
        ) {
            if (Array.isArray(source)) {
                const listInstance = existingValue as unknown as {
                    Add(item: unknown): void;
                    ElementType: Constructor<unknown>;
                };
                const elemType = listInstance.ElementType;
                if (!elemType) {
                    throw new Error(`Deserialization failed: List property does not define ElementType.`);
                }
                for (const item of source) {
                    const deserializedItem = JsonSerializer.DeserializeObject(
                        item,
                        elemType,
                        options,
                        context,
                        diagContext,
                    );
                    listInstance.Add(deserializedItem);
                }
                return existingValue;
            }
        }

        // If DTO (Recursive):
        if (typeof source === "object" && source !== null) {
            const instance =
                existingValue ??
                (() => {
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        return new (targetType as any)();
                    } catch {
                        throw new Error(`Cannot instantiate ${targetType.name}`);
                    }
                })();

            const sourceObj = source as Record<string, unknown>;
            const metadata = options.GetTypeMetadata(targetType);

            for (const jsonKey of Object.keys(sourceObj)) {
                let dtoKey = jsonKey;
                let propMeta: import("./Metadata/JsonPropertyMetadata").JsonPropertyMetadata | undefined;

                if (metadata) {
                    const found = metadata.GetPropertyByJsonName(jsonKey);
                    if (found) {
                        dtoKey = found.PropertyName;
                        propMeta = found;
                        // Diagnostics: Metadata Applied
                        if (options.Diagnostics?.OnMetadataApplied && diagContext) {
                            options.Diagnostics.OnMetadataApplied(targetType, found.PropertyName);
                        }
                    }
                }

                if (dtoKey in (instance as object)) {
                    const propVal = (instance as Record<string, unknown>)[dtoKey];
                    const jsonVal = sourceObj[jsonKey];

                    // NullHandling Check
                    if (jsonVal === null) {
                        if (propMeta) {
                            if (propMeta.NullHandling === NullHandling.Disallow) {
                                throw new Error(
                                    `Property '${dtoKey}' (JSON '${jsonKey}') is null but configured as DisallowNull.`,
                                );
                            }
                            if (propMeta.NullHandling === NullHandling.Ignore) {
                                continue;
                            }
                        }
                    }

                    if (propVal === undefined) continue;

                    // Converter Override
                    if (propMeta && propMeta.Converter) {
                        // Need propType for Read signature?
                        // propMeta.Converter.Read(...)
                        // If propVal is available, use its type.
                        let pType: Constructor<unknown> = Object as unknown as Constructor<unknown>; // fallback
                        if (propVal !== null) {
                            pType = Object.getPrototypeOf(propVal).constructor as Constructor<unknown>;
                        }
                        const converted = propMeta.Converter.Read(jsonVal, pType, options);

                        // Diagnostics: Converter Used
                        if (options.Diagnostics?.OnConverterUsed && diagContext) {
                            options.Diagnostics.OnConverterUsed(pType, propMeta.Converter);
                        }

                        (instance as Record<string, unknown>)[dtoKey] = converted;
                        continue;
                    }

                    if (propVal === null) continue; // Cannot hydrate null instance without type info

                    const propType = Object.getPrototypeOf(propVal).constructor as Constructor<unknown>;

                    const result = JsonSerializer.PopulateObject(
                        jsonVal,
                        propType,
                        options,
                        context,
                        propVal as unknown,
                        diagContext,
                    );
                    (instance as Record<string, unknown>)[dtoKey] = result;
                }
            }
            return instance as T;
        }

        return existingValue as T;
    }
}
