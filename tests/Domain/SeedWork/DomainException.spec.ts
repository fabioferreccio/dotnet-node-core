import { DomainException } from "../../../src/Domain/SeedWork/DomainException";

describe("Domain.SeedWork.DomainException", () => {
    test("Constructor sets message and inner exception correctly", () => {
        const inner = new Error("Inner");
        const ex = new DomainException("Outer Error", inner);
        
        expect(ex.Message).toBe("Outer Error");
        expect(ex.InnerException).toBe(inner);
        expect(ex instanceof Error).toBe(true);
    });

    test("Constructor handles unknown inner exception", () => {
         const ex = new DomainException("Error", "string reason");
         // The base Exception class might behave differently with unknown, 
         // but typically it stores it. Ideally we pass Error.
         expect(ex.InnerException).toBe("string reason");
    });

    test("Constructor handles missing inner exception", () => {
        const ex = new DomainException("Just Message");
        expect(ex.Message).toBe("Just Message");
        expect(ex.InnerException).toBeUndefined();
    });
});
