import { CsDecimal } from '../../../src/Domain/ValueObjects/CsDecimal';

describe('System.Decimal (CsDecimal)', () => {
    // MVP implementation wraps number, but implementation should support basic math.
    test('Value Wrapper', () => {
        const d = new CsDecimal(123.456);
        expect(d.Value).toBe(123.456);
    });

    test('Math Checks', () => {
        const a = new CsDecimal(10.5);
        const b = new CsDecimal(2.0);
        expect(a.Add(b).Value).toBe(12.5);
        expect(a.Divide(b).Value).toBe(5.25);
    });

    test('Equality Checks', () => {
        expect(new CsDecimal(10.00).Equals(new CsDecimal(10))).toBe(true);
    });
});
