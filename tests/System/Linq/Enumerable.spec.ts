import { Enumerable } from "../../../src/System/Linq/Enumerable";
import { List } from "../../../src/System/Collections/Generic/List";
import { CsInt32 } from "../../../src/Domain/ValueObjects/CsInt32";

describe("System.Linq.Enumerable", () => {
    beforeAll(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Enumerable.registerListFactory((source) => new List(source as any));
    });

    test("Deferred Execution: Proof of Concept", () => {
        const list = new List<number>([1, 2, 3]);
        let executed = false;

        // This predicate throws if executed
        const throwingPredicate = () => {
            executed = true;
            throw new Error("Should not execute yet");
        };

        const query = list.AsEnumerable().Where(throwingPredicate);

        // Assertion: Just creating the query did NOT execute the predicate
        expect(executed).toBe(false);

        // Execution: calling ToList triggers iteration
        expect(() => query.ToList()).toThrow("Should not execute yet");
        expect(executed).toBe(true);
    });

    test("Where & Select", () => {
        const list = new List<number>([1, 2, 3, 4]);
        const result = list
            .AsEnumerable()
            .Where((x) => x % 2 === 0)
            .Select((x) => x * 2)
            .ToList();

        expect(result.Count).toBe(2);
        expect(result.ToArray()).toEqual([4, 8]);
    });

    test("Take & Skip", () => {
        const list = [1, 2, 3, 4, 5];
        const result = Enumerable.From(list)
            .Skip(2) // 3, 4, 5
            .Take(2) // 3, 4
            .ToArray();

        expect(result).toEqual([3, 4]);
    });

    test("Distinct", () => {
        const list = [1, 2, 2, 3, 3, 3];
        const result = Enumerable.From(list).Distinct().ToArray();
        expect(result).toEqual([1, 2, 3]);
    });

    test("First & FirstOrDefault", () => {
        const list = [1, 2, 3];
        const enumObj = Enumerable.From(list);

        expect(enumObj.First((x) => x > 1)).toBe(2);
        // Cover FirstOrDefault returning found item
        expect(enumObj.FirstOrDefault((x) => x === 2)).toBe(2);
        // Cover FirstOrDefault returning null (predicate false for all)
        expect(enumObj.FirstOrDefault((x) => x > 5)).toBeNull();

        expect(() => enumObj.First((x) => x > 5)).toThrow("Sequence contains no elements");
    });

    test("Count, Any, All", () => {
        const list = [1, 2, 3];
        const e = Enumerable.From(list);

        expect(e.Count()).toBe(3);
        expect(e.Count((x) => x > 1)).toBe(2);

        expect(e.Any()).toBe(true);
        expect(e.Any((x) => x > 5)).toBe(false);

        expect(e.All((x) => x > 0)).toBe(true);
        expect(e.All((x) => x > 2)).toBe(false);
    });

    test("Sum: Primitives", () => {
        const list = new List<number>([1, 2, 3]);
        expect(list.AsEnumerable().Sum()).toBe(6);
        expect(list.AsEnumerable().Sum((x) => x * 2)).toBe(12);

        // Sum with non-numeric (fallback branch coverage)
        // If selector returns undefined/null or object without Value, it shouldn't crash, but won't add.
        // Line 178 "Fallback or error?"
        // We need to hit the "else" block of line 176.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mixedList = new List<any>(["a", "b"]);
        expect(mixedList.AsEnumerable().Sum((x) => x)).toBe(0);
    });

    test("Sum: CsInt32 Integration", () => {
        const list = new List<CsInt32>([new CsInt32(10), new CsInt32(20)]);
        // The Sum implementation unwraps .Value if it detects it
        expect(list.AsEnumerable().Sum()).toBe(30);
    });
});
