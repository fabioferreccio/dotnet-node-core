import { Enumerable } from "../../../src/System/Linq/Enumerable";
import { List } from "../../../src/System/Collections/Generic/List";
import { CsInt32 } from "../../../src/Domain/ValueObjects/CsInt32";
import { OrderedEnumerable } from "../../../src/System/Linq/OrderedEnumerable";

describe("System.Linq.OrderedEnumerable", () => {
    beforeAll(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Enumerable.registerListFactory((source) => new List(source as any));
        Enumerable.registerOrderedEnumerableFactory((source, context) => new OrderedEnumerable(source, context));
    });

    test("OrderBy: Primitive", () => {
        const list = [3, 1, 2];
        const sorted = Enumerable.From(list)
            .OrderBy((x: number) => x)
            .ToArray();
        expect(sorted).toEqual([1, 2, 3]);
    });

    test("OrderByDescending: Primitive", () => {
        const list = [1, 3, 2];
        const sorted = Enumerable.From(list)
            .OrderByDescending((x: number) => x)
            .ToArray();
        expect(sorted).toEqual([3, 2, 1]);
    });

    test("OrderBy: ValueObject (IComparable)", () => {
        const list = [new CsInt32(3), new CsInt32(1), new CsInt32(2)];
        const sorted = Enumerable.From(list)
            .OrderBy((x: CsInt32) => x)
            .ToArray();

        expect(sorted[0].Value).toBe(1);
        expect(sorted[1].Value).toBe(2);
        expect(sorted[2].Value).toBe(3);
    });

    test("ThenBy: Stability and Secondary Sort", () => {
        const list = [
            { name: "A", age: 30 },
            { name: "B", age: 20 },
            { name: "C", age: 30 },
            { name: "D", age: 10 },
        ];

        // Sort by Age (ASC), then by Name (ASC)
        const sorted = Enumerable.From(list)
            .OrderBy((x: { name: string; age: number }) => x.age)
            .ThenBy((x: { name: string; age: number }) => x.name)
            .ToArray();

        // Exp: D(10), B(20), A(30), C(30)
        expect(sorted[0].name).toBe("D");
        expect(sorted[1].name).toBe("B");
        expect(sorted[2].name).toBe("A");
        expect(sorted[3].name).toBe("C");
    });

    test("ThenByDescending", () => {
        const list = [
            { name: "A", age: 30 },
            { name: "C", age: 30 },
        ];

        const sorted = Enumerable.From(list)
            .OrderBy((x: { name: string; age: number }) => x.age)
            .ThenByDescending((x: { name: string; age: number }) => x.name)
            .ToArray();

        // 30=30. Descending name: C then A.
        expect(sorted[0].name).toBe("C");
        expect(sorted[1].name).toBe("A");
    });
});
