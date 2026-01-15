import { CsGuid } from '../../../src/Domain/ValueObjects';

describe('System.Guid', () => {
    test('NewGuid should return unique values', () => {
        const id1 = CsGuid.NewGuid();
        const id2 = CsGuid.NewGuid();
        expect(id1.Equals(id2)).toBe(false);
    });

    test('Empty should return zero-filled GUID', () => {
        expect(CsGuid.Empty.ToString()).toBe("00000000-0000-0000-0000-000000000000");
    });

    test('Parse should handle valid GUID string', () => {
        const str = "550e8400-e29b-41d4-a716-446655440000";
        const guid = CsGuid.Parse(str);
        expect(guid.ToString()).toBe(str);
    });

    test('Parse should throw on invalid GUID', () => {
        expect(() => CsGuid.Parse("invalid-guid")).toThrow();
    });

    test('Equality check works', () => {
        const str = "550e8400-e29b-41d4-a716-446655440000";
        const g1 = CsGuid.Parse(str);
        const g2 = CsGuid.Parse(str);
        expect(g1.Equals(g2)).toBe(true);
    });
});
