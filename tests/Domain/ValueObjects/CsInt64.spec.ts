import { CsInt64 } from '../../../src/Domain/ValueObjects/CsInt64';

describe('System.Int64 (CsInt64)', () => {
    test('BigInt Support', () => {
        const large = new CsInt64("900719925474099200"); // Very large
        expect(large.Value).toBe(900719925474099200n);
    });

    test('Math Operations', () => {
        const a = new CsInt64(10n);
        const b = new CsInt64(3n);

        expect(a.Add(b).ToString()).toBe("13");
        expect(a.Subtract(b).ToString()).toBe("7");
        expect(a.Multiply(b).ToString()).toBe("30");
        expect(a.Divide(b).ToString()).toBe("3"); // Integer division
    });

    test('Equality Checks', () => {
        expect(new CsInt64(100).Equals(new CsInt64(100))).toBe(true);
    });
});
