import { ObjectPool } from "./ObjectPool";
import { DeserializationContext } from "../../Text/Json/DeserializationContext";

// Internal-only static container for pools
export class InternalPools {
    private static _deserializationContextPool: ObjectPool<DeserializationContext>;

    public static get DeserializationContextPool(): ObjectPool<DeserializationContext> {
        if (!this._deserializationContextPool) {
            this._deserializationContextPool = new ObjectPool<DeserializationContext>(
                () => new DeserializationContext(),
                (ctx) => ctx.Reset(),
                50 // Reasonable capacity for nested calls or concurrent requests (if single threaded, really just depth or separate requests)
            );
        }
        return this._deserializationContextPool;
    }
}
