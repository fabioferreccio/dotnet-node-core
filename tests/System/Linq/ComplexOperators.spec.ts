import { Enumerable } from '../../../src/System/Linq/Enumerable';
import { CsInt32 } from '../../../src/Domain/ValueObjects/CsInt32';
import { CsString } from '../../../src/Domain/ValueObjects/CsString';
import { IGrouping } from '../../../src/Domain/Interfaces/IGrouping';

describe('System.Linq Complex Operators', () => {
    
    // --- Sorting Tests ---
    
    test('OrderBy: Primitive', () => {
        const list = [3, 1, 2];
        const sorted = Enumerable.From(list).OrderBy((x: number) => x).ToArray();
        expect(sorted).toEqual([1, 2, 3]);
    });

    test('OrderByDescending: Primitive', () => {
        const list = [1, 3, 2];
        const sorted = Enumerable.From(list).OrderByDescending((x: number) => x).ToArray();
        expect(sorted).toEqual([3, 2, 1]);
    });

    test('OrderBy: ValueObject (IComparable)', () => {
        const list = [new CsInt32(3), new CsInt32(1), new CsInt32(2)];
        const sorted = Enumerable.From(list).OrderBy((x: CsInt32) => x).ToArray();
        
        expect(sorted[0].Value).toBe(1);
        expect(sorted[1].Value).toBe(2);
        expect(sorted[2].Value).toBe(3);
    });

    test('ThenBy: Stability and Secondary Sort', () => {
        const list = [
            { name: "A", age: 30 },
            { name: "B", age: 20 },
            { name: "C", age: 30 },
            { name: "D", age: 10 }
        ];

        // Sort by Age (ASC), then by Name (ASC)
        const sorted = Enumerable.From(list)
            .OrderBy((x: { name: string, age: number }) => x.age)
            .ThenBy((x: { name: string, age: number }) => x.name)
            .ToArray();

        // Exp: D(10), B(20), A(30), C(30)
        expect(sorted[0].name).toBe("D");
        expect(sorted[1].name).toBe("B");
        expect(sorted[2].name).toBe("A");
        expect(sorted[3].name).toBe("C");
    });

    test('ThenByDescending', () => {
        const list = [
            { name: "A", age: 30 },
            { name: "C", age: 30 }
        ];
        
        const sorted = Enumerable.From(list)
            .OrderBy((x: { name: string, age: number }) => x.age)
            .ThenByDescending((x: { name: string, age: number }) => x.name)
            .ToArray();
            
        // 30=30. Descending name: C then A.
        expect(sorted[0].name).toBe("C");
        expect(sorted[1].name).toBe("A");
    });

    // --- Grouping Tests ---

    test('GroupBy: Primitive Key', () => {
        const list = ["apple", "banana", "apricot", "blueberry", "cherry"];
        // Group by first letter
        const groups = Enumerable.From(list)
            .GroupBy((x: string) => x[0])
            .ToList(); // Immediate
            
        expect(groups.Count).toBe(3); // a, b, c
        
        // Find group 'a'
        const gA = groups.FirstOrDefault((g: IGrouping<string, string>) => g.Key === 'a');
        expect(gA).not.toBeNull();
        expect(gA!.Count(undefined)).toBe(2); // apple, apricot
    });

    test('GroupBy: ValueObject Key (Equality Check)', () => {
        // Critical Test: Grouping must use .Equals() for keys
        const k1a = new CsString("Key1");
        const k1b = new CsString("Key1"); // Different instance, same value
        const k2 = new CsString("Key2");

        const list = [
            { id: 1, key: k1a },
            { id: 2, key: k2 },
            { id: 3, key: k1b } 
        ];

        const groups = Enumerable.From(list)
            .GroupBy((x: { id: number, key: CsString }) => x.key)
            .ToList();

        // Should be 2 groups, not 3.
        expect(groups.Count).toBe(2);
        
        const g1 = groups.FirstOrDefault((g: IGrouping<CsString, { id: number, key: CsString }>) => g.Key.toString() === "Key1");
        expect(g1).not.toBeNull();
        expect(g1!.Count(undefined)).toBe(2); // id 1 and 3
    });
});
