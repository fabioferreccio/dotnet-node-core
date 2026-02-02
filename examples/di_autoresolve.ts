import "reflect-metadata";
import { ServiceCollection } from "../src/System/DependencyInjection/ServiceCollection";
import { Injectable } from "../src/Domain/DependencyInjection/Injectable";
import { Inject } from "../src/Domain/DependencyInjection/Inject";

// 1. Define Dependencies
@Injectable()
class Logger {
    log(msg: string) {
        console.log(`[Logger]: ${msg}`);
    }
}

// 2. Define Service with Auto-Resolution
@Injectable()
class UserService {
    constructor(private readonly logger: Logger) {}

    greet(name: string) {
        this.logger.log(`Hello, ${name}!`);
    }
}

// 3. Define Interface/Token Binding (The Interface Erasure Problem)
abstract class IFileService {
    abstract read(): void;
}

@Injectable()
class FileService extends IFileService {
    constructor(private readonly logger: Logger) {
        super();
    }
    read() {
        this.logger.log("Reading file...");
    }
}

// 4. Case: Manual resolution via @Inject for Interfaces
@Injectable()
class FileManager {
    // IFileService would normally resolve to Object due to JS erasure.
    // @Inject("IFileService") forces resolution by the registered token.
    constructor(@Inject("IFileService") private readonly fileService: IFileService) {}

    process() {
        this.fileService.read();
    }
}

// 5. Test Logic
function run() {
    console.log("--- DI Auto-Resolution Test ---");
    
    const services = new ServiceCollection();

    // Register Logger (Dependencies)
    services.AddSingleton(Logger);

    // Register UserService (Auto-Resolve -> Logger)
    services.AddTransient(UserService);

    // Register FileService (Token Binding + Auto-Resolve -> Logger)
    services.AddTransient("IFileService", FileService);

    // Register FileManager (Uses @Inject to find IFileService)
    services.AddTransient(FileManager);

    const provider = services.BuildServiceProvider();

    console.log("1. Resolving UserService...");
    const userService = provider.GetRequiredService(UserService);
    userService.greet("User");

    console.log("2. Resolving FileManager (via @Inject)...");
    const fileManager = provider.GetRequiredService(FileManager);
    fileManager.process();

    console.log("--- SUCCESS ---");
}

run();
