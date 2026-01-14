import { CsInt32 } from '../../../src/Domain/ValueObjects';

describe('System.Int32', () => {
    test('Should truncate decimals in constructor', () => {
        const i = new CsInt32(5.99);
        expect(i.Value).toBe(5);
    });

    test('Should handle addition', () => {
        const a = new CsInt32(10);
        const b = new CsInt32(20);
        const result = a.Add(b);
        expect(result.Value).toBe(30);
    });

    test('Parse handles integer strings', () => {
        const i = CsInt32.Parse("123");
        expect(i.Value).toBe(123);
    });

    test('Comparison implementation', () => {
        const a = new CsInt32(5);
        const b = new CsInt32(10);
        expect(a.CompareTo(b)).toBe(-1);
        expect(b.CompareTo(a)).toBe(1);
        expect(a.CompareTo(new CsInt32(5))).toBe(0);
    });
});
