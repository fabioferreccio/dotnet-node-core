import { CsSingle } from '../../../src/Domain/ValueObjects/CsSingle';

describe('System.Single (CsSingle)', () => {
    test('Construction & Precision', () => {
        // Checking wrapping behavior
        const val = 1.123456789;
        const single = new CsSingle(val);
        expect(single.Value).toBe(Math.fround(val));
    });

    test('Equals', () => {
        const a = new CsSingle(1.5);
        const b = new CsSingle(1.5);
        expect(a.Equals(b)).toBe(true);
        expect(a.Equals(null as any)).toBe(false);
    });

    test('CompareTo', () => {
        const a = new CsSingle(1.0);
        const b = new CsSingle(2.0);
        expect(a.CompareTo(b)).toBe(-1);
        expect(b.CompareTo(a)).toBe(1);
        expect(a.CompareTo(new CsSingle(Math.fround(1.0)))).toBe(0);
        expect(a.CompareTo(null)).toBe(1);
    });

    test('ToString', () => {
        expect(new CsSingle(1.5).ToString()).toBe("1.5");
    });
});
