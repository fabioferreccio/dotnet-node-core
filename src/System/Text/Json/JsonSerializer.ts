import { JsonSerializerOptions } from "./JsonSerializerOptions";
import { Constructor } from "./Serialization/JsonConverter";
import { JsonStringWriter } from "./JsonStringWriter";

export class JsonSerializer {
    public static Serialize<T>(value: T, options?: JsonSerializerOptions): string {
        const opts = options ?? new JsonSerializerOptions();
        
        // 1. Check if we have a converter for T directly.
        // In JS we don't pass T class to Serialize usually, we infer from value.
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

        // Fallback to standard JSON.stringify for primitives/unregistered objects
        // (Out of scope: Complex object graph traversal using converters for props)
        // For MVP, if no converter found for Root, we use stringify.
        return JSON.stringify(value);
    }

    public static Deserialize<T>(
        json: string,
        targetType: Constructor<T>, 
        options?: JsonSerializerOptions,
    ): T {
        const opts = options ?? new JsonSerializerOptions();
        const parsed: unknown = JSON.parse(json); // Boundary: unknown

        return JsonSerializer.DeserializeObject(parsed, targetType, opts);
    }

    /**
     * Internal recursive deserializer.
     * strictly typed: input is unknown, output is T.
     */
    private static DeserializeObject<T>(
        source: unknown,
        targetType: Constructor<T>,
        options: JsonSerializerOptions
    ): T {
        // 1. Null Check
        if (source === null || source === undefined) {
             // We can't return T if it creates a null value where object expected, 
             // but in JS deserialization of null is null.
             return source as unknown as T;
        }

        // 2. Check for Converter (Leaf System Types)
        const converter = options.GetConverter(targetType);
        if (converter) {
            // Converter handles validation of 'source' type (e.g. expects string for CsInt64)
            return converter.Read(source, targetType, options) as T;
        }

        // 3. Container Handling (List<T>)
        // We detect List by checking if targetType name is 'List' or if it matches the List constructor.
        // Since we don't have 'typeof List' imported here easily without circular ref potentially,
        // we can rely on prototype checking or name if strict.
        // Better: We check if strict instance creation matches List.
        // Actually, we can instantiate the targetType and see what it is.
        // "DTO... MUST be explicitly instantiated".
        
        let instance: T;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            instance = new (targetType as any)();
        } catch (e) {
            throw new Error(`Deserialization failed: Could not instantiate ${targetType.name}. Ensure it has a parameterless constructor or accessible factory.`);
        }

        // 4. List Handling (Explicit)
        // Check if instance looks like a List (has Add method and ElementType prop?)
        // We use duck typing or 'in' check safe.
        if (Array.isArray(source)) {
            // We expect the target to be a collection.
            if ('Add' in (instance as object) && 'ElementType' in (instance as object)) {
                // strict safe cast
                const listInstance = instance as unknown as { Add(item: unknown): void; ElementType: Constructor<unknown> };
                const elemType = listInstance.ElementType;

                if (!elemType) {
                     throw new Error(`Deserialization failed: List ${targetType.name} does not allow type inference. ElementType is undefined.`);
                }
                
                for (const item of source) {
                    const deserializedItem = JsonSerializer.DeserializeObject(item, elemType, options);
                    listInstance.Add(deserializedItem);
                }
                return instance;
            } else {
                 // Source is array, but target is NOT List?
                 // Could be a DTO that happens to initialize property. 
                 // But targetType itself IS the object we are creating.
                 // If targetType is a DTO, it shouldn't match Array source usually.
                 throw new Error(`Deserialization mismatch: JSON is Array but target type ${targetType.name} is not a List.`);
            }
        }

