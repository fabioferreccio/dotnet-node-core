export class DeserializationContext {
    // Track recursion depth for safety/debugging (optional, but good practice)
    public Depth: number = 0;

    // Buffer for Object.keys() to avoid allocating new arrays for property iteration
    // We can't reuse a single array for recursion because nested calls need their own iteration state.
    // However, we can use a stack of arrays? Or just pool this context object which is one-per-traversal.
    // Actually, `Object.keys` returns a new array every time.
    // To safe on allocations, we would need to AVOID `Object.keys` and use `for..in`,
    // but `for..in` iterates up prototype chain, so requires `hasOwnProperty`.

    // Strategy: The Context itself doesn't seemingly hold much state if recursion is on the stack.
    // UNLESS we use it for a temporary "Property Buffer" if we are doing something specific.
    // But standard JSON iteration in JS is `for (const key in obj)`.
    // Modern engines optimize `for..in` well. `Object.keys` allocates.
    // So `DeserializationContext` might just provide a helper `GetKeys(obj)` that uses a pooled array?
    // BUT we need the array for the duration of the loop.
    // Recursive calls happen *inside* the loop.
    // So we can't reuse the *same* array instance for the inner call.
    // This implies we need a `RentArray()` from the context?

    // Let's keep it simple for MVP:
    // The Context tracks Depth.
    // The Context can be extended later.
    // Just having the Context *object* pooled saves one allocation per Deserialize call.
    // If we want to optimize `Object.keys`, we need `StringArrayPool` or similar.

    // For this Phase, we pool the Context itself.

    public Reset(): void {
        this.Depth = 0;
    }
}
