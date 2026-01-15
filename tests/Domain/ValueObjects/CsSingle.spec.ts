import { CsSingle } from '../../../src/Domain/ValueObjects/CsSingle';

describe('System.Single (CsSingle)', () => {
    test('Precision Check (Float32 Simulation)', () => {
        // Math.fround(1.123456789) -> 1.1234568357467651 (loss of precision compared to Double)
        const s = new CsSingle(1.123456789);
        // We verify that it is NOT strictly equal to the double input if precision is lost
        // But for this test, we just check that it wraps the value.
        // Actually, we should check Math.fround equality.
        expect(s.Value).toBe(Math.fround(1.123456789));
    });

    test('Equality Checks', () => {
        expect(new CsSingle(1.5).Equals(new CsSingle(1.5))).toBe(true);
    });
});
