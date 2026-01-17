import { JsonSerializerOptions } from "./JsonSerializerOptions";
import { Constructor } from "./Serialization/JsonConverter";
import { JsonStringWriter } from "./JsonStringWriter";
import { InternalPools } from "../../Runtime/Pooling/InternalPools";
import { DeserializationContext } from "./DeserializationContext";

export class JsonSerializer {
    public static Serialize<T>(value: T, options?: JsonSerializerOptions): string {
        const opts = options ?? new JsonSerializerOptions();
        
        // 1. Check if we have a converter for T directly.
        if (value !== null && value !== undefined) {
             const type = (value as any).constructor as Constructor;
             const converter = opts.GetConverter(type);
             
             if (converter) {
                 const writer = new JsonStringWriter();
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 converter.Write(writer, value as any, opts);
                 return writer.toString();
             }
        }

        return JSON.stringify(value);
    }

    public static Deserialize<T>(
        json: string,
        targetType: Constructor<T>, 
        options?: JsonSerializerOptions,
    ): T {
        const opts = options ?? new JsonSerializerOptions();
        const parsed: unknown = JSON.parse(json);

        // Rent Context
        const context = InternalPools.DeserializationContextPool.Rent();
        
        try {
            return JsonSerializer.DeserializeObject(parsed, targetType, opts, context);
        } finally {
            // Return Context
            InternalPools.DeserializationContextPool.Return(context);
        }
    }

    /**
     * Internal recursive deserializer.
     */
    private static DeserializeObject<T>(
        source: unknown,
        targetType: Constructor<T>,
        options: JsonSerializerOptions,
        context: DeserializationContext
    ): T {
        // Safety: Track Depth
        context.Depth++;

        try {
            // 1. Null Check
            if (source === null || source === undefined) {
                 return source as unknown as T;
            }
    
            // 2. Check for Converter (Leaf System Types)
            const converter = options.GetConverter(targetType);
            if (converter) {
                return converter.Read(source, targetType, options) as T;
            }
    
            // 3. Container Handling (List<T>)
            let instance: T;
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                instance = new (targetType as any)();
            } catch (e) {
                throw new Error(`Deserialization failed: Could not instantiate ${targetType.name}. Ensure it has a parameterless constructor or accessible factory.`);
            }
    
            // 4. List Handling (Explicit)
            if (Array.isArray(source)) {
                if ('Add' in (instance as object) && 'ElementType' in (instance as object)) {
                    // strict safe cast
                    const listInstance = instance as unknown as { Add(item: unknown): void; ElementType: Constructor<unknown> };
                    const elemType = listInstance.ElementType;
    
                    if (!elemType) {
                         throw new Error(`Deserialization failed: List ${targetType.name} does not allow type inference. ElementType is undefined.`);
                    }
                    
                    for (const item of source) {
                        const deserializedItem = JsonSerializer.DeserializeObject(item, elemType, options, context);
                        listInstance.Add(deserializedItem);
                    }
                    return instance;
                } else {
                     throw new Error(`Deserialization mismatch: JSON is Array but target type ${targetType.name} is not a List.`);
                }
            }
    
            // 5. DTO Handling (Object)
            if (typeof source === 'object') {
                 const sourceObj = source as Record<string, unknown>;
                 
                 // Optimization: We could use context to rent keys array here if we avoided Object.keys?
                 // For now, standard Object.keys iteration.
                 for (const key of Object.keys(sourceObj)) {
                     if (key in (instance as object)) {
                          const propVal = (instance as Record<string, unknown>)[key];
                          
                          if (propVal === undefined) {
                              continue;
                          }
    
                          if (propVal === null) {
                              continue;
                          }
                          
                          const propType = (propVal as any).constructor as Constructor<unknown>;
                          const jsonVal = sourceObj[key];
                          
                          const hydrated = JsonSerializer.PopulateObject(jsonVal, propType, options, context, propVal);
                          
                          if (hydrated !== undefined) {
                               (instance as Record<string, unknown>)[key] = hydrated;
                          }
                     }
                 }
                 return instance;
            }
    
            return instance; 
        } finally {
            context.Depth--;
        }
    }

    private static PopulateObject<T>(
        source: unknown,
        targetType: Constructor<T>,
        options: JsonSerializerOptions,
        context: DeserializationContext,
        existingValue?: T
    ): T {
         // If Leaf Converter Exists:
         const converter = options.GetConverter(targetType);
         if (converter) {
             return converter.Read(source, targetType, options, existingValue) as T;
         }

         // If List (detected by shape):
         if (existingValue && 'Add' in (existingValue as object) && 'ElementType' in (existingValue as object)) {
             if (Array.isArray(source)) {
                 const listInstance = existingValue as unknown as { Add(item: unknown): void; ElementType: Constructor<unknown> };
                 const elemType = listInstance.ElementType;
                  if (!elemType) {
                     throw new Error(`Deserialization failed: List property does not define ElementType.`);
                }
                 for (const item of source) {
                     const deserializedItem = JsonSerializer.DeserializeObject(item, elemType, options, context);
                     listInstance.Add(deserializedItem);
                 }
                 return existingValue;
             }
         }
         
         // If DTO (Recursive):
         if (typeof source === 'object' && source !== null) {
              const instance = existingValue ?? (() => {
                   try {
                       // eslint-disable-next-line @typescript-eslint/no-explicit-any
                       return new (targetType as any)();
                   } catch {
                       throw new Error(`Cannot instantiate ${targetType.name}`);
                   }
              })();
              
              const sourceObj = source as Record<string, unknown>;
              for (const key of Object.keys(sourceObj)) {
                   if (key in (instance as object)) {
                        const propVal = (instance as Record<string, unknown>)[key];
                        if (propVal === undefined) continue;
                        
                        const propType = (propVal as any).constructor as Constructor<unknown>;
                        const jsonVal = sourceObj[key];
                        
                        const result = JsonSerializer.PopulateObject(jsonVal, propType, options, context, propVal as unknown);
                        (instance as Record<string, unknown>)[key] = result;
                   }
              }
              return instance as T;
         }

         return existingValue as T; 
    }
}