        // 5. DTO Handling (Object)
        if (typeof source === 'object') {
             // Iterate keys of the source JSON or the Target Instance?
             // Prompt: "Iterate over JSON properties... Verify property exists on instance"
             const sourceObj = source as Record<string, unknown>; // Safe cast for iteration
             
             // We iterate keys of the DTO instance to ensure we only accept known properties?
             // No, standard is iterate JSON and fill DTO.
             // "For EACH property (in JSON)... Verify the property exists on the instance"
             
             for (const key of Object.keys(sourceObj)) {
                 if (key in (instance as object)) {
                      // Safe access
                      const propVal = (instance as Record<string, unknown>)[key];
                      
                      // Aggressive ignore of uninitialized
                      if (propVal === undefined) {
                          continue;
                      }

                      // Determine Type
                      // We must know the constructor of the property value.
                      if (propVal === null) {
                          // Cannot determine type if null. Ignore.
                          continue;
                      }
                      
                      const propType = (propVal as any).constructor as Constructor<unknown>;
                      
                      // Recurse
                      // Pass the existing value? 
                      // For Lists, instance[key] is ALREADY initialized (Checked by !undefined).
                      // If we pass it as 'existingValue' to Read?
                      // Wait, converters for System Types don't use existingValue usually.
                      // But Lists might?
                      
                      // If it's a Leaf (System Type), we just get the value.
                      // If it's a List, we need to populate the EXISTING list.
                      // But `DeserializeObject` creates NEW instance of the type passed.
                      // We want to POPULATE `propVal`.
                      
                      // Special Case: If propVal is a List, we must not overwrite it with `new List()`,
                      // we must add to it.
                      // OR we create new List and assign?
                      // The List constructor preserves ElementType if passed?
                      // If we do `const newList = new List([], elementType)`, it works.
                      // So `DeserializeObject` creating a new instance is fine IF it knows the constructor arguments (ElementType).
                      // But generic `new targetType()` won't pass arguments.
                      
                      // CRITICAL: We can't just `new List()` during recursion because we lose `ElementType` 
                      // which was set in the DTO constructor `new List([], String)`.
                      // So we MUST use the EXISTING instance for Lists.
                      
                      // How to handle "Use Existing"?
                      // 1. If we are traversing a DTO property, we have `propVal`.
                      // 2. We should populate `propVal`.
                      
                      // Modifying `DeserializeObject` to accept `targetInstance?`.
                      // If provided, use it instead of `new`.
                      
                      // But wait, `DeserializeObject` signature is (source, type).
                      // Let's change the DTO loop to handle this inline or modify signature.
                      // Modifying signature is cleaner.
                      
                      const jsonVal = sourceObj[key];
                      const hydrated = JsonSerializer.PopulateObject(jsonVal, propType, options, propVal);
                      
                      if (hydrated !== undefined) {
                           (instance as Record<string, unknown>)[key] = hydrated;
                      }
                 }
             }
             return instance;
        }

        return instance; 
    }

    private static PopulateObject<T>(
        source: unknown,
        targetType: Constructor<T>,
        options: JsonSerializerOptions,
        existingValue?: T
    ): T {
         // If Leaf Converter Exists:
         const converter = options.GetConverter(targetType);
         if (converter) {
             // Converter.Read signature updated to accept existingValue?
             // We checked JsonConverter.ts, it has existingValue.
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
                     // Recurse for item using elemType. 
                     // Items in list are usually new instances unless we are merging?
                     // Standard is new instances.
                     const deserializedItem = JsonSerializer.DeserializeObject(item, elemType, options);
                     listInstance.Add(deserializedItem);
                 }
                 return existingValue;
             }
         }
         
         // If DTO (Recursive):
         // If we have existingValue, we can populate it? 
         // But logic above for DTO created new instance.
         // Unifying:
         if (typeof source === 'object' && source !== null) {
              const instance = existingValue ?? (() => {
                   try {
                       // eslint-disable-next-line @typescript-eslint/no-explicit-any
                       return new (targetType as any)();
                   } catch {
                       throw new Error(`Cannot instantiate ${targetType.name}`);
                   }
              })();
              
              // Iterate JSON
              const sourceObj = source as Record<string, unknown>;
              for (const key of Object.keys(sourceObj)) {
                   if (key in (instance as object)) {
                        const propVal = (instance as Record<string, unknown>)[key];
                         if (propVal === undefined) continue;
                         
                         const propType = (propVal as any).constructor as Constructor<unknown>;
                         const jsonVal = sourceObj[key];
                         
                         const result = JsonSerializer.PopulateObject(jsonVal, propType, options, propVal as unknown);
                         (instance as Record<string, unknown>)[key] = result;
                   }
              }
              return instance as T;
         }

         return existingValue as T; 
    }
}
