import { System } from "../src/System";

async function runVerify() {
    System.Console.WriteLine(System.String.From("Verifying Examples..."));

    // ==========================================
    // README.md Examples
    // ==========================================
    
    // 1. Immutability & String Behavior
    {
        const original = System.String.From("  dotnet-node-core  ");
        const clean = original.Trim().ToUpper();
        
        // System.Console.WriteLine(original); // Prints: "  dotnet-node-core  " (Unchanged)
        // System.Console.WriteLine(clean);    // Prints: "DOTNET-NODE-CORE" (New Instance)
        
        if (original.ToString() !== "  dotnet-node-core  ") throw new Error("README Ex 1 Failed");
        if (clean.ToString() !== "DOTNET-NODE-CORE") throw new Error("README Ex 1 Failed");
    }

    // 2. System.IO (File Operations)
    {
        // Mocking or skipping actual IO for verification to avoid side effects in test run
        // const path = "./output.txt";
        // const content = "Hello World";
        // System.IO.File.WriteAllText(path, content);
        // const stream = System.IO.File.ReadAllText(path);
        
        // Just verifying types exist
        const _fileType = System.IO.File;
    }

    // 3. System.Linq
    {
        const numbers = new System.Collections.Generic.List<System.Int32>();
        numbers.Add(System.Int32.From(10));
        numbers.Add(System.Int32.From(20));

        const query = System.Linq.Enumerable.From(numbers)
            .Where((x: System.Int32) => x.Value > 15)
            .Select((x: System.Int32) => x.ToString());
            
        // System.Console.WriteLine(query.First()); // "20"
        if (query.First() !== "20") throw new Error("README Ex 3 Failed");
    }

    // 4. Dependency Injection
    {
        class MyService {}
        const services = new System.DependencyInjection.ServiceCollection();
        // services.AddSingleton(MyService); // This line in README was commented out, let's enable for check
        services.AddSingleton(MyService);

        const provider = services.BuildServiceProvider();
        const myService = provider.GetService(MyService);
        if (!(myService instanceof MyService)) throw new Error("README Ex 4 Failed");
    }

    // ==========================================
    // SERIALIZATION.md Examples
    // ==========================================

    // 1. Basic Serialization
    class UserDTO {
        public Name: System.String;
        public Age: System.Int32;
    
        constructor(name: string, age: number) {
            this.Name = System.String.From(name);
            this.Age = System.Int32.From(age);
        }
    }

    {
        const user = new UserDTO("Alice", 30);
        const json = System.Text.Json.JsonSerializer.Serialize(user);
        // System.Console.WriteLine(json);
        // Output: {"Name":"Alice","Age":30}
        if (json !== '{"Name":"Alice","Age":30}') throw new Error("Serialization Ex 1 Failed");
    }

    // 3. Collections
    {
        const list = new System.Collections.Generic.List<System.Int32>();
        list.Add(System.Int32.From(100));
        list.Add(System.Int32.From(200));

        const jsonList = System.Text.Json.JsonSerializer.Serialize(list);
        // Output: [100,200]
        if (jsonList !== '[100,200]') throw new Error("Serialization Ex 3 Failed");
    }

    // Metadata Mapping
    {
        const metadata = System.Text.Json.Metadata.JsonTypeMetadata.For(UserDTO);

        // Define property mapping
        metadata.Map(
            "Name",
            "fullName",
            null,
            System.Text.Json.Metadata.NullHandling.Allow
        );
    }

    // Diagnostics
    {
        const options = new System.Text.Json.JsonSerializerOptions();
        options.Diagnostics = {
            OnSerializeStart: (context) => {
                // Verified callback
            }
        };
        const user = new UserDTO("Test", 1);
        System.Text.Json.JsonSerializer.Serialize(user, options);
    }

    // ==========================================
    // DEPENDENCY_INJECTION.md Examples
    // ==========================================

    // 1. Basic Registration & Resolution
    {
        class DatabaseService {
            public Connect(): System.String {
                return System.String.From("Connected");
            }
        }
        
        // 2. Register
        const services = new System.DependencyInjection.ServiceCollection();
        services.AddSingleton(DatabaseService);
        
        // 3. Build
        const provider = services.BuildServiceProvider();
        
        // 4. Resolve
        const db = provider.GetService(DatabaseService)!;
        if (db.Connect().ToString() !== "Connected") throw new Error("DI Ex 1 Failed");
    }

    // 2. Interface based Resolution
    {
        abstract class ILogger {
            abstract Log(message: System.String): void;
        }

        class ConsoleLogger extends ILogger {
            public Log(message: System.String): void {
                // System.Console.WriteLine(message);
            }
        }

        const services = new System.DependencyInjection.ServiceCollection();
        services.AddSingleton(ILogger, () => new ConsoleLogger());
    }

    // 3. Factory Registration
    {
         class Configuration { ConnectionString = "DB" } 
         class DatabaseService { constructor(public conn: string) {} }

         const services = new System.DependencyInjection.ServiceCollection();
         services.AddSingleton(Configuration);
         // Note: Self-binding factories must be zero-argument (Strict Mode).
         // Dependencies should be auto-wired or hardcoded if using factory.
         services.AddTransient(DatabaseService, () => {
            return new DatabaseService("DB_CONNECTION_STRING");
        });
    }

    // 4. Scoped Services
    {
        class RequestContext {}
        const services = new System.DependencyInjection.ServiceCollection();
        services.AddScoped(RequestContext);

        const rootProvider = services.BuildServiceProvider();

        // Create a Scope
        // Verify we can access CreateScope via IServiceScopeFactory
        const scope = (rootProvider as unknown as System.DependencyInjection.IServiceScopeFactory).CreateScope();
        const context = scope.ServiceProvider.GetService(RequestContext);

        // Dispose scope at end of request
        scope.Dispose();
    }

    // ==========================================
    // TYPES.md Examples
    // ==========================================

    // 1. CsString
    {
        const str = System.String.From(" Hello ");
        const trimmed = str.Trim();

        // Equality
        if (trimmed.Equals(System.String.From("Hello"))) {
            // True
        } else {
            throw new Error("Types Ex 1 Failed");
        }
    }

    // 2. CsInt32 & Numerics
    {
        const age = System.Int32.From(25);
        const year = System.Int32.From(2023);

        // Arithmetic (returns new instance)
        const nextYear = year.Add(System.Int32.From(1));
        if (nextYear.Value !== 2024) throw new Error("Types Ex 2 Failed");
    }

    // 3. Explicit Interop
    {
        // Input from JS
        const input: string = "some input";
        const csVal = System.String.From(input);

        // Output to JS
        const jsVal: string = csVal.ToString();
        if (jsVal !== input) throw new Error("Types Ex 3 Failed");
    }

    // Equality Contract
    {
        const a = System.Int32.From(5);
        const b = System.Int32.From(5);

        // console.log(a === b); // FALSE (Referential Inequality)
        if (a === b) throw new Error("Types Identity Check Failed");
        // console.log(a.Equals(b)); // TRUE (Structural Equality)
        if (!a.Equals(b)) throw new Error("Types Equality Check Failed");
    }

    System.Console.WriteLine(System.String.From("All Verified!"));
}

runVerify().catch(e => {
    console.error(e);
    process.exit(1);
});
