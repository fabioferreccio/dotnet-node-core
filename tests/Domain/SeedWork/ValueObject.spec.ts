import { ValueObject } from "../../../src/Domain/SeedWork/ValueObject";

// Concrete subclass for testing logic
class TestValueObject extends ValueObject {
    public constructor(
        public readonly valueA: number,
        public readonly valueB: string,
    ) {
        super();
    }

    protected GetEqualityComponents(): any[] {
        return [this.valueA, this.valueB];
    }
}

class AnotherTestValueObject extends ValueObject {
    public constructor(public readonly valueA: number) {
        super();
    }
    protected GetEqualityComponents(): any[] {
        return [this.valueA];
    }
}

describe("Domain.SeedWork.ValueObject", () => {
    test("Equals - Symmetry", () => {
        const obj1 = new TestValueObject(1, "test");
        const obj2 = new TestValueObject(1, "test");

        expect(obj1.Equals(obj2)).toBe(true);
        expect(obj2.Equals(obj1)).toBe(true);
    });

    test("Equals - Transitivity", () => {
        const obj1 = new TestValueObject(1, "test");
        const obj2 = new TestValueObject(1, "test");
        const obj3 = new TestValueObject(1, "test");

        expect(obj1.Equals(obj2)).toBe(true);
        expect(obj2.Equals(obj3)).toBe(true);
        expect(obj1.Equals(obj3)).toBe(true);
    });

    test("Equals - Different Values", () => {
        const obj1 = new TestValueObject(1, "test");
        const obj2 = new TestValueObject(2, "test");
        const obj3 = new TestValueObject(1, "diff");

        expect(obj1.Equals(obj2)).toBe(false);
        expect(obj1.Equals(obj3)).toBe(false);
    });

    test("Equals - Type Safety", () => {
        const obj1 = new TestValueObject(1, "test");
        const obj2 = new AnotherTestValueObject(1);

        // Even if components matched (not possible here due to length), type check fails
        expect(obj1.Equals(obj2 as any)).toBe(false);
    });

    test("Equals - Null/Undefined", () => {
        const obj1 = new TestValueObject(1, "test");
        expect(obj1.Equals(null as any)).toBe(false);
        expect(obj1.Equals(undefined as any)).toBe(false);
    });

    test("Immutability Check (Simulated)", () => {
        // Value Objects rely on immutable members.
        // We verify that passing primitives is safe.
        let localStr = "original";
        const obj = new TestValueObject(1, localStr);
        localStr = "changed";
        // obj should still be "original" because strings are immutable primitives in JS
        expect(obj.valueB).toBe("original");
        expect(obj.Equals(new TestValueObject(1, "original"))).toBe(true);
    });

    test("Internal: Shallow Equal Length Mismatch", () => {
        // To hit the "if (a.length !== b.length)" branch in shallowEqual,
        // we need instances that pass the constructor Check but return different component arrays.
        // Since getEqualityComponents is virtual, we can mock it or use a dynamic subclass.
        class VarArgsObject extends ValueObject {
            constructor(public items: any[]) {
                super();
            }
            protected GetEqualityComponents(): any[] {
                return this.items;
            }
        }

        const o1 = new VarArgsObject([1]);
        const o2 = new VarArgsObject([1, 2]);
        // They are same class, so constructor check passes.
        // shallowEqual will check lengths.
        expect(o1.Equals(o2)).toBe(false);
    });
});
