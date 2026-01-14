import { List } from '../../../../src/System/Collections/Generic/List';
import { CsString } from '../../../../src/Domain/ValueObjects/CsString';

describe('System.Collections.Generic.List<T>', () => {
    
    test('Should handle primitives with reference equality', () => {
        const list = new List<number>();
        list.Add(1);
        list.Add(2);
        
        expect(list.Count).toBe(2);
        expect(list.Contains(1)).toBe(true);
        
        const removed = list.Remove(1);
        expect(removed).toBe(true);
        expect(list.Count).toBe(1);
        expect(list.Contains(1)).toBe(false);
    });

    test('Should handle CsString with Value Object equality', () => {
        const list = new List<CsString>();
        const val1 = new CsString("hello");
        const val2 = new CsString("hello"); // Different reference, same value

        list.Add(val1);

        // Prove references are different
        expect(val1 === val2).toBe(false);

        // Prove Contains uses Value Equality
        expect(list.Contains(val2)).toBe(true);

        // Prove Remove uses Value Equality
        const removed = list.Remove(val2);
        expect(removed).toBe(true);
        expect(list.Count).toBe(0);
    });

    test('Should handle mixed operations', () => {
        const list = new List<string>();
        list.Add("a");
        list.Add("b");
        
        const filtered = list.Where(x => x === "a");
        expect(filtered.Count).toBe(1);
        expect(filtered.FirstOrDefault()!).toBe("a");
        
        const mapped = list.Select(x => x.toUpperCase());
        expect(mapped.ToArray()).toEqual(["A", "B"]);
    });

    test('FirstOrDefault returns null definition', () => {
        const list = new List<number>();
        expect(list.FirstOrDefault()).toBeNull();
        
        list.Add(10);
        expect(list.FirstOrDefault()).toBe(10);
        
        expect(list.FirstOrDefault(x => x > 20)).toBeNull();
    });
});
