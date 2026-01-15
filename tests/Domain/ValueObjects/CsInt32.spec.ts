import { CsInt32 } from '../../../src/Domain/ValueObjects/CsInt32';

describe('System.Int32 (CsInt32)', () => {
    test('Boundary Checks (Native Number Limits implicitly checked by logic but strictly handled by bitwise or)', () => {
        // Javascript bitwise operators treat operands as 32 bit integers.
        // But CsInt32 constructor performs logic: value | 0.
        // Larger numbers wrap around or truncate in JS bitwise ops.
        // We ensure consistent behavior with "value | 0".
        const i = new CsInt32(2147483647);
        expect(i.Value).toBe(2147483647);
    });

    test('Truncation Checks', () => {
        expect(new CsInt32(10.5).Value).toBe(10);
        expect(new CsInt32(-5.9).Value).toBe(-5);
    });

    test('Math Checks', () => {
        const a = new CsInt32(100);
        const b = new CsInt32(200);
        expect(a.Add(b).Value).toBe(300);
        expect(b.Subtract(a).Value).toBe(100);
        expect(a.Multiply(new CsInt32(2)).Value).toBe(200);
    });

    test('Equality Checks', () => {
        expect(new CsInt32(5).Equals(new CsInt32(5))).toBe(true);
    });
});
